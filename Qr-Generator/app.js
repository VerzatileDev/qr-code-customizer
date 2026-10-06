const input = document.getElementById("qrInput");
const generateButton = document.getElementById("generateButton");
const downloadButton = document.getElementById("downloadButton");
const qrContainer = document.getElementById("qrContainer");

let currentCanvas = null;

generateButton.addEventListener("click", generateQR);

function generateQR() {
  const text = input.value.trim();

  if (!text) {
    alert("Please enter a URL first.");
    return;
  }

  // Remove previous QR code
  qrContainer.innerHTML = "";

  // Create a canvas
  const canvas = document.createElement("canvas");

  QRCode.toCanvas(
    canvas,
    text,
    {
      width: 400,
      margin: 4,
      errorCorrectionLevel: "H",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    },
    function (error) {
      if (error) {
        console.error(error);
        alert("Could not generate QR code.");
        return;
      }

      // Put the QR code on the page
      qrContainer.appendChild(canvas);
      fitAppToViewport();

      // Remember the canvas for downloading
      currentCanvas = canvas;

      // Show download button
      downloadButton.hidden = false;
    },
  );
}

downloadButton.addEventListener("click", function () {
  if (!currentCanvas) {
    return;
  }

  const link = document.createElement("a");

  link.download = "qr-code.png";

  link.href = currentCanvas.toDataURL("image/png");

  link.click();
});
