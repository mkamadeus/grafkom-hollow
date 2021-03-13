var gl = null;
var programObject = null;
var wireProgramObject = null;
var vbo = null;
var elementVbo = null;
var colorOffset = 0;
var numElements = 0;
var wireNumElements = 0;
var matrixLocation = null;
var wireMatrixLocation = null;
var matrix = Array(16);

var modelPositions = new Float32Array([
                                      -0.5, -0.5, -0.5,
                                      -0.4, -0.5, -0.5,
                                      -0.4, -0.4, -0.5,
                                      -0.5, -0.4, -0.5,

                                      -0.4, 0.4, -0.5,
                                      -0.5, 0.4, -0.5,
                                      -0.4, 0.5, -0.5,
                                      -0.5, 0.5, -0.5,

                                      0.4, -0.5, -0.5,
                                      0.4, -0.4, -0.5,
                                      0.5, -0.5, -0.5,
                                      0.5, -0.4, -0.5,

                                      0.5, 0.4, -0.5,
                                      0.4, 0.4, -0.5,
                                      0.5, 0.5, -0.5,
                                      0.4, 0.5, -0.5,

                                      -0.5, -0.5, -0.4,
                                      -0.4, -0.5, -0.4,
                                      -0.4, -0.4, -0.4,
                                      -0.5, -0.4, -0.4,

                                      -0.4, 0.4, -0.4,
                                      -0.5, 0.4, -0.4,
                                      -0.4, 0.5, -0.4,
                                      -0.5, 0.5, -0.4,

                                      0.4, -0.5, -0.4,
                                      0.4, -0.4, -0.4,
                                      0.5, -0.5, -0.4,
                                      0.5, -0.4, -0.4,

                                      0.5, 0.4, -0.4,
                                      0.4, 0.4, -0.4,
                                      0.5, 0.5, -0.4,
                                      0.4, 0.5, -0.4,

                                      -0.5, -0.5, 0.4,
                                      -0.4, -0.5, 0.4,
                                      -0.4, -0.4, 0.4,
                                      -0.5, -0.4, 0.4,

                                      -0.4, 0.4, 0.4,
                                      -0.5, 0.4, 0.4,
                                      -0.4, 0.5, 0.4,
                                      -0.5, 0.5, 0.4,

                                      0.4, -0.5, 0.4,
                                      0.4, -0.4, 0.4,
                                      0.5, -0.5, 0.4,
                                      0.5, -0.4, 0.4,

                                      0.5, 0.4, 0.4,
                                      0.4, 0.4, 0.4,
                                      0.5, 0.5, 0.4,
                                      0.4, 0.5, 0.4,

                                      -0.5, -0.5, 0.5,
                                      -0.4, -0.5, 0.5,
                                      -0.4, -0.4, 0.5,
                                      -0.5, -0.4, 0.5,

                                      -0.4, 0.4, 0.5,
                                      -0.5, 0.4, 0.5,
                                      -0.4, 0.5, 0.5,
                                      -0.5, 0.5, 0.5,

                                      0.4, -0.5, 0.5,
                                      0.4, -0.4, 0.5,
                                      0.5, -0.5, 0.5,
                                      0.5, -0.4, 0.5,

                                      0.5, 0.4, 0.5,
                                      0.4, 0.4, 0.5,
                                      0.5, 0.5, 0.5,
                                      0.4, 0.5, 0.5,

                                      ]);

var modelColors = new Float32Array([1.0,0.0,0.0,1.0,
                                    1.0,0.0,1.0,1.0,
                                    0.0,0.0,1.0,1.0,
                                    1.0,0.0,1.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0,
                                    0.0,1.0,0.0,1.0]);
                                    
