/* Face Atlas: a particle face built from the MediaPipe canonical face mesh.
   Touch a region to see the Apex treatments for it. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const A = window.APEX;
const FM = window.FACEMESH;
const start = () => { const h = document.getElementById('atlas'); if (h && FM && !h.dataset.on) { h.dataset.on = 1; init(h); } };
start(); document.addEventListener('apex:ready', start);

function init(host){
  // region label (the site's own words) + its treatments, resolved per language at build time
  const REG = A.shared.atlas;
  const ORDER = ['forehead','glabella','crowsfeet','eyes','nose','cheeks','nasolabial','lips','chin','jawline'];

  host.innerHTML = `<div class="atlas-stage" id="atlas-stage"><div class="atlas-tags"></div><div class="atlas-hint">${A.ic('move-horizontal')}</div></div>
    <aside class="atlas-panel" aria-live="polite"><h3 id="atlas-title"></h3><div class="chips" id="atlas-chips"></div><div class="atlas-list" id="atlas-list"></div></aside>`;
  const stage = host.querySelector('.atlas-stage');
  const tagsEl = host.querySelector('.atlas-tags');

  // ---- geometry ----
  const V = FM.v, RI = FM.r, R = FM.R, E = FM.e;
  const nv = V.length / 3;
  const pos = [], reg = [], rnd = [];
  const cx = 0, cy = -.4, cz = 2.2;
  const vx = i => V[i*3] - cx, vy = i => V[i*3+1] - cy, vz = i => V[i*3+2] - cz;
  for (let i = 0; i < nv; i++) { pos.push(vx(i), vy(i), vz(i)); reg.push(RI[i]); rnd.push(Math.random()); }
  // dense sampling across triangles (faces come from the edge list: rebuild triangles from mesh edges is costly; sample along edges instead)
  for (let k = 0; k < E.length; k += 2) {
    const a = E[k], b = E[k+1];
    const steps = 4;
    for (let s = 1; s < steps; s++) {
      const t = s / steps + (Math.random() - .5) * .08;
      pos.push(vx(a) + (vx(b) - vx(a)) * t, vy(a) + (vy(b) - vy(a)) * t, vz(a) + (vz(b) - vz(a)) * t);
      reg.push(t < .5 ? RI[a] : RI[b]); rnd.push(Math.random());
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aReg', new THREE.Float32BufferAttribute(reg, 1));
  geo.setAttribute('aRnd', new THREE.Float32BufferAttribute(rnd, 1));

  const uniforms = {uTime:{value:0}, uActive:{value:-1}, uPix:{value:Math.min(devicePixelRatio, 2)}, uIntro:{value:0}};
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    vertexShader:`
      attribute float aReg; attribute float aRnd;
      uniform float uTime, uActive, uPix, uIntro;
      varying float vOn; varying float vA;
      void main(){
        vec3 p = position;
        float on = step(abs(aReg - uActive), .1);
        vOn = on;
        p += normalize(p + vec3(0.,0.,6.)) * (sin(uTime*1.6 + aRnd*12.) * .05 + on * (.18 + .12*sin(uTime*3. + aRnd*6.)));
        p *= mix(1.6, 1., uIntro);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        float facing = clamp((-mv.z - 20.) / 10., 0., 1.);
        vA = mix(1., .45, facing) * uIntro;
        gl_PointSize = (on > .5 ? 4.2 : 2.8) * uPix * (44. / -mv.z) * (0.75 + aRnd*.5);
      }`,
    fragmentShader:`
      varying float vOn; varying float vA;
      void main(){
        vec2 c = gl_PointCoord - .5; float d = length(c);
        if (d > .5) discard;
        float a = smoothstep(.5, .0, d);
        vec3 base = vec3(.70,.58,.86);
        vec3 hot = vec3(1.,.93,1.);
        vec3 col = mix(base, hot, vOn);
        gl_FragColor = vec4(col, a * vA * (vOn > .5 ? 1. : .7));
      }`
  });
  const points = new THREE.Points(geo, mat);

  // wire
  const lpos = [], lreg = [];
  for (let k = 0; k < E.length; k += 2) {
    const a = E[k], b = E[k+1];
    lpos.push(vx(a), vy(a), vz(a), vx(b), vy(b), vz(b));
    lreg.push(RI[a], RI[b]);
  }
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute('position', new THREE.Float32BufferAttribute(lpos, 3));
  lgeo.setAttribute('aReg', new THREE.Float32BufferAttribute(lreg, 1));
  const lmat = new THREE.ShaderMaterial({
    uniforms, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    vertexShader:`attribute float aReg; uniform float uActive, uIntro; varying float vOn;
      void main(){ vOn = step(abs(aReg-uActive), .1); vec3 p = position * mix(1.6,1.,uIntro); gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.); }`,
    fragmentShader:`varying float vOn; uniform float uIntro; void main(){ gl_FragColor = vec4(mix(vec3(.55,.42,.72), vec3(1.,.85,1.), vOn), (vOn>.5 ? .45 : .06) * uIntro); }`
  });
  const lines = new THREE.LineSegments(lgeo, lmat);

  const group = new THREE.Group();
  group.add(lines, points);
  const scene = new THREE.Scene();
  scene.add(group);
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 200);
  camera.position.set(0, -0.6, 42);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  stage.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  // region centroids for tags
  const cent = {};
  ORDER.forEach(k => {
    const ri = R.indexOf(k); const acc = [0,0,0,0]; const side = (k === 'crowsfeet' || k === 'cheeks' || k === 'nasolabial' || k === 'eyes' || k === 'jawline') ? -1 : 0;
    for (let i = 0; i < nv; i++) if (RI[i] === ri && (side === 0 || vx(i) < -0.2)) { acc[0] += vx(i); acc[1] += vy(i); acc[2] += vz(i); acc[3]++; }
    cent[k] = new THREE.Vector3(acc[0]/acc[3], acc[1]/acc[3], acc[2]/acc[3] + .6);
  });
  tagsEl.innerHTML = ORDER.map(k => `<button class="atlas-tag" data-k="${k}">${A.esc(REG[k].x)}</button>`).join('');
  const tags = [...tagsEl.children];

  // ---- panel ----
  const titleEl = host.querySelector('#atlas-title'), listEl = host.querySelector('#atlas-list'), chipsEl = host.querySelector('#atlas-chips');
  chipsEl.innerHTML = ORDER.map(k => `<button class="chip" data-k="${k}" aria-pressed="false">${REG[k].x}</button>`).join('');
  let active = null;
  function select(k, fromUser){
    if (fromUser) lastUser = performance.now();
    active = k;
    uniforms.uActive.value = R.indexOf(k);
    titleEl.textContent = REG[k].x;
    tags.forEach(t => t.classList.toggle('on', t.dataset.k === k));
    [...chipsEl.children].forEach(c => c.setAttribute('aria-pressed', c.dataset.k === k));
    listEl.innerHTML = REG[k].items.map((it, i) => `<a class="atlas-item" style="animation-delay:${i*50}ms" href="${it.h}">${it.img ? `<img loading="lazy" src="${A.img(it.img)}" alt="">` : `<span class="noimg">${A.ic('sparkles')}</span>`}<span><b>${A.esc(it.x)}</b><small>${A.esc(it.c || '')}</small></span>${A.ic('arrow-up-right')}</a>`).join('');
    targetRot.y = (k === 'crowsfeet' || k === 'jawline') ? .55 : (k === 'cheeks' || k === 'nasolabial' ? .3 : 0);
  }
  tagsEl.addEventListener('click', e => { const b = e.target.closest('.atlas-tag'); if (b) select(b.dataset.k, true); });
  chipsEl.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) select(b.dataset.k, true); });

  // ---- interaction: drag to turn, spring back ----
  const rot = {x:0, y:0}, vel = {x:0, y:0}, targetRot = {x:0, y:0};
  let drag = null, lastUser = 0;
  stage.addEventListener('pointerdown', e => { drag = {x:e.clientX, y:e.clientY, rx:targetRot.x, ry:targetRot.y, moved:false}; stage.setPointerCapture(e.pointerId); lastUser = performance.now(); });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    targetRot.y = Math.max(-1.2, Math.min(1.2, drag.ry + dx * .006));
    targetRot.x = Math.max(-.5, Math.min(.5, drag.rx + dy * .004));
    lastUser = performance.now();
  });
  stage.addEventListener('pointerup', e => {
    if (drag && !drag.moved && !e.target.closest('.atlas-tag')) pick(e);
    drag = null;
  });
  // click on the face picks the nearest region
  const ray = new THREE.Raycaster(); ray.params.Points.threshold = .5;
  function pick(e){
    const r = stage.getBoundingClientRect();
    const m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(m, camera);
    const hit = ray.intersectObject(points)[0];
    if (hit) { const k = R[reg[hit.index]]; if (REG[k]) select(k, true); }
  }

  // ---- loop ----
  let w = 0, h = 0, visible = false, raf, t0 = performance.now(), introT = 0, tourAt = 0;
  const resize = () => { w = stage.clientWidth; h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < 560 ? 38 : 30; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(stage); resize();
  const tmp = new THREE.Vector3();
  function frame(now){
    const t = (now - t0) / 1000;
    uniforms.uTime.value = t;
    introT = Math.min(1, introT + .012); uniforms.uIntro.value = 1 - Math.pow(1 - introT, 3);
    // auto tour when idle
    if (!A.reduced && now - lastUser > 7000 && now - tourAt > 3600) {
      tourAt = now;
      const i = active ? (ORDER.indexOf(active) + 1) % ORDER.length : 0;
      select(ORDER[i], false);
    }
    const idle = now - lastUser > 2500 && !drag;
    const ty = targetRot.y + (idle ? Math.sin(t * .4) * .22 : 0);
    // spring
    vel.y += (ty - rot.y) * .06; vel.y *= .78; rot.y += vel.y;
    vel.x += (targetRot.x - rot.x) * .06; vel.x *= .78; rot.x += vel.x;
    if (idle && !drag) targetRot.x *= .98;
    group.rotation.set(rot.x, rot.y, 0);
    renderer.render(scene, camera);
    // tags
    group.updateMatrixWorld();
    tags.forEach(tag => {
      const k = tag.dataset.k;
      tmp.copy(cent[k]).applyMatrix4(group.matrixWorld);
      const facing = tmp.z > -1.5;
      tmp.project(camera);
      tag.style.left = ((tmp.x + 1) / 2 * w) + 'px';
      tag.style.top = ((1 - tmp.y) / 2 * h) + 'px';
      tag.classList.toggle('back', !facing);
    });
    raf = visible ? requestAnimationFrame(frame) : 0;
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }, {threshold:.05}).observe(stage);
  select('forehead', false);
}
