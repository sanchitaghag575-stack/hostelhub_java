# HostelHub — Java Backend Edition

This package preserves the existing HostelHub HTML/CSS/JavaScript frontend and adds a small Java HTTP backend using only the JDK (no Maven/Gradle dependencies required).

## Requirements
- JDK 17 or newer recommended (JDK 11+ may work depending on the exact distribution; use JDK 17 for the demo).
- VS Code or any editor.

## Run on Windows
1. Extract the ZIP.
2. Open the extracted `HostelHub` folder in VS Code.
3. Double-click `run.bat`, or open a terminal in the project root and run `run.bat`.
4. Keep the terminal open.
5. Open http://localhost:8080 in your browser.
6. Test http://localhost:8080/api/health and http://localhost:8080/api/hostels.

## Run on macOS/Linux
From the project root run `./run.sh`, then open http://localhost:8080.

## API endpoints
- `GET /api/health` — backend status.
- `GET /api/hostels` — sample hostel JSON for API demonstration.
- `GET /api/bookings` — returns booking records saved by the Java backend.
- `POST /api/bookings` — accepts a JSON booking object and appends it to `data/bookings.jsonl`.

## Booking integration
The existing booking UI still saves locally for compatibility with the current student/admin pages. It also attempts to send the same booking object to `POST /api/bookings`. Run the website through `http://localhost:8080` for the Java endpoint to receive bookings. The existing localStorage dashboard and the Java backend file are separate stores; they are not automatically synchronised.

## Storage note
Bookings received by the Java server are persisted as JSON Lines in `data/bookings.jsonl`. This is a simple file-based demonstration, not a full database and not suitable for production. Payment remains simulated; no real payment gateway is connected.

## Java concepts to explain
- `HostelHubServer` class and `main()` method.
- `HttpServer` and HTTP request methods (`GET`, `POST`, `OPTIONS`).
- Helper methods for request handling and responses.
- `Path`, `Files`, and file I/O for saving booking records.
- `List`, streams, and lambda expressions for reading records.
- JSON request/response data exchanged between frontend and backend.
