var canvasCopy, ctxCopy, canvas, ctx;
var instrument;
var instrumentDefault = 'ellipse'; // By default din input

var init = function () {
  canvas = document.getElementById('canvas1');
  ctx = canvas.getContext('2d');

  // Copy of the canvas on which first we'll be drawing and then paste the original one
  var container = canvas.parentNode;
  canvasCopy = document.createElement('canvas');

  canvasCopy.id = 'canvas2';
  canvasCopy.width = canvas.width;
  canvasCopy.height = canvas.height;
  container.appendChild(canvasCopy);

  ctxCopy = canvasCopy.getContext('2d');

  // Getting the select input
  var selectedInstrument = document.getElementById('selection');

  // For when changes of the instruments will be made
  selectedInstrument.addEventListener('change', instrument_change_evt, false);

  // Slider for the instrument thickness
  var thickness = document.getElementById('thickness');
  thickness.addEventListener('change', function () {
    ctxCopy.lineWidth = thickness.value;
  });

  // Canvas background
  Background = function () {
    canvas.style.backgroundColor =
      document.getElementById('backgroundColor').value;
  };

  // Clear canvas button function
  Clear = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('lines').innerHTML = 0;
    document.getElementById('circles').innerHTML = 0;
    document.getElementById('ellipses').innerHTML = 0;
    document.getElementById('rectangles').innerHTML = 0;
    canvas.style.backgroundColor = '#ffffff'; // inapoi alb
  };

  // Default instrument (ellipse)
  if (instruments[instrumentDefault] != null) {
    instrument = new instruments[instrumentDefault]();
    selectedInstrument.value = instrumentDefault;
  }

  // Event listeners for every move
  canvasCopy.addEventListener('mousedown', canvas_evt, false);
  canvasCopy.addEventListener('mousemove', canvas_evt, false);
  canvasCopy.addEventListener('mouseup', canvas_evt, false);
};

// Getting the mouse position
canvas_evt = function (evt) {
  if (evt.layerX || evt.layerX == 0) {
    evt._x = evt.layerX;
    evt._y = evt.layerY;
  }

  // Event handler for the instrument
  const func = instrument[evt.type];
  if (func !== null) {
    func(evt);
  }
};

// Event handler for changing between instruments
function instrument_change_evt(evt) {
  if (instruments[this.value]) {
    instrument = new instruments[this.value]();
  }
}

// Overlaying canvasCopy over canvas
updateCanvas = function () {
  ctx.drawImage(canvasCopy, 0, 0);
  ctxCopy.clearRect(0, 0, canvasCopy.width, canvasCopy.height);
};

// Download image in raster format
DownloadImage = function () {
  img = canvas.toDataURL('image/png');
  var a = document.createElement('a'); // link creating
  a.download = 'result.png'; // file name
  a.href = img;
  a.click();
};

var instruments = {};

// Circle
instruments.circle = function () {
  var instrument = this;
  this.started = false; // When the click has been made
  var moved = false; // In case the mouse cursor is actually moved, this variable becomes true

  this.mousedown = function (evt) {
    instrument.started = true;
    instrument.x0 = evt._x; // x0, y0 = first coordinates
    instrument.y0 = evt._y;
    moved = false; // If moves are actually made, circles variable inside the unordered list will be incremented
  };

  this.mousemove = function (evt) {
    if (instrument.started == false) {
      return;
    }

    ctxCopy.clearRect(0, 0, canvasCopy.width, canvasCopy.height);

    let x = instrument.x0,
      y = instrument.y0,
      radius = Math.abs(evt._x - instrument.x0) / 2;
    ctxCopy.strokeStyle = document.getElementById('color').value; // Color from the color picker
    ctxCopy.beginPath();
    ctxCopy.arc(x, y, radius, 0, Math.PI * 2);
    ctxCopy.stroke();

    if (Math.abs(evt._x + evt._y - instrument.x0 - instrument.y0)) {
      moved = true;
    }
  };

  this.mouseup = function (evt) {
    if (instrument.started) {
      instrument.mousemove(evt);
      instrument.started = false; // When the mouse left button is no longer clicked
      updateCanvas(); // Overlaying canvasCopy over the original one
    }
    if (moved) {
      document.getElementById('circles').innerHTML++; // Incrementing the circle number
    }
  };
};

