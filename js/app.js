console.log("HostelHub JavaScript is connected!");

// ========================================
// ROOM DATA
// ========================================

const roomData = {

    "101": {
        name: "Room 101",
        type: "Single Sharing",
        floor: "1st Floor",
        rent: 6000,
        occupancy: "1 Person",
        status: "Available",
        image: "assets/images/room1.jpg"
    },

    "102": {
        name: "Room 102",
        type: "Double Sharing",
        floor: "1st Floor",
        rent: 5500,
        occupancy: "1/2 Occupied",
        status: "Available",
        image: "assets/images/room2.jpg"
    },

    "201": {
        name: "Room 201",
        type: "Triple Sharing",
        floor: "2nd Floor",
        rent: 4500,
        occupancy: "2/3 Occupied",
        status: "Available",
        image: "assets/images/room3.jpg"
    },

    "205": {
        name: "Room 205",
        type: "Triple Sharing",
        floor: "2nd Floor",
        rent: 4500,
        occupancy: "2/3 Occupied",
        status: "Available",
        image: "assets/images/room3.jpg"
    },

    "301": {
        name: "Room 301",
        type: "Single Sharing",
        floor: "3rd Floor",
        rent: 6500,
        occupancy: "1 Person",
        status: "Available",
        image: "assets/images/room1.jpg"
    },

    "308": {
        name: "Room 308",
        type: "Double Sharing",
        floor: "3rd Floor",
        rent: 5500,
        occupancy: "2/2 Occupied",
        status: "Partial",
        image: "assets/images/room2.jpg"
    }

};

// ========================================
// ROOM FILTERS
// ========================================

const roomSearch = document.getElementById("roomSearch");
const roomTypeFilter = document.getElementById("roomTypeFilter");
const rentFilter = document.getElementById("rentFilter");
const rooms = document.querySelectorAll("#roomsGrid .room-card");


function filterRooms() {

    const searchValue = roomSearch
        ? roomSearch.value.toLowerCase().trim()
        : "";

    const selectedType = roomTypeFilter
        ? roomTypeFilter.value
        : "all";

    const selectedRent = rentFilter
        ? rentFilter.value
        : "all";

    const noRoomsMessage =
    document.getElementById("noRoomsMessage");

let visibleRooms = 0;
    rooms.forEach(function(room) {

        const roomNumber =
            room.querySelector("h3").textContent.toLowerCase();

        const roomType =
            room.dataset.type;

        const roomRent =
            Number(room.dataset.rent);


        const matchesSearch =
            roomNumber.includes(searchValue);

        const matchesType =
            selectedType === "all" ||
            roomType === selectedType;

        const matchesRent =
            selectedRent === "all" ||
            roomRent <= Number(selectedRent);

        
        if (matchesSearch && matchesType && matchesRent) 
            {
            room.style.display = "";
            }
        else 
            {
            room.style.display = "none";
            }
    });
        if (noRoomsMessage) {

    if (visibleRooms === 0) {
        noRoomsMessage.style.display = "block";
    } else {
        noRoomsMessage.style.display = "none";
    }

}
}


// Search

if (roomSearch) {

    roomSearch.addEventListener(
        "input",
        filterRooms
    );

}


// Room type filter

if (roomTypeFilter) {

    roomTypeFilter.addEventListener(
        "change",
        filterRooms
    );

}


// Rent filter

if (rentFilter) {

    rentFilter.addEventListener(
        "change",
        filterRooms
    );

}


// Clear filters

function clearRoomFilters() {

    if (roomSearch) {
        roomSearch.value = "";
    }

    if (roomTypeFilter) {
        roomTypeFilter.value = "all";
    }

    if (rentFilter) {
        rentFilter.value = "all";
    }

    filterRooms();

}
// ========================================
// ROOM DETAILS
// ========================================

const urlParams = new URLSearchParams(
    window.location.search
);

const roomId = urlParams.get("id");

