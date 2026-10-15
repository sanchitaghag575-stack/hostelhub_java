// ============================================================
// HostelHub — Admin JS
// All admin page logic in one file.
// ============================================================

function toggleSidebar() {
    var sb = document.getElementById("sidebar");
    if (sb) sb.classList.toggle("open");
}

function initAdminPage() {
    var user = requireAuth("admin");
    if (!user) return;

    var sidebarUser = document.getElementById("sidebarUser");
    if (sidebarUser) sidebarUser.innerHTML = "<strong>" + user.name + "</strong><br>" + user.email;
    var topbarUser = document.getElementById("topbarUser");
    if (topbarUser) topbarUser.textContent = "👤 " + user.name;

    var page = window.location.pathname.split("/").pop();
    if (page === "dashboard.html")    initAdminDashboard(user);
    if (page === "rooms.html")        initAdminRooms();
    if (page === "residents.html")    initResidents();
    if (page === "allocations.html")  initAllocations();
    if (page === "payments.html")     initAdminPayments();
    if (page === "complaints.html")   initAdminComplaints();
    if (page === "announcements.html") initAdminAnnouncements(user);
}

// ── Admin Dashboard ──────────────────────────────────────────

function initAdminDashboard(user) {
    var rooms         = getData("rooms",              defaultRooms);
    var users         = getData("users",              defaultUsers);
    var payments      = getData("payments",           defaultPayments);
    var applications  = getData("hostelApplications", defaultApplications);
    var complaints    = getData("complaints",         defaultComplaints);
    var announcements = getData("announcements",      defaultAnnouncements);

    var students      = users.filter(function (u) { return u.role === "student"; });
    var residents     = students.filter(function (u) { return u.roomId !== null; });
    var pendingApps   = applications.filter(function (a) { return a.status === "Pending"; });
    var openComplaints = complaints.filter(function (c) { return c.status !== "Resolved"; });

    var expectedRent = 0;
    rooms.forEach(function (r) { if (r.occupied > 0) expectedRent += r.rent * r.occupied; });

    var collectedRent = 0;
    var today = new Date();
    payments.forEach(function (p) {
        if (p.status === "Paid") {
            var paid = new Date(p.paidDate || p.dueDate);
            if (paid.getMonth() === today.getMonth() && paid.getFullYear() === today.getFullYear()) {
                collectedRent += p.amount;
            }
        }
    });

    function setStat(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
    setStat("statTotalRooms",      rooms.length);
    setStat("statResidents",       residents.length);
    setStat("statPendingApps",     pendingApps.length);
    setStat("statOpenComplaints",  openComplaints.length);
    setStat("statExpectedRent",    formatCurrency(expectedRent));
    setStat("statCollectedRent",   formatCurrency(collectedRent));
    setStat("statAnnouncements",   announcements.length);

    // Recent applications + student bookings
    // Applications are stored under "hostelApplications" while completed
    // Book Now payments are stored separately under "bookings".
    var recentAppsEl = document.getElementById("recentApps");
    if (recentAppsEl) {
        var recentApplications = getData("hostelApplications", defaultApplications);
        var studentBookings = getData("bookings", []);
        var recentEntries = [];

        recentApplications.forEach(function (a) {
            recentEntries.push({
                id: a.id,
                name: a.fullName || a.name || "Unknown Student",
                property: a.roomName || a.hostelName || "Room not specified",
                date: a.submittedAt || a.date || "",
                status: a.status || "Pending",
                type: "Application"
            });
        });

        studentBookings.forEach(function (b) {
            recentEntries.push({
                id: b.id,
                name: b.studentName || "Unknown Student",
                property: b.hostelName || "Hostel not specified",
                date: b.date || b.createdAt || "",
                status: b.bookingStatus || b.paymentStatus || "Pending",
                type: "Booking"
            });
        });

        // Newest applications/bookings first, regardless of source.
        recentEntries.sort(function (a, b) {
            var dateA = a.date ? new Date(a.date).getTime() : 0;
            var dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });

        var recent = recentEntries.slice(0, 3);
        if (recent.length === 0) {
            recentAppsEl.innerHTML = "<div class='empty-state'><span class='empty-icon'>📋</span><p>No applications or bookings yet.</p></div>";
        } else {
            recentAppsEl.innerHTML = recent.map(function (entry) {
                return "<div style='display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f4f8;'>" +
                    "<div><div style='font-weight:600;font-size:0.9rem;'>" + entry.name + "</div>" +
                    "<div style='font-size:0.78rem;color:#667085;'>" + entry.property + " • " + (entry.date ? formatDate(entry.date) : "Date unavailable") + "</div>" +
                    "<div style='font-size:0.72rem;color:#667085;'>" + entry.type + "</div></div>" +
                    getStatusBadgeHTML(entry.status) +
                "</div>";
            }).join("");
        }
    }

    // Recent complaints
    var recentCmpEl = document.getElementById("recentComplaints");
    if (recentCmpEl) {
        var recentC = complaints.slice(-3).reverse();
        if (recentC.length === 0) {
            recentCmpEl.innerHTML = "<div class='empty-state'><span class='empty-icon'>🔧</span><p>No complaints yet.</p></div>";
        } else {
            var usersArr = getData("users", defaultUsers);
            recentCmpEl.innerHTML = recentC.map(function (c) {
                var u = usersArr.find(function (x) { return x.id === c.userId; }) || {};
                return "<div style='display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0f4f8;'>" +
                    "<div><div style='font-weight:600;font-size:0.9rem;'>" + c.title + "</div><div style='font-size:0.78rem;color:#667085;'>" + (u.name || "Unknown") + " • " + c.category + "</div></div>" +
                    getStatusBadgeHTML(c.status) +
                "</div>";
            }).join("");
        }
    }
}

// ── Admin Rooms ──────────────────────────────────────────────

function initAdminRooms() {
    renderRoomsTable();

    var form = document.getElementById("addRoomForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            addRoom();
        });
    }
}

