import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Minimal Java HTTP backend for HostelHub.
 * Uses only the JDK; bookings are persisted as JSON Lines in data/bookings.jsonl.
 */
public class HostelHubServer {
    private static final int PORT = 8080;
    private static final Path ROOT = Paths.get("").toAbsolutePath().normalize();
    private static final Path DATA_DIR = ROOT.resolve("data");
    private static final Path BOOKINGS_FILE = DATA_DIR.resolve("bookings.jsonl");

    public static void main(String[] args) throws IOException {
        Files.createDirectories(DATA_DIR);
        if (!Files.exists(BOOKINGS_FILE)) Files.createFile(BOOKINGS_FILE);

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/health", HostelHubServer::handleHealth);
        server.createContext("/api/hostels", HostelHubServer::handleHostels);
        server.createContext("/api/bookings", HostelHubServer::handleBookings);
        server.createContext("/", HostelHubServer::handleStaticFiles);
        server.setExecutor(null);
        server.start();
        System.out.println("HostelHub Java backend is running.");
        System.out.println("Website: http://localhost:" + PORT);
        System.out.println("Health:  http://localhost:" + PORT + "/api/health");
    }

    private static void handleHealth(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        if (!"GET".equalsIgnoreCase(ex.getRequestMethod())) {
            sendJson(ex, 405, "{\"error\":\"Use GET\"}"); return;
        }
        sendJson(ex, 200, "{\"status\":\"ok\",\"service\":\"HostelHub Java Backend\",\"time\":\"" + Instant.now() + "\"}");
    }

    private static void handleHostels(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        if (!"GET".equalsIgnoreCase(ex.getRequestMethod())) {
            sendJson(ex, 405, "{\"error\":\"Use GET\"}"); return;
        }
        // Sample API response for demonstrating the Java backend. The existing UI still uses its seeded hostel data.
        String json = "["
            + "{\"id\":1,\"name\":\"Sunrise Hostel\",\"area\":\"Mumbai\",\"rent\":8000},"
            + "{\"id\":2,\"name\":\"Green View PG\",\"area\":\"Navi Mumbai\",\"rent\":6500},"
            + "{\"id\":3,\"name\":\"Campus Stay\",\"area\":\"Thane\",\"rent\":7000}"
            + "]";
        sendJson(ex, 200, json);
    }

    private static void handleBookings(HttpExchange ex) throws IOException {
        if (handleOptions(ex)) return;
        String method = ex.getRequestMethod().toUpperCase();
        if ("GET".equals(method)) {
            List<String> lines = Files.readAllLines(BOOKINGS_FILE, StandardCharsets.UTF_8).stream()
                .filter(line -> !line.isBlank()).collect(Collectors.toList());
            sendJson(ex, 200, "[" + String.join(",", lines) + "]");
            return;
        }
        if ("POST".equals(method)) {
            String body;
            try (InputStream in = ex.getRequestBody()) {
                body = new String(in.readAllBytes(), StandardCharsets.UTF_8).trim();
            }
            if (body.length() < 2 || !body.startsWith("{") || !body.endsWith("}")) {
                sendJson(ex, 400, "{\"error\":\"Expected a JSON booking object\"}"); return;
            }
            // Keep one JSON object per line. This is a lightweight file-backed demo, not a production database.
            String safeLine = body.replace("\r", "").replace("\n", " ");
            Files.writeString(BOOKINGS_FILE, safeLine + System.lineSeparator(), StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            sendJson(ex, 201, "{\"message\":\"Booking saved by Java backend\",\"savedAt\":\"" + Instant.now() + "\"}");
            return;
        }
        sendJson(ex, 405, "{\"error\":\"Use GET or POST\"}");
    }

    private static boolean handleOptions(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1); ex.close(); return true;
        }
        return false;
    }

    private static void handleStaticFiles(HttpExchange ex) throws IOException {
        addCors(ex);
        if (!"GET".equalsIgnoreCase(ex.getRequestMethod()) && !"HEAD".equalsIgnoreCase(ex.getRequestMethod())) {
            sendText(ex, 405, "Method not allowed"); return;
        }
        String rawPath = ex.getRequestURI().getPath();
        String decoded = URLDecoder.decode(rawPath, StandardCharsets.UTF_8);
        if (decoded.equals("/")) decoded = "/index.html";
        Path file = ROOT.resolve("." + decoded).normalize();
        if (!file.startsWith(ROOT) || !Files.isRegularFile(file)) {
            sendText(ex, 404, "Not found"); return;
        }
        String type = contentType(file.getFileName().toString());
        byte[] bytes = Files.readAllBytes(file);
        ex.getResponseHeaders().set("Content-Type", type);
        ex.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        if ("HEAD".equalsIgnoreCase(ex.getRequestMethod())) {
            ex.sendResponseHeaders(200, -1); ex.close(); return;
        }
        ex.sendResponseHeaders(200, bytes.length);
        try (OutputStream out = ex.getResponseBody()) { out.write(bytes); }
    }

    private static String contentType(String name) {
        String n = name.toLowerCase();
        if (n.endsWith(".html")) return "text/html; charset=UTF-8";
        if (n.endsWith(".css")) return "text/css; charset=UTF-8";
        if (n.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (n.endsWith(".json")) return "application/json; charset=UTF-8";
        if (n.endsWith(".svg")) return "image/svg+xml";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
        if (n.endsWith(".webp")) return "image/webp";
        if (n.endsWith(".ico")) return "image/x-icon";
        return "application/octet-stream";
    }

    private static void addCors(HttpExchange ex) {
        Headers h = ex.getResponseHeaders();
        h.set("Access-Control-Allow-Origin", "*");
        h.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
        h.set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendJson(HttpExchange ex, int status, String body) throws IOException {
        addCors(ex);
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = ex.getResponseBody()) { out.write(bytes); }
    }

    private static void sendText(HttpExchange ex, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = ex.getResponseBody()) { out.write(bytes); }
    }
}
