var matrix4 = {

  multiply: function(m, o){
    tmp = Array(16);

    for (var i = 0; i < 4; i++){
      tmp[i*4+0] =  (m[i*4+0] * o[0*4+0]) +
                  (m[i*4+1] * o[1*4+0]) +
                  (m[i*4+2] * o[2*4+0]) +
                  (m[i*4+3] * o[3*4+0]);
      
      tmp[i*4+1] =  (m[i*4+0] * o[0*4+1]) +
                  (m[i*4+1] * o[1*4+1]) +
                  (m[i*4+2] * o[2*4+1]) +
                  (m[i*4+3] * o[3*4+1]);

      tmp[i*4+2] =  (m[i*4+0] * o[0*4+2]) +
                  (m[i*4+1] * o[1*4+2]) +
                  (m[i*4+2] * o[2*4+2]) +
                  (m[i*4+3] * o[3*4+2]);

      tmp[i*4+3] =  (m[i*4+0] * o[0*4+3]) +
                  (m[i*4+1] * o[1*4+3]) +
                  (m[i*4+2] * o[2*4+3]) +
                  (m[i*4+3] * o[3*4+3]);
    }
    return tmp;
  },



  translation: function(x, y, z) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1,
    ];
  },

  xRotation: function(angle) {
    var c = Math.cos(angle * Math.PI / 180.0);
    var s = Math.sin(angle * Math.PI / 180.0);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angle) {
    var c = Math.cos(angle * Math.PI / 180.0);
    var s = Math.sin(angle * Math.PI / 180.0);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function(angle) {
    var c = Math.cos(angle * Math.PI / 180.0);
    var s = Math.sin(angle * Math.PI / 180.0);

    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  scale: function(x, y ,z) {
    return [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1,
    ];
  },
};