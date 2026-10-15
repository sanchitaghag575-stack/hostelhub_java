// ============================================================
// HostelHub — Storage & UI Helpers
// Load after data.js, before auth.js and feature files.
// ============================================================

// ── Core localStorage helpers ────────────────────────────────

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getData(key, defaultValue) {
    if (defaultValue === undefined) defaultValue = [];
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
}

// Seed all default data into localStorage.
// Pass force = true to wipe & re-seed (demo reset).
function initializeData(force) {

    var keys = [

        ["users",              defaultUsers],

        ["rooms",              defaultRooms],

        ["payments",           defaultPayments],

        ["complaints",         defaultComplaints],

        ["announcements",      defaultAnnouncements],

        ["hostelApplications", defaultApplications],

        ["colleges",           defaultColleges],

        ["nearbyHostels",      defaultNearbyHostels],

        ["pgs",                defaultPGs]

    ];

    keys.forEach(function (pair) {

        var key = pair[0];

        var defaultValue = pair[1];

        if (force || localStorage.getItem(key) === null) {

            saveData(key, defaultValue);

        }

    });
}

// ── UI Feedback (replaces alert()) ───────────────────────────
// Renders a styled success / error / info banner inside
// the element with id="messageContainer".

function showMessage(message, type, targetId) {
    type     = type     || "success";
    targetId = targetId || "messageContainer";

    var container = document.getElementById(targetId);
    if (!container) return;

    var icon = type === "success" ? "✓"
             : type === "error"   ? "⚠"
             : "ℹ";

    container.innerHTML =
        "<div class=\"alert alert-" + type + "\">" +
            "<span class=\"alert-icon\">" + icon + "</span> " +
            "<span>" + message + "</span>" +
        "</div>";
    container.style.display = "block";

    if (type === "success") {
        setTimeout(function () {
            container.innerHTML = "";
        }, 4000);
    }
}

// ── Path helper ──────────────────────────────────────────────
// Returns "../" when inside student/ or admin/ folders,
// "" otherwise (root pages).

function getBasePath() {
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    if (path.indexOf("/student/") !== -1 || path.indexOf("/admin/") !== -1) {
        return "../";
    }
    return "";
}

// ── Utility helpers ──────────────────────────────────────────

function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN");
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    var d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getRoomStatusClass(status) {
    if (status === "Available") return "status-available";
    if (status === "Full")      return "status-full";
    return "status-partial";
}

function getStatusBadgeHTML(status) {
    var cls = "badge-pending";
    if (status === "Approved" || status === "Paid" || status === "Resolved") cls = "badge-success";
    if (status === "Rejected")   cls = "badge-danger";
    if (status === "In Progress") cls = "badge-warning";
    return "<span class=\"badge " + cls + "\">" + status + "</span>";
}

function getPriorityBadgeHTML(priority) {
    var cls = priority === "High" ? "badge-danger"
            : priority === "Medium" ? "badge-warning"
            : "badge-info";
    return "<span class=\"badge " + cls + "\">" + priority + "</span>";
}

// ── Demo Reset ───────────────────────────────────────────────

function resetDemoData() {
    if (!confirm("Reset all demo data to default? This cannot be undone.")) return;
    localStorage.removeItem("currentUser");
    localStorage.removeItem("hostelLoggedIn");
    localStorage.removeItem("hostelUser");
    initializeData(true);
    alert("Demo data reset! Please log in again.");
    window.location.href = getBasePath() + "login.html";
}

// ── Seed on every page load ───────────────────────────────────
initializeData(false);
