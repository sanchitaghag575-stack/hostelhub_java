// ============================================================
// HostelHub — Payments JS (student)
// ============================================================

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function initPayments() {
    var user = requireAuth("student");
    if (!user) return;

    var sidebarUser = document.getElementById("sidebarUser");
    if (sidebarUser) sidebarUser.innerHTML = "<strong>" + user.name + "</strong><br>" + user.email;
    var topbarUser = document.getElementById("topbarUser");
    if (topbarUser) topbarUser.textContent = "👤 " + user.name;

    var payments = getData("payments", defaultPayments);
    var myPayments = payments.filter(function (p) { return p.userId === user.id; });

    // Sort: pending first, then by id desc
    myPayments.sort(function (a, b) {
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (b.status === "Pending" && a.status !== "Pending") return 1;
        return b.id - a.id;
    });

    var pending = myPayments.find(function (p) { return p.status === "Pending"; });

    // Render current payment card
    var currentEl = document.getElementById("currentPayment");
    if (currentEl) {
        if (pending) {
            currentEl.innerHTML =
                "<div class='payment-due-card pending'>" +
                    "<div>" +
                        "<p style='margin:0 0 6px;opacity:0.85;font-size:0.88rem;'>CURRENT DUE — " + pending.month + "</p>" +
                        "<h2>" + formatCurrency(pending.amount) + "</h2>" +
                        "<p>Due Date: " + formatDate(pending.dueDate) + "</p>" +
                        "<p style='margin-top:6px;'><span class='badge badge-warning'>PENDING</span></p>" +
                    "</div>" +
                    "<button class='pay-now-btn' onclick='payNow(" + pending.id + ")'>💳 Pay Now</button>" +
                "</div>";
        } else {
            currentEl.innerHTML =
                "<div class='payment-due-card' style='background:linear-gradient(135deg,#20a66a,#178055);'>" +
                    "<div>" +
                        "<p style='margin:0 0 6px;opacity:0.85;font-size:0.88rem;'>PAYMENT STATUS</p>" +
                        "<h2>All Paid ✓</h2>" +
                        "<p>No outstanding dues this month</p>" +
                    "</div>" +
                    "<span style='font-size:3rem;opacity:0.5;'>✓</span>" +
                "</div>";
        }
    }

    // History table
    var historyEl = document.getElementById("paymentHistory");
    if (historyEl) {
        if (myPayments.length === 0) {
            historyEl.innerHTML = "<div class='empty-state'><span class='empty-icon'>💳</span><p>No payment records found.</p></div>";
            return;
        }
        var rows = myPayments.map(function (p) {
            return "<tr>" +
                "<td>" + p.month + "</td>" +
                "<td>" + formatCurrency(p.amount) + "</td>" +
                "<td>" + formatDate(p.dueDate) + "</td>" +
                "<td>" + (p.paidDate ? formatDate(p.paidDate) : "—") + "</td>" +
                "<td>" + getStatusBadgeHTML(p.status) + "</td>" +
            "</tr>";
        }).join("");
        historyEl.innerHTML =
            "<table class='data-table'>" +
                "<thead><tr><th>Month</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th></tr></thead>" +
                "<tbody>" + rows + "</tbody>" +
            "</table>";
    }
}

function payNow(paymentId) {
    var payments = getData("payments", defaultPayments);
    var idx = payments.findIndex(function (p) { return p.id === paymentId; });
    if (idx === -1) return;

    payments[idx].status   = "Paid";
    payments[idx].paidDate = new Date().toISOString().split("T")[0];
    saveData("payments", payments);

    showMessage("Payment of " + formatCurrency(payments[idx].amount) + " recorded successfully! ✓", "success");
    setTimeout(initPayments, 600);
}

document.addEventListener("DOMContentLoaded", initPayments);
