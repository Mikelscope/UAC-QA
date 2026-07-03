
// =============================
// WEIGHT INPUTS
// =============================
const weightInputs = document.querySelectorAll(".weight-input");


// =============================
// AUTO MOVE TO NEXT INPUT
// =============================
function getRules(productType) {
    if (productType === "odogwu") {
        return { min: 100, max: 999, length: 3 };
    }
    if (productType === "classic" || productType === "gsr") {
        return { min: 10, max: 99, length: 2 };
    }
    return { min: 0, max: 999, length: 1 };
}

weightInputs.forEach((input, index) => {

    input.addEventListener("input", () => {

        const productType = document.getElementById("productType").value || "classic";
        const rules = getRules(productType);

        const value = input.value;
        const num = parseInt(value);

        const isValid =
            !isNaN(num) &&
            num >= rules.min &&
            num <= rules.max &&
            value.length === rules.length;

        // move only when valid
        if (isValid) {
            const nextInput = weightInputs[index + 1];

            if (nextInput) {
                nextInput.focus();
            } else {
                document.querySelector("button[type='submit']").focus();
            }
        }
    });
});


// =============================
// CALCULATION ENGINE
// =============================
document.getElementById("qaForm").addEventListener("submit", function (e) {
    e.preventDefault();
    

    // Change input container background to white
document.querySelectorAll(".input-container").forEach(container => {
    container.style.background = "white";
});


    const productType = document.getElementById("productType").value || "classic";

    // =============================
    // PRODUCT SPEC LIMITS
    // =============================
    function getSpec(type) {
        switch (type) {
            case "classic":
                return { min: 57, max: 63 };

            case "gsr":
                return { min: 27, max: 33 };

            case "odogwu":
                return { min: 117, max: 123 };

            default:
                return { min: 57, max: 63 };
        }
    }

    const spec = getSpec(productType);

    // =============================
    // RESET VALUES
    // =============================
    let weights = [];
    let meetStandard = 0;
    let underStandard = 0;
    let overStandard = 0;

    // =============================
    // PROCESS INPUTS + COLOR LOGIC
    // =============================
    weightInputs.forEach(input => {

        const value = parseFloat(input.value);

        // reset old colors
        input.classList.remove("green", "red", "yellow");

        if (!isNaN(value)) {

            weights.push(value);

            // =============================
            // CLASSIFICATION
            // =============================
            if (value < spec.min) {
                underStandard++;
                input.classList.add("yellow");
            } 
            else if (value > spec.max) {
                overStandard++;
                input.classList.add("red");
            } 
            else {
                meetStandard++;
                input.classList.add("green");
            }
        }
    });

    const total = weights.length;

    if (total === 0) {
        alert("Please enter weight values");
        return;
    }

    // =============================
    // PERCENTAGES
    // =============================
    const meetPercent = (meetStandard / total) * 100;
    const defectPercent = ((underStandard + overStandard) / total) * 100;
    const onSpecPercent = 100 - defectPercent;
    // =============================
    // STATUS ENGINE
    // =============================
    let status = "GOOD";

    if (meetPercent < 90 && meetPercent >= 75) {
        status = "WARNING";
    } 
    else if (meetPercent < 75) {
        status = "CRITICAL";
    }

    // =============================
    // DISPLAY RESULTS
    // =============================
    document.getElementById("meetStandardCount").textContent = meetStandard +' ' + '(' + onSpecPercent.toFixed(2) + "%" + ')';
    document.getElementById("underweightCount").textContent = underStandard +' ' + '(' + underStandard.toFixed(2) /total*100 + "%" + ')';
    document.getElementById("overweightCount").textContent = overStandard+' ' + '(' + overStandard.toFixed(2) /total*100 + "%" + ')';

    document.getElementById("totalDefects").textContent =
        underStandard + overStandard;

    document.getElementById("defectPercentage").textContent =
        defectPercent.toFixed(2) + "%";

        document.getElementById("onSpecPercentage").textContent =
        onSpecPercent.toFixed(2) + "%";

    document.getElementById("averageWeight").textContent =
        (weights.reduce((a, b) => a + b, 0) / total).toFixed(2);

    document.getElementById("status").textContent = status;


});

// RESET PAGE WHEN CLEAR BUTTON IS CLICKED
document.querySelector("button[type='reset']").addEventListener("click", function () {
    setTimeout(() => {
        location.reload();
    }, 50);
});