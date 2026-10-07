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

const logoBackgroundColor = document.getElementById("logoBackgroundColor");

const logoBackgroundColorValue = document.getElementById(
  "logoBackgroundColorValue",
);

const rotationButtons = document.querySelectorAll(".rotation-button");

const logoControlInputs = logoControls.querySelectorAll("input, button");

let currentCanvas = null;
let logoImage = null;
let currentRotation = 0;

// --------------------------------------------------
// Show placeholder QR when the page loads
// --------------------------------------------------

showPlaceholderQR();

// --------------------------------------------------
// Keep logo settings disabled initially
// --------------------------------------------------

setLogoControlsEnabled(false);

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
// Enable / disable logo settings
// --------------------------------------------------

function setLogoControlsEnabled(enabled) {
  logoControls.classList.toggle("enabled", enabled);

  logoControlInputs.forEach((control) => {
    control.disabled = !enabled;
  });
}

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

    if (logoImage) {
      drawLogo(canvas, logoImage);
    }

    qrContainer.appendChild(canvas);

    currentCanvas = canvas;

    downloadButton.hidden = false;
    shareButton.hidden = false;

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

  if (!file) {
    return;
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    alert("Please choose a PNG, JPG, JPEG, or WebP image.");

    logoInput.value = "";

    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const image = new Image();

    image.onload = function () {
      logoImage = image;

      setLogoControlsEnabled(true);

      removeLogoButton.hidden = false;

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
  logoImage = null;

  logoInput.value = "";

  setLogoControlsEnabled(false);

  removeLogoButton.hidden = true;

  currentRotation = 0;

  logoRotation.value = 0;

  logoRotationValue.textContent = "0°";

  logoSize.value = 20;

  logoSizeValue.textContent = "20%";

  logoBackgroundColor.value = "#ffffff";

  logoBackgroundColorValue.textContent = "#FFFFFF";

  updateRotationButtons();

  if (input.value.trim()) {
    generateQR();
  }
}

// --------------------------------------------------
// Draw logo onto QR
// --------------------------------------------------

function drawLogo(canvas, image) {
  const ctx = canvas.getContext("2d");

  const backingSize = canvas.width * 0.3;

  const logoSizePercent = Number(logoSize.value);

  const calculatedLogoSize = backingSize * (logoSizePercent / 100);

  const centerX = canvas.width / 2;

  const centerY = canvas.height / 2;

  ctx.save();

  ctx.fillStyle = logoBackgroundColor.value;

  ctx.fillRect(
    centerX - backingSize / 2,
    centerY - backingSize / 2,
    backingSize,
    backingSize,
  );

  ctx.restore();

  ctx.save();

  ctx.beginPath();

  ctx.rect(
    centerX - backingSize / 2,
    centerY - backingSize / 2,
    backingSize,
    backingSize,
  );

  ctx.clip();

  ctx.translate(centerX, centerY);

  ctx.rotate((currentRotation * Math.PI) / 180);

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

  if (navigator.share) {
    try {
      await navigator.share({
        title: "QR Code",
        text: text,
        url: text,
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  } else {
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
