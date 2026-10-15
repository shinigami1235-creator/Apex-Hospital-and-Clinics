/* Inner pages: services, service detail, doctors, blog, article, about, contact, promotion, updates */
(function(){
  const A = window.APEX;
  const page = document.body.dataset.page;
  const labelOf = () => { const m = {}; A.shared.centers.forEach(c => c.items.forEach(it => { if (it.key && !m[it.key]) m[it.key] = {label:it.label, center:c.name, img:it.img}; })); return m; };
  const SIDE_SERVICES = [['Facelift Surgery','face-lift'],['Breast Augmentation','breast-augmentation'],['Rhinoplasty','nose-surgery'],['Double Eyelid Surgery','double-eyelid-surgery'],['HArmonyCa','harmonyca'],['Profhilo','profhilo'],['Coolsculpting','coolsculpting-elite'],['Ultherapy Prime','ultherapy-prime'],['Filler Injection','filler-injection'],['Laser Hair Removal','laser-hair-removal'],['Snoring Treatment','snore-laser']];
  const consultCard = () => {
    const S = A.shared;
    return `<div class="side-card"><h4>Give free consultation</h4>
      <a class="row" href="${S.phones[0].h}">${A.ic('phone')}${S.phones[0].x}</a>
      <a class="row" href="${S.consult.h}" target="_blank" rel="noopener">${A.ic('whatsapp')}+66 85 000 2001</a>
      <a class="row" href="https://lin.ee/mDmt5oV" target="_blank" rel="noopener">${A.ic('line')}@apexbeauty</a>
      <a class="btn btn-plum" href="${S.consult.h}" target="_blank" rel="noopener">${S.consult.x}</a></div>`;
  };
  const head = (crumbs, h1, extra='') => `<section class="phead"><div class="wrap">${A.crumbs(crumbs)}<h1 class="h-xl rv">${A.esc(h1)}</h1>${extra}</div></section>`;
  const main = () => A.qs('#main');

  /* ---------------- services ---------------- */
  function services(){
    const C = A.shared.centers, M = A.media;
    const surgical = [['face-lift'],['service/endotine-forehead-lift'],['service/eye-bags'],['breast-augmentation'],['nose-surgery'],['service/vaser-liposuction']];
    main().innerHTML = head([['Home','index.html'],['Services']], 'Services') + `
      <section class="section washed" style="padding-top:60px"><div class="wrap"><div class="atlas" id="atlas"></div></div></section>
      <section class="section"><div class="wrap">
        <div class="shead"><h2 class="h-l rv">${A.esc(M.surgical.length ? 'Surgical Services' : '')}</h2></div>
        <div class="rail" id="surg">${M.surgical.map((x,i) => { const key = surgical[i][0], s = A.services[key]; const img = s && s.thumb; return `<a class="prog rv" data-d="${i*60}" href="service.html?p=${key}"><div class="ph${img ? '' : ' tt'}">${img ? `<img loading="lazy" src="${A.img(img)}" alt="">` : `<span>${A.esc(x)}</span>`}</div><h3>${A.esc(x)}${A.ic('arrow-up-right')}</h3></a>`; }).join('')}</div>
      </div></section>
      <section class="section washed"><div class="wrap">
        <div class="centers-tabs" role="tablist" id="tabs">${C.map((c,i) => `<button class="chip" role="tab" aria-pressed="${i===0}" data-i="${i}">${A.esc(c.name)}</button>`).join('')}</div>
        <div class="center-grid" id="grid"></div>
      </div></section>`;
    const draw = i => {
      A.qs('#grid').innerHTML = C[i].items.map((it, k) => {
        const href = it.key ? 'service.html?p=' + it.key : it.href;
        return `<a class="svc-card${it.img ? '' : ' noimg'}" style="animation-delay:${k*45}ms" href="${href}" ${it.key ? '' : 'target="_blank" rel="noopener"'}><div class="ph">${it.img ? `<img loading="lazy" src="${A.img(it.img)}" alt="">` : `<span>${A.esc(it.label)}</span>`}</div><div class="tx"><b>${A.esc(it.label)}</b>${A.ic('arrow-up-right')}</div></a>`;
      }).join('');
    };
    A.qs('#tabs').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; A.qsa('.chip', A.qs('#tabs')).forEach(c => c.setAttribute('aria-pressed', c === b)); draw(+b.dataset.i); });
    const want = A.param('c'); const ci = Math.max(0, C.findIndex(c => c.name === want));
    if (ci) A.qs(`#tabs [data-i="${ci}"]`).click(); else draw(0);
  }

  /* ---------------- service detail ---------------- */
  function service(){
    const key = A.param('p'), s = A.services[key];
    if (!s) { location.replace('services.html'); return; }
    const L = labelOf()[key] || {};
    document.title = (s.title || '') + ' | Apex Medical Center';
    const shot = (s.hero && s.hero.src) || s.thumb;
    const meta = [s.date ? `${A.ic('calendar')}${A.esc(s.date)}` : '', L.center ? `<a href="services.html?c=${encodeURIComponent(L.center)}">${A.esc(L.center)}</a>` : ''].filter(Boolean).join('<span>·</span>');
    main().innerHTML = `<section class="phead"><div class="wrap svc-hero${shot ? "" : " one"}"><div>${A.crumbs([['Home','index.html'],['Services','services.html'],[L.label || s.title]])}<h1 class="h-xl rv">${A.esc(s.title)}</h1><div class="meta">${meta}</div></div>
        ${shot ? `<div class="shot rv-clip"><img src="${A.img(shot)}" alt="${A.esc((s.hero && s.hero.alt) || '')}"></div>` : ''}</div></section>
      <section class="section" style="padding-top:60px"><div class="wrap doc-layout">
        <nav class="toc" id="toc" aria-label="Table of contents"></nav>
        <article class="prose" id="prose"></article>
        <aside class="side" id="side"></aside></div></section>
      <section class="section washed" id="related"></section>`;
    const toc = A.renderBlocks(s.blocks, A.qs('#prose'));
    A.qs('#toc').innerHTML = toc.length > 1 ? `<h4>Table of contents</h4>${toc.map(t => `<a href="#${t.id}">${A.esc(t.x)}</a>`).join('')}` : '';
    if (toc.length < 2) A.qs('.doc-layout').classList.add('notoc');
    A.tocSpy(A.qs('#toc'), toc.map(t => t.id));
    const wi = ['service/botox','service/line-wrinkle','harmonyca','filler-injection','service/dermal-fillers'].includes(key);
    A.qs('#side').innerHTML = consultCard() + (wi ? `<a class="side-card" href="what-if.html" style="display:block;background:var(--night);color:#fff;border:0"><h4 style="color:#fff">What if?</h4><span class="link-arrow" style="color:var(--lilac-300)">${A.ic('scan-face')} Botox ${A.ic('arrow-right')}</span></a>` : '')
      + `<div class="side-card"><h4>Our Services</h4>${SIDE_SERVICES.map(([t,k]) => `<a class="row" href="service.html?p=${k}">${A.esc(t)}</a>`).join('')}</div>`;
    const center = A.shared.centers.find(c => c.name === L.center);
    if (center) {
      const items = center.items.filter(it => it.key !== key);
      A.qs('#related').innerHTML = `<div class="wrap"><div class="shead"><h2 class="h-l rv">${A.esc(center.name)}</h2><a class="link-arrow" href="services.html?c=${encodeURIComponent(center.name)}">All services ${A.ic('arrow-right')}</a></div>
        <div class="center-grid">${items.map(it => `<a class="svc-card${it.img ? '' : ' noimg'}" href="${it.key ? 'service.html?p=' + it.key : it.href}"><div class="ph">${it.img ? `<img loading="lazy" src="${A.img(it.img)}" alt="">` : `<span>${A.esc(it.label)}</span>`}</div><div class="tx"><b>${A.esc(it.label)}</b>${A.ic('arrow-up-right')}</div></a>`).join('')}</div></div>`;
    } else A.qs('#related').remove();
    A.readBar();
  }

  /* ---------------- doctors ---------------- */
  function doctors(){
    const D = A.doctors.list;
    main().innerHTML = head([['Home','index.html'],['Doctor teams']], A.doctors.page.h1) + `
      <section class="section" style="padding-top:50px"><div class="wrap dpanel" id="dpanel">
        <div class="droster"><label class="dsearch">${A.ic('search')}<input id="q" type="search" autocomplete="off" aria-label="Search"></label><div class="dlist" id="dlist" role="listbox" aria-label="Doctor teams"></div></div>
        <div class="dview" id="dview" aria-live="polite"></div></div></section>`;
    const list = A.qs('#dlist'), view = A.qs('#dview');
    list.innerHTML = D.map(d => `<button role="option" data-s="${d.slug}" aria-selected="false"><img loading="lazy" src="${A.img(d.img)}" alt=""><span><b>${A.esc(d.name)}</b><small>${A.esc(d.nick)}</small></span></button>`).join('');
    function show(slug, push){
      const d = D.find(x => x.slug === slug) || D[0];
      A.qsa('button', list).forEach(b => b.setAttribute('aria-selected', b.dataset.s === d.slug));
      const btn = A.qs(`[data-s="${d.slug}"]`, list); if (btn && push) btn.scrollIntoView({block:'nearest', inline:'center', behavior:'smooth'});
      view.innerHTML = `<div class="dcard"><div class="dphoto"><img src="${A.img(d.img)}" alt="${A.esc(d.thai)}"><div class="lic"><span>${A.esc(d.licenseLine || d.license)}</span>${d.check ? `<a href="${d.check.h}" target="_blank" rel="noopener" title="${A.esc(d.check.x)}" aria-label="${A.esc(d.check.x)}" style="color:#fff">${A.ic('badge-check')}</a>` : ''}</div></div>
        <div class="dinfo"><div class="dhead"><h2 class="dname">${A.esc(d.h1 || d.name)}</h2><p class="dnick">${A.esc(d.nickParen || '(' + d.nick + ')')}</p><p class="dthai">${A.esc(d.thai)}</p>
          ${d.check ? `<a class="btn btn-ghost on-light btn-sm" href="${d.check.h}" target="_blank" rel="noopener" style="color:var(--plum);margin-top:8px">${A.ic('badge-check')}${A.esc(d.check.x)}</a>` : ''}</div>
          <div class="dscroll" tabindex="0">${d.sections.map(sec => sec.items.length ? `<div class="dsec"><h3>${A.esc(sec.h)}</h3><ul>${sec.items.flatMap(it => it.split(' • ')).map(it => `<li>${A.fmtLi(it)}</li>`).join('')}</ul></div>` : '').join('')}</div>
        </div></div>`;
      const sc = A.qs('.dscroll', view); const edge = () => { sc.classList.toggle('top', sc.scrollTop < 4); sc.classList.toggle('end', sc.scrollTop + sc.clientHeight > sc.scrollHeight - 4); };
      sc.addEventListener('scroll', edge, {passive:true}); edge();
      if (push) history.replaceState(null, '', '#' + d.slug);
      if (push && innerWidth < 900) view.scrollIntoView({behavior:'smooth', block:'start'});
    }
    list.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.s, true); });
    list.addEventListener('keydown', e => {
      if (!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)) return;
      const bs = A.qsa('button:not([hidden])', list), i = bs.findIndex(b => b.getAttribute('aria-selected') === 'true');
      const n = bs[Math.max(0, Math.min(bs.length - 1, i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1)))];
      if (n) { e.preventDefault(); n.focus(); show(n.dataset.s, true); }
    });
    A.qs('#q').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      A.qsa('button', list).forEach(b => { const d = D.find(x => x.slug === b.dataset.s); b.hidden = q && !(d.name + ' ' + d.nick + ' ' + d.thai + ' ' + d.license).toLowerCase().includes(q); });
    });
    // with the panel on screen, the wheel over the portrait scrolls the credentials instead of the page
    const panel = A.qs('#dpanel');
    view.addEventListener('wheel', e => {
      const sc = A.qs('.dscroll', view); if (!sc || innerWidth < 900 || e.target.closest('.dscroll')) return;
      const r = panel.getBoundingClientRect(); if (r.top < -2 || r.bottom > innerHeight + 2) return;
      const can = e.deltaY > 0 ? sc.scrollTop + sc.clientHeight < sc.scrollHeight - 1 : sc.scrollTop > 0;
      if (can) { e.preventDefault(); sc.scrollTop += e.deltaY; }
    }, {passive:false});
    show(location.hash.slice(1), false);
    if (location.hash && innerWidth >= 900) setTimeout(() => panel.scrollIntoView({block:'center'}), 120);
    addEventListener('hashchange', () => show(location.hash.slice(1), false));
  }

  /* ---------------- blog ---------------- */
  function blog(){
    const P = A.posts, items = P.order.map(k => P.items[k]);
    main().innerHTML = head([['Home','index.html'],['Blog']], 'Blog') + `
      <section class="section" style="padding-top:60px"><div class="wrap">
        <a class="blog-feature rv" id="feat"></a>
        <div class="btools" style="justify-content:space-between"><div class="centers-tabs" style="margin:0" id="cats"></div><label class="bsearch" style="max-width:340px">${A.ic('search')}<input id="q" type="search" aria-label="Search"></label></div>
        <div class="blog-grid" id="grid" style="margin-top:30px"></div></div></section>`;
    const f = items[0];
    A.qs('#feat').href = 'article.html?p=' + f.key;
    A.qs('#feat').innerHTML = `<div class="ph"><img src="${A.img(f.img)}" alt="${A.esc(f.alt)}"></div><div><span class="cat">${A.esc(f.cat)}</span><h2 class="h-l">${A.esc(f.title)}</h2><p class="lead" style="margin-top:18px">${A.esc(f.excerpt)}</p><span class="link-arrow">Read More » </span></div>`;
    let cat = A.param('cat') || '';
    A.qs('#cats').innerHTML = [''].concat(P.page.cats).map(c => `<button class="chip" aria-pressed="${c === cat}" data-c="${c}">${c || 'Blog'}</button>`).join('');
    const draw = () => {
      const q = (A.qs('#q').value || '').toLowerCase();
      const list = items.filter((p, i) => (cat || q || i > 0) && (!cat || p.cat === cat) && (!q || (p.title + ' ' + p.excerpt).toLowerCase().includes(q)));
      A.qs('#grid').innerHTML = list.map((p, i) => `<a class="bpost" style="animation-delay:${Math.min(i, 8) * 40}ms" href="article.html?p=${p.key}"><div class="ph"><img loading="lazy" src="${A.img(p.img)}" alt="${A.esc(p.alt)}"></div><span class="cat" style="margin-top:14px">${A.esc(p.cat)}</span><h3>${A.esc(p.title)}</h3><p>${A.esc(p.excerpt || '')}</p></a>`).join('');
    };
    A.qs('#cats').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; cat = b.dataset.c; A.qsa('.chip', A.qs('#cats')).forEach(c => c.setAttribute('aria-pressed', c === b)); draw(); });
    A.qs('#q').addEventListener('input', draw);
    draw();
  }

  /* ---------------- article ---------------- */
  function article(){
    const key = A.param('p'), p = A.posts.items[key];
    if (!p) { location.replace('blog.html'); return; }
    document.title = p.h1 + ' | Apex Medical Center';
    const hero = (p.hero && p.hero.src) || p.img;
    main().innerHTML = `<section class="phead art"><div class="wrap"><div class="art-head">${A.crumbs([['Home','index.html'],['Blog','blog.html'],[p.cat, 'blog.html?cat=' + p.cat]])}<span class="cat" style="color:var(--lilac-300)">${A.esc(p.cat)}</span><h1 class="h-xl rv" style="max-width:none">${A.esc(p.h1)}</h1><div class="meta" style="color:var(--on-night-2);margin-top:20px">${p.date ? A.ic('calendar') + ' ' + A.esc(p.date) : ''}</div></div></div></section>
      <div class="wrap"><div class="art-hero rv-clip"><img src="${A.img(hero)}" alt="${A.esc(p.alt)}"></div></div>
      <section class="section" style="padding-top:60px"><div class="wrap doc-layout"><nav class="toc" id="toc"></nav><article class="prose" id="prose"></article><aside class="side" id="side"></aside></div></section>
      <section class="section washed"><div class="wrap"><div class="shead"><h2 class="h-l">Related articles</h2><a class="link-arrow" href="blog.html">Blog ${A.ic('arrow-right')}</a></div><div class="blog-grid" id="rel"></div></div></section>`;
    const toc = A.renderBlocks(p.blocks, A.qs('#prose'));
    A.qs('#toc').innerHTML = toc.length > 1 ? `<h4>Table of Content</h4>${toc.map(t => `<a href="#${t.id}">${A.esc(t.x)}</a>`).join('')}` : '';
    if (toc.length < 2) A.qs('.doc-layout').classList.add('notoc');
    A.tocSpy(A.qs('#toc'), toc.map(t => t.id));
    const share = encodeURIComponent(location.href);
    A.qs('#side').innerHTML = consultCard() + `<div class="side-card"><h4>Share :</h4><div class="ftr-socials" style="margin:0">
      <a style="background:var(--lilac-100);color:var(--plum)" href="https://www.facebook.com/sharer/sharer.php?u=${share}" target="_blank" rel="noopener" aria-label="Facebook">${A.ic('facebook')}</a>
      <a style="background:var(--lilac-100);color:var(--plum)" href="https://x.com/intent/post?url=${share}" target="_blank" rel="noopener" aria-label="X">${A.ic('x')}</a>
      <a style="background:var(--lilac-100);color:var(--plum)" href="https://social-plugins.line.me/lineit/share?url=${share}" target="_blank" rel="noopener" aria-label="LINE">${A.ic('line')}</a></div></div>
      <div class="side-card"><h4>Category</h4>${A.posts.page.cats.map(c => `<a class="row" href="blog.html?cat=${c}">${c}</a>`).join('')}</div>`;
    const rel = A.posts.order.filter(k => k !== key).map(k => A.posts.items[k]).sort((a, b) => (b.cat === p.cat) - (a.cat === p.cat)).slice(0, 3);
    A.qs('#rel').innerHTML = rel.map(r => `<a class="bpost" href="article.html?p=${r.key}"><div class="ph"><img loading="lazy" src="${A.img(r.img)}" alt="${A.esc(r.alt)}"></div><span class="cat" style="margin-top:14px">${A.esc(r.cat)}</span><h3>${A.esc(r.title)}</h3><p>${A.esc(r.excerpt || '')}</p></a>`).join('');
    A.readBar();
  }

  /* ---------------- about ---------------- */
  function about(){
    const B = A.about, H = A.home;
    const yr = s => A.esc(s).replace(/\b(19\d\d|20\d\d)\b/g, '<span class="yr">$1</span>');
    main().innerHTML = head([['Home','index.html'],[B.h1]], B.h1) + `
      <section class="section"><div class="wrap intro-grid">
        <div><h2 class="h-xl rv">${A.esc(B.h2)}</h2><p class="h-m plum-t rv" style="margin:20px 0 30px">${A.esc(B.sub)}</p>${B.lead.map(p => `<p class="lead rv">${A.esc(p)}</p>`).join('')}</div>
        <div class="intro-photo rv"><img src="${A.img(B.photo.src)}" alt="${A.esc(B.photo.alt)}"></div></div></section>
      <section class="section washed"><div class="wrap founder">
        <aside class="f-side"><div class="f-media"><div class="ph rv-clip"><img src="${A.img(B.founderImg)}" alt="${A.esc(B.founderName)}"></div>
            <nav class="f-rail" id="frail">${B.bio.map((p, i) => { const y = (p.match(/\b(19\d\d|20\d\d)\b/) || [])[1]; return `<button type="button" data-i="${i}" aria-label="${y || i + 1}"${y ? ' class="y"' : ''}>${y || String(i + 1).padStart(2, '0')}</button>`; }).join('')}</nav></div>
          <div class="cap"><b class="h-s b">${A.esc(B.founderName)}</b><p class="muted">${A.esc(B.founderRole)}</p><a class="link-arrow" href="doctors.html#dr-nantapat-supapannachart">Doctor teams ${A.ic('arrow-right')}</a></div></aside>
        <div class="bio" id="bio">${B.bio.map((p, i) => `<p data-i="${i}"${i && p.length < 170 ? ' class="big"' : ''}>${yr(p)}</p>`).join('')}</div></div></section>
      <section class="section plum"><div class="wrap why">
        <div class="why-sticky"><h2 class="h-xl rv">${A.esc(B.whyH)}</h2><p class="lead rv" style="margin-top:24px;color:var(--lilac-200)">${A.esc(B.whyIntro)}</p></div>
        <div>${B.why.map((w, i) => `<div class="why-row rv"><span class="why-ico" style="background:rgba(255,255,255,.12);color:#fff">${A.ic(['shield-check','stethoscope','layers'][i])}</span><div><h3>${A.esc(w.h)}</h3><p style="color:var(--lilac-200)">${A.esc(w.p)}</p></div></div>`).join('')}</div></div></section>
      <section class="section" style="padding-bottom:60px"><div class="wrap"><h2 class="h-m muted rv" style="text-align:center;margin-bottom:34px">${A.esc(H.partnersH)}</h2></div>
        <div class="marquee logos" id="logos" style="--d:70s"><div class="marquee-track">${H.partners.concat(H.partners).map(p => `<img loading="lazy" src="${A.img(p.img)}" alt="${A.esc(p.alt)}">`).join('')}</div></div></section>`;
    A.logoLens(A.qs('#logos'));
    // reading focus: the paragraph at eye level stays bright, the rail follows it
    const bio = A.qs('#bio'), ps = A.qsa('p', bio), rail = A.qs('#frail'), rb = A.qsa('button', rail);
    let at = -1;
    const read = () => {
      const line = innerHeight * .42; let k = 0;
      ps.forEach((p, i) => { if (p.getBoundingClientRect().top < line) k = i; });
      const r = bio.getBoundingClientRect();
      rail.style.setProperty('--p', Math.max(0, Math.min(1, (line - r.top) / r.height)).toFixed(3));
      if (k === at) return; at = k;
      ps.forEach((p, i) => p.classList.toggle('on', i === k)); rb.forEach((b, i) => b.classList.toggle('on', i === k));
    };
    bio.classList.add('reading'); addEventListener('scroll', read, {passive:true}); read();
    rail.addEventListener('click', e => { const b = e.target.closest('button'); if (b) ps[+b.dataset.i].scrollIntoView({behavior:'smooth', block:'center'}); });
  }

  /* ---------------- contact ---------------- */
  function contact(){
    const C = A.contact, S = A.shared;
    main().innerHTML = head([['Home','index.html'],[C.h1]], C.h1, `<p class="lead rv" style="max-width:60ch;margin-top:22px">${A.esc(C.intro)} <a href="branches.html" style="color:#fff">Our Branches</a></p>`) + `
      <section class="section"><div class="wrap contact-grid">
        <div>
          <div class="info-row rv"><span class="ic">${A.ic('building-2')}</span><div><small>${A.esc(C.office)}</small><b>${A.esc(C.address)}</b></div></div>
          <a class="info-row rv" href="${S.phones[0].h}"><span class="ic">${A.ic('phone')}</span><div><small>${A.esc(C.phoneLabel)}</small><b>${A.esc(C.phone)}</b></div></a>
          <div class="info-row rv"><span class="ic">${A.ic('clock')}</span><div><small>${A.esc(C.hoursLabel)}</small><b>${A.esc(C.hours)}</b></div></div>
          <h3 class="h-s b" style="margin:34px 0 14px">${A.esc(C.other)}</h3>
          <div class="socgrid" style="margin:0">${S.socials.map(s => `<a class="chip" href="${s.h}" target="_blank" rel="noopener" style="height:42px">${A.socIcon(s.k)}${A.esc(s.x)}</a>`).join('')}</div>
        </div>
        <div><h2 class="h-m rv" style="margin-bottom:18px">${A.esc(C.officeH)}</h2><div class="mapbox rv"><iframe loading="lazy" title="${A.esc(C.officeH)}" src="${C.mapSrc}"></iframe></div></div>
      </div></section>
      <section class="section" style="padding-top:0"><div class="wrap"><div class="consult" style="grid-template-columns:1fr"><div style="position:relative"><h2 class="h-xl">${A.esc(C.inquire)}</h2>
        <div class="ch-list" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:30px">
          <a class="ch" href="${S.phones[0].h}"><span class="ic">${A.ic('phone')}</span><b>${S.phones[0].x}</b></a>
          <a class="ch" href="${S.phones[1].h}"><span class="ic">${A.ic('phone')}</span><b>${S.phones[1].x}</b></a>
          <a class="ch" href="https://lin.ee/XfA7ouT" target="_blank" rel="noopener"><span class="ic">${A.ic('line')}</span><b>@APEX International</b></a>
          <a class="ch" href="${S.consult.h}" target="_blank" rel="noopener"><span class="ic">${A.ic('whatsapp')}</span><b>${S.consult.x}</b></a>
        </div></div></div></div></section>`;
  }

  /* ---------------- promotion ---------------- */
  function promotion(){
    const P = A.promo;
    main().innerHTML = head([['Home','index.html'],[P.h1]], P.h1, `<p class="lead rv" style="max-width:60ch;margin-top:22px">${A.esc(P.note)}</p>`) + `
      <section class="section"><div class="wrap"><div class="results" id="pgrid" style="columns:3 280px">${P.promos.map((p, i) => `<figure class="rv" data-i="${i}"><img loading="lazy" src="${A.img(p.img)}" alt="${A.esc(p.alt)}"></figure>`).join('')}</div></div></section>
      <section class="section washed"><div class="wrap"><div class="shead"><h2 class="h-l">Promotion</h2><a class="link-arrow" href="blog.html?cat=Promotion">Blog ${A.ic('arrow-right')}</a></div>
        <div class="blog-grid">${P.posts.map(r => `<a class="bpost" href="article.html?p=${r.key}"><div class="ph"><img loading="lazy" src="${A.img(r.img)}" alt="${A.esc(r.alt)}"></div><span class="cat" style="margin-top:14px">${A.esc(r.cat)}</span><h3>${A.esc(r.title)}</h3><p>${A.esc(r.excerpt || '')}</p></a>`).join('')}</div></div></section>`;
    A.qs('#pgrid').addEventListener('click', e => { const f = e.target.closest('figure'); if (f) A.lightbox.images(P.promos.map(p => ({src:p.img, alt:p.alt})), +f.dataset.i); });
  }

  /* ---------------- updates (facebook + youtube) ---------------- */
  function updates(){
    const M = A.media, H = A.home;
    const fb = (url, name) => `<div class="fbframe rv"><div class="fbhead">${A.ic('facebook')}<a href="${url}" target="_blank" rel="noopener"><b>${A.esc(name)}</b></a></div><iframe loading="lazy" height="760" title="${A.esc(name)} on Facebook" src="https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(url)}&tabs=timeline,events&width=480&height=760&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false" allow="encrypted-media"></iframe></div>`;
    main().innerHTML = head([['Home','index.html'],[H.latestH]], H.latestH) + `
      <section class="section" style="padding-top:60px"><div class="wrap"><div class="fb-duo">${fb('https://www.facebook.com/ApexInterThailand/', 'Apex International Thailand')}${fb('https://www.facebook.com/ApexProfoundBeauty/', 'APEX Hospital & Beauty Clinic')}</div></div></section>
      <section class="section night"><div class="wrap"><div class="shead"><h2 class="h-l"><a href="${M.videos.channel}" target="_blank" rel="noopener">${A.ic('youtube')} Apex Beauty Clinic</a></h2></div>
        <div class="blog-grid" id="vids">${M.videos.hero.concat(M.videos.library).map(v => `<div class="vcard" style="width:auto"><button data-v="${v.id}"><div class="vthumb"><img loading="lazy" src="${A.yt(v.id)}" alt=""><span class="pl">${A.ic('play')}</span>${v.len ? `<span class="len">${v.len}</span>` : ''}</div><h4>${A.esc(v.t)}</h4></button></div>`).join('')}</div></div></section>
      <section class="section washed"><div class="wrap"><div class="shead"><h2 class="h-l">Blog</h2><a class="link-arrow" href="blog.html">Blog ${A.ic('arrow-right')}</a></div>
        <div class="blog-grid">${H.posts.map(r => `<a class="bpost" href="article.html?p=${r.key}"><div class="ph"><img loading="lazy" src="${A.img(r.img)}" alt="${A.esc(r.alt)}"></div><span class="cat" style="margin-top:14px">${A.esc(r.cat)}</span><h3>${A.esc(r.title)}</h3><p>${A.esc(r.excerpt || '')}</p></a>`).join('')}</div></div></section>`;
    A.qs('#vids').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b) A.lightbox.video(b.dataset.v); });
  }

  const R = {services, service, doctors, blog, article, about, contact, promotion, updates};
  if (R[page]) A.boot(R[page]);
})();