function renderRoomsTable() {
    var rooms = getData("rooms", defaultRooms);
    var tbody = document.getElementById("roomsTableBody");
    if (!tbody) return;

    var countEl = document.getElementById("roomCount");
    if (countEl) countEl.textContent = rooms.length + " Rooms";

    if (rooms.length === 0) {
        tbody.innerHTML = "<tr><td colspan='8' style='text-align:center;padding:32px;color:#667085;'>No rooms yet. Add one above.</td></tr>";
        return;
    }

    tbody.innerHTML = rooms.map(function (r) {
        var statusCls = r.status === "Available" ? "badge-success" : r.status === "Full" ? "badge-danger" : "badge-warning";
        var facs = (r.facilities || []).join(", ");
        return "<tr>" +
            "<td><strong>Room " + r.number + "</strong></td>" +
            "<td>Floor " + r.floor + "</td>" +
            "<td>" + r.type + "</td>" +
            "<td>" + r.occupied + "/" + r.capacity + "</td>" +
            "<td>" + formatCurrency(r.rent) + "</td>" +
            "<td><span class='badge " + statusCls + "'>" + r.status + "</span></td>" +
            "<td style='font-size:0.78rem;max-width:150px;'>" + facs + "</td>" +
            "<td><button class='btn-dashboard btn-red' style='font-size:0.78rem;padding:5px 10px;' onclick='deleteRoom(" + r.id + ")'>Delete</button></td>" +
        "</tr>";
    }).join("");
}

function addRoom() {
    var number   = document.getElementById("newRoomNumber").value.trim();
    var floor    = document.getElementById("newFloor").value;
    var type     = document.getElementById("newType").value;
    var capacity = document.getElementById("newCapacity").value;
    var rent     = document.getElementById("newRent").value;

    if (!number || !floor || !type || !capacity || !rent) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }

    var facilityCheckboxes = document.querySelectorAll(".facilityCheck:checked");
    var facilities = [];
    facilityCheckboxes.forEach(function (cb) { facilities.push(cb.value); });

    var rooms = getData("rooms", defaultRooms);
    if (rooms.find(function (r) { return r.number === number; })) {
        showMessage("Room number " + number + " already exists.", "error");
        return;
    }

    var imgIdx = (rooms.length % 3) + 1;
    var newRoom = {
        id:         Date.now(),
        number:     number,
        floor:      parseInt(floor),
        type:       type,
        capacity:   parseInt(capacity),
        occupied:   0,
        rent:       parseInt(rent),
        status:     "Available",
        facilities: facilities,
        image:      "assets/images/room" + imgIdx + ".jpg"
    };

    rooms.push(newRoom);
    saveData("rooms", rooms);
    document.getElementById("addRoomForm").reset();
    showMessage("Room " + number + " added successfully!", "success");
    renderRoomsTable();
}

