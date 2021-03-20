import "./styles/style.css";
import { cubeColors, cubeIndices, cubePositions } from "./models/cube";
import {
  tetrahedronColors,
  tetrahedronIndices,
  tetrahedronPositions,
} from "./models/tetrahedron";
import {
  multiplyMatrix,
  getScaleMatrix,
  getTranslationMatrix,
  getRotationMatrix,
  getPerspectiveMatrix,
  getInverse,
  getTranspose,
  getIdentityMatrix,
  getLookAt,
} from "./utils/Matrix4";

import BodyVertexShader from "./shaders/BodyVertexShader.glsl";
import BodyFragmentShader from "./shaders/BodyFragmentShader.glsl";
import WireVertexShader from "./shaders/WireVertexShader.glsl";
import WireFragmentShader from "./shaders/WireFragmentShader.glsl";

let gl: WebGLRenderingContext | null = null;
let programObject: WebGLProgram | null = null;
let wireProgramObject: WebGLProgram | null = null;

let vbo: WebGLBuffer | null = null;
let wireVbo: WebGLBuffer | null = null;
let elementVbo: WebGLBuffer | null = null;

let normalOffset: number = 0;
let numElements: number = 0;
let wireNumElements: number = 0;

let matrixLocation: WebGLUniformLocation | null = null;
let wireMatrixLocation: WebGLUniformLocation | null = null;
let projectionMatrixLocation: WebGLUniformLocation | null = null;
let wireProjectionMatrixLocation: WebGLUniformLocation | null = null;
let normalMatrixLocation: WebGLUniformLocation | null = null;

let mode: WebGLUniformLocation | null = null;
let ka: WebGLUniformLocation | null = null;
let kd: WebGLUniformLocation | null = null;
let ks: WebGLUniformLocation | null = null;
let shineVal: WebGLUniformLocation | null = null;
let ac: WebGLUniformLocation | null = null;
let dc: WebGLUniformLocation | null = null;
let sc: WebGLUniformLocation | null = null;
let lightPos: WebGLUniformLocation | null = null;

let wireIndices = null;
let matrix = Array(16).fill(0);

// Camera matrix
let xRotationCamera = 0;
let yRotationCamera = 0;
let cameraDistance = 2;
let cameraMatrix = Array(16).fill(0);
let projectionMatrix = Array(16).fill(0);

// Normal
let cubeNormal = new Float32Array(cubePositions);

// Transformation variables
let xRotation = 0;
let yRotation = 0;
let zRotation = 0;

let xScale = 1;
let yScale = 1;
let zScale = 1;

let xTranslation = 0;
let yTranslation = 0;
let zTranslation = 0;

function main() {
  const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;

  const ratio = window.devicePixelRatio ? window.devicePixelRatio : 1;
  canvas.width = 1200 * ratio;
  canvas.height = 1200 * ratio;

  gl = canvas.getContext("webgl");
  if (!gl) alert("Your browser/machine does not support WebGL!");

  init();
}

function init() {
  gl = gl as WebGLRenderingContext;

  // Clear canvas
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 0.0);

  initModel();
  initShaders();
  initWireShaders();
  initEvents();
  calculateMatrix();
  calculateCameraProjection();

  draw();
}

/**
 * Insert object model to WebGL buffers.
 */
function initModel() {
  gl = gl as WebGLRenderingContext;

  vbo = gl.createBuffer() as WebGLBuffer;

  // Store cube vertex positions and colors
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    tetrahedronPositions.byteLength + cubeNormal.byteLength,
    gl.STATIC_DRAW
  );
  // colorOffset = tetrahedronPositions.byteLength;
  // gl.bufferSubData(gl.ARRAY_BUFFER, 0, tetrahedronPositions);
  // gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset, tetrahedronColors);
  //   cubePositions.byteLength + cubeNormal.byteLength,
  //   gl.STATIC_DRAW
  // );

  normalOffset = tetrahedronPositions.byteLength;
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, tetrahedronPositions);
  gl.bufferSubData(gl.ARRAY_BUFFER, normalOffset, cubeNormal);

  // Store element triangle definition
  elementVbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementVbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, tetrahedronIndices, gl.STATIC_DRAW);
  numElements = tetrahedronIndices.length;

  // Store wire definition
  wireIndices = createWireIndices(tetrahedronIndices);
  wireVbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireVbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wireIndices, gl.STATIC_DRAW);
  wireNumElements = wireIndices.length;
}

