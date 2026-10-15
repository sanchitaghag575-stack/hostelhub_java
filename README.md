
# HostelHub — Java Backend Edition

HostelHub is a Smart PG & Hostel Management System. This package keeps the existing HTML, CSS, images, and Vanilla JavaScript frontend and adds a Java HTTP backend.

## Requirements
- JDK 17 or newer (recommended)
- VS Code or any code editor

## Run on Windows
1. Extract this ZIP.
2. Open the extracted `HostelHub` folder in VS Code.
3. Run `run.bat` from the project root.
4. Keep the terminal open and visit **http://localhost:8080**.

## Run on macOS/Linux
From the project root, run `./run.sh`, then visit **http://localhost:8080**.

## Java API endpoints
- `GET /api/health` — checks that the Java backend is running.
- `GET /api/hostels` — returns sample hostel data as JSON.
- `GET /api/bookings` — returns bookings received by the Java backend.
- `POST /api/bookings` — accepts a booking JSON object and appends it to `data/bookings.jsonl`.

The existing booking UI continues to use `localStorage` for compatibility with its current student/admin pages, and now also sends a copy of new bookings to the Java backend when served through `http://localhost:8080`. The localStorage dashboard and Java file storage are not automatically synchronised.

## Important demo limitations
- The Java backend uses JDK built-in `HttpServer`; no Maven, Gradle, Spring Boot, MongoDB, or external libraries are required.
- `GET /api/hostels` currently returns sample API data; the existing UI's seeded hostel listings remain in browser storage.
- Java backend bookings persist in `data/bookings.jsonl`, a simple file-based demo store, not a full database.
- Payments remain simulated; no real payment gateway is connected.
- This is a classroom demonstration backend, not a production-ready system.

## Java concepts to explain
- `HostelHubServer` is a Java class and `main()` is the entry point.
- `HttpServer` listens for HTTP requests.
- `GET` and `POST` are HTTP request methods.
- Helper methods handle API routes, request validation, and responses.
- `Files` and `Path` are used for file handling and persistent booking records.
- `List`, streams, and lambda expressions are used to read saved records.
- The frontend sends JSON to the Java backend and receives JSON responses.

# hostelhub_java
java backend version of hostel hub

