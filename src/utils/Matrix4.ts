import { crossVector, normalizeVector, subtractVector } from "./Vector3";

export const getIdentityMatrix = () => {
  const arr = Array(16).fill(0);
  for (let i = 0; i < 4; i++) arr[4 * i + i] = 1;
  return arr;
};

/**
 * Multiplies two matrices.
 * @param m1 The first matrix in flattened form
 * @param m2 The second matrix in flattened form
 * @returns The multiplication result in flattened form
 */
export const multiplyMatrix = (m1: number[], m2: number[]): number[] => {
  if (m1.length !== 16 || m2.length !== 16)
    throw new Error("💀 Length not equal to 16!");

  const tmp = Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let res = 0;
      for (let k = 0; k < 4; k++) {
        res += m1[4 * i + k] * m2[4 * k + j];
      }
      tmp[4 * i + j] = res;
    }
  }
  return tmp;
};

// export const getInverse = (m: number[]) => {
//   const det = getDeterminant(m);
//   return getAdjugate(m).map((val) => val / det);
// };

// export const getAdjugate = (m: number[]) => {
//   if (m.length !== 16) throw new Error("💀 Length not equal to 16!");

//   const result = Array(16).fill(0);
//   for (let i = 0; i < 16; i++) {
//     const row = Math.floor(i / 4);
//     const col = i % 4;
//     const cofactor = m.filter(
//       (_val, index) => !(row == Math.floor(index / 4) || col == index % 4)
//     );
//     // console.log(cofactor);
//     result[i] = ((row + col) % 2 == 0 ? 1 : -1) * determinant3(cofactor);
//   }

//   // console.log("Adjugate: ", result);

//   return result;
// };

// export const getDeterminant = (m: number[]) => {
//   if (m.length !== 16) throw new Error("💀 Length not equal to 16!");