/**
 * Initialize body shaders.
 */
function initShaders() {
  gl = gl as WebGLRenderingContext;

  // Initialize body vertex shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
  gl.shaderSource(vertexShader, BodyVertexShader);
  gl.compileShader(vertexShader);

  // Initialize body fragment shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
  gl.shaderSource(fragmentShader, BodyFragmentShader);
  gl.compileShader(fragmentShader);

  // Initialize shader program
  programObject = gl.createProgram() as WebGLProgram;
  gl.attachShader(programObject, vertexShader);
  gl.attachShader(programObject, fragmentShader);

  // Link shader variables
  gl.bindAttribLocation(programObject, 0, "a_position");
  gl.bindAttribLocation(programObject, 1, "normal");

  console.log(vertexShader);
  console.log(fragmentShader);

  gl.linkProgram(programObject);
  // normalLocation = gl.getAttribLocation(programObject, "normal");
  matrixLocation = gl.getUniformLocation(programObject, "u_matrix");
  projectionMatrixLocation = gl.getUniformLocation(
    programObject,
    "u_proj_matrix"
  );
  mode = gl.getUniformLocation(programObject, "mode");
  ka = gl.getUniformLocation(programObject, "Ka");
  kd = gl.getUniformLocation(programObject, "Kd");
  ks = gl.getUniformLocation(programObject, "Ks");
  shineVal = gl.getUniformLocation(programObject, "shininessVal");
  ac = gl.getUniformLocation(programObject, "ambientColor");
  dc = gl.getUniformLocation(programObject, "diffuseColor");
  sc = gl.getUniformLocation(programObject, "specularColor");
  lightPos = gl.getUniformLocation(programObject, "lightPos");
  normalMatrixLocation = gl.getUniformLocation(
    programObject,
    "normalMat"
  );

}

/**
 * Initialize wire shaders.
 */
function initWireShaders() {
  gl = gl as WebGLRenderingContext;

  // Initialize wire vertex shaders
  const wireVertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
  gl.shaderSource(wireVertexShader, WireVertexShader);
  gl.compileShader(wireVertexShader);

  // Initialize wire fragment shaders
  const wireFragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
  gl.shaderSource(wireFragmentShader, WireFragmentShader);
  gl.compileShader(wireFragmentShader);

  // Initialize wire shader program
  wireProgramObject = gl.createProgram() as WebGLProgram;
  gl.attachShader(wireProgramObject, wireVertexShader);
  gl.attachShader(wireProgramObject, wireFragmentShader);

  // Link shader variables
  gl.bindAttribLocation(wireProgramObject, 0, "a_position");
  gl.linkProgram(wireProgramObject);
  wireMatrixLocation = gl.getUniformLocation(wireProgramObject, "u_matrix");
  wireProjectionMatrixLocation = gl.getUniformLocation(
    wireProgramObject,
    "u_proj_matrix"
  );
}

/**
 * Function to calculate current transformation matrix.
 */
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

/**
 * Function to calculate the projection matrix.
 */