function deleteRoom(roomId) {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    var rooms = getData("rooms", defaultRooms);
    rooms = rooms.filter(function (r) { return r.id !== roomId; });
    saveData("rooms", rooms);
    showMessage("Room deleted.", "success");
    renderRoomsTable();
}

// ── Residents ────────────────────────────────────────────────

function initResidents() {
    renderResidents("");
    var search = document.getElementById("residentSearch");
    if (search) search.addEventListener("input", function () { renderResidents(this.value); });
}

function renderResidents(query) {
    var users = getData("users", defaultUsers);
    var rooms = getData("rooms", defaultRooms);
    var students = users.filter(function (u) { return u.role === "student"; });

    if (query) {
        var q = query.toLowerCase();
        students = students.filter(function (u) {
            return u.name.toLowerCase().indexOf(q) !== -1 || u.email.toLowerCase().indexOf(q) !== -1;
        });
    }

    var tbody = document.getElementById("residentsTableBody");
    if (!tbody) return;

    var countEl = document.getElementById("residentCount");
    if (countEl) countEl.textContent = students.length + " Students";

    if (students.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;padding:32px;color:#667085;'>No students found.</td></tr>";
        return;
    }

    tbody.innerHTML = students.map(function (u) {
        var room = rooms.find(function (r) { return r.id === u.roomId; });
        var roomDisplay = room ? "Room " + room.number : "—";
        var statusBadge = room ? "<span class='badge badge-success'>Active</span>" : "<span class='badge badge-pending'>No Room</span>";
        return "<tr>" +
            "<td><strong>" + u.name + "</strong></td>" +
            "<td>" + u.email + "</td>" +
            "<td>" + roomDisplay + "</td>" +
            "<td>" + (u.phone || "—") + "</td>" +
            "<td>" + (u.college || "—") + "</td>" +
            "<td>" + statusBadge + "</td>" +
        "</tr>";
    }).join("");
}

// ── Allocations ──────────────────────────────────────────────

function initAllocations() {
    renderAllocations();
}

function renderAllocations() {
    // Keep real room applications separate so only these can be approved/rejected.
    var applications = getData("hostelApplications", defaultApplications);
    var bookings = getData("bookings", []);
    var pending = applications.filter(function (a) { return a.status === "Pending"; });

    var pendingEl = document.getElementById("pendingList");
    if (pendingEl) {
        if (pending.length === 0) {
            pendingEl.innerHTML = "<div class='empty-state'><span class='empty-icon'>✓</span><p>No pending applications.</p><p style='font-size:0.82rem;color:#667085;'>Confirmed hostel bookings are listed under All Applications.</p></div>";
        } else {
            pendingEl.innerHTML = pending.map(function (a) {
                return "<div class='complaint-item'>" +
                    "<div class='complaint-meta'>" +
                        "<h4>" + (a.fullName || a.name || "Unknown Student") + "</h4>" +
                        "<p>" + (a.email || "—") + " • " + (a.college || "—") + "</p>" +
                        "<p>Requested: <strong>" + (a.roomName || "Room not specified") + "</strong> • Applied: " + formatDate(a.submittedAt) + "</p>" +
                    "</div>" +
                    "<div class='complaint-status'>" +
                        "<button class='btn-dashboard btn-green' style='font-size:0.8rem;padding:6px 14px;' onclick='approveApplication(" + a.id + ")'>✓ Approve</button>" +
                        "<button class='btn-dashboard btn-red' style='font-size:0.8rem;padding:6px 14px;margin-top:6px;' onclick='rejectApplication(" + a.id + ")'>✗ Reject</button>" +
                    "</div>" +
                "</div>";
            }).join("");
        }
    }

    // The full list includes both room applications and confirmed hostel bookings.
    // Bookings are display-only here; they are not room-allocation requests.
    var allEntries = [];
    applications.forEach(function (a) {
        allEntries.push({
            name: a.fullName || a.name || "Unknown Student",
            email: a.email || "—",
            property: a.roomName || a.hostelName || "Room not specified",
            status: a.status || "Pending",
            date: a.submittedAt || a.date || "",
            kind: "application"
        });
    });
    bookings.forEach(function (b) {
        allEntries.push({
            name: b.studentName || "Unknown Student",
            email: b.studentEmail || "—",
            property: b.hostelName || "Hostel not specified",
            status: b.bookingStatus || "Confirmed",
            date: b.date || b.createdAt || "",
            kind: "booking"
        });
    });
    allEntries.sort(function (a, b) {
        var dateA = a.date ? new Date(a.date).getTime() : 0;
        var dateB = b.date ? new Date(b.date).getTime() : 0;
        if (!Number.isFinite(dateA)) dateA = 0;
        if (!Number.isFinite(dateB)) dateB = 0;
        return dateB - dateA;
    });

    var tbody = document.getElementById("allApplicationsBody");
    if (tbody) {
        if (allEntries.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;padding:32px;color:#667085;'>No applications or bookings yet.</td></tr>";
        } else {
            tbody.innerHTML = allEntries.map(function (entry) {
                var label = entry.kind === "booking" ? " <span style='font-size:0.72rem;color:#667085;'>(Booking)</span>" : "";
                return "<tr>" +
                    "<td><strong>" + entry.name + "</strong>" + label + "<br><span style='font-size:0.78rem;color:#667085;'>" + entry.email + "</span></td>" +
                    "<td>" + entry.property + "</td>" +
                    "<td>" + (String(entry.status).toLowerCase() === "confirmed" ? "<span class='badge badge-success'>Confirmed</span>" : getStatusBadgeHTML(entry.status)) + "</td>" +
                    "<td>" + formatDate(entry.date) + "</td>" +
                "</tr>";
            }).join("");
        }
    }
}

