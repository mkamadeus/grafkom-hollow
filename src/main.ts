import "./styles/style.css";
import {
  cubeColors,
  cubeIndices,
  cubePositions,
  cubeMaterial,
} from "./models/cube";
import {
  tetrahedronColors,
  tetrahedronIndices,
  tetrahedronPositions,
  tetrahedronMaterial,
} from "./models/tetrahedron";
import {
  triangleColors,
  triangleIndices,
  trianglePositions,
  triangleMaterial,
} from "./models/triangle";
import {
  multiplyMatrix,
  getScaleMatrix,
  getTranslationMatrix,
  getRotationMatrix,
  getPerspectiveMatrix,
  getOrthographicMatrix,
  getInverse,
  getTranspose,
  getIdentityMatrix,
  getLookAt,
  getObliqueMatrix,
} from "./utils/Matrix4";

import BodyVertexShader from "./shaders/BodyVertexShader.glsl";
import BodyFragmentShader from "./shaders/BodyFragmentShader.glsl";
import WireVertexShader from "./shaders/WireVertexShader.glsl";
import WireFragmentShader from "./shaders/WireFragmentShader.glsl";
import { subtractVector, addVector, transformVector } from "./utils/Vector3";

let models = {
  1: {
    positions: trianglePositions,
    indices: triangleIndices,
    colors: triangleColors,
    material: triangleMaterial,
  },
  2: {
    positions: cubePositions,
    indices: cubeIndices,
    colors: cubeColors,
    material: cubeMaterial,
  },
  3: {
    positions: tetrahedronPositions,
    indices: tetrahedronIndices,
    colors: tetrahedronColors,
    material: tetrahedronMaterial,
  },
};

let gl: WebGLRenderingContext | null = null;
let programObject: WebGLProgram | null = null;
let wireProgramObject: WebGLProgram | null = null;

let vbo: WebGLBuffer | null = null;
let wireVbo: WebGLBuffer | null = null;
let elementVbo: WebGLBuffer | null = null;

let normalOffset: number = 0;
let colorOffset: number = 0;
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
let shadingModeLocation: WebGLUniformLocation | null = null;

let wireIndices = null;
let matrix = Array(16).fill(0);
let type: 1 | 2 | 3 = 1;
let shadingMode = 1;
let projMode = 1;
let near = 1;
let far = 50;

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
  calculateCameraProjection(near, far);

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
    models[type].positions.byteLength +
      cubeNormal.byteLength +
      models[type].colors.byteLength,
    gl.STATIC_DRAW
  );
  normalOffset = models[type].positions.byteLength;
  colorOffset = normalOffset + cubeNormal.byteLength;
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, models[type].positions);
  gl.bufferSubData(gl.ARRAY_BUFFER, normalOffset, cubeNormal);
  gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset, models[type].colors);

  // Store element triangle definition
  elementVbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementVbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, models[type].indices, gl.STATIC_DRAW);
  numElements = models[type].indices.length;

  // Store wire definition
  wireIndices = createWireIndices(models[type].indices);
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
  gl.bindAttribLocation(programObject, 2, "a_color");

  gl.linkProgram(programObject);
  matrixLocation = gl.getUniformLocation(programObject, "u_matrix");
  projectionMatrixLocation = gl.getUniformLocation(
    programObject,
    "u_proj_matrix"
  );
  mode = gl.getUniformLocation(programObject, "mode");
  shadingModeLocation = gl.getUniformLocation(programObject, "shading");
  ka = gl.getUniformLocation(programObject, "Ka");
  kd = gl.getUniformLocation(programObject, "Kd");
  ks = gl.getUniformLocation(programObject, "Ks");
  shineVal = gl.getUniformLocation(programObject, "shininessVal");
  ac = gl.getUniformLocation(programObject, "ambientColor");
  dc = gl.getUniformLocation(programObject, "diffuseColor");
  sc = gl.getUniformLocation(programObject, "specularColor");
  lightPos = gl.getUniformLocation(programObject, "lightPos");
  normalMatrixLocation = gl.getUniformLocation(programObject, "normalMat");
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
 * Function to calculate the projection matrix. Arcball camera pointed at (0,0,0).
 */
