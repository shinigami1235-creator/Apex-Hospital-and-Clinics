/* Apex — shared shell: header, footer, icons, motion, lightbox, content renderer */
(function(){
  const A = window.APEX = window.APEX || {};
  const SITE = 'https://www.apexmedicalcenter.co.th/';
  document.documentElement.classList.remove('no-js');

  A.img = s => !s ? '' : (s.startsWith('~/') ? SITE + s.slice(2) : s);
  A.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  A.ic = (n, cls='') => {
    const I = window.ICONS || {};
    if (n === 'close') n = 'x-close';
    if (n === 'x-close') return `<svg class="i l ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I['l_x']}</svg>`;
    if (I['b_'+n]) return `<svg class="i br ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${I['b_'+n]}"/></svg>`;
    if (I['l_'+n]) return `<svg class="i l ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I['l_'+n]}</svg>`;
    return '';
  };
  A.qs = (s, r=document) => r.querySelector(s);
  A.qsa = (s, r=document) => [...r.querySelectorAll(s)];
  A.param = k => new URLSearchParams(location.search).get(k);
  A.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SOC = {facebook:'facebook', instagram:'instagram', tiktok:'tiktok', youtube:'youtube', x:'x', line:'line', whatsapp:'whatsapp'};
  A.socIcon = k => A.ic(SOC[k] || 'globe');
  A.yt = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  /* ---------- language ---------- */
  A.lang = (document.documentElement.lang || 'en').slice(0, 2);
  A.t = s => (A.shared && A.shared.i18n && A.shared.i18n[s]) || s;
  // where this language's data files live (for articles and services loaded on demand)
  const ds = document.querySelector('script[src*="/shared.js"],script[src^="shared.js"]');
  A.dataBase = ds ? ds.getAttribute('src').replace(/shared\.js.*$/, '') : 'assets/data/';
  A.load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); });
  A.detail = (obj, kind) => {
    if (!obj || obj.blocks) return Promise.resolve(obj);
    return A.load(A.dataBase + kind + '/' + obj.f + '.js').then(() => Object.assign(obj, (A._d || {})[kind + obj.f]));
  };
  // the same page in another language: same file, same item when it exists there, else that language's index of the same kind
  const FOLDER = {en:'', th:'th/', zh:'zh/'};
  A.langHref = code => {
    const up = A.lang === 'en' ? '' : '../';
    const file = (location.pathname.split('/').pop() || 'index.html');
    const alt = A.shared && A.shared.alts && A.shared.alts[file + '|' + (A.param('p') || '')];
    if (code === A.lang) return file + location.search + location.hash;
    if (alt && alt[code]) return up + FOLDER[code] + alt[code];
    const fallback = {'service.html':'services.html', 'article.html':'blog.html'}[file] || file;
    const keep = /^(doctors|branches|what-if)\.html$/.test(file) ? location.hash : '';
    return up + FOLDER[code] + fallback + keep;
  };

  /* ---------- header ---------- */
  function header(){
    const S = A.shared, page = document.body.dataset.page || '';
    const itHref = it => it.key ? 'service.html?p=' + it.key : it.href;
    const nav = S.nav.map(n => {
      const cur = n.k === page ? ' aria-current="page"' : '';
      if (n.k === 'services') {
        const block = c => `<div class="mc"><h4>${A.esc(c.name)}</h4>${c.items.map(it => `<a href="${itHref(it)}"${it.d ? ' class="sub"' : ''}>${A.esc(it.label)}</a>`).join('')}</div>`;
        let cols;
        if (S.centers.length > 6) {
          // many groups: five stacks with about the same number of links each, in menu order
          const total = S.centers.reduce((n, c) => n + c.items.length + 2, 0), per = total / 5, stacks = [[]];
          let run = 0;
          S.centers.forEach(c => { const w = c.items.length + 2; if (run + w / 2 > per * stacks.length && stacks.length < 5) stacks.push([]); stacks[stacks.length - 1].push(c); run += w; });
          cols = stacks.map(st => `<div class="stack">${st.map(block).join('')}</div>`).join('');
        } else cols = S.centers.map(block).join('');
        return `<div class="has-mega"><button type="button" aria-expanded="false"${cur}>${A.esc(n.x)}${A.ic('chevron-down')}</button><div class="mega${S.centers.length > 6 ? ' wide' : ''}" role="menu">${cols}<div class="mega-foot"><a class="link-arrow" href="services.html">${A.esc(A.t('All services'))} ${A.ic('arrow-right')}</a><a class="link-arrow" href="what-if.html">What if? ${A.ic('scan-face')}</a></div></div></div>`;
      }
      return `<a href="${n.h}"${cur}>${A.esc(n.x)}</a>`;
    }).join('');
    const LANGS = [['th','TH'],['en','EN'],['zh','CN']];
    const langs = LANGS.map(([c,t]) => `<a href="${A.langHref(c)}" hreflang="${c}" class="${c===A.lang?'on':''}"${c===A.lang?' aria-current="true"':''}>${t}</a>`).join('');
    const el = document.createElement('header');
    el.className = 'hdr';
    el.innerHTML = `<div class="hdr-in">
      <a class="hdr-logo" href="index.html" aria-label="Apex Medical Center"><img src="${A.img(S.logo)}" alt="APEX Hospital & Clinics by Apex Medical Center" width="160" height="34"></a>
      <nav class="hdr-nav" aria-label="Main">${nav}<a href="updates.html"${page==='updates'?' aria-current="page"':''}>${A.ic('sparkles')}</a></nav>
      <div class="hdr-right"><div class="lang">${langs}</div>
        <a class="btn btn-plum btn-sm" href="${S.consult.h}" target="_blank" rel="noopener">${A.ic(S.consult.ic || 'whatsapp')}${A.esc(S.consult.x)}</a>
        <button class="burger" type="button" aria-label="${A.esc(A.t('Menu'))}">${A.ic('menu')}</button></div></div>`;
    document.body.prepend(el);
    // updates link: label with its own heading text for screen readers
    const up = A.qs('.hdr-nav a[href="updates.html"]', el); up.setAttribute('aria-label', S.latestH); up.title = S.latestH;

    const mega = A.qs('.has-mega', el), mbtn = A.qs('button', mega);
    let t;
    const open = v => { mega.classList.toggle('open', v); mbtn.setAttribute('aria-expanded', v); };
    mega.addEventListener('mouseenter', () => { clearTimeout(t); open(true); });
    mega.addEventListener('mouseleave', () => { t = setTimeout(() => open(false), 160); });
    mbtn.addEventListener('click', () => open(!mega.classList.contains('open')));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });

    // hide on scroll down, show on up
    let last = scrollY;
    addEventListener('scroll', () => {
      const y = scrollY;
      el.classList.toggle('hide', y > 240 && y > last && !mega.classList.contains('open'));
      last = y;
    }, {passive:true});

    // mobile sheet
    const sh = document.createElement('div');
    sh.className = 'sheet'; sh.setAttribute('role','dialog'); sh.setAttribute('aria-label', A.t('Menu'));
    const subs = S.centers.map(c => `<h5>${A.esc(c.name)}</h5>${c.items.map(it => `<a href="${itHref(it)}">${A.esc(it.label)}</a>`).join('')}`).join('');
    sh.innerHTML = `<div class="sheet-top"><img src="${A.img(S.logoWhite)}" alt="Apex"><button class="close" aria-label="${A.esc(A.t('Close'))}">${A.ic('close')}</button></div>
      <nav>${S.nav.map(n => n.k === 'services' ? `<details><summary>${A.esc(n.x)}${A.ic('chevron-down')}</summary><div class="sub"><a href="services.html">${A.esc(A.t('All services'))}</a>${subs}</div></details>` : `<a href="${n.h}">${A.esc(n.x)}${A.ic('arrow-up-right')}</a>`).join('')}
      <a href="updates.html">${A.esc(S.latestH)}${A.ic('arrow-up-right')}</a><a href="what-if.html">What if?${A.ic('scan-face')}</a></nav>
      <div class="sheet-cta"><a class="btn btn-light" href="${S.consult.h}" target="_blank" rel="noopener">${A.ic(S.consult.ic || 'whatsapp')}${A.esc(S.consult.x)}</a>
      <div class="lang" style="display:flex;justify-content:center;border-color:rgba(201,179,221,.3)">${langs}</div></div>`;
    document.body.append(sh);
    const toggle = v => { sh.classList.toggle('open', v); document.documentElement.style.overflow = v ? 'hidden' : ''; };
    A.qs('.burger', el).addEventListener('click', () => toggle(true));
    A.qs('.close', sh).addEventListener('click', () => toggle(false));
  }

  /* ---------- footer ---------- */
  function footer(){
    const S = A.shared, F = S.footer;
    const f = document.createElement('footer');
    f.className = 'ftr';
    const ext = h => /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
    const link = l => `<a href="${l.h}"${ext(l.h)}>${l.ic ? A.ic(l.ic) : ''}${A.esc(l.x)}</a>`;
    f.innerHTML = `<div class="wrap"><div class="ftr-top">
      <div class="brand"><img class="logo" src="${A.img(S.logoWhite)}" alt="APEX Hospital & Clinics by Apex Medical Center"><p>${A.esc(F.text)}</p>
        <a href="${S.aaciHref}" target="_blank" rel="noopener" style="display:inline-block;padding:0"><img class="aaci" src="${A.img(S.aaci)}" alt="AACI APEX Surgery Hospital Ploenchit"></a></div>
      ${F.cols.map(c => `<div><h5>${A.esc(c.h)}</h5>${c.links.map(link).join('')}</div>`).join('')}
      <div><h5>${A.esc(F.qr.h)}</h5><a href="${F.qr.href}"${ext(F.qr.href)} style="padding:0"><img class="qr" src="${A.img(F.qr.img)}" alt="${A.esc(F.qr.cap)}"></a><p style="margin-top:10px">${A.esc(F.qr.cap)}</p>
        <h5 style="margin-top:22px">${A.esc(F.followH)}</h5><div class="ftr-socials">${F.follow.map(s => `<a href="${s.h}" target="_blank" rel="noopener" aria-label="${A.esc(s.x || s.k)}">${A.socIcon(s.k)}</a>`).join('')}</div></div>
    </div>
    <div class="ftr-word" aria-hidden="true">APEX</div>
    ${F.note ? `<p class="ftr-note">${A.esc(F.note)}</p>` : ''}
    <div class="ftr-bot"><span>${A.esc(F.copyright)}</span><span>${[['th','TH'],['en','EN'],['zh','CN']].map(([c,t]) => `<a href="${A.langHref(c)}" hreflang="${c}" style="display:inline;padding:0 6px">${t}</a>`).join('·')}</span></div></div>`;
    document.body.append(f);
  }

  /* ---------- floating contact ---------- */
  function fab(){
    const S = A.shared;
    const d = document.createElement('div');
    d.className = 'fab';
    d.innerHTML = `<div class="fab-list">
      <a class="wa" href="${S.consult.h}" target="_blank" rel="noopener">${A.ic(S.consult.ic || 'whatsapp')}${A.esc(S.consult.x)}</a>
      <a class="ln" href="${S.line.h}" target="_blank" rel="noopener">${A.ic(S.line.ic || 'line')}${A.esc(S.line.x)}</a>
      <a class="ph" href="${S.phones[0].h}">${A.ic('phone')}${S.phones[0].x}</a></div>
      <button class="fab-btn" aria-label="${S.consult.x}" aria-expanded="false">${A.ic('message-circle')}</button>`;
    document.body.append(d);
    const b = A.qs('.fab-btn', d);
    b.addEventListener('click', () => { const o = d.classList.toggle('open'); b.setAttribute('aria-expanded', o); A.qs('.fab-btn', d).innerHTML = o ? A.ic('close') : A.ic('message-circle'); });
  }

  /* ---------- reveal ---------- */
  A.reveal = (root=document) => {
    const els = A.qsa('.rv:not(.in),.rv-clip:not(.in),[data-in]:not(.in)', root);
    if (!('IntersectionObserver' in window) || A.reduced) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px', threshold:.08});
    els.forEach((e,i) => { if (e.dataset.d) e.style.transitionDelay = e.dataset.d + 'ms'; io.observe(e); });
  };

  /* ---------- lightbox ---------- */
  let lb, list = [], idx = 0, mode = 'img';
  function ensureLB(){
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true');
    lb.innerHTML = `<div class="lb-stage"></div><button class="lb-x" aria-label="Close">${A.ic('close')}</button><button class="lb-prev" aria-label="Previous">${A.ic('chevron-left')}</button><button class="lb-next" aria-label="Next">${A.ic('chevron-right')}</button><div class="lb-count"></div>`;
    document.body.append(lb);
    A.qs('.lb-x', lb).onclick = close;
    A.qs('.lb-prev', lb).onclick = () => step(-1);
    A.qs('.lb-next', lb).onclick = () => step(1);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key==='Escape') close(); if (e.key==='ArrowLeft') step(-1); if (e.key==='ArrowRight') step(1); });
    let sx = null;
    lb.addEventListener('pointerdown', e => sx = e.clientX);
    lb.addEventListener('pointerup', e => { if (sx != null && Math.abs(e.clientX - sx) > 50 && mode==='img') step(e.clientX < sx ? 1 : -1); sx = null; });
  }
  function draw(){
    const st = A.qs('.lb-stage', lb);
    if (mode === 'yt') st.innerHTML = `<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/${list[0]}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube video"></iframe></div>`;
    else st.innerHTML = `<img src="${A.img(list[idx].src || list[idx])}" alt="${A.esc(list[idx].alt || '')}">`;
    const many = mode==='img' && list.length > 1;
    A.qs('.lb-prev', lb).style.display = A.qs('.lb-next', lb).style.display = many ? '' : 'none';
    A.qs('.lb-count', lb).textContent = many ? `${idx+1} / ${list.length}` : '';
  }
  function step(d){ idx = (idx + d + list.length) % list.length; draw(); }
  function close(){ lb.classList.remove('open'); setTimeout(() => { if (!lb.classList.contains('open')) A.qs('.lb-stage', lb).innerHTML = ''; }, 260); document.documentElement.style.overflow = ''; }
  A.lightbox = {
    images(items, i=0){ ensureLB(); mode='img'; list=items; idx=i; draw(); lb.classList.add('open'); document.documentElement.style.overflow='hidden'; },
    video(id){ ensureLB(); mode='yt'; list=[id]; draw(); lb.classList.add('open'); document.documentElement.style.overflow='hidden'; }
  };

  /* ---------- content renderer (service pages + articles) ---------- */
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
  A.fmtLi = x => {
    const e = A.esc(x);
    let m = x.match(/^([^:]{2,80}?)\s?:\s(.+)$/s);
    if (m && !/https?$/.test(m[1])) return `<strong>${A.esc(m[1])}:</strong> ${A.esc(m[2])}`;
    m = x.match(/^(.{8,150}?\?)\s(.+)$/s);
    if (m) return `<strong>${A.esc(m[1])}</strong> ${A.esc(m[2])}`;
    return e;
  };
  A.renderBlocks = (blocks, el) => {
    const toc = [];
    let html = '', galleryId = 0;
    A._galleries = A._galleries || [];
    for (const b of blocks) {
      switch (b.t) {
        case 'h2': { const id = 's-' + slug(b.x) + '-' + toc.length; toc.push({id, x:b.x}); html += `<h2 id="${id}">${A.esc(b.x)}</h2>`; break; }
        case 'h3': case 'h4': case 'h5': case 'h6': html += `<${b.t === 'h3' ? 'h3' : 'h4'}>${A.esc(b.x)}</${b.t === 'h3' ? 'h3' : 'h4'}>`; break;
        case 'p': {
          const cls = b.b ? ' class="b"' : (b.lead ? ' class="b"' : '');
          html += b.h && !/^tel:|^https?:\/\/wa\.me/.test(b.h) && b.x.length < 60 ? `<p${cls}><a href="${b.h}">${A.esc(b.x)}</a></p>` : `<p${cls}>${A.esc(b.x)}</p>`;
          break;
        }
        case 'list': {
          const tag = b.o ? 'ol' : 'ul';
          html += `<${tag}>${b.items.map(li => `<li>${li.h ? `<a href="${li.h}" ${/^https?:/.test(li.h)?'target="_blank" rel="noopener"':''}>${A.esc(li.x)}</a>` : A.fmtLi(li.x)}</li>`).join('')}</${tag}>`;
          break;
        }
        case 'img': html += `<figure class="rv-clip"><img loading="lazy" src="${A.img(b.src)}" alt="${A.esc(b.alt)}"></figure>`; break;
        case 'gallery': {
          const gi = A._galleries.push(b.items) - 1;
          const more = b.items.length - 6;
          html += `<div class="ba-gallery" data-g="${gi}">${b.items.slice(0, 6).map((s,i) => `<button data-i="${i}" aria-label="${i+1} / ${b.items.length}"><img loading="lazy" src="${A.img(s)}" alt="">${i === 5 && more > 0 ? `<span class="more">+${more}</span>` : ''}</button>`).join('')}</div>`;
          break;
        }
        case 'yt': html += `<div class="ytbox"><button data-yt="${b.id}" aria-label="${A.esc(A.t('Play video'))}"><img loading="lazy" src="${A.yt(b.id)}" alt=""><span class="pl">${A.ic('play')}</span></button></div>`; break;
        case 'faqs': html += `<div class="faq">${b.items.map(q => `<details><summary>${A.esc(q.q)}<span class="pm">${A.ic('plus')}</span></summary><div class="ans">${q.a.map(a => `<p>${A.esc(a.x)}</p>`).join('')}</div></details>`).join('')}</div>`; break;
        case 'btn': html += `<p><a class="btn btn-plum btn-sm" href="${b.h}" ${/^https?:/.test(b.h)?'target="_blank" rel="noopener"':''}>${A.esc(b.x)} ${A.ic('arrow-up-right')}</a></p>`; break;
        case 'table': html += `<div style="overflow-x:auto"><table>${b.rows.map(r => `<tr>${r.map(c => `<td>${A.esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`; break;
      }
    }
    el.innerHTML = html;
    el.addEventListener('click', e => {
      const g = e.target.closest('.ba-gallery button');
      if (g) { const items = A._galleries[+g.parentElement.dataset.g]; A.lightbox.images(items, +g.dataset.i); }
      const y = e.target.closest('[data-yt]');
      if (y) { y.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${y.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube video"></iframe>`; }
    });
    return toc;
  };
  A.tocSpy = (tocEl, ids) => {
    if (!tocEl || !ids.length) return;
    const links = A.qsa('a', tocEl), hs = ids.map(i => document.getElementById(i)).filter(Boolean);
    const f = () => {
      let cur = hs[0];
      for (const h of hs) if (h.getBoundingClientRect().top < innerHeight * .3) cur = h;
      links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + cur.id));
    };
    addEventListener('scroll', f, {passive:true}); f();
  };
  A.readBar = () => {
    const b = document.createElement('div'); b.className = 'read-bar'; document.body.append(b);
    const f = () => { const h = document.documentElement.scrollHeight - innerHeight; b.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
    addEventListener('scroll', f, {passive:true}); f();
  };
  A.crumbs = items => `<div class="crumbs">${items.map((it,i) => i < items.length-1 ? `<a href="${it[1]}">${A.esc(A.t(it[0]))}</a>${A.ic('chevron-right')}` : `<span>${A.esc(A.t(it[0]))}</span>`).join('')}</div>`;

  /* rail arrows */
  A.railCtrl = (rail, prev, next) => {
    const by = () => rail.clientWidth * .8;
    prev && prev.addEventListener('click', () => rail.scrollBy({left:-by(), behavior:'smooth'}));
    next && next.addEventListener('click', () => rail.scrollBy({left:by(), behavior:'smooth'}));
  };

  // static labels written in the HTML templates (English) get the page language's wording
  function translateStatic(){
    if (A.lang === 'en') return;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => { const k = n.nodeValue.trim(); if (k && A.t(k) !== k) n.nodeValue = n.nodeValue.replace(k, A.t(k)); });
    A.qsa('[aria-label],[title]').forEach(e => ['aria-label','title'].forEach(a => { const v = e.getAttribute(a); if (v && A.t(v) !== v) e.setAttribute(a, A.t(v)); }));
  }

  A.boot = (fn) => {
    const go = () => { translateStatic(); header(); fn && fn(); footer(); fab(); A.reveal(); document.dispatchEvent(new Event('apex:ready')); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  };
})();
