(() => {
  const d = document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  d.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const root = d.documentElement;
  const portrait = $('#portrait');
  const go = () => { root.classList.add('ready'); if (portrait) portrait.classList.add('go'); };
  const loader = $('.loader'), fx = $('.lo-fx');
  let seen = false;
  try { seen = sessionStorage.getItem('seen') === '1'; } catch (e) {}
  if (/[?&]loader/.test(location.search)) seen = false;

  const runLoader = () => {
    const svg = $('.lo-svg'), pct = $('#pct');
    const letters = ['R', 'A', 'S', 'H', 'Q', 'T'];
    const xs = letters.map((_, i) => 88 + i * 164.8);
    const wave = 'M-500 0 ' + 'q62.5 -28 125 0 t125 0 '.repeat(8) + 'V400 H-500Z';
    let defs = '', body = '';
    letters.forEach((ch, i) => {
      defs += `<clipPath id="lc${i}"><text class="lo-t" x="${xs[i]}" y="215">${ch}</text></clipPath>`;
      body += `<g class="lo-l"><text class="lo-t lo-out" x="${xs[i]}" y="215">${ch}</text><g clip-path="url(#lc${i})"><g class="lo-wt"><path class="lo-w2" d="${wave}"/><path class="lo-w1" d="${wave}"/></g></g></g>`;
    });
    svg.innerHTML = `<defs>${defs}</defs>${body}`;
    const waters = $$('.lo-wt'), lets = $$('.lo-l');
    const Y0 = 235, Y1 = 68;
    const setLevel = (p, t) => {
      const y = Y0 - (Y0 - Y1) * p + Math.sin(t / 260) * 3 * (1 - p * .5);
      waters.forEach(w => w.setAttribute('transform', `translate(0 ${y.toFixed(1)})`));
      pct.textContent = String(Math.round(p * 100)).padStart(2, '0') + '%';
    };
    setLevel(0, 0);

    const reveal = () => {
      const R = Math.hypot(innerWidth, innerHeight) / 2 + 24, t1 = performance.now();
      const step = t => {
        const p = clamp((t - t1) / 950, 0, 1), r = R * p * p;
        const g = `radial-gradient(circle at 50% 50%, transparent ${r}px, #000 ${r + 1}px)`;
        loader.style.webkitMaskImage = g;
        loader.style.maskImage = g;
        if (p < 1) requestAnimationFrame(step);
        else { loader.remove(); root.style.overflow = ''; }
      };
      requestAnimationFrame(step);
    };

    const burst = box => {
      const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      const ring = d.createElement('div');
      ring.className = 'lo-ring';
      ring.style.left = cx + 'px';
      ring.style.top = cy + 'px';
      fx.append(ring);
      const big = Math.hypot(innerWidth, innerHeight) * 1.1 + 'px';
      ring.animate([{ width: '10px', height: '10px', opacity: .9 }, { width: big, height: big, opacity: 0 }], { duration: 1000, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' });
      const n = innerWidth < 600 ? 46 : 84;
      for (let i = 0; i < n; i++) {
        const p = d.createElement('div');
        const s = 4 + Math.random() * 10;
        const x0 = (Math.random() - .5) * box.width * .9, y0 = (Math.random() - .5) * box.height * .5;
        const a = Math.random() * Math.PI * 2, dist = 140 + Math.random() * Math.max(innerWidth, innerHeight) * .45;
        p.className = 'lo-p';
        p.style.cssText = `left:${cx}px;top:${cy}px;width:${s}px;height:${s}px;background:${Math.random() < .7 ? '#d9ff35' : '#f1efe7'};border-radius:${Math.random() < .4 ? '50%' : '2px'}`;
        fx.append(p);
        p.animate([
          { transform: `translate(${x0}px,${y0}px) rotate(0deg)`, opacity: 1 },
          { transform: `translate(${x0 + Math.cos(a) * dist}px,${y0 + Math.sin(a) * dist}px) rotate(${(Math.random() - .5) * 720}deg)`, opacity: 0 }
        ], { duration: 700 + Math.random() * 600, easing: 'cubic-bezier(.1,.7,.2,1)', fill: 'forwards' });
      }
      setTimeout(() => fx.remove(), 1600);
    };

    const explode = () => {
      loader.classList.add('full');
      const box = svg.getBoundingClientRect();
      setTimeout(() => {
        lets.forEach((l, i) => {
          const dx = (xs[i] - 500) * 1.5 + (Math.random() - .5) * 120, dy = (Math.random() - .5) * 700;
          l.animate([
            { transform: 'none', opacity: 1 },
            { transform: `translate(${dx}px,${dy}px) rotate(${(Math.random() - .5) * 240}deg) scale(1.9)`, opacity: 0 }
          ], { duration: 850, easing: 'cubic-bezier(.15,.7,.2,1)', fill: 'forwards' });
        });
        burst(box);
        setTimeout(() => { go(); reveal(); }, 260);
      }, 220);
    };

    let loaded = d.readyState === 'complete', t0 = 0;
    addEventListener('load', () => { loaded = true; });
    setTimeout(() => { loaded = true; }, 4500);
    const tick = t => {
      const pt = clamp((t - t0) / 2600, 0, 1);
      let p = pt < .5 ? 2 * pt * pt : 1 - Math.pow(-2 * pt + 2, 2) / 2;
      if (!loaded) p = Math.min(p, .96);
      if (pt >= 1 && loaded) { setLevel(1, t); explode(); return; }
      setLevel(p, t);
      requestAnimationFrame(tick);
    };
    const begin = () => { t0 = performance.now(); requestAnimationFrame(tick); };
    const fontReady = d.fonts && d.fonts.load ? d.fonts.load('900 100px Unbounded', 'RASHQT') : Promise.resolve();
    Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))]).then(begin, begin);
  };

  if (loader && !seen && !reduce) {
    root.style.overflow = 'hidden';
    setTimeout(() => { root.style.overflow = ''; }, 14000);
    try { sessionStorage.setItem('seen', '1'); } catch (e) {}
    runLoader();
  } else {
    if (loader) loader.remove();
    if (fx) fx.remove();
    go();
  }

  $$('.card').forEach((c, i) => c.style.setProperty('--d', (i % 3) * 90 + 'ms'));
  $$('.pills').forEach(ul => [...ul.children].forEach((li, i) => {
    li.style.setProperty('--d', i * 45 + 'ms');
    li.addEventListener('pointermove', e => {
      const r = li.getBoundingClientRect();
      li.style.setProperty('--mx', e.clientX - r.left + 'px');
      li.style.setProperty('--my', e.clientY - r.top + 'px');
    });
    const [kind, name] = (li.dataset.i || '').split(':');
    if (!name) return;
    if (kind === 'g') {
      li.insertAdjacentHTML('afterbegin', `<svg class="g ic" aria-hidden="true"><use href="#${name}"/></svg>`);
      return;
    }
    const img = new Image();
    img.className = 'ic';
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => img.remove();
    img.src = kind === 'd'
      ? `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`
      : `https://cdn.simpleicons.org/${name}/f1efe7`;
    li.prepend(img);
  }));

  const count = el => {
    const n = +el.dataset.count;
    if (reduce) { el.textContent = n; return; }
    const t0 = performance.now();
    const step = t => {
      const p = clamp((t - t0) / 1100, 0, 1);
      el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const reveal = el => {
    el.classList.add('in');
    if (el.classList.contains('stats')) $$('[data-count]').forEach(count);
  };

  const links = $$('.top nav a'), header = $('.top');
  const targets = $$('.rv, .cat, .soc, .job, .stats, .card');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
    }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(e => io.observe(e));

    const so = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      header.dataset.theme = e.target.dataset.theme || 'dark';
      const id = '#' + e.target.id;
      links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === id));
    }), { rootMargin: '-5% 0px -92% 0px' });
    $$('main section[data-theme], .footer').forEach(s => so.observe(s));
  } else targets.forEach(reveal);

  const stack = $('#stack'), model = $('#model'), tl = $('#tl');
  const update = () => {
    const y = Math.min(scrollY, innerHeight);
    if (portrait) portrait.style.setProperty('--y', y * .25 + 'px');
    if (stack && model) {
      const r = stack.getBoundingClientRect();
      const p = reduce ? .6 : clamp(-r.top / (r.height - innerHeight), 0, 1);
      model.style.setProperty('--gap', 6 + p * model.offsetWidth * .3 + 'px');
      model.style.setProperty('--rz', p * 50 + 'deg');
    }
    if (tl) {
      const line = innerHeight * .6, r = tl.getBoundingClientRect();
      tl.style.setProperty('--p', reduce ? 1 : clamp((line - r.top) / r.height, 0, 1));
      $$('.job').forEach(j => j.classList.toggle('on', reduce || j.getBoundingClientRect().top < line));
    }
  };
  let busy = false;
  const onScroll = () => { if (busy) return; busy = true; requestAnimationFrame(() => { update(); busy = false; }); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  if (matchMedia('(hover: hover)').matches && !reduce) {
    $$('.card').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  const hero = $('.hero');
  if (portrait && hero && matchMedia('(hover: hover)').matches && !reduce) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      portrait.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      portrait.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => { portrait.style.setProperty('--px', 0); portrait.style.setProperty('--py', 0); });
  }

  const slides = $('.slides');
  if (slides) addEventListener('load', () => {
    const imgs = [...slides.querySelectorAll('img')];
    if (!imgs.length) return;
    const dots = slides.querySelector('.dots'), count = slides.querySelector('.count');
    const pad = n => String(n).padStart(2, '0');
    let i = 0, timer = 0, visible = false;
    const show = n => {
      const old = imgs[i];
      i = n;
      imgs.forEach(m => m.classList.remove('prev'));
      if (old !== imgs[i]) { old.classList.remove('on'); old.classList.add('prev'); setTimeout(() => old.classList.remove('prev'), 1000); }
      imgs[i].classList.add('on');
      [...dots.children].forEach((b, k) => b.classList.toggle('on', k === i));
      count.textContent = pad(i + 1) + ' / ' + pad(imgs.length);
    };
    const restart = () => {
      clearInterval(timer);
      if (reduce || !visible || imgs.length < 2) return;
      timer = setInterval(() => show((i + 1) % imgs.length), 3600);
    };
    if (imgs.length > 1) imgs.forEach((_, k) => {
      const b = d.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show image ' + (k + 1));
      b.addEventListener('click', () => { show(k); restart(); });
      dots.append(b);
    });
    show(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; restart(); }, { threshold: .3 }).observe(slides);
    } else { visible = true; restart(); }
  });

  const f = $('#form'), st = $('#status');
  if (f) f.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(f);
    if (f.action.includes('YOUR_FORM_ID')) {
      const body = `${data.get('message')}\n\nFrom: ${data.get('name')} (${data.get('email')})`;
      location.href = 'mailto:workforrash@gmail.com?subject=' + encodeURIComponent('Portfolio message from ' + data.get('name')) + '&body=' + encodeURIComponent(body);
      st.textContent = 'Opening your email app. If nothing opens, write to workforrash@gmail.com.';
      return;
    }
    const b = f.querySelector('button');
    b.disabled = true; b.textContent = 'Sending…'; st.textContent = '';
    try {
      const r = await fetch(f.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('bad response');
      f.reset(); st.textContent = 'Message sent. I will reply soon.';
    } catch (err) {
      st.textContent = 'Could not send. Please email workforrash@gmail.com.';
    }
    b.disabled = false; b.textContent = 'Send message';
  });
})();
