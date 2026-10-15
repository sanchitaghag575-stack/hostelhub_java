// ============================================================
// HostelHub - PG Listings Page
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const collegeId = params.get("collegeId");
    const roomType = params.get("type");

    let colleges = [];
    if (typeof getData === "function") {
        colleges = getData("colleges", typeof defaultColleges !== "undefined" ? defaultColleges : []);
    } else {
        try { colleges = JSON.parse(localStorage.getItem("colleges")) || []; } catch (e) {}
    }
    if ((!colleges || !colleges.length) && typeof defaultColleges !== "undefined") {
        colleges = defaultColleges;
    }

    let allPGs = [];
    if (typeof getData === "function") {
        allPGs = getData("pgs", typeof defaultPGs !== "undefined" ? defaultPGs : []);
    } else {
        try { allPGs = JSON.parse(localStorage.getItem("pgs")) || []; } catch (e) {}
    }
    if ((!allPGs || !allPGs.length) && typeof defaultPGs !== "undefined") {
        allPGs = defaultPGs;
    }

    let selectedCollege = null;

    // ------------------------------------------------------------
    // Find selected college if collegeId exists
    // ------------------------------------------------------------

    if (collegeId) {
        selectedCollege = colleges.find(function (college) {
            return college.id.toLowerCase() === collegeId.toLowerCase();
        });

        if (!selectedCollege) {
            try {
                const sessionCollege = JSON.parse(sessionStorage.getItem("selectedCollege"));
                if (sessionCollege && sessionCollege.id.toLowerCase() === collegeId.toLowerCase()) {
                    selectedCollege = sessionCollege;
                }
            } catch (e) {}
        }
    }

    // ------------------------------------------------------------
    // IMPORTANT:
    // If no collegeId is present, show ALL PGs.
    // ------------------------------------------------------------

    let filteredPGs = allPGs;

    if (selectedCollege) {

        filteredPGs = allPGs.filter(function (pg) {

            // Primary match: collegeId
            if (pg.collegeId &&
                String(pg.collegeId) === String(selectedCollege.id)) {
                return true;
            }

            // Secondary match: college name
            if (pg.college &&
                selectedCollege.name &&
                pg.college
                    .toLowerCase()
                    .includes(selectedCollege.name.toLowerCase())) {
                return true;
            }

            return false;
        });
    }

    // ------------------------------------------------------------
    // Page heading
    // ------------------------------------------------------------

    updatePageHeading(selectedCollege, collegeId);

    // ------------------------------------------------------------
    // Room type from URL
    // ------------------------------------------------------------

    if (roomType && roomType !== "all") {

        filteredPGs = filteredPGs.filter(function (pg) {

            if (!pg.sharing) {
                return false;
            }

            return Object.prototype.hasOwnProperty.call(
                pg.sharing,
                roomType
            );
        });
    }

    // ------------------------------------------------------------
    // Get elements
    // ------------------------------------------------------------

    const searchInput =
        document.getElementById("searchInput") ||
        document.getElementById("pgSearch") ||
        document.querySelector(
            'input[placeholder*="PG name"], input[placeholder*="PG Name"], input[placeholder*="area"]'
        );

    const sharingSelect =
        document.getElementById("sharingFilter") ||
        document.getElementById("roomTypeFilter");

    const rentSelect =
        document.getElementById("rentFilter") ||
        document.getElementById("maxRent");

    const genderRadios =
        document.querySelectorAll('input[name="gender"]');

    const sortSelect =
        document.getElementById("sortFilter") ||
        document.getElementById("sortBy");

    const distanceSelect =
        document.getElementById("distanceFilter");

    const clearButton =
        document.getElementById("clearFilters") ||
        document.querySelector(
            'button[onclick*="clear"], button.clear-filters'
        );

    const pgContainer =
        document.getElementById("pgContainer") ||
        document.getElementById("roomsContainer") ||
        document.getElementById("pgListings") ||
        document.querySelector(".rooms-grid") ||
        document.querySelector(".pg-grid") ||
        document.querySelector(".room-grid");

    // ------------------------------------------------------------
    // Amenity checkboxes
    // ------------------------------------------------------------

    const amenityCheckboxes =
        document.querySelectorAll(
            'input[type="checkbox"][data-amenity]'
        );

    // ------------------------------------------------------------
    // Render
    // ------------------------------------------------------------

    function renderPGs(list) {

        if (!pgContainer) {
            console.error(
                "HostelHub: PG container not found."
            );
            return;
        }

        if (!list || list.length === 0) {

            pgContainer.innerHTML = `
                <div class="empty-state" style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px 20px;
                ">
                    <h2>No PGs found</h2>
                    <p>
                        Try changing your filters or search for another area.
                    </p>
                </div>
            `;

            updateResultCount(0);
            return;
        }

        pgContainer.innerHTML = list.map(function (pg) {

            const rent = getLowestRent(pg);

            const image =
                pg.image ||
                "assets/images/room1.jpg";

            const amenities =
                getAmenities(pg);

            const gender =
                pg.gender || "Co-ed";

            const rating =
                pg.rating !== undefined &&
                pg.rating !== null
                    ? `⭐ ${pg.rating}`
                    : "";

            const distance =
                pg.distanceKm !== undefined &&
                pg.distanceKm !== null
                    ? `${pg.distanceKm} km from college`
                    : "";

            const college =
                pg.college || "";

            const location =
                pg.area ||
                pg.city ||
                "";

            return `
                <div class="room-card pg-card">

                    <div class="room-image-container">

                        <img
                            src="${image}"
                            alt="${escapeHTML(pg.name || "PG")}"
                            class="room-image"
                            onerror="this.src='assets/images/room1.jpg'"
                        >

                        <span class="room-status available">
                            Available
                        </span>

                    </div>

                    <div class="room-card-content">

                        <h3>
                            ${escapeHTML(pg.name || "PG")}
                        </h3>

                        <p class="room-location">
                            📍 ${escapeHTML(location)}
                        </p>

                        ${
                            college
                                ? `
                                <p class="room-college">
                                    🎓 ${escapeHTML(college)}
                                </p>
                                `
                                : ""
                        }

                        <div class="room-info">

                            <span>
                                👥 ${escapeHTML(gender)}
                            </span>

                            ${
                                distance
                                    ? `
                                    <span>
                                        📏 ${distance}
                                    </span>
                                    `
                                    : ""
                            }

                            ${
                                rating
                                    ? `
                                    <span>
                                        ${rating}
                                    </span>
                                    `
                                    : ""
                            }

                        </div>

                        <div class="room-price">
                            <strong>
                                ₹${formatNumber(rent)}
                            </strong>

                            <span>/month onwards</span>
                        </div>

                        <div class="amenities">

                            ${amenities
                                .slice(0, 5)
                                .map(function (amenity) {
                                    return `
                                        <span class="amenity-tag">
                                            ${escapeHTML(amenity)}
                                        </span>
                                    `;
                                })
                                .join("")}

                        </div>

                        <a
                            href="room-details.html?pgId=${encodeURIComponent(pg.id)}"
                            class="btn btn-primary"
                        >
                            View Details
                        </a>

                    </div>

                </div>
            `;

        }).join("");

        updateResultCount(list.length);
    }

    // ------------------------------------------------------------
    // Apply all filters
    // ------------------------------------------------------------

    function applyFilters() {

        let results = filteredPGs.slice();

        // --------------------------------------------------------
        // Search
        // --------------------------------------------------------

        const searchValue =
            searchInput
                ? searchInput.value.trim().toLowerCase()
                : "";

        if (searchValue) {

            results = results.filter(function (pg) {

                const searchableText = [

                    pg.name,
                    pg.area,
                    pg.city,
                    pg.college,
                    pg.gender

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(searchValue);
            });
        }

        // --------------------------------------------------------
        // Sharing
        // --------------------------------------------------------

        const sharingValue =
            sharingSelect
                ? sharingSelect.value
                : "all";

        if (
            sharingValue &&
            sharingValue !== "all"
        ) {

            results = results.filter(function (pg) {

                if (!pg.sharing) {
                    return false;
                }

                return Object.prototype.hasOwnProperty.call(
                    pg.sharing,
                    sharingValue
                );
            });
        }

        // --------------------------------------------------------
        // Maximum rent
        // --------------------------------------------------------

        const rentValue =
            rentSelect
                ? rentSelect.value
                : "all";

        if (
            rentValue &&
            rentValue !== "all"
        ) {

            const maxRent =
                Number(rentValue);

            results = results.filter(function (pg) {

                return getLowestRent(pg) <= maxRent;
            });
        }

        // --------------------------------------------------------
        // Gender
        // --------------------------------------------------------

        let selectedGender = "all";

        genderRadios.forEach(function (radio) {

            if (radio.checked) {
                selectedGender = radio.value;
            }

        });

        if (
            selectedGender &&
            selectedGender !== "all"
        ) {

            results = results.filter(function (pg) {

                const pgGender =
                    String(pg.gender || "")
                        .toLowerCase();

                return (
                    pgGender ===
                    selectedGender.toLowerCase()
                );
            });
        }

        // --------------------------------------------------------
        // Distance
        // --------------------------------------------------------

        const distanceValue =
            distanceSelect
                ? distanceSelect.value
                : "all";

        if (
            distanceValue &&
            distanceValue !== "all"
        ) {

            const maxDistance =
                Number(distanceValue);

            results = results.filter(function (pg) {

                if (
                    pg.distanceKm === undefined ||
                    pg.distanceKm === null
                ) {
                    return false;
                }

                return (
                    Number(pg.distanceKm) <=
                    maxDistance
                );
            });
        }

        // --------------------------------------------------------
        // Amenities
        // --------------------------------------------------------

        const selectedAmenities = [];

        amenityCheckboxes.forEach(function (checkbox) {

            if (checkbox.checked) {

                const amenity =
                    checkbox.dataset.amenity;

                if (amenity) {
                    selectedAmenities.push(
                        amenity.toLowerCase()
                    );
                }
            }

        });

        if (selectedAmenities.length > 0) {

            results = results.filter(function (pg) {

                const pgAmenities =
                    getAmenities(pg)
                        .map(function (item) {
                            return item.toLowerCase();
                        });

                return selectedAmenities.every(
                    function (requiredAmenity) {

                        return pgAmenities.some(
                            function (availableAmenity) {

                                return availableAmenity
                                    .includes(requiredAmenity) ||
                                    requiredAmenity
                                        .includes(availableAmenity);
                            }
                        );

                    }
                );
            });
        }

        // --------------------------------------------------------
        // Sorting
        // --------------------------------------------------------

        const sortValue =
            sortSelect
                ? sortSelect.value
                : "recommended";

        results.sort(function (a, b) {

            if (sortValue === "price-low") {

                return (
                    getLowestRent(a) -
                    getLowestRent(b)
                );
            }

            if (sortValue === "price-high") {

                return (
                    getLowestRent(b) -
                    getLowestRent(a)
                );
            }

            if (sortValue === "distance") {

                return (
                    Number(a.distanceKm || 999) -
                    Number(b.distanceKm || 999)
                );
            }

            if (sortValue === "rating") {

                return (
                    Number(b.rating || 0) -
                    Number(a.rating || 0)
                );
            }

            return 0;
        });

        renderPGs(results);
    }

    // ------------------------------------------------------------
    // Event listeners
    // ------------------------------------------------------------

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );
    }

    if (sharingSelect) {

        sharingSelect.addEventListener(
            "change",
            applyFilters
        );
    }

    if (rentSelect) {

        rentSelect.addEventListener(
            "change",
            applyFilters
        );
    }

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            applyFilters
        );
    }

    if (distanceSelect) {

        distanceSelect.addEventListener(
            "change",
            applyFilters
        );
    }

    genderRadios.forEach(function (radio) {

        radio.addEventListener(
            "change",
            applyFilters
        );

    });

    amenityCheckboxes.forEach(function (checkbox) {

        checkbox.addEventListener(
            "change",
            applyFilters
        );

    });

    // ------------------------------------------------------------
    // Clear filters
    // ------------------------------------------------------------

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                if (searchInput) {
                    searchInput.value = "";
                }

                if (sharingSelect) {
                    sharingSelect.value = "all";
                }

                if (rentSelect) {
                    rentSelect.value = "all";
                }

                if (sortSelect) {
                    sortSelect.value = "recommended";
                }

                if (distanceSelect) {
                    distanceSelect.value = "all";
                }

                genderRadios.forEach(
                    function (radio) {

                        radio.checked =
                            radio.value === "all";
                    }
                );

                amenityCheckboxes.forEach(
                    function (checkbox) {

                        checkbox.checked = false;

                    }
                );

                applyFilters();
            }
        );
    }

    // ------------------------------------------------------------
    // Initial render
    // ------------------------------------------------------------

    renderPGs(filteredPGs);

});