const selectedRoom = roomData[roomId];
console.log("URL Room ID:", roomId);
console.log("Selected Room:", selectedRoom);
if (selectedRoom &&
    document.getElementById("detailRoomName")) {

    const detailRoomName =
        document.getElementById("detailRoomName");

    const detailRoomType =
        document.getElementById("detailRoomType");

    const detailRoomRent =
        document.getElementById("detailRoomRent");

    const detailOccupancy =
        document.getElementById("detailOccupancy");

    const detailFloor =
        document.getElementById("detailFloor");

    const detailType =
        document.getElementById("detailType");

    const detailAvailability =
        document.getElementById("detailAvailability");

    const detailRoomImage =
        document.getElementById("detailRoomImage");

    const detailRoomStatus =
        document.getElementById("detailRoomStatus");


    detailRoomName.textContent =
        selectedRoom.name;


    detailRoomType.textContent =
        `${selectedRoom.type} • ${selectedRoom.floor}`;


    detailRoomRent.textContent =
        `₹${selectedRoom.rent.toLocaleString("en-IN")}`;


    detailOccupancy.textContent =
        selectedRoom.occupancy;


    detailFloor.textContent =
        selectedRoom.floor;


    detailType.textContent =
        selectedRoom.type;


    detailAvailability.textContent =
        selectedRoom.status;


    detailRoomImage.src =
        selectedRoom.image;


    detailRoomStatus.textContent =
        selectedRoom.status;


    if (selectedRoom.status === "Partial") {

        detailRoomStatus.classList.remove(
            "available"
        );

        detailRoomStatus.classList.add(
            "partial"
        );

    }
    const applyRoomBtn =
    document.getElementById("applyRoomBtn");

if (applyRoomBtn) {

   applyRoomBtn.href =
    `apply.html?id=${roomId}`;

}
}
// ========================================
// ROOM APPLICATION PAGE
// ========================================

const applyRoomId =
    new URLSearchParams(window.location.search).get("id");

if (
    applyRoomId &&
    document.getElementById("applyRoomName")
) {

    const applyRoom =
        roomData[applyRoomId];

    if (applyRoom) {

        document.getElementById(
            "applyRoomName"
        ).textContent =
            applyRoom.name;

        document.getElementById(
            "applyRoomType"
        ).textContent =
            applyRoom.type;

        document.getElementById(
            "applyRoomRent"
        ).textContent =
            `₹${applyRoom.rent.toLocaleString("en-IN")} / month`;

        document.getElementById(
            "applyRoomFloor"
        ).textContent =
            applyRoom.floor;

    }

}
// ========================================
// SAVE ROOM APPLICATION
// ========================================

const applicationForm =
    document.getElementById("roomApplicationForm");

if (applicationForm) {

    applicationForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const application = {
            id: Date.now(),
            roomId: applyRoomId,
            roomName: document.getElementById("applyRoomName").textContent,
            status: "Pending",
            fullName: document.getElementById("fullName").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            college: document.getElementById("college").value,
            address: document.getElementById("address").value,
            submittedAt: new Date().toISOString()
        };

        const existingApplications =
            JSON.parse(
                localStorage.getItem("hostelApplications")
            ) || [];

        existingApplications.push(application);

        localStorage.setItem(
            "hostelApplications",
            JSON.stringify(existingApplications)
        );

        alert("Application submitted successfully!");

    });

}
// ========================================
// DISPLAY SAVED APPLICATIONS
// ========================================

const applicationList =
    document.getElementById("applicationList");

