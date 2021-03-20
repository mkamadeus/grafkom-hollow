attribute vec3 a_position;
attribute vec3 normal;

uniform mat4 u_matrix;
uniform mat4 u_proj_matrix;
uniform mat4 normalMat;

varying vec3 normalInterp;
varying vec3 vertPos;

void main() {
  vec4 vertPos4 = u_matrix * vec4(a_position, 1.0);
  vertPos = vec3(vertPos4) / vertPos4.w;
  normalInterp = vec3(normalMat * vec4(normalize(normal), 0.0));
  gl_Position = u_proj_matrix * vertPos4;
}