// ============================================================
// Helper Functions
// ============================================================


// ------------------------------------------------------------
// Page heading
// ------------------------------------------------------------

function updatePageHeading(
    selectedCollege,
    collegeId
) {

    const heading =
        document.querySelector("h1");

    const subtitle =
        document.querySelector(".page-subtitle") ||
        document.querySelector(".subtitle");

    if (!heading) {
        return;
    }

    if (selectedCollege) {

        heading.textContent =
            "PGs Near " +
            selectedCollege.name;

        if (subtitle) {

            subtitle.textContent =
                "Find student accommodation near your college.";
        }

        return;
    }

    if (!collegeId) {

        heading.textContent =
            "Find Your Perfect PG";

        if (subtitle) {

            subtitle.textContent =
                "Browse student hostels and PGs across Navi Mumbai and Mumbai.";
        }

        return;
    }

    heading.textContent =
        "College Not Found";

    if (subtitle) {

        subtitle.textContent =
            "Showing all available PGs instead.";
    }
}


// ------------------------------------------------------------
// Lowest rent
// ------------------------------------------------------------

function getLowestRent(pg) {

    if (!pg || !pg.sharing) {
        return 0;
    }

    const rents =
        Object.values(pg.sharing)
            .map(Number)
            .filter(function (rent) {

                return (
                    !isNaN(rent) &&
                    rent > 0
                );
            });

    if (rents.length === 0) {
        return 0;
    }

    return Math.min.apply(
        null,
        rents
    );
}