function calculateCameraProjection() {
  cameraMatrix = getRotationMatrix(xRotationCamera, yRotationCamera, 0);
  cameraMatrix = multiplyMatrix(
    getTranslationMatrix(0, 0, cameraDistance),
    cameraMatrix
  );

  const cameraPosition = [cameraMatrix[12], cameraMatrix[13], cameraMatrix[14]];
  const targetPosition = [0, 0, 0];
  const up = [0, 1, 0];

  cameraMatrix = getLookAt(cameraPosition, targetPosition, up);
  // cameraMatrix

  projectionMatrix = multiplyMatrix(
    getInverse(cameraMatrix),
    getPerspectiveMatrix(60, 1, 1, 2000)
    // cameraMatrix
  );

  // projectionMatrix = getPerspectiveMatrix(60, 1, 1, 2000);
  console.log(projectionMatrix);
}

/**
 * Function to calculate normals.
 */
function calculateSurfaceNormal() {
  var vertNormal = Array(cubePositions.length).fill(0);
  for(var i = 0; i < cubeIndices.length/3; i = i+3){
    var p1 = [];
    var p2 = [];
    var p3 = [];
    for(var j = 0; j < 3; j++){
      p1.push(cubePositions[cubeIndices[i] * 3 + j]);
      p2.push(cubePositions[cubeIndices[i + 1] * 3 + j]);
      p3.push(cubePositions[cubeIndices[i + 2] * 3 + j]);
    }
    var u = [];
    var v = [];
    for(var j = 0; j < 3; j++){
      u.push(p2[j] - p1[j]);
      v.push(p3[j] - p1[j]);
    }
    var nx = u[1] * v[2] - u[2] * v[1];
    var ny = u[2] * v[0] - u[0] * v[2];
    var nz = u[0] * v[1] - u[1] * v[0];

    var normal = [nx, ny, nz];

    for(var j = 0; j < 3; j++){
      vertNormal[cubeIndices[i] * 3 + j] += normal[j];
      vertNormal[cubeIndices[i + 1] * 3 + j] += normal[j];
      vertNormal[cubeIndices[i + 2] * 3 + j] += normal[j];
    }
  }
  cubeNormal = new Float32Array(vertNormal);
}

/**
 * Draw objects
 */
function draw() {
  calculateSurfaceNormal();

  gl = gl as WebGLRenderingContext;

  // Reset canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // Use WebGL Program
  gl.useProgram(programObject);

  // Retrieve buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, normalOffset);
  gl.enableVertexAttribArray(1);

  // Initiate transformation matrix
  gl.uniformMatrix4fv(matrixLocation, false, matrix);
  gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
  gl.uniformMatrix4fv(normalMatrixLocation, false, new Float32Array(getTranspose(getInverse(matrix))));

  // Phong shader uniform
  gl.uniform1i(mode, 1);
  gl.uniform1f(ka, 1);
  gl.uniform1f(kd, 1);
  gl.uniform1f(ks, 1);
  gl.uniform1f(shineVal, 80);
  gl.uniform3fv(ac, new Float32Array([0.2, 0.0, 0.0]));
  gl.uniform3fv(dc, new Float32Array([0.7, 0.7, 0.0]));
  gl.uniform3fv(sc, new Float32Array([1.0, 1.0, 1.0]));
  gl.uniform3fv(lightPos, new Float32Array([0, 0, 2]));

  // Bind and draw triangles
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementVbo);
  gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_SHORT, 0);

  // Draw wireframe
  // drawWire();
}

/**
 * Draw wireframe
 */
function drawWire() {
  gl = gl as WebGLRenderingContext;

  // Use WebGL Program
  gl.useProgram(wireProgramObject);

  // Bind transformation matrix
  gl.uniformMatrix4fv(wireMatrixLocation, false, matrix);
  gl.uniformMatrix4fv(wireProjectionMatrixLocation, false, projectionMatrix);

  // Retrieve buffers
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  // Bind and draw wireframes
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireVbo);
  gl.drawElements(gl.LINES, wireNumElements, gl.UNSIGNED_SHORT, 0);
}

