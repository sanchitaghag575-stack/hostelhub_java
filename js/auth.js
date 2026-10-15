// ============================================================
// HostelHub — Authentication
// Load after data.js and storage.js on every page.
// ============================================================

// ── Current user ─────────────────────────────────────────────

function getCurrentUser() {
    var raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
}

// ── Route guard ───────────────────────────────────────────────
// role: "student" | "admin" | null (any logged-in user)
// Returns the user object if allowed, null otherwise (and redirects).

function requireAuth(role) {
    var user = getCurrentUser();
    var base = getBasePath();

    if (!user) {
        window.location.href = base + "login.html";
        return null;
    }

    if (role && user.role !== role) {
        if (user.role === "admin") {
            window.location.href = base + "admin/dashboard.html";
        } else {
            window.location.href = base + "student/dashboard.html";
        }
        return null;
    }

    return user;
}

// ── Logout ────────────────────────────────────────────────────

function logoutUser() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("hostelLoggedIn");
    localStorage.removeItem("hostelUser");
    window.location.href = getBasePath() + "login.html";
}

// ── Navbar update ─────────────────────────────────────────────
// Populates #navButtons on public pages (index, rooms, etc.)
// with the correct Login/Register OR Username/Dashboard/Logout links.

function updateNavbar() {
    var user       = getCurrentUser();
    var navButtons = document.getElementById("navButtons");
    if (!navButtons) return;

    var base = getBasePath();

    if (user) {
        navButtons.innerHTML =
            "<span class=\"nav-user\">👤 " + user.name + "</span>" +
            "<a href=\"" + base + (user.role === "admin" ? "admin" : "student") + "/dashboard.html\" class=\"btn btn-outline\">Dashboard</a>" +
            "<button onclick=\"logoutUser()\" class=\"btn btn-primary\">Logout</button>";
    } else {
        navButtons.innerHTML =
            "<a href=\"" + base + "login.html\" class=\"btn btn-outline\">Login</a>" +
            "<a href=\"" + base + "register.html\" class=\"btn btn-primary\">Register</a>";
    }
}

// ── Sidebar active link highlighting ─────────────────────────
// Adds .active class to whichever sidebar link matches the
// current page filename.

function highlightSidebarLink() {
    var currentPage = window.location.pathname.split("/").pop();
    var links       = document.querySelectorAll(".sidebar-link");
    links.forEach(function (link) {
        var href = link.getAttribute("href");
        if (href && href.indexOf(currentPage) !== -1) {
            link.classList.add("active");
        }
    });
}

// ── Login handler ─────────────────────────────────────────────

function handleLogin(event) {
    event.preventDefault();

    var email    = document.getElementById("loginEmail").value.trim();
    var password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showMessage("Please fill in all fields.", "error");
        return;
    }

    var users = getData("users", defaultUsers);
    var user  = null;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email && users[i].email.toLowerCase() === email.toLowerCase() && users[i].password === password) {
            user = users[i];
            break;
        }
    }

    // Fallback: check if registered via hostelUser
    if (!user) {
        var rawHostelUser = localStorage.getItem("hostelUser");
        if (rawHostelUser) {
            try {
                var legacy = JSON.parse(rawHostelUser);
                if (legacy.email && legacy.email.toLowerCase() === email.toLowerCase() && legacy.password === password) {
                    user = {
                        id: legacy.id || Date.now(),
                        name: legacy.name || "User",
                        email: legacy.email,
                        password: legacy.password,
                        role: legacy.role || (email.toLowerCase().includes("admin") ? "admin" : "student"),
                        phone: legacy.phone || "",
                        college: legacy.college || "",
                        address: legacy.address || "",
                        roomId: null,
                        joinDate: new Date().toISOString().split("T")[0]
                    };
                    users.push(user);
                    saveData("users", users);
                }
            } catch (e) {}
        }
    }

    if (!user) {
        showMessage(
            "Invalid email or password.<br>Try <strong>student@gmail.com</strong> / <strong>1234</strong> " +
            "or <strong>admin@gmail.com</strong> / <strong>admin123</strong>",
            "error"
        );
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("hostelLoggedIn", "true");
    localStorage.setItem("hostelUser", JSON.stringify(user));
    showMessage("Login successful! Redirecting...", "success");

    var base = getBasePath();
    setTimeout(function () {
        if (user.role === "admin") {
            window.location.href = base + "admin/dashboard.html";
        } else {
            window.location.href = base + "student/dashboard.html";
        }
    }, 700);
}

// ── Register handler ──────────────────────────────────────────

function handleRegister(event) {
    event.preventDefault();

    var name            = document.getElementById("registerName").value.trim();
    var email           = document.getElementById("registerEmail").value.trim();
    var password        = document.getElementById("registerPassword").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    if (!name) {
        showMessage("Please enter your full name.", "error");
        return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
        showMessage("Please enter a valid email address.", "error");
        return;
    }

    if (password.length < 4) {
        showMessage("Password must be at least 4 characters.", "error");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
    }

    var users     = getData("users", defaultUsers);
    var duplicate = false;
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) { duplicate = true; break; }
    }
    if (duplicate) {
        showMessage("An account with this email already exists.", "error");
        return;
    }

    var newUser = {
        id:       Date.now(),
        name:     name,
        email:    email,
        password: password,
        role:     "student",
        phone:    "",
        college:  "",
        address:  "",
        roomId:   null,
        joinDate: new Date().toISOString().split("T")[0]
    };

    users.push(newUser);
    saveData("users", users);
    localStorage.setItem("hostelUser", JSON.stringify(newUser));

    showMessage("Account created! Redirecting to login...", "success");
    setTimeout(function () {
        window.location.href = getBasePath() + "login.html";
    }, 1000);
}

// ── Auto-attach on DOMContentLoaded ───────────────────────────

document.addEventListener("DOMContentLoaded", function () {
    updateNavbar();
    highlightSidebarLink();

    var loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);

    var registerForm = document.getElementById("registerForm");
    if (registerForm) registerForm.addEventListener("submit", handleRegister);
});
