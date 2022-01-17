var canvasCopy, ctxCopy, canvas, ctx;
var instrument;
var instrumentDefault = 'ellipse'; // By default din input

var init = function () {
  canvas = document.getElementById('canvas1');
  ctx = canvas.getContext('2d');

  // Copie a canvasului peste care desenam si se pune pe urma peste cel original
  // Copie cu aceleasi proprietati, alt id
  var container = canvas.parentNode;
  canvasCopy = document.createElement('canvas');

  canvasCopy.id = 'canvas2';
  canvasCopy.width = canvas.width;
  canvasCopy.height = canvas.height;
  container.appendChild(canvasCopy);

  ctxCopy = canvasCopy.getContext('2d');

  // Luam input-ul din select
  var selectedInstrument = document.getElementById('selection');

  selectedInstrument.addEventListener('change', instrument_change_evt, false); // Pentru cand schimbam instrumentul

  // Slider-ul pentru grosimea cu care se deseneaza
  var thickness = document.getElementById('thickness');
  thickness.addEventListener('change', function () {
    ctxCopy.lineWidth = thickness.value;
  });

  // Background-ul canvas-ului
  Background = function () {
    canvas.style.backgroundColor =
      document.getElementById('backgroundColor').value;
  };

  // Butonul prin care se sterge ce e desenat cand e apasat
  Clear = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('lines').innerHTML = 0;
    document.getElementById('circles').innerHTML = 0;
    document.getElementById('ellipses').innerHTML = 0;
    document.getElementById('rectangles').innerHTML = 0;
    canvas.style.backgroundColor = '#ffffff'; // inapoi alb
  };

  // Instrumentul default (elipsa)
  if (instruments[instrumentDefault] != null) {
    instrument = new instruments[instrumentDefault]();
    selectedInstrument.value = instrumentDefault;
  }

  // Event listener pentru fiecare miscare
  canvasCopy.addEventListener('mousedown', canvas_evt, false);
  canvasCopy.addEventListener('mousemove', canvas_evt, false);
  canvasCopy.addEventListener('mouseup', canvas_evt, false);
};

// Determinarea coordonatelor mouse-ului
canvas_evt = function (evt) {
  if (evt.layerX || evt.layerX == 0) {
    evt._x = evt.layerX;
    evt._y = evt.layerY;
  }

  // Event handler al instrumentului
  const func = instrument[evt.type];
  if (func !== null) {
    func(evt);
  }
};

// Event handler pt cand se schimba instrumentul.
function instrument_change_evt(evt) {
  if (instruments[this.value]) {
    instrument = new instruments[this.value]();
  }
}

// Overlay canvasCopy peste canvas
updateCanvas = function () {
  ctx.drawImage(canvasCopy, 0, 0);
  ctxCopy.clearRect(0, 0, canvasCopy.width, canvasCopy.height);
};

// Download imagine in format raster .png
DownloadImage = function () {
  img = canvas.toDataURL('image/png');
  var a = document.createElement('a'); // creare link
  a.download = 'result.png'; // nume fisier
  a.href = img;
  a.click();
};

var instruments = {};

// Cerc
instruments.circle = function () {
  var instrument = this;
  this.started = false; // Cand se apasa butonul
  var moved = false; // In cazul in care se misca cursorul pe canvas va deveni true

  this.mousedown = function (evt) {
    instrument.started = true;
    instrument.x0 = evt._x; // x0, y0 = primele coordonate
    instrument.y0 = evt._y;
    moved = false; // Daca se va inregistra miscare (daca apare efectiv un CERC nou, nu doar fiindca s-a apasat click), se va incrementa numarul acestora
  };

  this.mousemove = function (evt) {
    if (instrument.started == false) {
      return;
    }

    ctxCopy.clearRect(0, 0, canvasCopy.width, canvasCopy.height);

    let x = instrument.x0,
      y = instrument.y0,
      radius = Math.abs(evt._x - instrument.x0) / 2;
    ctxCopy.strokeStyle = document.getElementById('color').value; // Culoarea din color picker
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
      instrument.started = false; // Nu mai este click-ul apasat
      updateCanvas(); // Overlay canvasCopy (ce s-a desenat) peste canvas-ul de baza
    }
    if (moved) {
      document.getElementById('circles').innerHTML++; // Incrementare nr cercuri
    }
  };
};

// Elipsa
instruments.ellipse = function () {
  var instrument = this;
  this.started = false;
  var moved = false;

  this.mousedown = function (evt) {
    instrument.started = true;
    instrument.x0 = evt._x;
    instrument.y0 = evt._y;
    moved = false; // Daca se va inregistra miscare (daca apare o ELIPSA pe canvas), se va incrementa numarul acestora
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

// Dreptunghi
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

// Linie
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