function calculateCameraProjection(near: number, far: number) {
  gl = gl as WebGLRenderingContext;
  let cameraPosition = [0, 0, cameraDistance];
  const targetPosition = [0, 0, 0];
  const up = [0, 1, 0];

  const xRotationMatrix = getRotationMatrix(xRotationCamera, 0, 0);
  let forwardVector = [...subtractVector(cameraPosition, targetPosition), 1];
  cameraPosition = addVector(
    transformVector(xRotationMatrix, forwardVector),
    targetPosition
  );

  const yRotationMatrix = getRotationMatrix(0, yRotationCamera, 0);
  forwardVector = [...subtractVector(cameraPosition, targetPosition), 1];
  cameraPosition = addVector(
    transformVector(yRotationMatrix, forwardVector),
    targetPosition
  );

  cameraMatrix = getLookAt(cameraPosition, targetPosition, up);
  if (projMode == 1) {
    // TODO : Change projection
    projectionMatrix = multiplyMatrix(
      getInverse(cameraMatrix),
      getPerspectiveMatrix(60, 1, near, far)
    );
  } else if (projMode == 2) {
    projectionMatrix = multiplyMatrix(
      getInverse(cameraMatrix),
      getOrthographicMatrix(-2.0, 2.0, -2.0, 2.0, 0.1, 100)
    );
  } else if (projMode == 3) {
    var tempOrthoMatrix = multiplyMatrix(
      getInverse(cameraMatrix),
      getOrthographicMatrix(-2.0, 2.0, -2.0, 2.0, 0.1, 100)
    );
    projectionMatrix = multiplyMatrix(
      getObliqueMatrix(45, 45),
      tempOrthoMatrix
    );
  }
}

/**
 * Function to calculate normals.
 */
function calculateNormal() {
  var vertNormal = Array(models[type].positions.length).fill(0);
  for (var i = 0; i < models[type].indices.length / 3; i = i + 3) {
    var p1 = [];
    var p2 = [];
    var p3 = [];
    for (var j = 0; j < 3; j++) {
      p1.push(models[type].positions[models[type].indices[i] * 3 + j]);
      p2.push(models[type].positions[models[type].indices[i + 1] * 3 + j]);
      p3.push(models[type].positions[models[type].indices[i + 2] * 3 + j]);
    }
    var u = [];
    var v = [];
    for (var j = 0; j < 3; j++) {
      u.push(p2[j] - p1[j]);
      v.push(p3[j] - p1[j]);
    }
    var nx = u[1] * v[2] - u[2] * v[1];
    var ny = u[2] * v[0] - u[0] * v[2];
    var nz = u[0] * v[1] - u[1] * v[0];

    var normal = [nx, ny, nz];

    for (var j = 0; j < 3; j++) {
      vertNormal[models[type].indices[i] * 3 + j] += normal[j];
      vertNormal[models[type].indices[i + 1] * 3 + j] += normal[j];
      vertNormal[models[type].indices[i + 2] * 3 + j] += normal[j];
    }
  }
  cubeNormal = new Float32Array(vertNormal);
}

/**
 * Draw objects
 */
