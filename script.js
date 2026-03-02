function calculateHACOR() {
  let score = 0;

  const hr = +document.getElementById("hr").value || 0;
  const ph = +document.getElementById("ph").value || 7.4;
  let pao2 = parseFloat(document.getElementById("pao2").value);
  let fio2 = parseFloat(document.getElementById("fio2").value);

  // Safety defaults
  if (isNaN(pao2) || isNaN(fio2) || fio2 <= 0) return 0;

  let pf = pao2 / fio2;
  const rr = +document.getElementById("rr").value || 0;
  const gcs = +document.getElementById("gcs").value || 15;

  if (hr >= 120) score += 1;

  if (ph < 7.25) score += 4;
  else if (ph < 7.30) score += 3;
  else if (ph < 7.35) score += 2;

  if (pf <= 100) score += 3;
  else if (pf <= 200) score += 2;
  else if (pf <= 300) score += 1;

  if (gcs <= 14) score += 2;

  if (rr > 40) score += 3;
  else if (rr >= 36) score += 2;
  else if (rr >= 31) score += 1;

  return score;
}

function calculateSOFA() {
  const ids = [
    "sofa_resp",
    "sofa_coag",
    "sofa_liver",
    "sofa_cardio",
    "sofa_cns",
    "sofa_renal"
  ];

  return ids.reduce((sum, id) => {
    return sum + (+document.getElementById(id).value || 0);
  }, 0);
}

function calculateHACORU() {
  const hacor = calculateHACOR();
  const sofa = calculateSOFA();

  let score = hacor + (0.5 * sofa);

  if (pneumonia.checked) score += 2.5;
  if (ards.checked) score += 3;
  if (septic.checked) score += 2.5;
  if (immuno.checked) score += 1.5;
  if (cpe.checked) score -= 4;

  score = score.toFixed(1);

  let riskClass = "low";
  let riskText = "Low risk of NIV failure";

  if (score > 14) {
    riskClass = "very-high";
    riskText = "Very high risk of NIV failure";
  } else if (score > 10.5) {
    riskClass = "high";
    riskText = "High risk of NIV failure";
  } else if (score > 7) {
    riskClass = "moderate";
    riskText = "Moderate risk of NIV failure";
  }

  const resultBox = document.getElementById("resultBox");
  resultBox.className = "result " + riskClass;

  document.getElementById("hacor").innerText = hacor;
  document.getElementById("sofa").innerText = sofa;
  document.getElementById("score").innerText = score;
  document.getElementById("risk").innerText = riskText;

  // Save to Google Sheets
  saveToGoogleSheets(hacor, sofa, score, riskText, riskClass);
}

function saveToGoogleSheets(hacor, sofa, score, riskText, riskClass) {
  // Get patient information
  const patientName = document.getElementById("patientName").value || "N/A";
  const patientGender = document.getElementById("patientGender").value || "N/A";
  const patientAge = document.getElementById("patientAge").value || "N/A";

  // Get HACOR values
  const hr = document.getElementById("hr").value || 0;
  const ph = document.getElementById("ph").value || 7.4;
  const pao2 = document.getElementById("pao2").value || 0;
  const fio2 = document.getElementById("fio2").value || 0;
  const rr = document.getElementById("rr").value || 0;
  const gcs = document.getElementById("gcs").value || 15;

  // Get SOFA values
  const sofa_resp = document.getElementById("sofa_resp").value || 0;
  const sofa_coag = document.getElementById("sofa_coag").value || 0;
  const sofa_liver = document.getElementById("sofa_liver").value || 0;
  const sofa_cardio = document.getElementById("sofa_cardio").value || 0;
  const sofa_cns = document.getElementById("sofa_cns").value || 0;
  const sofa_renal = document.getElementById("sofa_renal").value || 0;

  // Get clinical conditions
  const conditions = [];
  if (document.getElementById("pneumonia").checked) conditions.push("Pneumonia");
  if (document.getElementById("ards").checked) conditions.push("ARDS");
  if (document.getElementById("septic").checked) conditions.push("Septic Shock");
  if (document.getElementById("immuno").checked) conditions.push("Immunosuppression");
  if (document.getElementById("cpe").checked) conditions.push("CPE");

  const timestamp = new Date().toLocaleString();

  // Replace with your Google Form URL (must end with /formResponse, NOT /viewform)
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfc4T6bDzf5hCybWC0oLl9jl05Ch0qZxvKIr9rHn7dQGGNycQ/formResponse";

  // Create form data with entry IDs from your Google Form
  const formData = new FormData();
  // Note: You need to find the entry ID for Timestamp field and replace the line below
  // For now, we'll skip it or you can add it once you find the ID
  // formData.append("entry.YOUR_TIMESTAMP_ID", timestamp);
  formData.append("entry.870563324", patientName);
  formData.append("entry.1439371898", patientGender);
  formData.append("entry.72024893", patientAge);
  formData.append("entry.1802139191", hr);
  formData.append("entry.252511933", ph);
  formData.append("entry.544567708", pao2);
  formData.append("entry.823727167", fio2);
  formData.append("entry.1405091351", rr);
  formData.append("entry.300443988", gcs);

  formData.append("entry.1357381546", sofa_resp);
  formData.append("entry.1619308833", sofa_coag);
  formData.append("entry.2086858640", sofa_liver);
  formData.append("entry.1283404738", sofa_cardio);
  formData.append("entry.1288747338", sofa_cns);
  formData.append("entry.103885253", sofa_renal);

  formData.append("entry.1570793573", conditions[0]);
    formData.append("entry.91621282", conditions[1]);
      formData.append("entry.1597306720", conditions[2]);
        formData.append("entry.1463747276", conditions[3]);
          formData.append("entry.1911287566", conditions[4]);

  formData.append("entry.1068048428", hacor);
  formData.append("entry.55898782", sofa);
  formData.append("entry.1951113748", score);
  formData.append("entry.1605100109", riskText);

  fetch(GOOGLE_FORM_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  })
  .then(() => {
    console.log("Data sent to Google Sheets successfully");
    showNotification("Data saved to Google Sheets!", "success");
  })
  .catch(error => {
    console.error("Error saving to Google Sheets:", error);
    showNotification("Error saving to Google Sheets", "error");
  });
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === "success" ? "#4CAF50" : "#f44336"};
    color: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