function approveApplication(appId) {
    var applications = getData("hostelApplications", defaultApplications);
    var rooms        = getData("rooms",              defaultRooms);
    var users        = getData("users",              defaultUsers);

    var appIdx = applications.findIndex(function (a) { return a.id === appId; });
    if (appIdx === -1) return;
    var app = applications[appIdx];

    // Check room capacity
    var roomIdx = rooms.findIndex(function (r) { return r.id === app.roomId; });
    if (roomIdx !== -1) {
        if (rooms[roomIdx].occupied >= rooms[roomIdx].capacity) {
            showMessage("Cannot approve — Room " + rooms[roomIdx].number + " is already full.", "error");
            return;
        }
        rooms[roomIdx].occupied += 1;
        if (rooms[roomIdx].occupied >= rooms[roomIdx].capacity) rooms[roomIdx].status = "Full";
        saveData("rooms", rooms);
    }

    // Assign room to user
    var userIdx = users.findIndex(function (u) { return u.id === app.userId; });
    if (userIdx !== -1) {
        users[userIdx].roomId = app.roomId;
        saveData("users", users);
        // Update currentUser if same user is somehow logged in (shouldn't happen but safe)
        var cu = getCurrentUser();
        if (cu && cu.id === users[userIdx].id) {
            localStorage.setItem("currentUser", JSON.stringify(users[userIdx]));
        }
    }

    applications[appIdx].status = "Approved";
    saveData("hostelApplications", applications);

    showMessage("Application approved! Room assigned to " + app.fullName + ".", "success");
    renderAllocations();
}

function rejectApplication(appId) {
    var applications = getData("hostelApplications", defaultApplications);
    var idx = applications.findIndex(function (a) { return a.id === appId; });
    if (idx === -1) return;

    applications[idx].status = "Rejected";
    saveData("hostelApplications", applications);
    showMessage("Application rejected.", "info");
    renderAllocations();
}

// ── Admin Payments ───────────────────────────────────────────

