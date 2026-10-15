/* =========================================================
   HOSTELHUB - BOOKING + SIMULATED PAYMENT
   ========================================================= */


/* ---------------------------------------------------------
   GET SELECTED PG
--------------------------------------------------------- */

function getSelectedPG() {

    const params = new URLSearchParams(window.location.search);

    const pgId = params.get("pgId");

    if (!pgId) {
        return null;
    }

    try {

        const pgs =
            JSON.parse(
                localStorage.getItem("pgs")
            ) || [];

        return pgs.find(
            pg => String(pg.id) === String(pgId)
        ) || null;

    } catch (error) {

        console.error(
            "Unable to load PG data:",
            error
        );

        return null;
    }
}


/* ---------------------------------------------------------
   GET CHEAPEST RENT
--------------------------------------------------------- */

function getPGStartingRent(pg) {

    if (!pg || !pg.sharing) {
        return 0;
    }

    const rents =
        Object.values(pg.sharing)
            .filter(
                value => Number(value) > 0
            )
            .map(Number);

    if (!rents.length) {
        return 0;
    }

    return Math.min(...rents);
}


/* ---------------------------------------------------------
   GET AVAILABLE SHARING OPTION
--------------------------------------------------------- */

function getDefaultSharing(pg) {

    if (!pg || !pg.sharing) {
        return "Room";
    }

    const options =
        Object.keys(pg.sharing);

    if (!options.length) {
        return "Room";
    }

    const first =
        options[0];

    const names = {
        single: "Single Sharing",
        double: "Double Sharing",
        triple: "Triple Sharing",
        four: "4 Sharing"
    };

    return names[first] || first;
}


/* ---------------------------------------------------------
   CREATE MODAL
--------------------------------------------------------- */

function createBookingModal() {

    if (document.getElementById("hostelBookingModal")) {
        return;
    }

    const modal =
        document.createElement("div");

    modal.id =
        "hostelBookingModal";

    modal.innerHTML = `

        <div class="booking-overlay">

            <div class="booking-modal">

                <button
                    class="booking-close"
                    id="bookingClose">
                    ×
                </button>

                <div id="bookingContent"></div>

            </div>

        </div>

    `;

    document.body.appendChild(modal);


    /* -----------------------------
       STYLES
    ----------------------------- */

    const style =
        document.createElement("style");

    style.textContent = `

        #hostelBookingModal {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: none;
        }

        .booking-overlay {
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .booking-modal {
            width: 100%;
            max-width: 460px;
            background: white;
            border-radius: 18px;
            padding: 28px;
            position: relative;
            box-shadow:
                0 20px 60px rgba(0,0,0,0.25);
            animation: bookingPop 0.2s ease;
        }

        @keyframes bookingPop {

            from {
                opacity: 0;
                transform: scale(0.94);
            }

            to {
                opacity: 1;
                transform: scale(1);
            }

        }

        .booking-close {
            position: absolute;
            right: 16px;
            top: 12px;
            border: none;
            background: transparent;
            font-size: 28px;
            cursor: pointer;
            color: #6b7280;
        }

        .booking-title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 6px;
        }

        .booking-subtitle {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 22px;
        }

        .booking-property {
            background: #f7f9fc;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 20px;
        }

        .booking-property h3 {
            margin: 0 0 7px;
            color: #111827;
        }

        .booking-property p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
        }

        .booking-price {
            font-size: 23px;
            font-weight: 700;
            color: #07549b;
            margin-top: 10px;
        }

        .booking-field {
            margin-bottom: 15px;
        }

        .booking-field label {
            display: block;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 6px;
            color: #374151;
        }

        .booking-field input,
        .booking-field select {
            width: 100%;
            box-sizing: border-box;
            padding: 11px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
        }

        .payment-box {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 13px;
            margin: 16px 0;
            background: #fff;
        }

        .payment-option {
            display: flex;
            align-items: center;
            gap: 9px;
            margin: 7px 0;
            font-size: 14px;
        }

        .booking-confirm-btn {
            width: 100%;
            border: none;
            background: #07549b;
            color: white;
            padding: 13px;
            border-radius: 9px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
        }

        .booking-confirm-btn:hover {
            background: #063f76;
        }

        .booking-success {
            text-align: center;
            padding: 10px 0;
        }

        .success-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto 15px;
            border-radius: 50%;
            background: #dcfce7;
            color: #15803d;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 38px;
        }

        .booking-success h2 {
            color: #15803d;
            margin-bottom: 8px;
        }

        .booking-id {
            background: #f3f4f6;
            padding: 12px;
            border-radius: 8px;
            margin: 18px 0;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .booking-done-btn {
            width: 100%;
            border: none;
            background: #07549b;
            color: white;
            padding: 12px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }

        @media(max-width:500px) {

            .booking-modal {
                padding: 22px;
            }

            .booking-title {
                font-size: 21px;
            }

        }

    `;

    document.head.appendChild(style);


    /* -----------------------------
       CLOSE
    ----------------------------- */

    document
        .getElementById("bookingClose")
        .addEventListener(
            "click",
            closeBookingModal
        );

}


/* ---------------------------------------------------------
   OPEN BOOKING MODAL
--------------------------------------------------------- */

