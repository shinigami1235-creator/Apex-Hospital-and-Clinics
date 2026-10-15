/* What-if page: upload or take a photo, pick areas, compare before / after */
APEX.boot(() => {
  const A = APEX, W = window.WhatIf;
  const WI = A.shared.whatif;
  A.qs('#lead').textContent = WI.lead;
  A.qs('#crumbs').innerHTML = A.crumbs([['Home', 'index.html'], [WI.link.x, WI.link.h], ['What if?']]);
  A.qs('#knob').innerHTML = A.ic('move-horizontal');
  A.qs('#empty-ic').innerHTML = A.ic('scan-face');

  const srcBtns = `<button class="btn btn-plum btn-sm" data-src="upload">${A.ic('upload')}${A.esc(A.t('Upload'))}</button><button class="btn btn-ghost on-light btn-sm" data-src="camera">${A.ic('camera')}${A.esc(A.t('Camera'))}</button>`;
  A.qs('#src').innerHTML = srcBtns + `<button class="btn btn-ghost on-light btn-sm" data-src="sample" style="grid-column:1/-1">${A.ic('image')}${A.esc(A.t('Before - After'))}</button>`;
  A.qs('#empty-src').innerHTML = srcBtns.replace('btn-ghost on-light', 'btn-light');

  const ON = new Set(WI.on);
  A.qs('#areas').innerHTML = Object.keys(W.AREAS).map(k => `<button class="wi-area" data-k="${k}" aria-pressed="${ON.has(k)}"><span>${A.esc(WI.areas[k])}<small>${A.esc(WI.treat[k === 'nasolabial' ? 'filler' : 'botox'])}</small></span><span class="tg"></span></button>`).join('');
  A.qs('#links').innerHTML = WI.links.map(l => `<a class="chip" href="${l.h}">${A.esc(l.x)} ${A.ic('arrow-up-right')}</a>`).join('');

  const stage = A.qs('#stage'), ba = A.qs('#ba'), busy = A.qs('#busy'), empty = A.qs('#empty'), video = A.qs('#video'), file = A.qs('#file'), amt = A.qs('#amt');
  W.slider(ba);
  let base = null, lm = null, stream = null;

  const loadMesh = W.loadMesh, detect = W.detect;

  async function useCanvas(c){
    stopCam();
    busy.classList.add('on');
    base = c;
    try { lm = await detect(c); } catch (e) { lm = null; }
    busy.classList.remove('on');
    window.__lm = lm; // available for inspection
    if (!lm) { empty.hidden = false; ba.hidden = true; A.qs('#empty-ic').innerHTML = A.ic('scan-face'); return; }
    empty.hidden = true; ba.hidden = false;
    stage.style.aspectRatio = `${c.width} / ${c.height}`; stage.style.maxWidth = `calc(80vh * ${(c.width / c.height).toFixed(4)})`;
    render();
  }
  let rt;
  function render(){
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (!base || !lm) return;
      const areas = A.qsa('.wi-area[aria-pressed=true]').map(b => b.dataset.k);
      const after = W.simulate(base, lm, areas, amt.value / 100);
      A.qsa('canvas', ba).forEach(c => c.remove());
      const b = base.cloneNode(); b.getContext('2d').drawImage(base, 0, 0);
      b.className = 'before'; after.className = 'after';
      ba.prepend(b); b.after(after);
    }, 60);
  }

  // sources
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-src]'); if (!b) return;
    const k = b.dataset.src;
    if (k === 'upload') file.click();
    if (k === 'sample') { busy.classList.add('on'); try { const im = await W.loadImage(W.SAMPLE); useCanvas(W.toCanvas(im)); } catch (er) { busy.classList.remove('on'); } }
    if (k === 'camera') startCam();
    if (k === 'shot') snap();
  });
  file.addEventListener('change', () => {
    const f = file.files[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    W.loadImage(url).then(im => { useCanvas(W.toCanvas(im)); URL.revokeObjectURL(url); });
    file.value = '';
  });
  async function startCam(){
    try {
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user', width:{ideal:1280}, height:{ideal:1280}}, audio:false});
      video.srcObject = stream; video.hidden = false; await video.play();
      empty.hidden = true; ba.hidden = true; stage.style.aspectRatio = ''; stage.style.maxWidth = '';
      let shot = A.qs('#shot');
      if (!shot) { shot = document.createElement('button'); shot.id = 'shot'; shot.dataset.src = 'shot'; shot.className = 'fab-btn'; shot.setAttribute('aria-label', 'Camera'); shot.style.cssText = 'position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:4;width:72px;height:72px;background:#fff;color:var(--plum)'; shot.innerHTML = A.ic('camera'); stage.append(shot); }
      shot.hidden = false;
    } catch (er) { empty.hidden = false; }
  }
  function stopCam(){ if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; } video.hidden = true; const s = A.qs('#shot'); if (s) s.hidden = true; }
  function snap(){
    const c = document.createElement('canvas'); c.width = video.videoWidth; c.height = video.videoHeight;
    const x = c.getContext('2d'); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(video, 0, 0);
    useCanvas(W.toCanvas(c));
  }

  A.qs('#areas').addEventListener('click', e => { const b = e.target.closest('.wi-area'); if (!b) return; b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); render(); });
  const paint = () => amt.style.setProperty('--v', amt.value + '%');
  amt.addEventListener('input', () => { paint(); render(); }); paint();
  // preload the model in the background once the page is idle
  setTimeout(() => loadMesh().catch(() => {}), 1500);
  // arriving from the home page's Camera button
  if (location.hash === '#camera') startCam();
});
