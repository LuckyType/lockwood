// Minimal 3D math (a subset of three.js's Vector3 / Quaternion / Euler API) so the layout runs without three.js.
export class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  cross(v) { const x = this.y * v.z - this.z * v.y, y = this.z * v.x - this.x * v.z, z = this.x * v.y - this.y * v.x; return this.set(x, y, z); }
  length() { return Math.hypot(this.x, this.y, this.z); }
  normalize() { const l = this.length() || 1; return this.multiplyScalar(1 / l); }
  applyQuaternion(q) {
    const { x, y, z } = this, qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    const ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy; this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz; this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx; return this;
  }
}
export class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) { this.x = x; this.y = y; this.z = z; this.w = w; }
  set(x, y, z, w) { this.x = x; this.y = y; this.z = z; this.w = w; return this; }
  clone() { return new Quaternion(this.x, this.y, this.z, this.w); }
  copy(q) { return this.set(q.x, q.y, q.z, q.w); }
  invert() { this.x = -this.x; this.y = -this.y; this.z = -this.z; return this; } // unit quaternions only
  multiply(q) { // this = this * q
    const ax = this.x, ay = this.y, az = this.z, aw = this.w, bx = q.x, by = q.y, bz = q.z, bw = q.w;
    this.x = ax * bw + aw * bx + ay * bz - az * by; this.y = ay * bw + aw * by + az * bx - ax * bz; this.z = az * bw + aw * bz + ax * by - ay * bx; this.w = aw * bw - ax * bx - ay * by - az * bz; return this;
  }
  setFromEulerXYZ(x, y, z) { // intrinsic XYZ, matching THREE.Euler order 'XYZ'
    const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2), s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
    this.x = s1 * c2 * c3 + c1 * s2 * s3; this.y = c1 * s2 * c3 - s1 * c2 * s3; this.z = c1 * c2 * s3 + s1 * s2 * c3; this.w = c1 * c2 * c3 - s1 * s2 * s3; return this;
  }
  setFromUnitVectors(from, to) {
    let r = from.dot(to) + 1;
    if (r < 1e-8) { r = 0; if (Math.abs(from.x) > Math.abs(from.z)) this.set(-from.y, from.x, 0, r); else this.set(0, -from.z, from.y, r); }
    else this.set(from.y * to.z - from.z * to.y, from.z * to.x - from.x * to.z, from.x * to.y - from.y * to.x, r);
    const l = Math.hypot(this.x, this.y, this.z, this.w) || 1; this.x /= l; this.y /= l; this.z /= l; this.w /= l; return this;
  }
}
