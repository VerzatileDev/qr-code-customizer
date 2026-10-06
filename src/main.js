import QRCode from "qrcode";

const input = document.getElementById("qrInput");
const generateButton = document.getElementById("generateButton");

const downloadButton = document.getElementById("downloadButton");
const shareButton = document.getElementById("shareButton");

const qrContainer = document.getElementById("qrContainer");

const logoButton = document.getElementById("logoButton");
const removeLogoButton = document.getElementById("removeLogoButton");
const logoControls = document.getElementById("logoControls");
const logoInput = document.getElementById("logoInput");

const logoSize = document.getElementById("logoSize");
const logoSizeValue = document.getElementById("logoSizeValue");

const logoRotation = document.getElementById("logoRotation");
const logoRotationValue = document.getElementById("logoRotationValue");

const rotationButtons = document.querySelectorAll(".rotation-button");
const logoBackgroundColor = document.getElementById("logoBackgroundColor");

const logoBackgroundColorValue = document.getElementById(
  "logoBackgroundColorValue",
);

let currentCanvas = null;
let logoImage = null;
let currentRotation = 0;

// --------------------------------------------------
// Show placeholder QR when the page loads
// --------------------------------------------------

showPlaceholderQR();

// --------------------------------------------------
// Generate QR
// --------------------------------------------------

generateButton.addEventListener("click", generateQR);

// --------------------------------------------------
// Add / replace logo
// --------------------------------------------------

logoButton.addEventListener("click", () => {
  logoInput.click();
});

// --------------------------------------------------
// Remove logo
// --------------------------------------------------

removeLogoButton.addEventListener("click", removeLogo);

// --------------------------------------------------
// Logo upload
// --------------------------------------------------

logoInput.addEventListener("change", handleLogoUpload);

// --------------------------------------------------
// Logo size
// --------------------------------------------------

logoSize.addEventListener("input", () => {
  logoSizeValue.textContent = `${logoSize.value}%`;

  if (logoImage) {
    generateQR();
  }
});

// --------------------------------------------------
// Logo background color
// --------------------------------------------------

logoBackgroundColor.addEventListener("input", () => {
  logoBackgroundColorValue.textContent =
    logoBackgroundColor.value.toUpperCase();

  if (logoImage) {
    generateQR();
  }
});

// --------------------------------------------------
// Fine rotation
// --------------------------------------------------

logoRotation.addEventListener("input", () => {
  currentRotation = Number(logoRotation.value);

  logoRotationValue.textContent = `${currentRotation}°`;

  updateRotationButtons();

  if (logoImage) {
    generateQR();
  }
});

// --------------------------------------------------
// Rotation presets
// --------------------------------------------------

rotationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const rotation = Number(button.dataset.rotation);

    if (rotation === 270) {
      currentRotation = -90;
    } else {
      currentRotation = rotation;
    }

    logoRotation.value = currentRotation;

    logoRotationValue.textContent = `${currentRotation}°`;

    updateRotationButtons();

    if (logoImage) {
      generateQR();
    }
  });
});

// --------------------------------------------------
// Placeholder QR
// --------------------------------------------------

async function showPlaceholderQR() {
  qrContainer.innerHTML = "";

  const canvas = document.createElement("canvas");

  try {
    await QRCode.toCanvas(canvas, "https://verzatiledev.itch.io/", {
      width: 360,
      margin: 4,
      errorCorrectionLevel: "H",

      color: {
        dark: "#b5b5b5",
        light: "#ffffff",
      },
    });

    canvas.classList.add("placeholder-qr");

    qrContainer.appendChild(canvas);

    // Important:
    // This is only the placeholder.
    // It must NOT become the downloadable QR.
    currentCanvas = null;
  } catch (error) {
    console.error("Placeholder QR generation error:", error);
  }
}

// --------------------------------------------------
// Generate actual QR
// --------------------------------------------------

async function generateQR() {
  const text = input.value.trim();

  if (!text) {
    alert("Please enter a URL first.");
    return;
  }

  qrContainer.innerHTML = "";

  const canvas = document.createElement("canvas");

  try {
    await QRCode.toCanvas(canvas, text, {
      width: 360,
      margin: 4,
      errorCorrectionLevel: "H",
    });

    // Add logo if one exists
    if (logoImage) {
      drawLogo(canvas, logoImage);
    }

    qrContainer.appendChild(canvas);

    currentCanvas = canvas;

    // Show QR actions
    downloadButton.hidden = false;
    shareButton.hidden = false;

    // Show Add Logo
    logoButton.hidden = false;
  } catch (error) {
    console.error("QR generation error:", error);

    alert("Could not generate the QR code.");
  }
}

