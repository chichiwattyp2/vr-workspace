AFRAME.registerComponent("css-borderline", {
  schema: {
    height: { default: 1, min: 0 },
    width: { default: 1, min: 0 },
    color: { default: "#ffffff" },
    style: { default: "solid" }, // solid | dashed | dotted
    linewidth: { default: 1, min: 0 },
    radiusBL: { default: 0, min: 0 },
    radiusBR: { default: 0, min: 0 },
    radiusTL: { default: 0, min: 0 },
    radiusTR: { default: 0, min: 0 }
  },

  update() {
    const data = this.data;
    const w = data.width / 2 || 0.005;
    const h = data.height / 2 || 0.005;
    const path = new THREE.Path();
    const rTL = data.radiusTL, rTR = data.radiusTR, rBL = data.radiusBL, rBR = data.radiusBR;
    const r = Math.PI / 2;

    path.moveTo(-w, -h + rBL);
    path.lineTo(-w, h - rTL);
    if (rTL) path.absarc(-w + rTL, h - rTL, rTL, Math.PI, Math.PI / 2, true);
    path.lineTo(w - rTR, h);
    if (rTR) path.absarc(w - rTR, h - rTR, rTR, Math.PI / 2, 0, true);
    path.lineTo(w, -h + rBR);
    if (rBR) path.absarc(w - rBR, -h + rBR, rBR, 0, -Math.PI / 2, true);
    path.lineTo(-w + rBL, -h);
    if (rBL) path.absarc(-w + rBL, -h + rBL, rBL, -Math.PI / 2, -Math.PI, true);

    const points = path.getPoints(64);
    let geometry, line;

    // Use modern line system for Three r173+
    if (THREE.LineGeometry && THREE.LineMaterial) {
      geometry = new THREE.LineGeometry();
      geometry.setPositions(points.flatMap(p => [p.x, p.y, 0]));
      const mat = new THREE.LineMaterial({
        color: new THREE.Color(data.color),
        linewidth: data.linewidth / 100, // scaled down for LineMaterial
      });
      mat.resolution.set(window.innerWidth, window.innerHeight);
      line = new THREE.Line2(geometry, mat);
    } else {
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      const matOpts = { color: new THREE.Color(data.color) };
      const mat = (data.style === "solid")
        ? new THREE.LineBasicMaterial(matOpts)
        : new THREE.LineDashedMaterial({
            ...matOpts,
            dashSize: 0.05,
            gapSize: 0.05,
          });
      line = new THREE.Line(geometry, mat);
      if (data.style !== "solid" && line.computeLineDistances)
        line.computeLineDistances();
    }

    line.position.set(0, 0, 0.001);
    line.frustumCulled = false;
    line.raycast = () => {}; // disable
    this.remove();
    this.el.setObject3D("css-borderline", line);
    this._line = line;
  },

  remove() {
    if (this._line) {
      this._line.geometry.dispose?.();
      this._line.material.dispose?.();
      this.el.removeObject3D("css-borderline");
      this._line = null;
    }
  }
});