function initAdminPayments() {
    var payments = getData("payments", defaultPayments);
    var bookings = getData("bookings", []);
    var users = getData("users", defaultUsers);
    var rooms = getData("rooms", defaultRooms);
    var today = new Date().toISOString().split("T")[0];

    // Combine the existing monthly rent payments with the separate booking payments.
    // Do not write booking records into "payments", so they are not duplicated.
    var rows = [];
    payments.forEach(function (p) {
        rows.push({ source: "rent", data: p, date: p.dueDate || "" });
    });
    bookings.forEach(function (b) {
        rows.push({ source: "booking", data: b, date: b.date || b.createdAt || "" });
    });

    var paid = rows.filter(function (row) {
        return String(row.source === "booking" ? row.data.paymentStatus : row.data.status).toLowerCase() === "paid";
    });
    var pending = rows.filter(function (row) {
        return String(row.source === "booking" ? row.data.paymentStatus : row.data.status).toLowerCase() === "pending";
    });
    var overdue = rows.filter(function (row) {
        return row.source === "rent" && row.data.status === "Pending" && row.data.dueDate < today;
    });

    function setStat(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
    setStat("statTotalPayments", rows.length);
    setStat("statPaidPayments", paid.length);
    setStat("statPendingPayments", pending.length);
    setStat("statOverduePayments", overdue.length);

    var tbody = document.getElementById("paymentsTableBody");
    if (!tbody) return;

    rows.sort(function (a, b) {
        var dateA = a.date ? new Date(a.date).getTime() : 0;
        var dateB = b.date ? new Date(b.date).getTime() : 0;
        if (!Number.isFinite(dateA)) dateA = 0;
        if (!Number.isFinite(dateB)) dateB = 0;
        return dateB - dateA;
    });

    tbody.innerHTML = rows.map(function (row) {
        if (row.source === "booking") {
            var b = row.data;
            var bookingStatus = b.paymentStatus || "—";
            return "<tr>" +
                "<td><strong>" + (b.studentName || "—") + "</strong><br><span style='font-size:0.78rem;color:#667085;'>" + (b.studentEmail || "—") + "</span></td>" +
                "<td>" + (b.hostelName || "Hostel booking") + "</td>" +
                "<td>Hostel booking" + (b.paymentMethod ? " • " + b.paymentMethod : "") + "</td>" +
                "<td>" + formatCurrency(b.amount || 0) + "</td>" +
                "<td>" + formatDate(b.date || b.createdAt) + "</td>" +
                "<td>" + (String(bookingStatus).toLowerCase() === "paid" ? formatDate(b.date || b.createdAt) : "—") + "</td>" +
                "<td>" + getStatusBadgeHTML(bookingStatus) + "</td>" +
                "<td>—</td>" +
            "</tr>";
        }

        var p = row.data;
        var u = users.find(function (x) { return x.id === p.userId; }) || {};
        var r = rooms.find(function (x) { return x.id === p.roomId; }) || {};
        var isOverdue = p.status === "Pending" && p.dueDate < today;
        return "<tr>" +
            "<td><strong>" + (u.name || "—") + "</strong></td>" +
            "<td>" + (r.number ? "Room " + r.number : "—") + "</td>" +
            "<td>" + (p.month || "—") + "</td>" +
            "<td>" + formatCurrency(p.amount) + "</td>" +
            "<td>" + formatDate(p.dueDate) + "</td>" +
            "<td>" + (p.paidDate ? formatDate(p.paidDate) : "—") + "</td>" +
            "<td>" + getStatusBadgeHTML(p.status) + (isOverdue ? " <span class='badge badge-danger' style='font-size:0.68rem;'>OVERDUE</span>" : "") + "</td>" +
            "<td>" + (p.status === "Pending" ? "<button class='btn-dashboard btn-green' style='font-size:0.78rem;padding:5px 10px;' onclick='markPaymentPaid(" + p.id + ")'>Mark Paid</button>" : "—") + "</td>" +
        "</tr>";
    }).join("");
}

function markPaymentPaid(paymentId) {
    var payments = getData("payments", defaultPayments);
    var idx = payments.findIndex(function (p) { return p.id === paymentId; });
    if (idx === -1) return;
    payments[idx].status   = "Paid";
    payments[idx].paidDate = new Date().toISOString().split("T")[0];
    saveData("payments", payments);
    showMessage("Payment marked as paid.", "success");
    initAdminPayments();
}

// ── Admin Complaints ─────────────────────────────────────────

function initAdminComplaints() {
    renderAdminComplaints("All");

    var filter = document.getElementById("complaintFilter");
    if (filter) filter.addEventListener("change", function () { renderAdminComplaints(this.value); });
}

function renderAdminComplaints(statusFilter) {
    var complaints = getData("complaints", defaultComplaints);
    var users      = getData("users",      defaultUsers);

    if (statusFilter !== "All") {
        complaints = complaints.filter(function (c) { return c.status === statusFilter; });
    }

    complaints = complaints.slice().sort(function (a, b) { return b.id - a.id; });

    var countEl = document.getElementById("complaintCount");
    if (countEl) countEl.textContent = complaints.length + " Complaint" + (complaints.length !== 1 ? "s" : "");

    var tbody = document.getElementById("complaintsTableBody");
    if (!tbody) return;

    if (complaints.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;padding:32px;color:#667085;'>No complaints found.</td></tr>";
        return;
    }

    tbody.innerHTML = complaints.map(function (c) {
        var u = users.find(function (x) { return x.id === c.userId; }) || {};
        return "<tr>" +
            "<td>#" + c.id + "</td>" +
            "<td><strong>" + (u.name || "—") + "</strong></td>" +
            "<td>" + c.title + "</td>" +
            "<td><span class='badge badge-info'>" + c.category + "</span></td>" +
            "<td>" + getPriorityBadgeHTML(c.priority) + "</td>" +
            "<td>" +
                "<select class='status-select' onchange='updateComplaintStatus(" + c.id + ", this.value)'>" +
                    "<option" + (c.status === "Pending"     ? " selected" : "") + ">Pending</option>" +
                    "<option" + (c.status === "In Progress" ? " selected" : "") + ">In Progress</option>" +
                    "<option" + (c.status === "Resolved"    ? " selected" : "") + ">Resolved</option>" +
                "</select>" +
            "</td>" +
            "<td>" + formatDate(c.submittedDate) + "</td>" +
        "</tr>";
    }).join("");
}

function updateComplaintStatus(complaintId, newStatus) {
    var complaints = getData("complaints", defaultComplaints);
    var idx = complaints.findIndex(function (c) { return c.id === complaintId; });
    if (idx === -1) return;
    complaints[idx].status = newStatus;
    if (newStatus === "Resolved") complaints[idx].resolvedDate = new Date().toISOString().split("T")[0];
    saveData("complaints", complaints);
    showMessage("Complaint status updated to: " + newStatus, "success");
}

// ── Admin Announcements ──────────────────────────────────────

function initAdminAnnouncements(user) {
    renderAdminAnnouncements();

    var form = document.getElementById("announcementForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            postAnnouncement(user);
        });
    }
}

