export const normalizeVector = (v: number[]) => {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return length !== 0
    ? [v[0] / length, v[1] / length, v[2] / length]
    : [0, 0, 0];
};

export const subtractVector = (v1: number[], v2: number[]) => {
  return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

export const crossVector = (v1: number[], v2: number[]) => {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
};
