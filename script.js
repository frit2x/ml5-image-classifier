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
  
  const preview = document.getElementById("preview");
  const placeholder = document.getElementById("placeholder");
  const imageWrapper = img.closest('.image-wrapper');
  const label = imageWrapper ? imageWrapper.querySelector('.result-label') : null;

  const classify = () => {
    placeholder.classList.add('hidden');
    preview.classList.add('visible');
    classifier.classify(preview, 5).then(results => {
      if (label && results[0]) {
        const confidence = (results[0].confidence * 100).toFixed(0);
        label.textContent = `${confidence}% ${results[0].label}`;
      }
      showChart(results);
    });
  };

  preview.src = img.src;
  if (preview.complete && preview.naturalWidth) {
    classify();
  } else {
    preview.onload = classify;
  }
}

// Klassifikation für User-Bild (automatisch bei Upload)
function classifyUserImage() {
  if (!classifier) return;
  const img = document.getElementById("preview");
  if (img.src) {
    classifier.classify(img, 5).then(results => {
      showChart(results);
    });
  }
}

// Diagramm anzeigen
function showChart(results) {
  const topResults = results.slice(0, 5);
  const labels = topResults.map(r => r.label);
  const data = topResults.map(r => (r.confidence * 100).toFixed(2));

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
        },
        tooltip: {
          callbacks: {
            label: context => `${context.parsed.x.toFixed(2)} %`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100
        },
        y: {
          ticks: {
            autoSkip: false,
            maxTicksLimit: 5,
            callback: function(value) {
              const label = this.getLabelForValue(value);
              if (label && label.length > 20) {
                const words = label.split(' ');
                let lines = [];
                let currentLine = '';
                words.forEach(word => {
                  if ((currentLine + ' ' + word).trim().length > 20) {
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