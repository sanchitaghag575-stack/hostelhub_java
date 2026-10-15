// ============================================================
// HostelHub — Announcements JS (student)
// ============================================================

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function initAnnouncements() {
    var user = requireAuth("student");
    if (!user) return;

    var sidebarUser = document.getElementById("sidebarUser");
    if (sidebarUser) sidebarUser.innerHTML = "<strong>" + user.name + "</strong><br>" + user.email;
    var topbarUser = document.getElementById("topbarUser");
    if (topbarUser) topbarUser.textContent = "👤 " + user.name;

    var announcements = getData("announcements", defaultAnnouncements);
    announcements.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    var listEl  = document.getElementById("announcementList");
    var countEl = document.getElementById("announcementCount");
    if (countEl) countEl.textContent = announcements.length + " Announcement" + (announcements.length !== 1 ? "s" : "");

    if (!listEl) return;

    if (announcements.length === 0) {
        listEl.innerHTML = "<div class='empty-state'><span class='empty-icon'>📢</span><p>No announcements posted yet.</p></div>";
        return;
    }

    listEl.innerHTML = announcements.map(function (a) {
        return "<div class='announcement-item'>" +
            "<h4>📢 " + a.title + "</h4>" +
            "<p>" + a.description + "</p>" +
            "<div style='display:flex;justify-content:space-between;align-items:center;'>" +
                "<span class='announcement-date'>" + formatDate(a.date) + "</span>" +
                "<span style='font-size:0.78rem;color:#667085;'>Posted by " + (a.postedBy || "Admin") + "</span>" +
            "</div>" +
        "</div>";
    }).join("");
}

document.addEventListener("DOMContentLoaded", initAnnouncements);