if (applicationList) {

    const statusFilter =
        document.getElementById("statusFilter");
    function getStatusBadge(status) {

        const currentStatus = status || "Pending";

        return `
            <span class="status-badge status-${currentStatus.toLowerCase()}">
                ${currentStatus}
            </span>
        `;

    }
    function displayApplications(filter = "All") {

        const savedApplications =
            JSON.parse(
                localStorage.getItem("hostelApplications")
            ) || [];

        const filteredApplications =
            filter === "All"
                ? savedApplications
                : savedApplications.filter(
                    application =>
                        (application.status || "Pending") === filter
                );

        if (filteredApplications.length > 0) {

            applicationList.innerHTML =
                filteredApplications.map(application => `

                    <div class="selected-room-card">

                        <h2>Application Details</h2>

                        <p>
                            <strong>Room:</strong>
                            ${application.roomName}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${getStatusBadge(application.status)}
                        </p>

                        <p>
                            <strong>Name:</strong>
                            ${application.fullName}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${application.email}
                        </p>

                        <p>
                            <strong>Phone:</strong>
                            ${application.phone}
                        </p>

                        <p>
                            <strong>College:</strong>
                            ${application.college}
                        </p>

                        <p>
                            <strong>Address:</strong>
                            ${application.address}
                        </p>

                        <p>
                            <strong>Submitted:</strong>
                            ${new Date(application.submittedAt).toLocaleString("en-IN")}
                        </p>
                        <div class="application-actions">

                            <button
                                onclick="updateApplicationStatus(${application.id}, 'Approved')"
                            >
                                Approve
                            </button>

                            <button
                                onclick="updateApplicationStatus(${application.id}, 'Rejected')"
                            >
                                Reject
                            </button>

                            <button
                                onclick="deleteApplication(${application.id})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `).join("");

        } else {

            applicationList.innerHTML = `
                <p>No applications found.</p>
            `;

        }

    }

    displayApplications();

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                displayApplications(
                    statusFilter.value
                );

            }
        );

    }

}

// ========================================
// UPDATE APPLICATION STATUS
// ========================================

function updateApplicationStatus(applicationId, newStatus) {

    const applications =
        JSON.parse(
            localStorage.getItem("hostelApplications")
        ) || [];

    const application =
        applications.find(
            app => app.id === applicationId
        );

    if (application) {

        application.status = newStatus;

        localStorage.setItem(
            "hostelApplications",
            JSON.stringify(applications)
        );

        location.reload();

    }

}
// ========================================
// DELETE APPLICATION
// ========================================

function deleteApplication(applicationId) {

    const confirmDelete =
        confirm("Are you sure you want to delete this application?");

    if (!confirmDelete) {
        return;
    }

    const applications =
        JSON.parse(
            localStorage.getItem("hostelApplications")
        ) || [];

    const updatedApplications =
        applications.filter(
            application => application.id !== applicationId
        );

    localStorage.setItem(
        "hostelApplications",
        JSON.stringify(updatedApplications)
    );

    location.reload();

}
// ========================================
// ADMIN DASHBOARD
// ========================================

const totalApplications =
    document.getElementById("totalApplications");

if (totalApplications) {

    const applications =
        JSON.parse(
            localStorage.getItem("hostelApplications")
        ) || [];

    const pendingCount =
        applications.filter(
            application =>
                (application.status || "Pending") === "Pending"
        ).length;

    const approvedCount =
        applications.filter(
            application =>
                application.status === "Approved"
        ).length;

    const rejectedCount =
        applications.filter(
            application =>
                application.status === "Rejected"
        ).length;

    totalApplications.textContent =
        applications.length;

    document.getElementById(
        "pendingApplications"
    ).textContent = pendingCount;

    document.getElementById(
        "approvedApplications"
    ).textContent = approvedCount;

    document.getElementById(
        "rejectedApplications"
    ).textContent = rejectedCount;

}
// ========================================
// DASHBOARD APPLICATION LIST
// ========================================

const dashboardApplications =
    document.getElementById("dashboardApplications");

