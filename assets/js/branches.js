/* Branches: map + list, filter by group, search */
APEX.boot(() => {
  const A = APEX, B = A.branches, L = window.L;
  const groups = Object.fromEntries(B.page.groups.map(g => [g.k, g.x]));
  A.qs('#main').innerHTML = `<section class="phead"><div class="wrap" style="display:flex;justify-content:space-between;align-items:end;gap:30px;flex-wrap:wrap">
      <div>${A.crumbs([['Home','index.html'],['Our Branches']])}<h1 class="h-xl rv">${A.esc(B.page.h1)}</h1></div>
      <div class="bcount rv"><b id="count">${B.list.length}</b></div></div></section>
    <section class="section" style="padding-top:40px"><div class="wrap">
      <div class="btools"><button class="chip" aria-pressed="true" data-g="">${A.ic('map')} ${B.list.length}</button>${Object.entries(groups).map(([k, x]) => `<button class="chip" aria-pressed="false" data-g="${k}">${A.esc(x)}</button>`).join('')}
        <label class="bsearch">${A.ic('search')}<input id="q" type="search" autocomplete="off" aria-label="${A.esc(A.t('Search'))}"></label>
        <button class="chip" id="near" aria-label="${A.esc(A.t('Near me'))}">${A.ic('navigation')}</button></div>
      <div class="bwrap"><div class="blist" id="blist"></div><div class="bmap" id="map"></div></div></div></section>`;

  const listEl = A.qs('#blist');
  let group = '', q = '', markers = [];
  const map = L.map('map', {zoomControl:true, scrollWheelZoom:false, attributionControl:true}).setView([13.76, 100.55], 11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  const icon = (h, on) => L.divIcon({className:'', html:`<div class="pin${h ? ' h' : ''}${on ? ' on' : ''}"></div>`, iconSize:[30, 30], iconAnchor:[15, 30], popupAnchor:[0, -28]});
  B.list.forEach((b, i) => {
    if (!b.ll) return;
    const m = L.marker(b.ll, {icon:icon(b.group === B.page.groups[0].k)}).addTo(map);
    m.bindPopup(`<b>${A.esc(b.name)}</b>${b.phones.map(p => `<a href="tel:${p.replace(/[^\d+]/g, '')}">${A.esc(p)}</a>`).join('<br>')}${b.map ? `<br><a href="${b.map}" target="_blank" rel="noopener">Google Map</a>` : ''}`);
    m.on('click', () => focus(i, false));
    markers[i] = m;
  });
  const card = (b, i) => `<article class="bcard" data-i="${i}" tabindex="0"><div class="ph"><img loading="lazy" src="${A.img(b.img)}" alt="${A.esc(b.alt)}"></div>
    <div><h3>${A.esc(b.name)}</h3><div class="acts">${b.phones.map(p => `<a href="tel:${p.replace(/[^\d+]/g, '')}">${A.ic('phone')}${A.esc(p)}</a>`).join('')}
      ${b.map ? `<a href="${b.map}" target="_blank" rel="noopener">${A.ic('map-pin')}Google Map</a>` : ''}${b.how ? `<a href="${b.how}"${/^https?:/.test(b.how) ? ' target="_blank" rel="noopener"' : ''}>${A.ic('navigation')}${A.esc(B.page.how || A.t('How to get there'))}</a>` : ''}</div></div></article>`;
  function draw(){
    const ql = q.toLowerCase();
    const vis = B.list.map((b, i) => [b, i]).filter(([b]) => (!group || b.group === group) && (!ql || (b.name + ' ' + b.alt + ' ' + b.phones.join(' ')).toLowerCase().includes(ql)));
    let html = '', lastG = null;
    vis.forEach(([b, i]) => { if (b.group !== lastG) { html += `<h2 class="bgroup-h">${A.esc(groups[b.group])}</h2>`; lastG = b.group; } html += card(b, i); });
    listEl.innerHTML = html || '';
    A.qs('#count').textContent = vis.length;
    markers.forEach((m, i) => { if (!m) return; const on = vis.some(v => v[1] === i); if (on && !map.hasLayer(m)) m.addTo(map); if (!on && map.hasLayer(m)) map.removeLayer(m); });
    const pts = vis.map(([b]) => b.ll).filter(Boolean);
    if (pts.length) map.flyToBounds(L.latLngBounds(pts).pad(.15), {duration:.8, maxZoom:14});
  }
  let current = -1;
  function focus(i, fly){
    if (current >= 0 && markers[current]) markers[current].setIcon(icon(B.list[current].group === B.page.groups[0].k));
    current = i;
    A.qsa('.bcard', listEl).forEach(c => c.classList.toggle('on', +c.dataset.i === i));
    const m = markers[i];
    if (m) { m.setIcon(icon(B.list[i].group === B.page.groups[0].k, true)); if (fly) map.flyTo(B.list[i].ll, 15, {duration:.9}); m.openPopup(); }
    const c = A.qs(`.bcard[data-i="${i}"]`, listEl); if (c && !fly) c.scrollIntoView({block:'nearest', behavior:'smooth'});
  }
  listEl.addEventListener('click', e => { if (e.target.closest('a')) return; const c = e.target.closest('.bcard'); if (c) { focus(+c.dataset.i, true); if (innerWidth < 900) A.qs('#map').scrollIntoView({behavior:'smooth', block:'center'}); } });
  listEl.addEventListener('keydown', e => { if (e.key === 'Enter') { const c = e.target.closest('.bcard'); if (c) focus(+c.dataset.i, true); } });
  A.qsa('.btools .chip[data-g]').forEach(b => b.addEventListener('click', () => { group = b.dataset.g; A.qsa('.btools .chip[data-g]').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); }));
  A.qs('#q').addEventListener('input', e => { q = e.target.value.trim(); draw(); });
  // nearest branch from the visitor's location
  A.qs('#near').addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const me = [pos.coords.latitude, pos.coords.longitude];
      L.circleMarker(me, {radius:8, color:'#fff', weight:3, fillColor:'#8E2DCF', fillOpacity:1}).addTo(map);
      let best = -1, bd = 1e9;
      B.list.forEach((b, i) => { if (!b.ll) return; const d = Math.hypot(b.ll[0] - me[0], (b.ll[1] - me[1]) * Math.cos(me[0] * Math.PI / 180)); if (d < bd) { bd = d; best = i; } });
      group = ''; q = ''; A.qs('#q').value = ''; A.qsa('.btools .chip[data-g]').forEach(x => x.setAttribute('aria-pressed', x.dataset.g === '')); draw();
      setTimeout(() => focus(best, true), 900);
    });
  });
  draw();
  setTimeout(() => map.invalidateSize(), 300);
});