// ------------------------------------------------------------
// Get amenities
// ------------------------------------------------------------

function getAmenities(pg) {

    const amenities = [];

    if (Array.isArray(pg.amenities)) {

        pg.amenities.forEach(
            function (amenity) {

                if (
                    amenity &&
                    !amenities.includes(amenity)
                ) {
                    amenities.push(amenity);
                }

            }
        );
    }

    if (pg.wifiAvailable === true) {
        addAmenity(amenities, "Wi-Fi");
    }

    if (pg.foodAvailable === true) {
        addAmenity(amenities, "Food");
    }

    if (pg.acAvailable === true) {
        addAmenity(amenities, "AC");
    }

    if (pg.laundry === true) {
        addAmenity(amenities, "Laundry");
    }

    if (pg.parking === true) {
        addAmenity(amenities, "Parking");
    }

    if (pg.cctv === true) {
        addAmenity(amenities, "CCTV");
    }

    if (pg.attachedBathroom === true) {
        addAmenity(
            amenities,
            "Attached Bathroom"
        );
    }

    if (pg.security === true) {
        addAmenity(
            amenities,
            "Security"
        );
    }

    if (pg.powerBackup === true) {
        addAmenity(
            amenities,
            "Power Backup"
        );
    }

    if (pg.housekeeping === true) {
        addAmenity(
            amenities,
            "Housekeeping"
        );
    }

    return amenities;
}


// ------------------------------------------------------------
// Add amenity without duplicates
// ------------------------------------------------------------

function addAmenity(
    list,
    value
) {

    const exists =
        list.some(function (item) {

            return item.toLowerCase() ===
                value.toLowerCase();

        });

    if (!exists) {
        list.push(value);
    }
}


// ------------------------------------------------------------
// Format number
// ------------------------------------------------------------

function formatNumber(number) {

    return Number(number || 0)
        .toLocaleString("en-IN");
}


// ------------------------------------------------------------
// Safe HTML
// ------------------------------------------------------------

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ------------------------------------------------------------
// Result count
// ------------------------------------------------------------

function updateResultCount(count) {

    const elements = [
        document.getElementById("resultCount"),
        document.getElementById("pgCount"),
        document.querySelector(".result-count")
    ];

    elements.forEach(function (element) {

        if (element) {

            element.textContent =
                `${count} PG${count === 1 ? "" : "s"} found`;

        }

    });
}