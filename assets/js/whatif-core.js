/* What-if core: simulate smoothing of lines in chosen areas from face landmarks.
   Runs entirely in the browser; the photo never leaves the device. */
(function(){
  const SAMPLE = 'https://images.unsplash.com/photo-1790574318874-8837efcfc519?w=1080&q=82&fm=jpg&fit=max';
  const EYE_R = [33,7,163,144,145,153,154,155,133,173,157,158,159,160,161,246];
  const EYE_L = [263,249,390,373,374,380,381,382,362,398,384,385,386,387,388,466];
  const BROW_R = [70,63,105,66,107,55,65,52,53,46];
  const BROW_L = [300,293,334,296,336,285,295,282,283,276];
  const LIPS = [61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185];
  const AREAS = {
    forehead:   {x:'Forehead',             treat:'Botox'},
    glabella:   {x:'Between the eyebrows', treat:'Botox'},
    crowsfeet:  {x:'Crow’s feet',          treat:'Botox'},
    nasolabial: {x:'Nasolabial folds',     treat:'HArmonyCA'},
  };

  const P = (lm, i, W, H) => [lm[i].x * W, lm[i].y * H];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  function poly(ctx, pts){ ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }

  function areaShapes(lm, W, H){
    const p = i => P(lm, i, W, H);
    const faceW = dist(p(234), p(454));
    const up = [p(10)[0] - p(9)[0], p(10)[1] - p(9)[1]]; // forehead "up" vector
    const lift = (pt, k) => [pt[0] + up[0] * k, pt[1] + up[1] * k];
    const shapes = {};
    // forehead: hairline arc (lifted a little) down to the top of both brows
    const top = [54,103,67,109,10,338,297,332,284].map(i => lift(p(i), .12));
    shapes.forehead = [{poly: top.concat([300,293,334,296,336,9,107,66,105,63,70].map(p))}];
    shapes.glabella = [{poly: [107,9,336,285,417,168,193,55].map(p).map(q => lift(q, .05))}];
    // crow's feet: soft ellipses beyond the outer eye corners
    shapes.crowsfeet = [[33,133],[263,362]].map(([o, inn]) => {
      const a = p(o), b = p(inn), ew = dist(a, b);
      const d = [(a[0] - b[0]) / ew, (a[1] - b[1]) / ew];
      return {ell:[a[0] + d[0] * ew * .42, a[1] + d[1] * ew * .42 + ew * .05, ew * .5, ew * .72, Math.atan2(d[1], d[0])]};
    });
    // nasolabial: a capsule from the side of the nose to the corner of the mouth
    shapes.nasolabial = [[129,61,1],[358,291,-1]].map(([n, m, s]) => {
      const a = p(n), b = p(m);
      const off = faceW * .025 * (s * (p(4)[0] > a[0] ? 1 : -1));
      return {cap:[a[0] - off, a[1], b[0] - off * 1.4, b[1] + faceW * .01, faceW * .05]};
    });
    return {shapes, faceW, p};
  }

  function buildMask(lm, W, H, areas){
    const {shapes, faceW, p} = areaShapes(lm, W, H);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.filter = `blur(${Math.max(2, faceW * .028)}px)`;
    x.fillStyle = '#fff';
    areas.forEach(k => (shapes[k] || []).forEach(s => {
      if (s.poly) { poly(x, s.poly); x.fill(); }
      if (s.ell) { const [cx, cy, rx, ry, a] = s.ell; x.beginPath(); x.ellipse(cx, cy, rx, ry, a, 0, Math.PI * 2); x.fill(); }
      if (s.cap) { const [ax, ay, bx, by, r] = s.cap; x.lineCap = 'round'; x.lineWidth = r * 2; x.strokeStyle = '#fff'; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); }
    }));
    // protect eyes, brows and lips
    x.globalCompositeOperation = 'destination-out';
    x.filter = `blur(${Math.max(1, faceW * .012)}px)`;
    x.lineJoin = 'round';
    [EYE_R, EYE_L, LIPS].forEach(ix => { poly(x, ix.map(p)); x.lineWidth = faceW * .035; x.strokeStyle = '#000'; x.stroke(); x.fill(); });
    [BROW_R, BROW_L].forEach(ix => { poly(x, ix.map(p)); x.lineWidth = faceW * .02; x.stroke(); x.fill(); });
    return {mask:c, faceW};
  }

  function blurCopy(src, r){
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const x = c.getContext('2d'); x.filter = `blur(${r}px)`;
    // pad edges by drawing with a margin so the blur does not darken borders
    x.drawImage(src, 0, 0);
    return x.getImageData(0, 0, c.width, c.height).data;
  }

  /* src: canvas with the photo; lm: normalized landmarks; areas: array of keys; s: 0..1 */
  function simulate(src, lm, areas, s){
    const W = src.width, H = src.height;
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const ox = out.getContext('2d');
    ox.drawImage(src, 0, 0);
    if (!areas.length || s <= 0) return out;
    const {mask, faceW} = buildMask(lm, W, H, areas);
    const I = ox.getImageData(0, 0, W, H), d = I.data;
    const M = mask.getContext('2d').getImageData(0, 0, W, H).data;
    const B1 = blurCopy(src, Math.max(1, faceW * .006));
    const B2 = blurCopy(src, Math.max(2, faceW * .02));
    const k = Math.min(1, s);
    for (let i = 0; i < d.length; i += 4) {
      const m = M[i + 3] / 255 * k;
      if (m < .004) continue;
      const L = .3 * d[i] + .59 * d[i+1] + .11 * d[i+2];
      const L2 = .3 * B2[i] + .59 * B2[i+1] + .11 * B2[i+2];
      const crease = Math.max(0, Math.min(1, (L2 - L) / 18));   // darker than surroundings = a line
      const lift = m * (.55 + .45 * crease) * crease;
      const smooth = m * .38;
      for (let c = 0; c < 3; c++) {
        let v = d[i+c];
        v += (B2[i+c] - v) * lift;          // fill the line toward the surrounding skin
        v += (B1[i+c] - v) * smooth;        // soften fine texture
        d[i+c] = v;
      }
    }
    ox.putImageData(I, 0, 0);
    return out;
  }

  /* before / after slider */
  function slider(el){
    const set = x => el.style.setProperty('--x', Math.max(0, Math.min(100, x)) + '%');
    let on = false;
    const move = e => { const r = el.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
    el.addEventListener('pointerdown', e => { on = true; el.setPointerCapture(e.pointerId); move(e); });
    el.addEventListener('pointermove', e => on && move(e));
    el.addEventListener('pointerup', () => on = false);
    el.addEventListener('keydown', e => { const v = parseFloat(getComputedStyle(el).getPropertyValue('--x')) || 50; if (e.key === 'ArrowLeft') set(v - 4); if (e.key === 'ArrowRight') set(v + 4); });
    el.tabIndex = 0; el.setAttribute('role', 'slider'); el.setAttribute('aria-label', window.APEX ? APEX.t('Before - After') : 'Before - After');
  }

  function loadImage(src){
    return new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = rej; im.src = src; });
  }
  function toCanvas(im, max = 1000){
    const r = Math.min(1, max / Math.max(im.naturalWidth || im.videoWidth || im.width, im.naturalHeight || im.videoHeight || im.height));
    const w = Math.round((im.naturalWidth || im.videoWidth || im.width) * r), h = Math.round((im.naturalHeight || im.videoHeight || im.height) * r);
    const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h); return c;
  }

  // MediaPipe Face Mesh, loaded only when someone brings their own photo
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/';
  let mesh = null;
  function loadMesh(){
    if (mesh) return mesh;
    mesh = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = MP + 'face_mesh.js'; s.crossOrigin = 'anonymous';
      s.onload = () => {
        const fm = new window.FaceMesh({locateFile: f => MP + f});
        fm.setOptions({maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:.5, staticImageMode:true});
        res(fm);
      };
      s.onerror = e => { mesh = null; rej(e); }; document.head.append(s);
    });
    return mesh;
  }
  async function detect(canvas){
    const fm = await loadMesh();
    return new Promise(res => { fm.onResults(r => res(r.multiFaceLandmarks && r.multiFaceLandmarks[0])); fm.send({image:canvas}); });
  }
  const cloneCanvas = c => { const b = document.createElement('canvas'); b.width = c.width; b.height = c.height; b.getContext('2d').drawImage(c, 0, 0); return b; };

  window.WhatIf = {SAMPLE, AREAS, simulate, slider, loadImage, toCanvas, areaShapes, loadMesh, detect};

  /* home teaser: the real filter on the sample photo (stored landmarks), then on the visitor's own photo */
  window.WhatIfTeaser = function(el, on){
    if (!el) return null;
    const A = window.APEX;
    el.innerHTML = `<span class="tag l">${A.esc(A.t('Before'))}</span><span class="tag r">${A.esc(A.t('After'))}</span><div class="handle"></div><span class="knob">${A.ic('move-horizontal')}</span><span class="hint" aria-hidden="true">${A.ic('pointer')}</span><span class="scan" aria-hidden="true"></span>`;
    slider(el);
    let base = null, lm = null, areas = (on || ['forehead', 'glabella', 'crowsfeet']).slice(), touched = false, sweepT = 0, seen = false;
    function draw(){
      if (!base || !lm) return;
      el.querySelectorAll('canvas').forEach(c => c.remove());
      const b = cloneCanvas(base), a = simulate(base, lm, areas, .95);
      b.className = 'before'; a.className = 'after';
      el.prepend(b); b.after(a);
    }
    // a hand drags the handle every few seconds until the visitor does it themselves
    function sweep(){
      if (touched || A.reduced || !seen) return;
      el.classList.add('demo');
      const t0 = performance.now(), D = 3200;
      const f = now => {
        if (touched) { el.classList.remove('demo'); return; }
        const t = Math.min(1, (now - t0) / D);
        el.style.setProperty('--x', (50 + Math.sin(t * Math.PI * 2) * 28 * Math.sin(t * Math.PI)) + '%');
        if (t < 1) requestAnimationFrame(f);
        else { el.style.setProperty('--x', '50%'); el.classList.remove('demo'); sweepT = setTimeout(sweep, 3000); }
      };
      setTimeout(() => requestAnimationFrame(f), 350);
    }
    const stop = () => { if (touched) return; touched = true; clearTimeout(sweepT); clearTimeout(sweepT); el.classList.remove('demo'); el.classList.add('touched'); };
    el.addEventListener('pointerdown', stop);
    el.addEventListener('keydown', stop);
    async function sample(){
      try {
        if (!window.SAMPLE_LM) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'assets/data/sample-landmarks.js'; s.onload = res; s.onerror = rej; document.head.append(s); });
        base = toCanvas(await loadImage(SAMPLE), 900); lm = window.SAMPLE_LM; draw();
        sweep();
      } catch (e) { el.style.display = 'none'; }
    }
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); seen = true; sample(); } }, {rootMargin:'200px'}).observe(el);
    async function useFile(f){
      if (!f || !/^image\//.test(f.type)) return;
      stop();
      el.classList.add('busy');
      const url = URL.createObjectURL(f);
      try {
        const c = toCanvas(await loadImage(url), 900);
        const found = await detect(c);
        if (found) { base = c; lm = found; draw(); el.style.setProperty('--x', '50%'); }
        else { el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope'); }
      } catch (e) { el.classList.add('nope'); }
      URL.revokeObjectURL(url);
      el.classList.remove('busy');
    }
    // drop a photo straight onto the slider
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drop'); });
    el.addEventListener('dragleave', () => el.classList.remove('drop'));
    el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('drop'); useFile(e.dataTransfer.files[0]); });
    return {useFile, setAreas(a){ areas = a; draw(); }, preload(){ loadMesh().catch(() => {}); }};
  };
})();
