/* Home page */
APEX.boot(() => {
  const A = APEX, H = A.home, S = A.shared, M = A.media;
  A.qsa('[data-ic]').forEach(e => e.outerHTML = A.ic(e.dataset.ic));

  /* ---------- 1. film stage ---------- */
  const words = H.h1.split(' ');
  const mid = Math.ceil(words.length / 2);
  A.qs('#hero-h1').innerHTML = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].map(l => `<span class="ln"><span>${A.esc(l)}</span></span>`).join('');
  A.qs('#hero-sub').textContent = H.sub;
  const films = M.videos.hero, durations = {tjU4p64JpS4:33, ExiKCoIAAkc:29, I3QJS204toI:32, 's-T6fBkR1zc':40, kg1Lz5oEKnI:30};
  const portal = A.qs('#portal'), poster = A.qs('#poster'), cap = A.qs('#cap'), reel = A.qs('#reel'), amb = A.qs('#amb'), count = A.qs('#count');
  poster.src = A.img(H.heroImgs[4] || H.heroImgs[0]);
  A.qs('#yt-ch').innerHTML = `${A.ic('youtube')}Apex Beauty Clinic`;
  A.qs('#yt-ch').href = M.videos.channel;
  reel.innerHTML = films.map((f, i) => `<button role="tab" aria-label="${A.esc(f.t)}" data-i="${i}"><i></i></button>`).join('');
  let cur = -1, t0 = 0, muted = true, frame, raf;
  const sound = A.qs('#sound');
  const setSound = () => sound.innerHTML = muted ? A.ic('volume-x') : A.ic('volume-2');
  sound.setAttribute('aria-label', 'Sound'); setSound();
  // the player is taller than the frame so YouTube letterboxes the film and its title bar sits in the hidden band
  const fit = () => { if (!frame) return; const r = {width:portal.offsetWidth, height:portal.offsetHeight}; const w = Math.max(r.width, r.height * 16 / 9), h = w * 9 / 16, band = Math.max(70, h * .2); frame.style.width = w + 'px'; frame.style.height = (h + band * 2) + 'px'; };
  new ResizeObserver(fit).observe(portal);
  const cmd = (func) => frame && frame.contentWindow && frame.contentWindow.postMessage(JSON.stringify({event:'command', func, args:[]}), '*');
  function play(i){
    cur = (i + films.length) % films.length;
    const f = films[cur];
    const span = cap; span.classList.add('swap');
    count.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(films.length).padStart(2, '0');
    const refl = A.qs('#refl'); [amb, refl].forEach(im => im.classList.add('swap')); setTimeout(() => { [amb, refl].forEach(im => { im.onload = () => im.classList.remove('swap'); im.src = A.yt(f.id); }); }, 300);
    setTimeout(() => { span.textContent = f.t; span.classList.remove('swap'); }, 260);
    if (!frame) {
      frame = document.createElement('iframe');
      frame.setAttribute('allow', 'autoplay; encrypted-media');
      frame.setAttribute('title', 'Apex Beauty Clinic');
      frame.setAttribute('tabindex', '-1');
      portal.insertBefore(frame, poster.nextSibling);
      frame.addEventListener('load', () => { setTimeout(() => poster.classList.add('gone'), 900); if (!muted) setTimeout(() => cmd('unMute'), 600); });
    }
    frame.src = `https://www.youtube-nocookie.com/embed/${f.id}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${f.id}&enablejsapi=1&iv_load_policy=3&disablekb=1`;
    fit();
    t0 = performance.now();
    A.qsa('button', reel).forEach((b, k) => { b.setAttribute('aria-selected', k === cur); b.querySelector('i').style.setProperty('--p', k < cur ? 1 : 0); });
  }
  function tick(now){
    const d = (durations[films[cur].id] || 30) * 1000;
    const p = Math.min(1, (now - t0) / d);
    const bar = reel.children[cur]; if (bar) bar.querySelector('i').style.setProperty('--p', p);
    if (p >= 1) play(cur + 1);
    raf = requestAnimationFrame(tick);
  }
  reel.addEventListener('click', e => { const b = e.target.closest('button'); if (b) play(+b.dataset.i); });
  sound.addEventListener('click', () => { muted = !muted; setSound(); cmd(muted ? 'mute' : 'unMute'); if (!muted) cmd('playVideo'); });
  // only run the film while the stage is visible
  const hero = A.qs('#hero');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (cur < 0) play(0); else cmd('playVideo'); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    else { cmd('pauseVideo'); cancelAnimationFrame(raf); }
  }, {threshold:.15}).observe(hero);
  requestAnimationFrame(() => setTimeout(() => hero.classList.add('ready'), 60));
  // the screen leans a little toward the pointer
  if (!A.reduced && matchMedia('(pointer:fine)').matches) {
    const tilt = A.qs('#tilt'); let tx = 0, ty = 0, rx = 0, ry = 0, tr = 0;
    const step = () => { rx += (tx - rx) * .08; ry += (ty - ry) * .08; tilt.style.transform = `perspective(1600px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`; tilt.style.setProperty('--gx', (50 + ry * 9).toFixed(1) + '%'); tilt.style.setProperty('--gy', (50 - rx * 12).toFixed(1) + '%'); tr = Math.abs(tx - rx) + Math.abs(ty - ry) > .01 ? requestAnimationFrame(step) : 0; };
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); ty = ((e.clientX - r.left) / r.width - .5) * 7; tx = -((e.clientY - r.top) / r.height - .5) * 5; if (!tr) tr = requestAnimationFrame(step); });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; if (!tr) tr = requestAnimationFrame(step); });
  }

  /* ---------- 2. intro: words light up as you read ---------- */
  const intro = A.qs('#intro');
  intro.innerHTML = [].concat(H.intro).join(' ').split(' ').map(w => `<span class="w">${A.esc(w)}</span>`).join(' ');
  const ws = A.qsa('.w', intro);
  const lightWords = () => {
    const r = intro.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
    const n = Math.round(p * ws.length);
    ws.forEach((w, i) => w.classList.toggle('on', i < n));
  };
  if (A.reduced) ws.forEach(w => w.classList.add('on')); else { addEventListener('scroll', lightWords, {passive:true}); lightWords(); }
  A.qs('#about-link').innerHTML = `${A.esc(H.aboutBtn)} ${A.ic('arrow-right')}`;
  A.qs('#intro-photo').innerHTML = `<img src="${A.img(H.heroImgs[4])}" alt="Apex Medical center" loading="lazy">`;

  /* ---------- 4. recommendation rail ---------- */
  A.qs('#rec-h').textContent = H.recH;
  A.qs('#rec').innerHTML = H.rec.map((r, i) => `<a class="prog rv" data-d="${i * 60}" href="${r.href}"><div class="ph"><img loading="lazy" src="${A.img(r.img)}" alt="${A.esc(r.alt)}"></div><h3>${A.esc(r.title)}${A.ic('arrow-up-right')}</h3></a>`).join('');
  A.qs('#rec-prev').innerHTML = A.ic('arrow-left'); A.qs('#rec-next').innerHTML = A.ic('arrow-right');
  A.railCtrl(A.qs('#rec'), A.qs('#rec-prev'), A.qs('#rec-next'));

  /* ---------- 5. what-if teaser ---------- */
  const WI = S.whatif;
  A.qs('#wi-lead').textContent = WI.lead;
  const teaser = window.WhatIfTeaser && window.WhatIfTeaser(A.qs('#wi-ba'), WI.on);
  const wiAreas = A.qs('#wi-areas');
  wiAreas.innerHTML = WI.on.map(k => `<button class="chip" type="button" aria-pressed="true" data-k="${k}">${A.esc(WI.areas[k])}</button>`).join('');
  A.qs('#wi-link').href = WI.link.h; A.qs('#wi-link').firstChild.nodeValue = WI.link.x + ' ';
  wiAreas.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b || !teaser) return; b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); teaser.setAreas(A.qsa('.chip[aria-pressed=true]', wiAreas).map(x => x.dataset.k)); });
  const wiFile = A.qs('#wi-file');
  ['#wi-up', '#wi-up2'].forEach(id => { const b = A.qs(id); b.addEventListener('click', () => wiFile.click()); b.addEventListener('pointerenter', () => teaser && teaser.preload(), {once:true}); });
  wiFile.addEventListener('change', () => { if (teaser) teaser.useFile(wiFile.files[0]); wiFile.value = ''; if (innerWidth < 900) A.qs('#wi-ba').scrollIntoView({behavior:'smooth', block:'center'}); });

  /* ---------- 6. promo deck ---------- */
  A.qs('#promo-h').textContent = H.promoH;
  A.qs('#promo-all').innerHTML = `${A.esc(H.allPromos)} ${A.ic('arrow-right')}`;
  const deck = A.qs('#deck'), dots = A.qs('#deck-dots');
  deck.innerHTML = H.promos.map((p, i) => `<figure class="deck-card" data-i="${i}"><img loading="lazy" src="${A.img(p.img)}" alt="${A.esc(p.alt)}"></figure>`).join('');
  dots.innerHTML = H.promos.map((_, i) => `<button aria-label="${i + 1}"></button>`).join('');
  A.qs('#deck-prev').innerHTML = A.ic('arrow-left'); A.qs('#deck-next').innerHTML = A.ic('arrow-right');
  const cards = A.qsa('.deck-card', deck), n = cards.length;
  let at = 0, auto;
  function layout(){
    const wide = innerWidth > 900;
    cards.forEach((c, i) => {
      let o = i - at; if (o > n / 2) o -= n; if (o < -n / 2) o += n;
      const ax = Math.abs(o);
      const x = o * (wide ? 58 : 34), z = -ax * 180, ry = o * -16, s = 1 - ax * .04;
      c.style.transform = `translate(-50%,-50%) translateX(${x}%) translateZ(${z}px) rotateY(${ry}deg) scale(${s})`;
      c.style.zIndex = 10 - ax;
      c.style.opacity = ax > 2 ? 0 : 1;
      c.style.filter = ax ? `brightness(${1 - ax * .12})` : 'none';
      c.setAttribute('aria-hidden', ax !== 0);
    });
    A.qsa('button', dots).forEach((d, i) => d.classList.toggle('on', i === at));
  }
  const go = d => { at = (at + d + n) % n; layout(); };
  const restart = () => { clearInterval(auto); if (!A.reduced) auto = setInterval(() => go(1), 3800); };
  A.qs('#deck-prev').onclick = () => { go(-1); restart(); };
  A.qs('#deck-next').onclick = () => { go(1); restart(); };
  dots.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { at = [...dots.children].indexOf(b); layout(); restart(); } });
  deck.addEventListener('click', e => { const c = e.target.closest('.deck-card'); if (!c) return; const i = +c.dataset.i; if (i === at) A.lightbox.images(H.promos.map(p => ({src:p.img, alt:p.alt})), i); else { at = i; layout(); restart(); } });
  let sx = null; deck.addEventListener('pointerdown', e => sx = e.clientX); deck.addEventListener('pointerup', e => { if (sx != null && Math.abs(e.clientX - sx) > 40) { go(e.clientX < sx ? 1 : -1); restart(); } sx = null; });
  addEventListener('resize', layout); layout(); restart();

  /* ---------- 7. doctors marquee ---------- */
  const D = A.doctors.list;
  const chip = d => `<a class="doc-chip" href="doctors.html#${d.slug}"><div class="ph"><img loading="lazy" src="${A.img(d.img)}" alt="${A.esc(d.thai)}"></div><b>${A.esc(d.name)}</b><small>${A.esc(d.nick)} · ${A.esc(d.license)}</small></a>`;
  const half = Math.ceil(D.length / 2), ra = D.slice(0, half), rb = D.slice(half);
  A.qs('#docs-a').innerHTML = ra.concat(ra).map(chip).join('');
  A.qs('#docs-b').innerHTML = rb.concat(rb).map(chip).join('');

  /* ---------- 8. why ---------- */
  if (!H.why) A.qs('#why-h').closest('section').remove();
  else { A.qs('#why-h').textContent = H.why.h; A.qs('#why-p').textContent = H.why.intro || '';
  const wico = ['shield-check', 'stethoscope', 'layers'];
  A.qs('#why-rows').innerHTML = H.why.items.map((w, i) => `<div class="why-row rv" data-d="${i * 80}"><span class="why-ico">${A.ic(wico[i])}</span><div><h3>${A.esc(w.h)}</h3><p>${A.esc(w.p)}</p></div></div>`).join(''); }

  /* ---------- 9. results wall ---------- */
  const res = [];
  M.results.forEach(g => g.imgs.slice(0, 2).forEach((src, k) => res.push({src, g, k})));
  A.qs('#results').innerHTML = res.slice(0, 20).map((r, i) => `<figure class="rv" data-d="${(i % 4) * 60}" data-i="${i}"><img loading="lazy" src="${A.img(r.src)}" alt="${A.esc(r.g.title)}"><figcaption>${A.esc(r.g.title)}</figcaption></figure>`).join('');
  A.qs('#results').addEventListener('click', e => { const f = e.target.closest('figure'); if (!f) return; const r = res[+f.dataset.i]; A.lightbox.images(r.g.imgs.map(s => ({src:s, alt:r.g.title})), r.k); });

  /* ---------- 10. Google reviews ---------- */
  const R = H.reviews || M.reviews;
  const stars = n => `<span class="stars" aria-label="${n} stars">${Array.from({length:n}, () => '<svg class="i" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>').join('')}</span>`;
  A.qs('#rv-head').innerHTML = R.label
    ? `<div class="score"><b class="word">${A.esc(R.label)}</b><div>${stars(5)}<div class="gmark" style="margin-top:6px">${A.ic('google')} ${A.esc(R.countText)}</div></div></div>
    <p class="lead" style="margin:0">${A.esc(M.reviews.place)}</p><a class="btn btn-ghost" href="${M.reviews.url}" target="_blank" rel="noopener">${A.ic('google')}Google ${A.ic('arrow-up-right')}</a>`
    : `<div class="score"><b>${R.rating}</b><div>${stars(5)}<div class="gmark" style="margin-top:6px">${A.ic('google')} ${R.count} · Google</div></div></div>
    <p class="lead" style="margin:0">${A.esc(R.place)}</p><a class="btn btn-ghost" href="${R.url}" target="_blank" rel="noopener">${A.ic('google')}Google ${A.ic('arrow-up-right')}</a>`;
  const card = r => `<article class="rcard">${stars(5)}<p>${A.esc(r.text)}</p><div class="who"><span class="av">${A.esc((r.name.trim()[0] || '·').toUpperCase())}</span><span><b>${A.esc(r.name)}</b>${A.esc(r.when)}</span></div></article>`;
  const cols = [[], [], []]; R.reviews.forEach((r, i) => cols[i % 3].push(r));
  A.qs('#reviews').innerHTML = cols.map((c, k) => `<div class="vmarquee-col"><div class="vmarquee-track" style="--d:${80 + k * 14}s">${c.concat(c).map(card).join('')}</div></div>`).join('');

  /* ---------- 11. videos ---------- */
  A.qs('#yt-h').innerHTML = `${A.ic('youtube')} Apex Beauty Clinic`; A.qs('#yt-h').href = M.videos.channel;
  A.qs('#yt-h .i').style.color = '#FF0033';
  A.qs('#videos').innerHTML = M.videos.library.map(v => `<div class="vcard"><button data-v="${v.id}"><div class="vthumb"><img loading="lazy" src="${A.yt(v.id)}" alt=""><span class="pl">${A.ic('play')}</span><span class="len">${v.len}</span></div><h4>${A.esc(v.t)}</h4></button></div>`).join('');
  A.qs('#videos').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) A.lightbox.video(b.dataset.v); });
  A.qs('#v-prev').innerHTML = A.ic('arrow-left'); A.qs('#v-next').innerHTML = A.ic('arrow-right');
  A.railCtrl(A.qs('#videos'), A.qs('#v-prev'), A.qs('#v-next'));

  /* ---------- 12. updates: facebook + latest posts ---------- */
  A.qs('#latest-h').textContent = H.latestH;
  const FB = S.fb.find(A.fbFeed) || S.fb[0];
  A.qs('#latest-link').lastElementChild.previousSibling.nodeValue = FB.x + ' ';
  { const t = document.createElement('div'); t.innerHTML = A.fbFrame(FB, 620, A.fbFeed(FB) ? 'timeline' : ''); const box = A.qs('#fb'); box.innerHTML = t.firstElementChild.innerHTML; box.classList.toggle('card', t.firstElementChild.classList.contains('card')); }
  A.fbMount(A.qs('#fb'));
  A.qs('#posts').innerHTML = H.posts.map((p, i) => `<a class="pcard rv" data-d="${i * 70}" href="article.html?p=${encodeURIComponent(p.key)}"><div class="ph"><img loading="lazy" src="${A.img(p.img)}" alt="${A.esc(p.alt)}"></div><div><span class="cat">${A.esc(p.cat)}</span><h3>${A.esc(p.title)}</h3><p>${A.esc(p.excerpt)}</p></div></a>`).join('')
    + `<a class="link-arrow rv" href="blog.html" style="margin:10px 12px">${A.esc(A.t('Blog'))} ${A.ic('arrow-right')}</a>`;

  /* ---------- 13. partners ---------- */
  A.qs('#partners-h').textContent = H.partnersH;
  A.qs('#partners').innerHTML = H.partners.concat(H.partners).map(p => `<img loading="lazy" src="${A.img(p.img)}" alt="${A.esc(p.alt)}">`).join('');

  /* ---------- 14. consultation ---------- */
  const soc = S.socials;
  A.qs('#consult').innerHTML = `<div style="position:relative"><h2 class="h-xl">${A.esc(H.consH)}</h2><p class="lead" style="color:var(--lilac-200);margin-top:22px">${A.esc(H.consP)}</p>
      <div class="socgrid">${soc.map(s => `<a href="${s.h}" target="_blank" rel="noopener">${A.socIcon(s.k)}${A.esc(s.x)}</a>`).join('')}</div></div>
    <div class="ch-list">${(H.channels || S.channels).map(c => `<a class="ch" href="${c.h}"${/^https?:/.test(c.h) ? ' target="_blank" rel="noopener"' : ''}><span class="ic">${A.ic(c.ic)}</span><span><b>${A.esc(c.x)}</b>${c.sub ? `<small>${A.esc(c.sub)}</small>` : ''}</span></a>`).join('')}
    </div>`;
});