// --------------------------------------------------
// Handle logo upload
// --------------------------------------------------

function handleLogoUpload(event) {
  const file = event.target.files[0];

  // User cancelled the file picker
  if (!file) {
    return;
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

  // Invalid file
  if (!allowedTypes.includes(file.type)) {
    alert("Please choose a PNG, JPG, JPEG, or WebP image.");

    // Do not remove an existing logo
    logoInput.value = "";

    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const image = new Image();

    image.onload = function () {
      // Replace the current logo
      logoImage = image;

      // Show settings
      logoControls.hidden = false;

      // Show Remove Logo
      removeLogoButton.hidden = false;

      // Generate QR with the new logo
      generateQR();
    };

    image.onerror = function () {
      alert("Could not load that image.");

      logoInput.value = "";
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);
}

// --------------------------------------------------
// Remove logo
// --------------------------------------------------

function removeLogo() {
  // Remove image
  logoImage = null;

  // Clear file input
  logoInput.value = "";

  // Hide settings
  logoControls.hidden = true;

  // Hide Remove Logo
  removeLogoButton.hidden = true;

  // Reset rotation
  currentRotation = 0;

  logoRotation.value = 0;
  logoRotationValue.textContent = "0°";

  logoBackgroundColor.value = "#ffffff";

  logoBackgroundColorValue.textContent = "#FFFFFF";

  // Reset size
  logoSize.value = 20;
  logoSizeValue.textContent = "20%";

  // Reset rotation button state
  updateRotationButtons();

  // Regenerate QR without logo
  if (input.value.trim()) {
    generateQR();
  }
}

// --------------------------------------------------
// Draw logo onto QR
// --------------------------------------------------

function drawLogo(canvas, image) {
  const ctx = canvas.getContext("2d");

  // White backing is always 30% of QR size
  const backingSize = canvas.width * 0.3;

  // Logo size is percentage of backing
  const logoSizePercent = Number(logoSize.value);

  const calculatedLogoSize = backingSize * (logoSizePercent / 100);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // ----------------------------------------------
  // White backing
  // ----------------------------------------------

  ctx.save();

  ctx.fillStyle = logoBackgroundColor.value;

  ctx.fillRect(
    centerX - backingSize / 2,
    centerY - backingSize / 2,
    backingSize,
    backingSize,
  );

  ctx.restore();

  // ----------------------------------------------
  // Clip logo to backing
  // ----------------------------------------------

  ctx.save();

  ctx.beginPath();

  ctx.rect(
    centerX - backingSize / 2,
    centerY - backingSize / 2,
    backingSize,
    backingSize,
  );

  ctx.clip();

  // ----------------------------------------------
  // Rotate only the logo
  // ----------------------------------------------

  ctx.translate(centerX, centerY);

  ctx.rotate((currentRotation * Math.PI) / 180);

  // ----------------------------------------------
  // Draw logo
  // ----------------------------------------------

  ctx.drawImage(
    image,
    -calculatedLogoSize / 2,
    -calculatedLogoSize / 2,
    calculatedLogoSize,
    calculatedLogoSize,
  );

  ctx.restore();
}

// --------------------------------------------------
// Update rotation buttons
// --------------------------------------------------

function updateRotationButtons() {
  rotationButtons.forEach((button) => {
    let rotation = Number(button.dataset.rotation);

    // 270° is represented as -90°
    if (rotation === 270) {
      rotation = -90;
    }

    button.classList.toggle("active", rotation === currentRotation);
  });
}

// --------------------------------------------------
// Download
// --------------------------------------------------

downloadButton.addEventListener("click", () => {
  if (!currentCanvas) {
    return;
  }

  const link = document.createElement("a");

  link.download = "qr-code.png";

  link.href = currentCanvas.toDataURL("image/png");

  link.click();
});

// --------------------------------------------------
// Share
// --------------------------------------------------

shareButton.addEventListener("click", async () => {
  const text = input.value.trim();

  if (!text) {
    return;
  }

  // Browser/device share menu
  if (navigator.share) {
    try {
      await navigator.share({
        title: "QR Code",
        text: text,
        url: text,
      });
    } catch (error) {
      // Cancelling the share menu isn't an error
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  } else {
    // Fallback
    try {
      await navigator.clipboard.writeText(text);

      alert(
        "Sharing is not supported by this browser. " +
          "The URL has been copied instead.",
      );
    } catch (error) {
      alert("Sharing is not supported by this browser.");
    }
  }
});
