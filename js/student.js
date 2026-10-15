// ============================================================
// HostelHub — Student JS (dashboard + my-room + profile)
// ============================================================

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function initStudentPage() {
    var user = requireAuth("student");
    if (!user) return;

    // Populate sidebar / topbar
    var sidebarUser = document.getElementById("sidebarUser");
    if (sidebarUser) sidebarUser.innerHTML = "<strong>" + user.name + "</strong><br>" + user.email;
    var topbarUser = document.getElementById("topbarUser");
    if (topbarUser) topbarUser.textContent = "👤 " + user.name;

    var page = window.location.pathname.split("/").pop();
    if (page === "dashboard.html") initDashboard(user);
    if (page === "my-room.html")   initMyRoom(user);
    if (page === "profile.html")   initProfile(user);
}

// ── Dashboard ────────────────────────────────────────────────

function initDashboard(user) {
    var rooms         = getData("rooms",              defaultRooms);
    var payments      = getData("payments",           defaultPayments);
    var complaints    = getData("complaints",         defaultComplaints);
    var announcements = getData("announcements",      defaultAnnouncements);
    var applications  = getData("hostelApplications", defaultApplications);

    // My Room card
    var room = rooms.find(function (r) { return r.id === user.roomId; });
    var el = document.getElementById("myRoomCard");
    if (el) {
        if (room) {
            el.innerHTML = "<div class='stat-value' style='font-size:1.2rem'>Room " + room.number + "</div><div class='stat-sub'>" + room.type + " • Floor " + room.floor + "</div>";
        } else {
            // Check for pending/approved application
            var app = applications.find(function (a) { return a.userId === user.id && a.status === "Pending"; });
            el.innerHTML = app
                ? "<div class='stat-value' style='font-size:1rem;color:#f59e0b'>Application Pending</div><div class='stat-sub'>" + app.roomName + "</div>"
                : "<div class='stat-value' style='font-size:1rem;color:#667085'>Not Assigned</div><div class='stat-sub'><a href='../rooms.html' style='color:#146fc1'>Browse Rooms →</a></div>";
        }
    }

    // Payment card
    var pendingPayment = null;
    for (var i = 0; i < payments.length; i++) {
        if (payments[i].userId === user.id && payments[i].status === "Pending") {
            pendingPayment = payments[i];
            break;
        }
    }
    var pel = document.getElementById("paymentCard");
    if (pel) {
        if (pendingPayment) {
            pel.innerHTML = "<div class='stat-value'>" + formatCurrency(pendingPayment.amount) + "</div><div class='stat-sub'>Due " + formatDate(pendingPayment.dueDate) + "</div>";
            pel.closest(".stat-card").querySelector(".stat-icon").style.background = "#fef3c7";
        } else {
            pel.innerHTML = "<div class='stat-value' style='color:#20a66a'>All Paid ✓</div><div class='stat-sub'>No dues pending</div>";
        }
    }

    // Complaints card
    var openComplaints = complaints.filter(function (c) { return c.userId === user.id && c.status !== "Resolved"; }).length;
    var cel = document.getElementById("complaintsCard");
    if (cel) {
        cel.innerHTML = "<div class='stat-value'>" + openComplaints + "</div><div class='stat-sub'>Open complaint" + (openComplaints !== 1 ? "s" : "") + "</div>";
    }

    // Announcements card
    var ael = document.getElementById("announcementsCard");
    if (ael) {
        ael.innerHTML = "<div class='stat-value'>" + announcements.length + "</div><div class='stat-sub'>Total announcements</div>";
    }

    // Recent announcements list
    var recentEl = document.getElementById("recentAnnouncements");
    if (recentEl) {
        var recent = announcements.slice(0, 3);
        if (recent.length === 0) {
            recentEl.innerHTML = "<div class='empty-state'><span class='empty-icon'>📢</span><p>No announcements yet.</p></div>";
        } else {
            recentEl.innerHTML = recent.map(function (a) {
                return "<div class='announcement-item'>" +
                    "<h4>📢 " + a.title + "</h4>" +
                    "<p>" + (a.description.length > 100 ? a.description.substring(0, 100) + "..." : a.description) + "</p>" +
                    "<span class='announcement-date'>" + formatDate(a.date) + "</span>" +
                "</div>";
            }).join("");
        }
    }
}

// ── My Room ──────────────────────────────────────────────────

