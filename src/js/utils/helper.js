
export default class Helper {
  static clamp (a, min, max) {
    return  Math.max(min, Math.min(a, max));
  }

  static interpolate01(a, min, max) {
    const n = this.clamp(a, min, max);
    return (n - min) / (max - min);
  }

  static interpolateArray(a, min, max, arr) {
    const i = this.interpolate01(a, min, max);
    const l = arr.length - 1;
    const fi = Math.floor(i * l);
    const ti = Math.ceil(i * l);
    if (fi === ti) return arr[fi];
    const bi = this.interpolate01(i * l, fi, ti);
    return arr[ti] * bi + arr[fi] * (1 - bi);
  }

  static deepAssign(target, ...sources) {
    for (let source of sources) {
      for (let k in source) {
        let vs = source[k], vt = target[k]
        if (Object(vs) === vs && Object(vt) === vt) {
          target[k] = this.deepAssign(vt, vs)
          continue
        }
        target[k] = source[k]
      }
    }
    return target
  }
}
