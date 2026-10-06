import QRCode from "qrcode";

const input = document.getElementById("qrInput");
const generateButton = document.getElementById("generateButton");

const downloadButton = document.getElementById("downloadButton");
const shareButton = document.getElementById("shareButton");
const copyButton = document.getElementById("copyButton");

const qrContainer = document.getElementById("qrContainer");

const logoButton = document.getElementById("logoButton");
const logoControls = document.getElementById("logoControls");
const logoInput = document.getElementById("logoInput");
const logoFileName = document.getElementById("logoFileName");
const logoPreview = document.getElementById("logoPreview");

const logoSize = document.getElementById("logoSize");
const logoSizeValue = document.getElementById("logoSizeValue");

const logoRotation = document.getElementById("logoRotation");
const logoRotationValue = document.getElementById("logoRotationValue");

const rotationButtons = document.querySelectorAll(".rotation-button");

let currentCanvas = null;
let logoImage = null;
let currentRotation = 0;

// Generate QR
generateButton.addEventListener("click", generateQR);

// Show/hide logo controls
logoButton.addEventListener("click", () => {
  logoControls.hidden = !logoControls.hidden;
});

// Logo upload
logoInput.addEventListener("change", handleLogoUpload);

// Logo size
logoSize.addEventListener("input", () => {
  logoSizeValue.textContent = `${logoSize.value}%`;

  if (logoImage) {
    generateQR();
  }
});

// Fine rotation
logoRotation.addEventListener("input", () => {
  currentRotation = Number(logoRotation.value);

  logoRotationValue.textContent = `${currentRotation}°`;

  updateRotationButtons();

  if (logoImage) {
    generateQR();
  }
});

// Rotation preset buttons
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

// Generate QR code
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

    // Add logo if one has been selected
    if (logoImage) {
      drawLogo(canvas, logoImage);
    }

    qrContainer.appendChild(canvas);

    currentCanvas = canvas;

    // Show QR action buttons
    downloadButton.hidden = false;
    shareButton.hidden = false;
    copyButton.hidden = false;

    // Only show Add Logo after a QR has been generated
    logoButton.hidden = false;
  } catch (error) {
    console.error("QR generation error:", error);
    alert("Could not generate the QR code.");
  }
}

// Logo upload
function handleLogoUpload(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    alert("Please choose a PNG, JPG, JPEG, or WebP image.");

    logoInput.value = "";
    logoFileName.textContent = "No file selected";

    return;
  }

  logoFileName.textContent = file.name;

  const reader = new FileReader();

  reader.onload = function () {
    const image = new Image();

    image.onload = function () {
      logoImage = image;

      logoPreview.src = reader.result;
      logoPreview.hidden = false;

      generateQR();
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);
}

// Draw logo onto QR
function drawLogo(canvas, image) {
  const ctx = canvas.getContext("2d");

  // White backing is 30% of the QR size
  const backingSize = canvas.width * 0.3;

  // Logo size is a percentage of the backing
  const logoSizePercent = Number(logoSize.value);

  const calculatedLogoSize = backingSize * (logoSizePercent / 100);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // Draw fixed white backing
  ctx.save();

  ctx.fillStyle = "white";

  ctx.fillRect(
    centerX - backingSize / 2,
    centerY - backingSize / 2,
    backingSize,
    backingSize,
  );

  ctx.restore();

  // Clip logo to the white backing
  ctx.save();

  ctx.beginPath();

  ctx.rect(
    centerX - backingSize / 2,
    centerY - backingSize / 2,
    backingSize,
    backingSize,
  );

  ctx.clip();

  // Rotate only the logo
  ctx.translate(centerX, centerY);

  ctx.rotate((currentRotation * Math.PI) / 180);

  // Draw logo
  ctx.drawImage(
    image,
    -calculatedLogoSize / 2,
    -calculatedLogoSize / 2,
    calculatedLogoSize,
    calculatedLogoSize,
  );

  ctx.restore();
}

// Update rotation buttons
function updateRotationButtons() {
  rotationButtons.forEach((button) => {
    let rotation = Number(button.dataset.rotation);

    if (rotation === 270) {
      rotation = -90;
    }

    button.classList.toggle("active", rotation === currentRotation);
  });
}

// Download QR
downloadButton.addEventListener("click", () => {
  if (!currentCanvas) {
    return;
  }

  const link = document.createElement("a");

  link.download = "qr-code.png";
  link.href = currentCanvas.toDataURL("image/png");

  link.click();
});

// Copy QR image
copyButton.addEventListener("click", () => {
  if (!currentCanvas) {
    return;
  }

  currentCanvas.toBlob(async (blob) => {
    if (!blob) {
      alert("Could not create the QR image.");
      return;
    }

    try {
      const clipboardItem = new ClipboardItem({
        "image/png": blob,
      });

      await navigator.clipboard.write([clipboardItem]);

      copyButton.textContent = "Copied!";

      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 1500);
    } catch (error) {
      console.error("QR image copy failed:", error);

      alert("Could not copy the QR image. " + "Please try again.");
    }
  }, "image/png");
});

// Share
shareButton.addEventListener("click", async () => {
  const text = input.value.trim();

  if (!text) {
    return;
  }

  // Use the browser/device share menu if supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: "QR Code",
        text: text,
        url: text,
      });
    } catch (error) {
      // User cancelling the share menu is not an error
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  } else {
    // Fallback for browsers without Web Share API
    try {
      await navigator.clipboard.writeText(text);

      alert(
        "Sharing is not supported by this browser. The URL has been copied instead.",
      );
    } catch (error) {
      alert("Sharing is not supported by this browser.");
    }
  }
});
