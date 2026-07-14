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

    const isValid = !isNaN(num) && num >= rules.min && num <= rules.max && value.length === rules.length;

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
  document.querySelectorAll(".input-container").forEach((container) => {
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
  weightInputs.forEach((input) => {
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
      } else if (value > spec.max) {
        overStandard++;
        input.classList.add("red");
      } else {
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
  } else if (meetPercent < 75) {
    status = "CRITICAL";
  }

  // =============================
  // DISPLAY RESULTS
  // =============================

  // Calculate percentages
  const underPercent = ((underStandard / total) * 100).toFixed(1);
  const overPercent = ((overStandard / total) * 100).toFixed(1);

  // Display counts and percentages
  document.getElementById("meetStandardCount").textContent = `${meetStandard} (${onSpecPercent.toFixed(1)}%)`;

  document.getElementById("underweightCount").textContent = `${underStandard} (${underPercent}%)`;

  document.getElementById("overweightCount").textContent = `${overStandard} (${overPercent}%)`;

  document.getElementById("totalDefects").textContent = underStandard + overStandard;

  document.getElementById("defectPercentage").textContent = defectPercent.toFixed(1) + "%";

  document.getElementById("onSpecPercentage").textContent = onSpecPercent.toFixed(1) + "%";

  document.getElementById("averageWeight").textContent = (weights.reduce((a, b) => a + b, 0) / total).toFixed(1);


  //NEW OBJECT TO SEND TO GOOGLE SHEETS
const qaData = {
    sampleDate: document.getElementById("sampleDate").value,
    batchTime: document.getElementById("batchTime").value,
    autoWrapper: document.getElementById("autoWrapper").value,
    productType: productType,

    averageWeight: (weights.reduce((a,b)=>a+b,0)/total).toFixed(1),

    onSpecCount: meetStandard,
    onSpecPercentage: onSpecPercent.toFixed(1),

    underweightCount: underStandard,
    underweightPercentage: underPercent,

    overweightCount: overStandard,
    overweightPercentage: overPercent
};

// Add Weight 1 - Weight 26
weights.forEach((weight, index) => {
    qaData[`weight${index + 1}`] = weight;
});

  //LINKING TO GOOGLE SHEETS SCRIPT
const scriptURL = "https://script.google.com/macros/s/AKfycbzZlOpwzz-T_bJa8m5TtGculjhGy5SG_zkebtIdjURWufNiUy2u3yix6gzx62ugaqGnOw/exec";

fetch(scriptURL, {
    method: "POST",
    body: new URLSearchParams(qaData)
})
.then(response => response.json())
.then(data => {
    console.log("Saved successfully");
    console.log(data);

    alert("QA Record " + data.qaID + " saved successfully.");
})
.catch(error => {
    console.error(error);
    alert("Failed to save data.");
});
  document.getElementById("resultsSection").style.display = "flex";
});
//close button on th eresults modal
const closeBtn = document.getElementById("closeResults");

closeBtn.addEventListener("click", () => {
  document.getElementById("resultsSection").style.display = "none";
});

//close modal when clicking outside the modal content

const resultsSection = document.getElementById("resultsSection");

resultsSection.addEventListener("click", function (e) {
  if (e.target === resultsSection) {
    resultsSection.style.display = "none";
  }
});

// =============================
// RESET FORM
// =============================
document.querySelector("button[type='reset']").addEventListener("click", function () {
  // Allow the form to reset first
  setTimeout(() => {
    // Remove colours from weight inputs
    weightInputs.forEach((input) => {
      input.classList.remove("green", "yellow", "red");
    });

    // Restore input-container background
    document.querySelectorAll(".input-container").forEach((container) => {
      container.style.background = "";
    });

    // Reset analysis results
    document.getElementById("averageWeight").textContent = "0";
    document.getElementById("meetStandardCount").textContent = "0";
    document.getElementById("underweightCount").textContent = "0";
    document.getElementById("overweightCount").textContent = "0";
    document.getElementById("totalDefects").textContent = "0";
    document.getElementById("defectPercentage").textContent = "0%";
    document.getElementById("onSpecPercentage").textContent = "0%";

    // Hide the results modal
    document.getElementById("resultsSection").style.display = "none";

    // Return product type to default (Classic)
    document.getElementById("productType").value = "classic";

    // Focus the first weight input
    weightInputs[0].focus();
  }, 0);
});