function createWireIndices(triangleIndices: Uint16Array) {
  const wireIndices = new Uint16Array(triangleIndices.length * 2);
  let j = 0;
  for (let i = 0; i < triangleIndices.length; i += 3) {
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
  // Set initial value
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
  xRotationCamera = (document.getElementById(
    "x-camera-rotation"
  ) as HTMLInputElement).valueAsNumber;
  yRotationCamera = (document.getElementById(
    "y-camera-rotation"
  ) as HTMLInputElement).valueAsNumber;
  cameraDistance = (document.getElementById(
    "camera-distance"
  ) as HTMLInputElement).valueAsNumber;

  (document.getElementById("x-rotation") as HTMLInputElement).addEventListener(
    "input",
    (ev) => {
      xRotation = (document.getElementById("x-rotation") as HTMLInputElement)
        .valueAsNumber;
      calculateMatrix();
      draw();
    }
  );
  (document.getElementById("y-rotation") as HTMLInputElement).addEventListener(
    "input",
    (ev) => {
      yRotation = (document.getElementById("y-rotation") as HTMLInputElement)
        .valueAsNumber;
      calculateMatrix();
      draw();
    }
  );
  (document.getElementById("z-rotation") as HTMLInputElement).addEventListener(
    "input",
    (ev) => {
      zRotation = (document.getElementById("z-rotation") as HTMLInputElement)
        .valueAsNumber;
      calculateMatrix();
      draw();
    }
  );
  (document.getElementById("x-scale") as HTMLInputElement).addEventListener(
    "input",
    (ev) => {
      xScale = (document.getElementById("x-scale") as HTMLInputElement)
        .valueAsNumber;
      calculateMatrix();
      draw();
    }
  );
  (document.getElementById("y-scale") as HTMLInputElement).addEventListener(
    "input",
    (ev) => {
      yScale = (document.getElementById("y-scale") as HTMLInputElement)
        .valueAsNumber;
      calculateMatrix();
      draw();
    }
  );
  (document.getElementById("z-scale") as HTMLInputElement).addEventListener(
    "input",
    (ev) => {
      zScale = (document.getElementById("z-scale") as HTMLInputElement)
        .valueAsNumber;
      calculateMatrix();
      draw();
    }
  );
  (document.getElementById(
    "x-translation"
  ) as HTMLInputElement).addEventListener("input", (ev) => {
    xTranslation = (document.getElementById(
      "x-translation"
    ) as HTMLInputElement).valueAsNumber;
    calculateMatrix();
    draw();
  });
  (document.getElementById(
    "y-translation"
  ) as HTMLInputElement).addEventListener("input", (ev) => {
    yTranslation = (document.getElementById(
      "y-translation"
    ) as HTMLInputElement).valueAsNumber;
    calculateMatrix();
    draw();
  });
  (document.getElementById(
    "z-translation"
  ) as HTMLInputElement).addEventListener("input", (ev) => {
    zTranslation = (document.getElementById(
      "z-translation"
    ) as HTMLInputElement).valueAsNumber;
    calculateMatrix();
    draw();
  });
  (document.getElementById(
    "x-camera-rotation"
  ) as HTMLInputElement).addEventListener("input", (ev) => {
    xRotationCamera = (document.getElementById(
      "x-camera-rotation"
    ) as HTMLInputElement).valueAsNumber;
    calculateCameraProjection();
    draw();
  });
  (document.getElementById(
    "y-camera-rotation"
  ) as HTMLInputElement).addEventListener("input", (ev) => {
    yRotationCamera = (document.getElementById(
      "y-camera-rotation"
    ) as HTMLInputElement).valueAsNumber;
    calculateCameraProjection();
    draw();
  });
  (document.getElementById(
    "camera-distance"
  ) as HTMLInputElement).addEventListener("input", (ev) => {
    cameraDistance = (document.getElementById(
      "camera-distance"
    ) as HTMLInputElement).valueAsNumber;
    calculateCameraProjection();
    draw();
  });
}

main();