function openBookingModal() {

    const pg =
        getSelectedPG();

    if (!pg) {

        alert(
            "Hostel information could not be found."
        );

        return;
    }

    createBookingModal();

    const modal =
        document.getElementById(
            "hostelBookingModal"
        );

    const content =
        document.getElementById(
            "bookingContent"
        );

    const rent =
        getPGStartingRent(pg);

    const sharing =
        getDefaultSharing(pg);

    const image =
        pg.image ||
        "assets/images/room1.jpg";


    content.innerHTML = `

        <div class="booking-title">
            Book Your Hostel
        </div>

        <div class="booking-subtitle">
            Confirm your stay and complete
            the demo payment.
        </div>


        <div class="booking-property">

            <h3>
                ${pg.name || "Hostel"}
            </h3>

            <p>
                📍 ${pg.area || pg.city || "Location"}
            </p>

            <p>
                🛏️ ${sharing}
            </p>

            <div class="booking-price">
                ₹${rent.toLocaleString("en-IN")}
                <small style="font-size:13px;color:#6b7280;">
                    / month
                </small>
            </div>

        </div>


        <div class="booking-field">

            <label>
                Student Name
            </label>

            <input
                type="text"
                id="bookingStudentName"
                placeholder="Enter your name"
                value="Student"
            >

        </div>


        <div class="booking-field">

            <label>
                Email
            </label>

            <input
                type="email"
                id="bookingStudentEmail"
                placeholder="student@example.com"
            >

        </div>


        <div class="payment-box">

            <strong>
                💳 Payment Method
            </strong>

            <label class="payment-option">

                <input
                    type="radio"
                    name="paymentMethod"
                    value="Demo Card"
                    checked
                >

                Demo Card Payment

            </label>


            <label class="payment-option">

                <input
                    type="radio"
                    name="paymentMethod"
                    value="Demo UPI"
                >

                Demo UPI Payment

            </label>

        </div>


        <button
            class="booking-confirm-btn"
            onclick="completeBooking()">

            Pay ₹${rent.toLocaleString("en-IN")}
            & Confirm Booking

        </button>

    `;

    modal.style.display =
        "block";

}


/* ---------------------------------------------------------
   COMPLETE BOOKING
--------------------------------------------------------- */

function completeBooking() {

    const pg =
        getSelectedPG();

    if (!pg) {
        return;
    }


    const name =
        document
            .getElementById(
                "bookingStudentName"
            )
            .value.trim();


    const email =
        document
            .getElementById(
                "bookingStudentEmail"
            )
            .value.trim();


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;
    }


    const rent =
        getPGStartingRent(pg);


    const paymentMethod =
        document
            .querySelector(
                'input[name="paymentMethod"]:checked'
            )
            ?.value || "Demo Payment";


    /* -----------------------------
       BOOKING ID
    ----------------------------- */

    const bookingId =
        "HH-" +
        Date.now()
            .toString()
            .slice(-8);


    /* -----------------------------
       BOOKING OBJECT
    ----------------------------- */

    const booking = {

        id: bookingId,

        hostelId: pg.id,

        hostelName:
            pg.name,

        location:
            pg.area || pg.city,

        studentName:
            name,

        studentEmail:
            email,

        amount:
            rent,

        paymentMethod:
            paymentMethod,

        paymentStatus:
            "Paid",

        bookingStatus:
            "Confirmed",

        date:
            new Date()
                .toISOString(),

        sharing:
            getDefaultSharing(pg)

    };


    /* -----------------------------
       SAVE BOOKINGS
    ----------------------------- */

    let bookings = [];

    try {

        bookings =
            JSON.parse(
                localStorage.getItem(
                    "bookings"
                )
            ) || [];

    } catch (error) {

        bookings = [];

    }


    bookings.push(booking);


    localStorage.setItem(
        "bookings",
        JSON.stringify(bookings)
    );


    // Send a copy to the Java backend when the website is served by HostelHubServer.
    // localStorage remains as a fallback for the existing student/admin UI.
    fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
    }).then(function (response) {
        if (!response.ok) {
            console.warn("Java backend did not accept the booking:", response.status);
        }
        return response.ok ? response.json() : null;
    }).then(function (result) {
        if (result) console.log("Booking also saved by Java backend.", result);
    }).catch(function (error) {
        console.warn("Java backend unavailable; booking remains in localStorage.", error);
    });


    /* -----------------------------
       SHOW SUCCESS
    ----------------------------- */

    const content =
        document.getElementById(
            "bookingContent"
        );


    content.innerHTML = `

        <div class="booking-success">

            <div class="success-icon">
                ✓
            </div>

            <h2>
                Payment Successful!
            </h2>

            <p style="color:#6b7280;">
                Your hostel booking has been
                confirmed successfully.
            </p>


            <div class="booking-id">

                Booking ID:
                ${bookingId}

            </div>


            <p>
                <strong>
                    ${pg.name}
                </strong>
            </p>

            <p style="color:#6b7280;">
                ${booking.sharing}
                •
                ₹${rent.toLocaleString("en-IN")}
                / month
            </p>


            <button
                class="booking-done-btn"
                onclick="closeBookingModal()">

                Done

            </button>

        </div>

    `;

}


/* ---------------------------------------------------------
   CLOSE MODAL
--------------------------------------------------------- */

function closeBookingModal() {

    const modal =
        document.getElementById(
            "hostelBookingModal"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

}


/* ---------------------------------------------------------
   FIND BOOK BUTTONS
--------------------------------------------------------- */

function setupBookingButtons() {

    const elements =
        document.querySelectorAll(
            "a, button"
        );


    elements.forEach(function(element) {

        const text =
            element.textContent
                .trim()
                .toLowerCase();


        const isBookingButton =
            text.includes("book hostel") ||
            text.includes("book this") ||
            text.includes("apply for this room") ||
            text === "book" ||
            text.includes("apply now");


        if (isBookingButton) {

            element.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    openBookingModal();

                }
            );

        }

    });

}


/* ---------------------------------------------------------
   INITIALIZE
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupBookingButtons();

    }
);