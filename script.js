(() => {
  const d = document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  d.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const portrait = $('#portrait');
  const go = () => portrait && portrait.classList.add('go');
  const loader = $('.loader');
  let seen = false;
  try { seen = sessionStorage.getItem('seen') === '1'; } catch (e) {}
  if (loader && !seen && !reduce) {
    loader.hidden = false;
    const bar = $('#bar'), pct = $('#pct');
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 14));
      bar.style.width = n + '%';
      pct.textContent = String(n).padStart(2, '0') + '%';
      if (n === 100) {
        clearInterval(t);
        setTimeout(() => { loader.classList.add('out'); setTimeout(go, 300); setTimeout(() => loader.remove(), 700); }, 200);
      }
    }, 60);
    try { sessionStorage.setItem('seen', '1'); } catch (e) {}
  } else { if (loader) loader.remove(); go(); }

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
  const targets = $$('.rv, .cat, .job, .stats, .card');
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
