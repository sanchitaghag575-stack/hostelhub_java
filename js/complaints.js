// ============================================================
// HostelHub — Complaints JS (student)
// ============================================================

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function initComplaints() {
    var user = requireAuth("student");
    if (!user) return;

    var sidebarUser = document.getElementById("sidebarUser");
    if (sidebarUser) sidebarUser.innerHTML = "<strong>" + user.name + "</strong><br>" + user.email;
    var topbarUser = document.getElementById("topbarUser");
    if (topbarUser) topbarUser.textContent = "👤 " + user.name;

    renderComplaintList(user);

    var form = document.getElementById("complaintForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            submitComplaint(user);
        });
    }
}

function submitComplaint(user) {
    var category = document.getElementById("complaintCategory").value;
    var title    = document.getElementById("complaintTitle").value.trim();
    var desc     = document.getElementById("complaintDesc").value.trim();
    var priority = document.querySelector("input[name='priority']:checked");

    if (!category) { showMessage("Please select a category.", "error"); return; }
    if (!title)    { showMessage("Please enter an issue title.", "error"); return; }
    if (!desc)     { showMessage("Please describe the issue.", "error"); return; }

    var complaints = getData("complaints", defaultComplaints);
    var newComplaint = {
        id:            Date.now(),
        userId:        user.id,
        title:         title,
        category:      category,
        priority:      priority ? priority.value : "Medium",
        description:   desc,
        status:        "Pending",
        submittedDate: new Date().toISOString().split("T")[0],
        resolvedDate:  null
    };

    complaints.push(newComplaint);
    saveData("complaints", complaints);

    document.getElementById("complaintForm").reset();
    showMessage("Complaint #" + newComplaint.id + " submitted successfully!", "success");
    renderComplaintList(user);
}

function renderComplaintList(user) {
    var complaints = getData("complaints", defaultComplaints);
    var mine = complaints.filter(function (c) { return c.userId === user.id; });
    mine.sort(function (a, b) { return b.id - a.id; });

    var listEl = document.getElementById("complaintList");
    if (!listEl) return;

    var countEl = document.getElementById("complaintCount");
    if (countEl) countEl.textContent = mine.length + " complaint" + (mine.length !== 1 ? "s" : "");

    if (mine.length === 0) {
        listEl.innerHTML = "<div class='empty-state'><span class='empty-icon'>🔧</span><p>No complaints submitted yet.</p></div>";
        return;
    }

    listEl.innerHTML = mine.map(function (c) {
        var shortDesc = c.description.length > 90 ? c.description.substring(0, 90) + "..." : c.description;
        return "<div class='complaint-item'>" +
            "<div class='complaint-meta'>" +
                "<h4>#" + c.id + " — " + c.title + "</h4>" +
                "<p>" + shortDesc + "</p>" +
                "<div class='complaint-badges'>" +
                    "<span class='badge badge-info'>" + c.category + "</span>" +
                    getPriorityBadgeHTML(c.priority) +
                "</div>" +
                "<div style='margin-top:8px;font-size:0.78rem;color:#667085;'>Submitted: " + formatDate(c.submittedDate) + (c.resolvedDate ? " &nbsp;|&nbsp; Resolved: " + formatDate(c.resolvedDate) : "") + "</div>" +
            "</div>" +
            "<div class='complaint-status'>" +
                getStatusBadgeHTML(c.status) +
            "</div>" +
        "</div>";
    }).join("");
}

document.addEventListener("DOMContentLoaded", initComplaints);