//   let result = 0;
//   for (let i = 0; i < 16; i++) {
//     const row = Math.floor(i / 4);
//     const col = i % 4;
//     const cofactor = m.filter(
//       (_val, index) => !(row == Math.floor(index / 4) || col == index % 4)
//     );
//     result += ((row + col) % 2 == 0 ? 1 : -1) * m[i] * determinant3(cofactor);
//   }
//   // console.log("Det: ", result);
//   return result;
// };
export const getInverse = (m: number[]) => {
  var m00 = m[0 * 4 + 0];
  var m01 = m[0 * 4 + 1];
  var m02 = m[0 * 4 + 2];
  var m03 = m[0 * 4 + 3];
  var m10 = m[1 * 4 + 0];
  var m11 = m[1 * 4 + 1];
  var m12 = m[1 * 4 + 2];
  var m13 = m[1 * 4 + 3];
  var m20 = m[2 * 4 + 0];
  var m21 = m[2 * 4 + 1];
  var m22 = m[2 * 4 + 2];
  var m23 = m[2 * 4 + 3];
  var m30 = m[3 * 4 + 0];
  var m31 = m[3 * 4 + 1];
  var m32 = m[3 * 4 + 2];
  var m33 = m[3 * 4 + 3];
  var tmp_0 = m22 * m33;
  var tmp_1 = m32 * m23;
  var tmp_2 = m12 * m33;
  var tmp_3 = m32 * m13;
  var tmp_4 = m12 * m23;
  var tmp_5 = m22 * m13;
  var tmp_6 = m02 * m33;
  var tmp_7 = m32 * m03;
  var tmp_8 = m02 * m23;
  var tmp_9 = m22 * m03;
  var tmp_10 = m02 * m13;
  var tmp_11 = m12 * m03;
  var tmp_12 = m20 * m31;
  var tmp_13 = m30 * m21;
  var tmp_14 = m10 * m31;
  var tmp_15 = m30 * m11;
  var tmp_16 = m10 * m21;
  var tmp_17 = m20 * m11;
  var tmp_18 = m00 * m31;
  var tmp_19 = m30 * m01;
  var tmp_20 = m00 * m21;
  var tmp_21 = m20 * m01;
  var tmp_22 = m00 * m11;
  var tmp_23 = m10 * m01;

  var t0 =
    tmp_0 * m11 +
    tmp_3 * m21 +
    tmp_4 * m31 -
    (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
  var t1 =
    tmp_1 * m01 +
    tmp_6 * m21 +
    tmp_9 * m31 -
    (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
  var t2 =
    tmp_2 * m01 +
    tmp_7 * m11 +
    tmp_10 * m31 -
    (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
  var t3 =
    tmp_5 * m01 +
    tmp_8 * m11 +
    tmp_11 * m21 -
    (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

  var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

  return [
    d * t0,
    d * t1,
    d * t2,
    d * t3,
    d *
      (tmp_1 * m10 +
        tmp_2 * m20 +
        tmp_5 * m30 -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
    d *
      (tmp_0 * m00 +
        tmp_7 * m20 +
        tmp_8 * m30 -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
    d *
      (tmp_3 * m00 +
        tmp_6 * m10 +
        tmp_11 * m30 -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
    d *
      (tmp_4 * m00 +
        tmp_9 * m10 +
        tmp_10 * m20 -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
    d *
      (tmp_12 * m13 +
        tmp_15 * m23 +
        tmp_16 * m33 -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
    d *
      (tmp_13 * m03 +
        tmp_18 * m23 +
        tmp_21 * m33 -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
    d *
      (tmp_14 * m03 +
        tmp_19 * m13 +
        tmp_22 * m33 -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
    d *
      (tmp_17 * m03 +
        tmp_20 * m13 +
        tmp_23 * m23 -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
    d *
      (tmp_14 * m22 +
        tmp_17 * m32 +
        tmp_13 * m12 -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
    d *
      (tmp_20 * m32 +
        tmp_12 * m02 +
        tmp_19 * m22 -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
    d *
      (tmp_18 * m12 +
        tmp_23 * m32 +
        tmp_15 * m02 -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
    d *
      (tmp_22 * m22 +
        tmp_16 * m02 +
        tmp_21 * m12 -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
  ];
};

export const determinant3 = (m: number[]) => {
  if (m.length !== 9) throw new Error("💀 Length not equal to 9!");
  return (
    m[0] * m[4] * m[8] +
    m[1] * m[5] * m[6] +
    m[2] * m[3] * m[7] -
    (m[2] * m[4] * m[6] + m[0] * m[5] * m[7] + m[1] * m[3] * m[8])
  );
};

/**
 * Creates the translation matrix for translation in x, y, z axis.
 * @param x Translation in the x axis
 * @param y Translation in the y axis
 * @param z Translation in the z axis
 * @returns The translation matrix in flattened form
 */
export const getTranslationMatrix = (x: number, y: number, z: number) => {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
};

/**
 * Creates the rotation matrix for the x, y, z axis.
 * @param angleX X rotation amount in degrees.
 * @param angleY Y rotation amount in degrees.
 * @param angleZ Z rotation amount in degrees.
 * @returns The rotation matrix in flattened form
 */
export const getRotationMatrix = (
  angleX: number,
  angleY: number,
  angleZ: number
) => {
  const cz = Math.cos((angleZ * Math.PI) / 180.0);
  const sz = Math.sin((angleZ * Math.PI) / 180.0);
  const cy = Math.cos((angleY * Math.PI) / 180.0);
  const sy = Math.sin((angleY * Math.PI) / 180.0);
  const cx = Math.cos((angleX * Math.PI) / 180.0);
  const sx = Math.sin((angleX * Math.PI) / 180.0);

  return multiplyMatrix(
    [cz, sz, 0, 0, -sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    multiplyMatrix(
      [cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, cx, sx, 0, 0, -sx, cx, 0, 0, 0, 0, 1]
    )
  );
};

export const getLookAt = (
  current: number[],
  target: number[],
  up: number[]
) => {
  const z = normalizeVector(subtractVector(current, target));
  const x = normalizeVector(crossVector(up, z));
  const y = normalizeVector(crossVector(z, x));

  console.log(x, y, z);

  // prettier-ignore
  return [
    x[0], x[1], x[2], 0,
    y[0], y[1], y[2], 0,
    z[0], z[1], z[2], 0,
    current[0], current[1], current[2], 1,
  ]
};

/**
 * Creates the scale matrix for scaling in x, y, z axis.
 * @param x Scale factor in the x axis
 * @param y Scale factor in the y axis
 * @param z Scale factor in the z axis
 * @returns The scale matrix in flattened form
 */
export const getScaleMatrix = (x: number, y: number, z: number) => {
  return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
};

/**
 * Gets the perspective matrix with certain parameters.
 * @param fov The FOV
 * @param aspect Aspect ratio
 * @param near Near clipping plane
 * @param far Far clipping
 * @returns
 */
export const getPerspectiveMatrix = (
  fov: number,
  aspect: number,
  near: number,
  far: number
) => {
  const f = 1 / Math.tan((fov * Math.PI) / 180 / 2);
  const d = far - near;

  // prettier-ignore
  return [
    f/aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, -(near + far) / d, -2 * near * far / d,
    0, 0, -1, 0
  ]
};

export const getOrthographicMatrix = (
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number
) => {
  return [
    2/(right-left), 0, 0, 0,
    0, 2/(top-bottom), 0, 0,
    0, 0, 2/(near-far), 0,

    (left + right) / (left - right),
    (bottom + top) / (bottom - top),
    (near + far) / (near - far),
    1,
  ];
}