var modelIndices = new Uint16Array([
                                    0,1,2,2,3,0,
                                    3,2,4,4,5,3,
                                    5,4,6,6,7,5,

                                    1,8,9,9,2,1,
                                    8,10,11,11,9,8,

                                    9,11,12,12,13,9,
                                    13,12,14,14,15,13,
                                    4,13,15,15,6,4,

                                    16,0,3,3,19,16,
                                    19,3,5,5,21,19,
                                    21,5,7,7,23,21,

                                    16,17,1,1,0,16,
                                    17,24,8,8,1,17,
                                    24,26,10,10,8,24,
                                    10,26,27,27,11,10,
                                    11,27,28,28,12,11,
                                    12,28,30,30,14,12,
                                    15,14,30,30,31,15,
                                    6,15,31,31,22,6,
                                    7,6,22,22,23,7,
                                    
                                    2,18,20,20,4,2,
                                    2,9,25,25,18,2,
                                    25,9,13,13,29,25,
                                    20,29,13,13,4,20,

                                    24,17,18,18,25,24,
                                    27,25,29,29,28,27,
                                    31,29,20,20,23,31,
                                    21,20,18,18,19,21,

                                    16,19,35,35,32,16,
                                    17,16,32,32,33,17,
                                    19,18,34,34,35,19,
                                    18,17,33,33,34,18,

                                    21,23,39,39,37,21,
                                    20,21,37,37,36,20,
                                    23,22,38,38,39,23,
                                    22,20,36,36,38,22,

                                    29,31,47,47,45,29,
                                    28,29,45,45,44,28,
                                    31,30,46,46,47,31,
                                    30,28,44,44,46,30,

                                    24,25,41,41,40,24,
                                    26,24,40,40,42,26,
                                    25,27,43,43,41,25,
                                    27,26,42,42,43,27,

                                    32,35,51,51,48,32,
                                    33,32,48,48,49,33,
                                    49,48,51,51,50,49,

                                    51,35,37,37,53,51,
                                    50,51,53,53,52,50,
                                    35,34,36,36,37,35,
                                    34,50,52,52,36,34,

                                    37,39,55,55,53,37,
                                    52,53,55,55,54,52,
                                    39,38,54,54,55,39,

                                    40,33,49,49,56,40,
                                    50,57,56,56,49,50,
                                    33,40,41,41,34,33,
                                    34,41,57,57,50,34,

                                    42,40,56,56,58,42,
                                    58,56,57,57,59,58,
                                    42,58,59,59,43,42,

                                    52,55,63,63,61,52,
                                    36,52,61,61,45,36,
                                    36,45,47,47,38,36,
                                    38,47,63,63,55,38,

                                    63,62,60,60,61,63,
                                    47,46,62,62,63,47,
                                    46,44,60,60,62,46,

                                    57,41,45,45,61,57,
                                    59,57,61,61,60,59,
                                    41,43,44,44,45,41,
                                    43,59,60,60,44,43,
                                    ]);

var wireIndices = null;

var xRotation = 0;
var yRotation = 0;
var zRotation = 0;
var xScale = 1;
var yScale = 1;
var zScale = 1;
var xTranslation = 0;
var yTranslation = 0;
var zTranslation = 0;

function main(){
  var canvas = document.getElementById("c");

  var ratio = window.devicePixelRatio ? window.devicePixelRatio : 1;
  canvas.width = 1200 * ratio;
  canvas.height = 1200 * ratio;

  gl = canvas.getContext("webgl");
  if (!gl) return;

  init();
}

function init() {
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
  gl.bufferData(gl.ARRAY_BUFFER, 
                modelPositions.byteLength +
                modelColors.byteLength,
                gl.STATIC_DRAW);
  colorsOffset = modelPositions.byteLength;
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, modelPositions);
  gl.bufferSubData(gl.ARRAY_BUFFER, colorsOffset, modelColors);

  elementVbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementVbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelIndices, gl.STATIC_DRAW);
  numElements = modelIndices.length;

  wireIndices = createWireIndices(modelIndices);
  wireVbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireVbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wireIndices, gl.STATIC_DRAW);
  wireNumElements = wireIndices.length;
}

function initShaders() {
  var vertexShaderSource = document.getElementById("vertex-shader").textContent;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.compileShader(vertexShader);

  var fragmentShaderSource = document.getElementById("fragment-shader").textContent;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  
  programObject = gl.createProgram();
  gl.attachShader(programObject, vertexShader);
  gl.attachShader(programObject, fragmentShader);

  gl.bindAttribLocation(programObject, 0, "a_position");
  gl.bindAttribLocation(programObject, 1,"a_color");
  gl.linkProgram(programObject);

  matrixLocation = gl.getUniformLocation(programObject, "u_matrix");
}

