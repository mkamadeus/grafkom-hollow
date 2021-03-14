import "./styles/style.css";
import { cubeColors, cubeIndices, cubePositions } from "./models/cube";
import {
  multiplyMatrix,
  scale as getScaleMatrix,
  getTranslationMatrix,
  getRotationMatrix,
} from "./utils/Matrix4";

let gl = null;
let programObject = null;
let wireProgramObject = null;
let vbo = null;
let wireVbo = null;
let elementVbo = null;
let colorOffset = 0;
let numElements = 0;
let wireNumElements = 0;
let matrixLocation = null;
let wireMatrixLocation = null;
let wireIndices = null;
let matrix = Array(16);

// Transformation variables
var xRotation = 0;
var yRotation = 0;
var zRotation = 0;

var xScale = 1;
var yScale = 1;
var zScale = 1;

var xTranslation = 0;
var yTranslation = 0;
var zTranslation = 0;

function main() {
  const canvas = document.getElementById("c") as HTMLCanvasElement;

  var ratio = window.devicePixelRatio ? window.devicePixelRatio : 1;
  canvas.width = 1200 * ratio;
  canvas.height = 1200 * ratio;

  gl = canvas.getContext("webgl");
  if (!gl) return;

  init();
}

function init() {
  // Clear canvas
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 0.0);

  initModel();
  initShaders();
  initWireShaders();
  initEvents();
  calculateMatrix();

  draw();
}

function initModel() {
  vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    cubePositions.byteLength + cubeColors.byteLength,
    gl.STATIC_DRAW
  );
  colorOffset = cubePositions.byteLength;
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, cubePositions);
  gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset, cubeColors);

  elementVbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementVbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
  numElements = cubeIndices.length;

  wireIndices = createWireIndices(cubeIndices);
  wireVbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireVbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wireIndices, gl.STATIC_DRAW);
  wireNumElements = wireIndices.length;
}

function initShaders() {
  var vertexShaderSource = document.getElementById("vertex-shader").textContent;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);

  var fragmentShaderSource = document.getElementById("fragment-shader")
    .textContent;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);

  programObject = gl.createProgram();
  gl.attachShader(programObject, vertexShader);
  gl.attachShader(programObject, fragmentShader);

  gl.bindAttribLocation(programObject, 0, "a_position");
  gl.bindAttribLocation(programObject, 1, "a_color");
  gl.linkProgram(programObject);

  matrixLocation = gl.getUniformLocation(programObject, "u_matrix");
}

function initWireShaders() {
  var wireVertexShaderSource = document.getElementById("wire-vertex-shader")
    .textContent;
  var wireVertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(wireVertexShader, wireVertexShaderSource);
  gl.compileShader(wireVertexShader);

  var wireFragmentSource = document.getElementById("wire-fragment-shader")
    .textContent;
  var wireFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(wireFragmentShader, wireFragmentSource);
  gl.compileShader(wireFragmentShader);

  wireProgramObject = gl.createProgram();
  gl.attachShader(wireProgramObject, wireVertexShader);
  gl.attachShader(wireProgramObject, wireFragmentShader);

  gl.bindAttribLocation(wireProgramObject, 0, "a_position");
  gl.linkProgram(wireProgramObject);

  wireMatrixLocation = gl.getUniformLocation(wireProgramObject, "u_matrix");
}

function calculateMatrix() {
  matrix = getScaleMatrix(xScale, yScale, zScale);
  matrix = multiplyMatrix(
    getRotationMatrix(xRotation, yRotation, zRotation),
    matrix
  );
  matrix = multiplyMatrix(
    getTranslationMatrix(xTranslation, yTranslation, zTranslation),
    matrix
  );
}

function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(programObject);

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, colorOffset);
  gl.enableVertexAttribArray(1);

  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementVbo);
  gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_SHORT, 0);

  drawWire();
}

function drawWire() {
  gl.useProgram(wireProgramObject);

  gl.uniformMatrix4fv(wireMatrixLocation, false, matrix);

  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireVbo);
  gl.drawElements(gl.LINES, this.wireNumElements, gl.UNSIGNED_SHORT, 0);
}

function createWireIndices(triangleIndices) {
  var wireIndices = new Uint16Array(triangleIndices.length * 2);
  var i, j;
  j = 0;
  for (i = 0; i < triangleIndices.length; i += 3) {
    wireIndices[j++] = triangleIndices[i];
    wireIndices[j++] = triangleIndices[i + 1];

    wireIndices[j++] = triangleIndices[i + 1];
    wireIndices[j++] = triangleIndices[i + 2];

    wireIndices[j++] = triangleIndices[i + 2];
    wireIndices[j++] = triangleIndices[i];
  }
  return wireIndices;
}

function initEvents() {
  xRotation = (document.getElementById("x-rotation") as HTMLInputElement)
    .valueAsNumber;
  yRotation = (document.getElementById("y-rotation") as HTMLInputElement)
    .valueAsNumber;
  zRotation = (document.getElementById("z-rotation") as HTMLInputElement)
    .valueAsNumber;
  xScale = (document.getElementById("x-scale") as HTMLInputElement)
    .valueAsNumber;
  yScale = (document.getElementById("y-scale") as HTMLInputElement)
    .valueAsNumber;
  zScale = (document.getElementById("z-scale") as HTMLInputElement)
    .valueAsNumber;
  xTranslation = (document.getElementById("x-translation") as HTMLInputElement)
    .valueAsNumber;
  yTranslation = (document.getElementById("y-translation") as HTMLInputElement)
    .valueAsNumber;
  zTranslation = (document.getElementById("z-translation") as HTMLInputElement)
    .valueAsNumber;

  document.getElementById("x-rotation").addEventListener("input", (ev) => {
    xRotation = (document.getElementById("x-rotation") as HTMLInputElement)
      .valueAsNumber;
    calculateMatrix();
    draw();
  });
  document.getElementById("y-rotation").addEventListener("input", (ev) => {
    yRotation = (document.getElementById("y-rotation") as HTMLInputElement)
      .valueAsNumber;
    calculateMatrix();
    draw();
  });
  document.getElementById("z-rotation").addEventListener("input", (ev) => {
    zRotation = (document.getElementById("z-rotation") as HTMLInputElement)
      .valueAsNumber;
    calculateMatrix();
    draw();
  });
  document.getElementById("x-scale").addEventListener("input", (ev) => {
    xScale = (document.getElementById("x-scale") as HTMLInputElement)
      .valueAsNumber;
    calculateMatrix();
    draw();
  });
  document.getElementById("y-scale").addEventListener("input", (ev) => {
    yScale = (document.getElementById("y-scale") as HTMLInputElement)
      .valueAsNumber;
    calculateMatrix();
    draw();
  });
  document.getElementById("z-scale").addEventListener("input", (ev) => {
    zScale = (document.getElementById("z-scale") as HTMLInputElement)
      .valueAsNumber;
    calculateMatrix();
    draw();
  });
  document.getElementById("x-translation").addEventListener("input", (ev) => {
    xTranslation = (document.getElementById(
      "x-translation"
    ) as HTMLInputElement).valueAsNumber;
    calculateMatrix();
    draw();
  });
  document.getElementById("y-translation").addEventListener("input", (ev) => {
    yTranslation = (document.getElementById(
      "y-translation"
    ) as HTMLInputElement).valueAsNumber;
    calculateMatrix();
    draw();
  });
  document.getElementById("z-translation").addEventListener("input", (ev) => {
    zTranslation = (document.getElementById(
      "z-translation"
    ) as HTMLInputElement).valueAsNumber;
    calculateMatrix();
    draw();
  });
}

main();