if (dashboardApplications) {

    const applications =
        JSON.parse(
            localStorage.getItem("hostelApplications")
        ) || [];

    if (applications.length > 0) {

        dashboardApplications.innerHTML = `
            <div class="selected-room-card">

                <h2>Recent Applications</h2>

                ${applications.map(application => `

                    <div class="dashboard-application">

                        <p>
                            <strong>Room:</strong>
                            ${application.roomName}
                        </p>

                        <p>
                            <strong>Name:</strong>
                            ${application.fullName}
                        </p>

                       <p>
                            <strong>Status:</strong>
                            ${getStatusBadge(application.status)}
                        </p>

                    </div>

                `).join("")}

            </div>
        `;

    } else {

        dashboardApplications.innerHTML = `
            <div class="selected-room-card">
                <p>No applications found.</p>
            </div>
        `;

    }

}
// ========================================
// CLEAR ALL APPLICATIONS
// ========================================

function clearAllApplications() {

    const confirmClear =
        confirm("Are you sure you want to clear all applications?");

    if (!confirmClear) {
        return;
    }

    localStorage.removeItem("hostelApplications");

    location.reload();

}
// ========================================
// CONTACT FORM
// ========================================

const contactForm =
    document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();

        alert("Your message has been sent successfully!");

        contactForm.reset();

    });

}
// ========================================
// HOME PAGE ROOM SEARCH
// ========================================

function selectAndSearchCollege(collegeName) {
    const searchInput = document.getElementById("collegeSearch");
    if (searchInput) {
        searchInput.value = collegeName;
    }
    searchCollege(collegeName);
}

