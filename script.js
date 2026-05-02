let classifier;
let currentChart;

// Modell laden
ml5.imageClassifier('MobileNet')
  .then(c => {
    classifier = c;
    console.log("Model loaded");
  });

// Klassifikation für Beispielbilder
function classifyExample(img) {
  if (!classifier) return;
  classifier.classify(img).then(results => {
    showChart(results);
  });
}

// Klassifikation für User-Bild (automatisch bei Upload)
function classifyUserImage() {
  if (!classifier) return;
  const img = document.getElementById("preview");
  if (img.src) {
    classifier.classify(img).then(results => {
      showChart(results);
    });
  }
}

// Diagramm anzeigen
function showChart(results) {
  const labels = results.map(r => r.label);
  const data = results.map(r => (r.confidence * 100).toFixed(2));

  if (currentChart) currentChart.destroy();

  const ctx = document.getElementById("chart");
  const placeholder = document.getElementById("chart-placeholder");
  
  ctx.style.display = 'block';
  placeholder.classList.add('hidden');

  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Confidence (%)',
        data: data,
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(237, 100, 166, 0.8)',
          'rgba(255, 154, 158, 0.8)',
          'rgba(250, 191, 144, 0.8)'
        ],
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100
        },
        y: {
          ticks: {
            callback: function(value) {
              const label = this.getLabelForValue(value);
              // Zeilenumbruch bei langen Namen (max 20 Zeichen pro Zeile)
              if (label && label.length > 20) {
                const words = label.split(' ');
                let lines = [];
                let currentLine = '';
                words.forEach(word => {
                  if ((currentLine + word).length > 20) {
                    lines.push(currentLine.trim());
                    currentLine = word;
                  } else {
                    currentLine += ' ' + word;
                  }
                });
                if (currentLine) lines.push(currentLine.trim());
                return lines;
              }
              return label;
            }
          }
        }
      }
    }
  });
}

// Upload Handler
document.getElementById("upload").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = document.getElementById("preview");
  const placeholder = document.getElementById("placeholder");
  
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    placeholder.classList.add('hidden');
    img.classList.add('visible');
    // Automatisch klassifizieren
    if (classifier) {
      setTimeout(() => classifyUserImage(), 100);
    }
  };
});

// Drag & Drop
const dropzone = document.getElementById("dropzone");

dropzone.addEventListener("dragover", e => {
  e.preventDefault();
  dropzone.classList.add("drag-over");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("drag-over");
});

dropzone.addEventListener("drop", e => {
  e.preventDefault();
  dropzone.classList.remove("drag-over");
  
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const img = document.getElementById("preview");
  const placeholder = document.getElementById("placeholder");
  
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    placeholder.classList.add('hidden');
    img.classList.add('visible');
    // Automatisch klassifizieren
    if (classifier) {
      setTimeout(() => classifyUserImage(), 100);
    }
  };
});