// Ellipse
instruments.ellipse = function () {
  var instrument = this;
  this.started = false;
  var moved = false;

  this.mousedown = function (evt) {
    instrument.started = true;
    instrument.x0 = evt._x;
    instrument.y0 = evt._y;
    moved = false;
  };

  this.mousemove = function (evt) {
    if (!instrument.started) {
      return;
    }

    ctxCopy.clearRect(0, 0, canvasCopy.width, canvasCopy.height);
    ctxCopy.strokeStyle = document.getElementById('color').value;
    var x = Math.min(evt._x, instrument.x0),
      y = Math.min(evt._y, instrument.y0),
      rx = Math.abs(instrument.x0 - evt._x) / 2,
      ry = Math.abs(instrument.y0 - evt._y) / 2;
    ctxCopy.beginPath();
    ctxCopy.ellipse(x, y, rx, ry, Math.PI / 4, 0, Math.PI * 2);
    ctxCopy.stroke();

    if (Math.abs(evt._x + evt._y - instrument.x0 - instrument.y0)) {
      moved = true;
    }
  };

  this.mouseup = function (evt) {
    if (instrument.started) {
      instrument.mousemove(evt);
      instrument.started = false;
      updateCanvas();
    }
    if (moved) {
      document.getElementById('ellipses').innerHTML++;
    }
  };
};

// Rectangle
instruments.rectangle = function () {
  var instrument = this;
  this.started = false;
  var moved = false;

  this.mousedown = function (evt) {
    instrument.started = true;
    instrument.x0 = evt._x;
    instrument.y0 = evt._y;
    moved = false;
  };

  this.mousemove = function (evt) {
    if (!instrument.started) {
      return;
    }

    var x = Math.min(evt._x, instrument.x0),
      y = Math.min(evt._y, instrument.y0),
      w = Math.abs(evt._x - instrument.x0),
      h = Math.abs(evt._y - instrument.y0);

    ctxCopy.clearRect(0, 0, canvasCopy.width, canvasCopy.height);

    if (!w || !h) {
      return;
    }
    ctxCopy.strokeStyle = document.getElementById('color').value;
    ctxCopy.strokeRect(x, y, w, h);
    if (Math.abs(evt._x + evt._y - instrument.x0 - instrument.y0)) {
      moved = true;
    }
  };

  this.mouseup = function (evt) {
    if (instrument.started) {
      instrument.mousemove(evt);
      instrument.started = false;
      updateCanvas();
    }
    if (moved) {
      document.getElementById('rectangles').innerHTML++;
    }
  };
};

// Line
instruments.line = function () {
  var instrument = this;
  this.started = false;
  var moved = false;

  this.mousedown = function (evt) {
    instrument.started = true;
    instrument.x0 = evt._x;
    instrument.y0 = evt._y;
    moved = false;
  };

  this.mousemove = function (evt) {
    if (!instrument.started) {
      return;
    }

    ctxCopy.clearRect(0, 0, canvasCopy.width, canvasCopy.height);

    ctxCopy.beginPath();
    ctxCopy.moveTo(instrument.x0, instrument.y0);
    ctxCopy.lineTo(evt._x, evt._y);
    ctxCopy.strokeStyle = document.getElementById('color').value;
    ctxCopy.stroke();
    ctxCopy.closePath();

    if (Math.abs(evt._x + evt._y - instrument.x0 - instrument.y0)) {
      moved = true;
    }
  };

  this.mouseup = function (evt) {
    if (instrument.started) {
      instrument.mousemove(evt);
      instrument.started = false;
      updateCanvas();
    }
    if (moved) {
      document.getElementById('lines').innerHTML++;
    }
  };
};

init();