function draw() {
  calculateNormal();

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
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, colorOffset);
  gl.enableVertexAttribArray(2);

  // Initiate transformation matrix
  gl.uniformMatrix4fv(matrixLocation, false, matrix);
  gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
  gl.uniformMatrix4fv(
    normalMatrixLocation,
    false,
    new Float32Array(getTranspose(getInverse(matrix)))
  );

  // Phong shader uniform
  gl.uniform1i(mode, 1);
  gl.uniform1i(shadingModeLocation, shadingMode);
  gl.uniform1f(ka, 1);
  gl.uniform1f(kd, 1);
  gl.uniform1f(ks, 1);

  gl.uniform1f(shineVal, models[type].material.shininess);
  gl.uniform3fv(ac, new Float32Array(models[type].material.ambient));
  gl.uniform3fv(dc, new Float32Array(models[type].material.diffuse));
  gl.uniform3fv(sc, new Float32Array(models[type].material.specular));
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
  near = (document.getElementById("near") as HTMLInputElement).valueAsNumber;
  far = (document.getElementById("far") as HTMLInputElement).valueAsNumber;

  (document.getElementById("reset") as HTMLInputElement).addEventListener(
    "click",
    (ev) => {
      xRotation = 0;
      (document.getElementById(
        "x-rotation"
      ) as HTMLInputElement).valueAsNumber = 0;
      yRotation = 0;
      (document.getElementById(
        "y-rotation"
      ) as HTMLInputElement).valueAsNumber = 0;
      zRotation = 0;
      (document.getElementById(
        "z-rotation"
      ) as HTMLInputElement).valueAsNumber = 0;
      xScale = 1;
      (document.getElementById(
        "x-scale"
      ) as HTMLInputElement).valueAsNumber = 1;
      yScale = 1;
      (document.getElementById(
        "y-scale"
      ) as HTMLInputElement).valueAsNumber = 1;
      zScale = 1;
      (document.getElementById(
        "z-scale"
      ) as HTMLInputElement).valueAsNumber = 1;
      xTranslation = 0;
      (document.getElementById(
        "x-translation"
      ) as HTMLInputElement).valueAsNumber = 0;
      yTranslation = 0;
      (document.getElementById(
        "y-translation"
      ) as HTMLInputElement).valueAsNumber = 0;
      zTranslation = 0;
      (document.getElementById(
        "z-translation"
      ) as HTMLInputElement).valueAsNumber = 0;
      xRotationCamera = 0;
      (document.getElementById(
        "x-camera-rotation"
      ) as HTMLInputElement).valueAsNumber = 0;
      yRotationCamera = 0;
      (document.getElementById(
        "y-camera-rotation"
      ) as HTMLInputElement).valueAsNumber = 0;
      cameraDistance = 2;
      (document.getElementById(
        "camera-distance"
      ) as HTMLInputElement).valueAsNumber = 2;
      near = 1;
      (document.getElementById("near") as HTMLInputElement).valueAsNumber = 1;
      far = 50;
      (document.getElementById("far") as HTMLInputElement).valueAsNumber = 50;
      calculateMatrix();
      calculateCameraProjection(near, far);
      draw();
    }
  );
  (document.getElementById(
    "toggle-shading"
  ) as HTMLInputElement).addEventListener("click", (ev) => {
    shadingMode = shadingMode == 0 ? 1 : 0;
    draw();
  });
  (document.getElementById("model1") as HTMLInputElement).addEventListener(
    "click",
    (ev) => {
      type = 1;
      initModel();
      draw();
    }
  );
  (document.getElementById("model2") as HTMLInputElement).addEventListener(
    "click",
    (ev) => {
      type = 2;
      initModel();
      draw();
    }
  );
  (document.getElementById("model3") as HTMLInputElement).addEventListener(
    "click",
    (ev) => {
      type = 3;
      initModel();
      draw();
    }
  );
  (document.getElementById("perspective") as HTMLInputElement).addEventListener(
    "click",
    (ev) => {
      projMode = 1;
      calculateCameraProjection(near, far);
      draw();
    }
  );
  (document.getElementById(
    "orthographic"
  ) as HTMLInputElement).addEventListener("click", (ev) => {
    projMode = 2;
    calculateCameraProjection(near, far);
    draw();
  });
  (document.getElementById("oblique") as HTMLInputElement).addEventListener(
    "click",
    (ev) => {
      projMode = 3;
      calculateCameraProjection(near, far);
      draw();
    }
  );
  (document.getElementById("near") as HTMLInputElement).addEventListener(
    "input",
    (ev) => {
      near = (document.getElementById("near") as HTMLInputElement)
        .valueAsNumber;
      calculateCameraProjection(near, far);
      draw();
    }
  );
  (document.getElementById("far") as HTMLInputElement).addEventListener(
    "input",
    (ev) => {
      far = (document.getElementById("far") as HTMLInputElement).valueAsNumber;
      calculateCameraProjection(near, far);
      draw();
    }
  );
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
    calculateCameraProjection(near, far, projMode);
    draw();
  });
  (document.getElementById(
    "y-camera-rotation"
  ) as HTMLInputElement).addEventListener("input", (ev) => {
    yRotationCamera = (document.getElementById(
      "y-camera-rotation"
    ) as HTMLInputElement).valueAsNumber;
    calculateCameraProjection(near, far, projMode);
    draw();
  });
  (document.getElementById(
    "camera-distance"
  ) as HTMLInputElement).addEventListener("input", (ev) => {
    cameraDistance = (document.getElementById(
      "camera-distance"
    ) as HTMLInputElement).valueAsNumber;
    calculateCameraProjection(near, far, projMode);
    draw();
  });
}

main();
