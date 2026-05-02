let classifier;
let currentChart;

// Modell laden
ml5.imageClassifier('MobileNet')
  .then(c => {
    classifier = c;
    console.log("Model loaded");
  });

// Klassifikation für Beispielbilder
function classifyImage(img) {
  classifier.classify(img).then(results => {
    showChart(results);
  });
}

// Klassifikation für User-Bild
function classifyUserImage() {
  const img = document.getElementById("preview");
  classifier.classify(img).then(results => {
    showChart(results);
  });
}

// Diagramm anzeigen
function showChart(results) {
  const labels = results.map(r => r.label);
  const data = results.map(r => (r.confidence * 100).toFixed(2));

  if (currentChart) currentChart.destroy();

  currentChart = new Chart(document.getElementById("chart"), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Confidence (%)',
        data: data
      }]
    }
  });
}

// Upload
document.getElementById("upload").addEventListener("change", e => {
  const file = e.target.files[0];
  const img = document.getElementById("preview");
  img.src = URL.createObjectURL(file);
});

// Drag & Drop
const dropzone = document.getElementById("dropzone");

dropzone.addEventListener("dragover", e => e.preventDefault());

dropzone.addEventListener("drop", e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  const img = document.getElementById("preview");
  img.src = URL.createObjectURL(file);
});