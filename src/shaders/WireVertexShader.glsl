attribute vec4 a_position;

uniform mat4 u_matrix;
uniform mat4 u_proj_matrix;

varying vec4 v_color;

void main() {
  gl_Position = u_proj_matrix * u_matrix * a_position;

}