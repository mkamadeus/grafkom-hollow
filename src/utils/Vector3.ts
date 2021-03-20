export const normalizeVector = (v: number[]) => {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return length !== 0
    ? [v[0] / length, v[1] / length, v[2] / length]
    : [0, 0, 0];
};

export const subtractVector = (v1: number[], v2: number[]) => {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

export const addVector = (v1: number[], v2: number[]) => {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
};

export const crossVector = (v1: number[], v2: number[]) => {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
};

export const transformVector = (trans: number[], v: number[]) => {
  return [
    trans[0] * v[0] + trans[1] * v[1] + trans[2] * v[2] + trans[3] * v[3],
    trans[4] * v[0] + trans[5] * v[1] + trans[6] * v[2] + trans[7] * v[3],
    trans[8] * v[0] + trans[9] * v[1] + trans[10] * v[2] + trans[11] * v[3],
    trans[12] * v[0] + trans[13] * v[1] + trans[14] * v[2] + trans[15] * v[3],
  ];
};
