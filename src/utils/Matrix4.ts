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
 * @param angleX X rotation amount in radians.
 * @param angleY Y rotation amount in radians.
 * @param angleZ Z rotation amount in radians.
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