function searchCollege(customQuery) {
    const searchInput = document.getElementById("collegeSearch");
    const rawInput = customQuery !== undefined ? customQuery : (searchInput ? searchInput.value : "");
    const collegeInput = (rawInput || "").trim();
    const roomTypeSelect = document.getElementById("roomTypeSearch");
    const roomType = roomTypeSelect ? roomTypeSelect.value : "all";
    const msgContainer = document.getElementById("heroSearchMessage") || document.getElementById("messageContainer");

    function displaySearchFeedback(message, type) {
        if (msgContainer) {
            const icon = type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ";
            msgContainer.innerHTML =
                '<div class="alert alert-' + type + '">' +
                    '<span class="alert-icon">' + icon + '</span>' +
                    '<div style="flex: 1;">' + message + '</div>' +
                '</div>';
            msgContainer.style.display = "block";
        } else {
            if (type === "error" || type === "info") {
                alert(message.replace(/<[^>]+>/g, ""));
            }
        }
    }

    if (!collegeInput) {
        displaySearchFeedback("Please enter your college name, abbreviation (e.g. DMCE, SIES, Somaiya), or area.", "info");
        return;
    }

    // Load colleges with fallback to defaultColleges
    let colleges = [];
    if (typeof getData === "function") {
        colleges = getData("colleges", typeof defaultColleges !== "undefined" ? defaultColleges : []);
    } else {
        try {
            colleges = JSON.parse(localStorage.getItem("colleges")) || [];
        } catch (e) {
            colleges = [];
        }
    }
    if ((!colleges || !colleges.length) && typeof defaultColleges !== "undefined") {
        colleges = defaultColleges;
    }

    if (!colleges || !colleges.length) {
        displaySearchFeedback("Unable to load college directory. Please try again later.", "error");
        return;
    }

    // Normalize query
    const cleanQuery = collegeInput.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const queryWords = cleanQuery.split(" ").filter(function (w) {
        return w.length > 0 && ["college", "of", "engineering", "arts", "science", "commerce", "the", "institute"].indexOf(w) === -1;
    });

    // Known aliases and abbreviations for supported colleges
    const collegeAliases = {
        "dmce": ["dmce", "datta meghe", "datta", "meghe", "airoli"],
        "sies-nerul": ["sies", "sies nerul", "sies asc", "nerul", "sies college"],
        "kj-somaiya": ["kj", "somaiya", "kj somaiya", "kjsce", "vidyavihar", "k j somaiya", "somaiya college"]
    };

    let selectedCollege = null;

    // 1. Direct ID match
    selectedCollege = colleges.find(function (c) {
        return c.id.toLowerCase() === cleanQuery || c.id.toLowerCase() === collegeInput.toLowerCase();
    });

    // 2. Exact or substring match on college name
    if (!selectedCollege) {
        selectedCollege = colleges.find(function (c) {
            const nameNorm = c.name.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
            return nameNorm.indexOf(cleanQuery) !== -1 || cleanQuery.indexOf(nameNorm) !== -1;
        });
    }

    // 3. Alias / abbreviation match
    if (!selectedCollege) {
        selectedCollege = colleges.find(function (c) {
            const aliases = collegeAliases[c.id] || [];
            return aliases.some(function (alias) {
                return alias === cleanQuery || cleanQuery.indexOf(alias) !== -1 || alias.indexOf(cleanQuery) !== -1;
            });
        });
    }

    // 4. Token-based match on distinctive words
    if (!selectedCollege && queryWords.length > 0) {
        selectedCollege = colleges.find(function (c) {
            const nameNorm = c.name.toLowerCase();
            const areaNorm = (c.area || "").toLowerCase();
            const cityNorm = (c.city || "").toLowerCase();
            return queryWords.every(function (word) {
                return nameNorm.indexOf(word) !== -1 || areaNorm.indexOf(word) !== -1 || cityNorm.indexOf(word) !== -1;
            });
        });
    }

    // 5. Area / city match fallback
    if (!selectedCollege) {
        selectedCollege = colleges.find(function (c) {
            const areaNorm = (c.area || "").toLowerCase();
            const cityNorm = (c.city || "").toLowerCase();
            return areaNorm.indexOf(cleanQuery) !== -1 || cleanQuery.indexOf(areaNorm) !== -1 || cityNorm.indexOf(cleanQuery) !== -1;
        });
    }

    if (!selectedCollege) {
        const safeQuery = collegeInput.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const suggestionsHtml = colleges.map(function (c) {
            const safeName = c.name.replace(/'/g, "\\'");
            return '<button type="button" onclick="selectAndSearchCollege(\'' + safeName + '\')" ' +
                'style="display:inline-block; margin: 4px 6px 4px 0; padding: 5px 12px; background: #fff; border: 1px solid #cbd5e1; border-radius: 16px; font-size: 0.82rem; cursor: pointer; color: #07549b; font-weight: 600;">' +
                '📍 ' + c.name + ' (' + c.area + ')' +
                '</button>';
        }).join("");

        displaySearchFeedback(
            '<div>' +
                '<strong>College not found.</strong> No matching supported college found for "<em>' + safeQuery + '</em>".' +
                '<div style="margin-top: 6px; font-weight: 500;">Currently supported colleges:</div>' +
                '<div style="margin-top: 6px;">' + suggestionsHtml + '</div>' +
            '</div>',
            'error'
        );
        return;
    }

    // College found!
    if (searchInput) searchInput.value = selectedCollege.name;
    sessionStorage.setItem("selectedCollege", JSON.stringify(selectedCollege));

    displaySearchFeedback('Found <strong>' + selectedCollege.name + '</strong>! Taking you to nearby accommodations...', 'success');

    let url = "rooms.html?collegeId=" + encodeURIComponent(selectedCollege.id);
    if (roomType && roomType !== "all") {
        url += "&type=" + encodeURIComponent(roomType);
    }

    setTimeout(function () {
        window.location.href = url;
    }, 400);
}

// Attach Enter key listener to search input
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("collegeSearch");
    if (searchInput) {
        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                searchCollege();
            }
        });
    }
});
// ========================================
// USE CURRENT LOCATION
// ========================================

function useCurrentLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");

        return;
    }

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            alert(
                `Your location:\nLatitude: ${latitude}\nLongitude: ${longitude}`
            );

        },

        function () {

            alert(
                "Unable to access your location. Please allow location permission."
            );

        }

    );

}
// ========================================
// USER REGISTRATION
// ========================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm && typeof handleRegister === "undefined") {

    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;
        }
        const user = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            role: "student"
        };

        localStorage.setItem(
            "hostelUser",
            JSON.stringify(user)
        );
        localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
        );

        alert("Registration successful!");

        window.location.href = "login.html";

    });

}
// ========================================
// USER LOGIN
// ========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm && typeof handleLogin === "undefined") {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        let savedUser =
            JSON.parse(
                localStorage.getItem("currentUser")
            ) ||
            JSON.parse(
                localStorage.getItem("hostelUser")
            );

        if (!savedUser && typeof defaultUsers !== "undefined") {
            savedUser = defaultUsers.find(function (u) {
                return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
            });
        }

        if (!savedUser) {

            alert("No account found. Please register first.");

            return;
        }

        if (
            email.toLowerCase() === savedUser.email.toLowerCase() &&
            password === savedUser.password
        ) {

            localStorage.setItem(
                "hostelLoggedIn",
                "true"
            );
            localStorage.setItem(
                "currentUser",
                JSON.stringify(savedUser)
            );
            localStorage.setItem(
                "hostelUser",
                JSON.stringify(savedUser)
            );

            alert("Login successful!");

            if (savedUser.role === "admin") {
                window.location.href = "admin/dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } else {

            alert("Invalid email or password.");

        }

    });

}
// ========================================
// USER LOGOUT
// ========================================

function logoutUser() {

    localStorage.removeItem("currentUser");
    localStorage.removeItem("hostelLoggedIn");
    localStorage.removeItem("hostelUser");

    alert("You have been logged out.");

    const base = typeof getBasePath === "function" ? getBasePath() : "";
    window.location.href = base + "login.html";
}
// ========================================
// DASHBOARD LOGIN PROTECTION
// ========================================

const normAppPath = (window.location.pathname || "").replace(/\\/g, "/");
const isRootAppPage = !normAppPath.includes("/admin/") && !normAppPath.includes("/student/");

if (isRootAppPage && normAppPath.endsWith("dashboard.html")) {

    const isLoggedIn =
        localStorage.getItem("hostelLoggedIn") === "true" || !!localStorage.getItem("currentUser");

    if (!isLoggedIn) {

        alert("Please login to access the dashboard.");

        window.location.href = "login.html";
    }
}
// ========================================
// APPLICATIONS LOGIN PROTECTION
// ========================================

if (isRootAppPage && normAppPath.endsWith("applications.html")) {

    const isLoggedIn =
        localStorage.getItem("hostelLoggedIn") === "true" || !!localStorage.getItem("currentUser");

    if (!isLoggedIn) {

        alert("Please login to view applications.");

        window.location.href = "login.html";
    }
}
// ========================================
// APPLY PAGE LOGIN PROTECTION
// ========================================

if (isRootAppPage && normAppPath.endsWith("apply.html")) {

    const isLoggedIn =
        localStorage.getItem("hostelLoggedIn") === "true" || !!localStorage.getItem("currentUser");

    if (!isLoggedIn) {

        alert("Please login to apply for a room.");

        window.location.href = "login.html";
    }
}
// ========================================
// DISPLAY LOGGED-IN USER
// ========================================

const dashboardUserName =
    document.getElementById("dashboardUserName");

if (dashboardUserName) {

    const savedUser =
        JSON.parse(
            localStorage.getItem("currentUser")
        ) ||
        JSON.parse(
            localStorage.getItem("hostelUser")
        );

    if (savedUser) {
        dashboardUserName.textContent =
            savedUser.name;
    }
}
// ========================================
// LOGIN STATUS
// ========================================

const loginStatus =
    document.getElementById("loginStatus");

if (loginStatus) {

    const isLoggedIn =
        localStorage.getItem("hostelLoggedIn") === "true" || !!localStorage.getItem("currentUser");

    if (isLoggedIn) {
        loginStatus.textContent = "Logged In";
    } else {
        loginStatus.textContent = "Not Logged In";
    }
}
// ========================================
// FORGOT PASSWORD
// ========================================

function forgotPassword() {

    alert(
        "Password recovery will be added in a future version."
    );
}