function initMyRoom(user) {
    var rooms = getData("rooms", defaultRooms);
    var room  = rooms.find(function (r) { return r.id === user.roomId; });
    var container = document.getElementById("myRoomContent");
    if (!container) return;

    if (!room) {
        var applications = getData("hostelApplications", defaultApplications);
        var app = applications.find(function (a) { return a.userId === user.id && a.status === "Pending"; });
        container.innerHTML =
            "<div class='empty-state'>" +
            "<span class='empty-icon'>🛏</span>" +
            (app
                ? "<p>Your application for <strong>" + app.roomName + "</strong> is <span class='badge badge-pending'>Pending</span>.</p>"
                : "<p>No room assigned yet.</p>") +
            "<a href='../rooms.html' class='btn-dashboard btn-blue' style='margin-top:16px;display:inline-block;'>Browse Available Rooms →</a>" +
            "</div>";
        return;
    }

    var facilitiesHtml = (room.facilities || []).map(function (f) {
        return "<span class='facility-tag'>✓ " + f + "</span>";
    }).join("");

    var floorSuffix = room.floor === 1 ? "st" : room.floor === 2 ? "nd" : "rd";

    container.innerHTML =
        "<div class='room-detail-card'>" +
            "<img src='../assets/images/room" + ((room.id % 3) + 1) + ".jpg' alt='Room " + room.number + "'>" +
            "<div class='room-detail-info'>" +
                "<h2>Room " + room.number + "</h2>" +
                "<div class='room-detail-meta'>" +
                    "<span>Floor " + room.floor + floorSuffix + "</span>" +
                    "<span>" + room.type + " Sharing</span>" +
                    "<span>" + room.occupied + "/" + room.capacity + " Occupied</span>" +
                    "<span class='badge badge-success'>" + room.status + "</span>" +
                "</div>" +
                "<h4 style='margin-bottom:10px;color:#172b4d;font-size:0.9rem;'>Facilities</h4>" +
                "<div class='facility-tags'>" + facilitiesHtml + "</div>" +
                "<div style='margin-top:20px;padding-top:20px;border-top:1px solid #edf2f7;display:flex;align-items:center;justify-content:space-between;'>" +
                    "<div><span style='font-size:1.4rem;font-weight:700;color:#146fc1;'>" + formatCurrency(room.rent) + "</span> <span style='color:#667085;font-size:0.88rem;'>/ month</span></div>" +
                    "<a href='../rooms.html' class='btn-dashboard btn-outline-d'>Browse More Rooms</a>" +
                "</div>" +
            "</div>" +
        "</div>";
}

// ── Profile ──────────────────────────────────────────────────

function initProfile(user) {
    var nameEl    = document.getElementById("profileName");
    var emailEl   = document.getElementById("profileEmail");
    var phoneEl   = document.getElementById("profilePhone");
    var collegeEl = document.getElementById("profileCollege");
    var addressEl = document.getElementById("profileAddress");
    var joinEl    = document.getElementById("profileJoin");
    var avatarEl  = document.getElementById("profileAvatar");

    if (nameEl)    nameEl.value    = user.name    || "";
    if (emailEl)   emailEl.value   = user.email   || "";
    if (phoneEl)   phoneEl.value   = user.phone   || "";
    if (collegeEl) collegeEl.value = user.college || "";
    if (addressEl) addressEl.value = user.address || "";
    if (joinEl)    joinEl.textContent = formatDate(user.joinDate);

    if (avatarEl) {
        var parts = (user.name || "U").split(" ");
        var initials = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
        avatarEl.textContent = initials.toUpperCase();
    }

    var form = document.getElementById("profileForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var users = getData("users", defaultUsers);
            var idx   = users.findIndex(function (u) { return u.id === user.id; });
            if (idx === -1) return;

            users[idx].name    = document.getElementById("profileName").value.trim()    || user.name;
            users[idx].phone   = document.getElementById("profilePhone").value.trim();
            users[idx].college = document.getElementById("profileCollege").value.trim();
            users[idx].address = document.getElementById("profileAddress").value.trim();

            saveData("users", users);
            localStorage.setItem("currentUser", JSON.stringify(users[idx]));
            showMessage("Profile updated successfully!", "success");

            // Update sidebar name
            var sidebarUser = document.getElementById("sidebarUser");
            if (sidebarUser) sidebarUser.innerHTML = "<strong>" + users[idx].name + "</strong><br>" + users[idx].email;
        });
    }
}

document.addEventListener("DOMContentLoaded", initStudentPage);