function initWireShaders() {
  var wireVertexShaderSource = document.getElementById("wire-vertex-shader").textContent;
  var wireVertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(wireVertexShader, wireVertexShaderSource);
  gl.compileShader(wireVertexShader);

  var wireFragmentSource = document.getElementById("wire-fragment-shader").textContent;
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

function calculateMatrix(){
  matrix = matrix4.scale(xScale, yScale, zScale);
  matrix = matrix4.multiply(matrix4.zRotation(zRotation), matrix4.multiply(matrix4.yRotation(yRotation), matrix4.multiply(matrix4.xRotation(xRotation), matrix)));
  matrix = matrix4.multiply(matrix4.translation(xTranslation,yTranslation,zTranslation), matrix);
}

function draw(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(programObject);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, colorsOffset);
  gl.enableVertexAttribArray(1);

  gl.uniformMatrix4fv(matrixLocation, false, matrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementVbo);
  gl.drawElements(gl.TRIANGLES, numElements, gl.UNSIGNED_SHORT, 0);

  drawWire();
}

function drawWire(){
  gl.useProgram(wireProgramObject);

  gl.uniformMatrix4fv(wireMatrixLocation, false, matrix);

  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireVbo);
  gl.drawElements(gl.LINES, this.wireNumElements, gl.UNSIGNED_SHORT, 0);
}

function createWireIndices(triangleIndices){
  var wireIndices = new Uint16Array(triangleIndices.length * 2);
  var i, j;
  j = 0;
  for(i = 0; i < triangleIndices.length; i += 3) {
    wireIndices[j++] = triangleIndices[i];
    wireIndices[j++] = triangleIndices[i+1];

    wireIndices[j++] = triangleIndices[i+1];
    wireIndices[j++] = triangleIndices[i+2];

    wireIndices[j++] = triangleIndices[i+2];
    wireIndices[j++] = triangleIndices[i];
  }
  return wireIndices;
}

function initEvents(){
  xRotation = document.getElementById("x-rotation").value;
  yRotation = document.getElementById("y-rotation").value;
  zRotation = document.getElementById("z-rotation").value;
  xScale = document.getElementById("x-scale").value;
  yScale = document.getElementById("y-scale").value;
  zScale = document.getElementById("z-scale").value;
  xTranslation = document.getElementById("x-translation").value;
  yTranslation = document.getElementById("y-translation").value;
  zTranslation = document.getElementById("z-translation").value;


  document.getElementById("x-rotation").addEventListener("input", (ev) => {
    xRotation = document.getElementById("x-rotation").value;
    calculateMatrix();
    draw();
  });
  document.getElementById("y-rotation").addEventListener("input", (ev) => {
    yRotation = document.getElementById("y-rotation").value;
    calculateMatrix();
    draw();
  });
  document.getElementById("z-rotation").addEventListener("input", (ev) => {
    zRotation = document.getElementById("z-rotation").value;
    calculateMatrix();
    draw();
  });
  document.getElementById("x-scale").addEventListener("input", (ev) => {
    xScale = document.getElementById("x-scale").value;
    calculateMatrix();
    draw();
  });
  document.getElementById("y-scale").addEventListener("input", (ev) => {
    yScale = document.getElementById("y-scale").value;
    calculateMatrix();
    draw();
  });
  document.getElementById("z-scale").addEventListener("input", (ev) => {
    zScale = document.getElementById("z-scale").value;
    calculateMatrix();
    draw();
  });
  document.getElementById("x-translation").addEventListener("input", (ev) => {
    xTranslation = document.getElementById("x-translation").value;
    calculateMatrix();
    draw();
  });
  document.getElementById("y-translation").addEventListener("input", (ev) => {
    yTranslation = document.getElementById("y-translation").value;
    calculateMatrix();
    draw();
  });
  document.getElementById("z-translation").addEventListener("input", (ev) => {
    zTranslation = document.getElementById("z-translation").value;
    calculateMatrix();
    draw();
  });
}