function postAnnouncement(user) {
    var title = document.getElementById("annTitle").value.trim();
    var desc  = document.getElementById("annDesc").value.trim();

    if (!title) { showMessage("Please enter a title.", "error"); return; }
    if (!desc)  { showMessage("Please enter a description.", "error"); return; }

    var announcements = getData("announcements", defaultAnnouncements);
    var newAnn = {
        id:          Date.now(),
        title:       title,
        description: desc,
        date:        new Date().toISOString().split("T")[0],
        postedBy:    user.name
    };

    announcements.unshift(newAnn);
    saveData("announcements", announcements);
    document.getElementById("announcementForm").reset();
    showMessage("Announcement posted successfully!", "success");
    renderAdminAnnouncements();
}

function deleteAnnouncement(annId) {
    if (!confirm("Delete this announcement?")) return;
    var announcements = getData("announcements", defaultAnnouncements);
    announcements = announcements.filter(function (a) { return a.id !== annId; });
    saveData("announcements", announcements);
    renderAdminAnnouncements();
}

function renderAdminAnnouncements() {
    var announcements = getData("announcements", defaultAnnouncements);
    var listEl = document.getElementById("adminAnnList");
    var countEl = document.getElementById("annCount");
    if (countEl) countEl.textContent = announcements.length + " Announcement" + (announcements.length !== 1 ? "s" : "");

    if (!listEl) return;

    if (announcements.length === 0) {
        listEl.innerHTML = "<div class='empty-state'><span class='empty-icon'>📢</span><p>No announcements yet.</p></div>";
        return;
    }

    listEl.innerHTML = announcements.map(function (a) {
        return "<div class='announcement-item' style='display:flex;justify-content:space-between;align-items:flex-start;gap:12px;'>" +
            "<div style='flex:1;'>" +
                "<h4>📢 " + a.title + "</h4>" +
                "<p>" + a.description + "</p>" +
                "<div style='display:flex;gap:16px;'>" +
                    "<span class='announcement-date'>" + formatDate(a.date) + "</span>" +
                    "<span style='font-size:0.78rem;color:#667085;'>by " + (a.postedBy || "Admin") + "</span>" +
                "</div>" +
            "</div>" +
            "<button class='btn-dashboard btn-red' style='font-size:0.78rem;padding:5px 10px;flex-shrink:0;' onclick='deleteAnnouncement(" + a.id + ")'>Delete</button>" +
        "</div>";
    }).join("");
}

document.addEventListener("DOMContentLoaded", initAdminPage);
