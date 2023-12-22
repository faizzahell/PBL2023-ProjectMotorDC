let historyDataDirection = [1, -1, 0, -1, 0];
let valueDirection = null
let valueVoltage = null
let valueSpeed = null

function updateArray(updateData) {
  if (updateData !== undefined && updateData !== null) {
    historyDataDirection.push(updateData);
    historyDataDirection.shift();
  }
}

function readValueCondition() {
  let trigger = '1'
  fetch("http://192.168.106.222:3000/data", {
    method: "POST",
    body: JSON.stringify({ trigger }),
    headers: { "Content-Type": "application/json" }
  })

  fetch('/api/message')
  .then(response => {
      if (!response.ok) {
          throw new Error('Permintaan gagal');
      }
      return response.json();
  })
  .then(data => {
    valueDirection = data.direction;
    valueSpeed = data.speed;
    valueVoltage = data.voltage; 

    updateArray(valueDirection);
  })
  .catch(error => {
      console.error('Terjadi kesalahan:', error);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  let dataSpeedMotor = historyDataDirection

  var data = {
    labels: ['Direction 1', 'Direction 2', 'Direction 3', 'Direction 4', 'Direction 5'],
    datasets: [{
      label: 'Data Motor Direction',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      data: dataSpeedMotor,
      fill: false
    }]
  };

  var options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  var ctx = document.getElementById('myLineChart').getContext('2d');

  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
  });

  var opts = {
    angle: 0,
    lineWidth: 0.4,
    radiusScale: 1,
    pointer: {
      length: 0.6,
      strokeWidth: 0.035,
      color: 'rgba(75, 192, 192, 1)'
    },
    limitMax: true,
    limitMin: true,
    colorStart: '#00FF00',
    colorStop: '#FF0000',
    strokeColor: '#E0E0E0',
    generateGradient: true,
    highDpiSupport: true,
  };

  var target = document.getElementById('gaugeChart');
  var gauge = new Gauge(target).setOptions(opts);

  gauge.maxValue = 1800;
  gauge.setMinValue(0);
  gauge.animationSpeed = 32;

  function updateColor(value) {
    if (value <= 100) {
      gauge.options.colorStart = '#00FF00';
      gauge.options.colorStop = '#00FF00';
    } else if (value >= 1500) {
      gauge.options.colorStart = '#FF0000';
      gauge.options.colorStop = '#FF0000';
    } else {
      gauge.options.colorStart = '#6FADCF';
      gauge.options.colorStop = '#8FC0DA';
    }
  }

  var initialValue = 130;

  gauge.maxValue = 1800;
  gauge.setMinValue(0);
  gauge.animationSpeed = 32;
  gauge.set(initialValue);

  updateColor(initialValue);

  function updateChartDirection() {
    let newDataDirectionMotor = historyDataDirection;

    myLineChart.data.datasets[0].data = newDataDirectionMotor;
    myLineChart.update();

    const indikatorClockwise = document.getElementById('clockwise');
    const indikatorCounterClockwise = document.getElementById('counter-clockwise');

    indikatorClockwise.style.backgroundColor = newDataDirectionMotor[4] > 0 ? 'rgba(75, 192, 192, 1)' : '#5C5470';
    indikatorCounterClockwise.style.backgroundColor = newDataDirectionMotor[4] < 0 ? 'rgba(75, 192, 192, 1)' : '#5C5470';
  }

  function updateChartSpeed() {
    let newDataSpeedMotor = valueSpeed;
    const valueSpeedMotorDc = document.getElementById('speed');

    valueSpeedMotorDc.textContent = `${newDataSpeedMotor} .Rpm`;

    gauge.set(newDataSpeedMotor);
    updateColor(newDataSpeedMotor);
  }

  function updateVoltage() {
    let newDataVoltage = valueVoltage;
    const indicatorValueVoltage = document.getElementById('voltmeter');

    indicatorValueVoltage.textContent = `${newDataVoltage} Volt`;
  }

  setInterval(updateChartDirection, 2000);
  setInterval(updateChartSpeed, 2000);
  setInterval(updateVoltage, 2000);
});

setInterval(readValueCondition, 2000);

