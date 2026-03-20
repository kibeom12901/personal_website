const canvas = document.getElementById('liquid-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const dot = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
const hint = document.getElementById('hint');
const current = location.pathname.split('/').pop() || 'index.html';
const QUICK_HIDE_KEY = 'quick_questions_hidden';
const staticUI = document.body.classList.contains('static-ui');
const enableRainbow = current === 'index.html';

if (!enableRainbow) {
  document.body.classList.add('no-rainbow');
}

if (enableRainbow && canvas && ctx) {
  let W;
  let H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: -999, y: -999, px: -999, py: -999 };
  const vel = { x: 0, y: 0 };
  let hasMoved = false;
  let hue = 200;
  let lastDist = 0;
  const blobs = [];

  window.addEventListener('mousemove', (e) => {
    if (!hasMoved) {
      hasMoved = true;
      if (hint) hint.classList.add('hidden');
    }

    vel.x = (e.clientX - mouse.x) * 0.55 + vel.x * 0.45;
    vel.y = (e.clientY - mouse.y) * 0.55 + vel.y * 0.45;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (dot) {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
    }

    if (ring) {
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
    }
  });

  function spawnBlobs(x, y, vx, vy) {
    const speed = Math.sqrt(vx * vx + vy * vy) || 0.1;
    const count = Math.min(6, 2 + Math.floor(speed / 6));

    for (let i = 0; i < count; i += 1) {
      const px = -vy / speed;
      const py = vx / speed;
      const lat = (Math.random() - 0.5) * Math.min(speed * 5, 90);
      const fwd = Math.random() * Math.min(speed * 2, 30);
      const jitterX = (Math.random() - 0.5) * 1.8;
      const jitterY = (Math.random() - 0.5) * 1.8;

      blobs.push({
        x: x + px * lat + (vx / speed) * fwd,
        y: y + py * lat + (vy / speed) * fwd,
        vx: vx * 0.04 + jitterX,
        vy: vy * 0.04 + jitterY,
        r: 55 + Math.random() * 90,
        hue: hue + (Math.random() - 0.5) * 28,
        alpha: 0.5 + Math.random() * 0.28,
        life: 1,
        decay: 0.004 + Math.random() * 0.004,
        grow: 0.4 + Math.random() * 0.9,
      });
    }

    hue = (hue + 1.8) % 360;
  }

  function render() {
    requestAnimationFrame(render);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255,255,255,0.008)';
    ctx.fillRect(0, 0, W, H);

    if (!hasMoved) return;

    const dist = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py);
    lastDist = dist;

    if (dist > 2) {
      spawnBlobs(mouse.x, mouse.y, vel.x, vel.y);
      mouse.px = mouse.x;
      mouse.py = mouse.y;
    }

    for (let i = blobs.length - 1; i >= 0; i -= 1) {
      const b = blobs[i];
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= 0.97;
      b.vy *= 0.97;
      b.r += b.grow;
      b.life -= b.decay;

      if (b.life <= 0) {
        blobs.splice(i, 1);
        continue;
      }

      const a = b.alpha * b.life * b.life;
      const r = b.r;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, `hsla(${b.hue}, 100%, 68%, ${a})`);
      g.addColorStop(0.3, `hsla(${b.hue + 20}, 98%, 72%, ${a * 0.72})`);
      g.addColorStop(0.6, `hsla(${b.hue + 40}, 95%, 76%, ${a * 0.35})`);
      g.addColorStop(1, `hsla(${b.hue + 60}, 85%, 82%, 0)`);

      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    if (lastDist > 1) {
      const tipR = 52;
      const g2 = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, tipR);
      g2.addColorStop(0, `hsla(${hue}, 100%, 75%, 0.75)`);
      g2.addColorStop(0.45, `hsla(${hue + 25}, 100%, 70%, 0.38)`);
      g2.addColorStop(1, `hsla(${hue + 50}, 100%, 82%, 0)`);
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, tipR, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();
    }

    if (blobs.length > 700) blobs.splice(0, blobs.length - 700);
  }

  render();
}

[...document.querySelectorAll('.nav-item')].forEach((el) => {
  const href = el.getAttribute('href') || '';
  if (href === current) el.classList.add('active');
});

function ensureMoreNavButton() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;
  if (nav.querySelector('.nav-more')) return;
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'nav-item nav-more';
  more.setAttribute('aria-label', 'More');
  more.textContent = '⋯';
  nav.appendChild(more);
}

const MORE_QUESTION_GROUPS = [
  {
    title: 'Me',
    icon: '🧑‍💼',
    items: [
      'Who are you?',
      'What are your passions?',
      'How did you get started in engineering?',
      'Where do you see yourself in 5 years?',
    ],
  },
  {
    title: 'Professional',
    icon: '💼',
    items: [
      'Can I see your resume?',
      'What internship experience do you have?',
      'What projects are you most proud of?',
    ],
  },
  {
    title: 'Skills',
    icon: '🎓',
    items: [
      'What are your skills?',
      'What embedded tools do you use most?',
      'What programming languages are you strongest in?',
    ],
  },
  {
    title: 'Fun',
    icon: '🎉',
    items: [
      'What do you do outside of engineering?',
      'Tell me about skiing and golf.',
      'Where is that travel photo from?',
      'Mac or PC?',
    ],
  },
  {
    title: 'Contact & Future',
    icon: '✉️',
    items: [
      'How can I reach you?',
      'What kind of role are you looking for?',
      'Where are you located?',
    ],
  },
];

function closeMoreQuestionsSheet() {
  document.body.classList.remove('more-sheet-open');
  const backdrop = document.querySelector('.more-sheet-backdrop');
  const sheet = document.querySelector('.more-sheet');
  if (backdrop) backdrop.classList.remove('show');
  if (sheet) sheet.classList.remove('show');
}

function submitMoreQuestion(question) {
  closeMoreQuestionsSheet();
  if (current === 'chat.html' && typeof window.__sendPortfolioChat === 'function') {
    window.__sendPortfolioChat(question);
    return;
  }
  location.href = `chat.html?query=${encodeURIComponent(question)}`;
}

function attachMoreQuestionsSheet() {
  const trigger = document.querySelector('.nav-more');
  if (!trigger) return;

  let backdrop = document.querySelector('.more-sheet-backdrop');
  let sheet = document.querySelector('.more-sheet');

  if (!backdrop) {
    backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'more-sheet-backdrop';
    backdrop.setAttribute('aria-label', 'Close questions');
    document.body.appendChild(backdrop);
  }

  if (!sheet) {
    sheet = document.createElement('section');
    sheet.className = 'more-sheet';
    sheet.innerHTML = `
      <div class="more-sheet-inner">
        <div class="more-sheet-handle"></div>
        ${MORE_QUESTION_GROUPS.map((group) => `
          <div class="more-sheet-group">
            <h3 class="more-sheet-title">
              <span>${group.icon}</span>
              <span>${group.title}</span>
            </h3>
            <div class="more-sheet-items">
              ${group.items.map((item, index) => `
                <button class="more-sheet-question${index === 0 ? ' primary' : ''}" type="button" data-question="${item.replace(/"/g, '&quot;')}">
                  <span>${item}</span>
                  <span class="more-sheet-question-arrow">›</span>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    document.body.appendChild(sheet);
  }

  const openSheet = () => {
    document.body.classList.add('more-sheet-open');
    backdrop.classList.add('show');
    sheet.classList.add('show');
  };

  trigger.addEventListener('click', openSheet);
  backdrop.addEventListener('click', closeMoreQuestionsSheet);

  sheet.addEventListener('click', (event) => {
    const btn = event.target.closest('.more-sheet-question');
    if (!btn) return;
    submitMoreQuestion(btn.getAttribute('data-question') || '');
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMoreQuestionsSheet();
  });
}

function createScreenLoader() {
  let loader = document.querySelector('.screen-loader');
  if (loader) return loader;
  loader = document.createElement('div');
  loader.className = 'screen-loader';
  loader.innerHTML = `
    <div class="loader-typing"><span></span><span></span><span></span></div>
    <p class="loader-label">Loading...</p>
  `;
  document.body.appendChild(loader);
  return loader;
}

function withLoadingParam(url, prompt) {
  const parsed = new URL(url, window.location.href);
  parsed.searchParams.set('loading', '1');
  if (prompt) parsed.searchParams.set('prompt', prompt);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function attachNavTransitions() {
  const navLinks = [...document.querySelectorAll('.bottom-nav .nav-item')];
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      event.preventDefault();
      const pageName = href.replace('.html', '').toLowerCase();
      const labelMap = {
        me: 'profile',
        projects: 'projects',
        skills: 'skills',
        fun: 'fun side',
        contact: 'contact details',
      };
      const prompt = `Show me your ${labelMap[pageName] || 'details'}.`;
      window.location.href = withLoadingParam(href, prompt);
    });
  });
}

function initProjectCarousel() {
  const row = document.querySelector('.project-row');
  const track = document.querySelector('.project-track');
  const prev = document.querySelector('.project-arrow-prev');
  const next = document.querySelector('.project-arrow-next');
  if (!row || !track || !prev || !next) return;

  const cards = [...track.querySelectorAll('.project-tile')];
  if (!cards.length) return;

  let index = 0;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let dragDelta = 0;
  let wheelLocked = false;

  const getVisibleCards = () => {
    const raw = getComputedStyle(row).getPropertyValue('--visible-cards').trim();
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 3;
  };

  const getMaxIndex = () => Math.max(0, cards.length - getVisibleCards());
  const getStep = () => {
    const gap = Number.parseFloat(getComputedStyle(track).gap || '0') || 0;
    const cardWidth = cards[0].getBoundingClientRect().width;
    return cardWidth + gap;
  };

  const render = () => {
    const step = getStep();
    track.style.transform = `translateX(${-index * step}px)`;
    prev.disabled = index <= 0;
    next.disabled = index >= getMaxIndex();
  };

  prev.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    render();
  });

  next.addEventListener('click', () => {
    index = Math.min(getMaxIndex(), index + 1);
    render();
  });

  window.addEventListener('resize', () => {
    index = Math.min(index, getMaxIndex());
    render();
  });

  const onPointerMove = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragDelta = event.clientX - startX;
    const step = getStep();
    const minTranslate = -getMaxIndex() * step;
    const baseTranslate = -index * step;
    let nextTranslate = baseTranslate + dragDelta;

    // Apply a little resistance when dragging past edges.
    if (nextTranslate > 0) nextTranslate *= 0.25;
    if (nextTranslate < minTranslate) {
      nextTranslate = minTranslate + (nextTranslate - minTranslate) * 0.25;
    }

    track.style.transform = `translateX(${nextTranslate}px)`;
  };

  const endDrag = (event) => {
    if (!dragging || (event && event.pointerId !== pointerId)) return;
    dragging = false;
    pointerId = null;
    track.classList.remove('dragging');

    const threshold = 45;
    if (dragDelta <= -threshold) {
      index = Math.min(getMaxIndex(), index + 1);
    } else if (dragDelta >= threshold) {
      index = Math.max(0, index - 1);
    }
    dragDelta = 0;
    render();
  };

  track.addEventListener('pointerdown', (event) => {
    const isMouse = event.pointerType === 'mouse';
    if ((isMouse && event.button !== 0) || getMaxIndex() <= 0) return;
    dragging = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    dragDelta = 0;
    track.classList.add('dragging');
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener('pointermove', onPointerMove);
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', endDrag);

  row.addEventListener(
    'wheel',
    (event) => {
      if (getMaxIndex() <= 0) return;

      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      if (absX <= absY || absX < 4) return;

      event.preventDefault();
      if (wheelLocked) return;

      const direction = event.deltaX > 0 ? 1 : -1;
      const maxIndex = getMaxIndex();

      // Primary move based on wheel direction.
      let nextIndex = Math.min(maxIndex, Math.max(0, index + direction));

      // If direction mapping is inverted on a device and hits an edge,
      // try the opposite direction so both swipes remain usable.
      if (nextIndex === index) {
        nextIndex = Math.min(maxIndex, Math.max(0, index - direction));
      }
      if (nextIndex === index) return;

      index = nextIndex;
      wheelLocked = true;
      render();
      setTimeout(() => {
        wheelLocked = false;
      }, 170);
    },
    { passive: false }
  );

  render();
}

function attachProjectImageFallbacks() {
  const imgs = [...document.querySelectorAll('img[data-fallback-srcs]')];
  imgs.forEach((img) => {
    const fallbackList = (img.getAttribute('data-fallback-srcs') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!fallbackList.length) return;

    let idx = 0;
    img.addEventListener('error', () => {
      if (idx >= fallbackList.length) return;
      const nextSrc = fallbackList[idx];
      idx += 1;
      img.src = nextSrc;
    });
  });
}

function runArrivalTypingReveal() {
  if (staticUI) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('loading') !== '1') return;

  const overlay = document.createElement('div');
  overlay.className = 'page-loader-overlay show';
  document.body.appendChild(overlay);

  const shell = document.querySelector('.app-shell');
  if (shell) shell.style.visibility = 'hidden';

  const card = document.querySelector('.content-card');
  if (!card) return;
  const prompt = params.get('prompt') || 'Tell me more about you.';
  const scene = document.createElement('section');
  scene.className = 'page-loader-scene show';
  scene.innerHTML = `
    <div class="scene-top">
      <div class="scene-avatar">
        <img src="https://portfolio-website-nine-zeta-33.vercel.app/images/intro.png" alt="Brian Kim" />
      </div>
    </div>
    <div class="scene-bubble">${prompt}</div>
    <div class="scene-dots"><span></span><span></span><span></span></div>
  `;

  overlay.appendChild(scene);
  card.classList.add('preload-hide');

  setTimeout(() => {
    overlay.remove();
    if (shell) shell.style.visibility = 'visible';
    // Remove the hide state; animatePageContent drives the per-element reveal
    card.classList.remove('preload-hide');
    const clean = new URL(window.location.href);
    clean.searchParams.delete('loading');
    clean.searchParams.delete('prompt');
    window.history.replaceState({}, '', `${clean.pathname}${clean.search}${clean.hash}`);
  }, 1350);
}

function applyQuickHiddenState(hidden) {
  document.body.classList.toggle('quick-hidden', hidden);
  const toggle = document.querySelector('.quick-hide');
  if (toggle) {
    toggle.textContent = hidden ? '⌃ Show quick questions' : '⌄ Hide quick questions';
  }
}

function attachQuickHideToggle() {
  const toggle = document.querySelector('.quick-hide');
  // Always start with quick questions visible so nav cards are immediately accessible.
  applyQuickHiddenState(false);
  if (!toggle) return;
  window.localStorage.removeItem(QUICK_HIDE_KEY);

  toggle.addEventListener('click', () => {
    const next = !document.body.classList.contains('quick-hidden');
    applyQuickHiddenState(next);
  });
}

function isIntroQuery(text) {
  const q = (text || '').toLowerCase().trim();
  if (!q) return false;

  // Keep link/resource queries inside chat.
  if (/(linkedin|resume|cv|github|contact)/.test(q)) return false;

  // Broad identity triggers.
  if (/(\bbk\b|brian|kibeom)/.test(q)) return true;
  if (/(who\s+are\s+you|introduce\s+yourself|about\s+you|your\s+profile|this\s+guy|this\s+person)/.test(q)) return true;

  // Generic "who" questions that refer to the portfolio owner.
  if (/\bwho\b/.test(q) && /(you|your|\bu\b|owner)/.test(q)) return true;

  return false;
}

function isProjectsQuery(text) {
  const q = (text || '').toLowerCase().trim();
  if (!q) return false;
  return /(\bproject\b|\bprojects\b|\bportfolio\b|\bwork\b|\bbuild\b|\bbuilt\b)/.test(q);
}

function isContactQuery(text) {
  const q = (text || '').toLowerCase().trim();
  if (!q) return false;
  return /(\bcontact\b|\breach\b|\bemail\b|\blinkedin\b|\bgithub\b|\bresume\b|\bcv\b)/.test(q);
}


function getResourceCards(text) {
  const q = (text || '').toLowerCase();
  const cards = [];

  if (q.includes('resume') || q.includes('cv')) {
    cards.push({
      href: 'https://docs.google.com/document/d/1R_ndpSbF7Pnptnhy0haO2IUpl0N-ecEF32rU8T0wcDc/export?format=pdf',
      title: "Brian Kim's Resume",
      subtitle: 'Electrical Engineering · Embedded Systems',
      meta: 'PDF · Direct download',
      icon: '↓',
    });
  }

  if (q.includes('linkedin')) {
    cards.push({
      href: 'https://www.linkedin.com/in/brian-kim-2b3b40262/',
      title: "Brian Kim's LinkedIn",
      subtitle: 'Professional profile and experience',
      meta: 'LinkedIn · Open profile',
      icon: '↗',
    });
  }

  if (q.includes('github')) {
    cards.push({
      href: 'https://github.com/kibeom12901',
      title: "Brian Kim's GitHub",
      subtitle: 'Code repositories and technical projects',
      meta: 'GitHub · Open profile',
      icon: '↗',
    });
  }

  return cards;
}


function getResourceQuickReply(text, cards) {
  const q = (text || '').toLowerCase().trim();
  if (!cards.length) return null;

  const linkedinOnly = q.includes('linkedin') && !q.includes('resume') && !q.includes('cv');
  const resumeOnly = (q.includes('resume') || q.includes('cv')) && !q.includes('linkedin');
  const both = q.includes('linkedin') && (q.includes('resume') || q.includes('cv'));

  if (linkedinOnly) return 'You can open my LinkedIn from the card above.';
  if (resumeOnly) return 'You can download my resume from the card above.';
  if (both) return 'You can use the cards above for both my LinkedIn and resume.';

  return null;
}

function getLocalChatReply(text, cards) {
  const q = (text || '').toLowerCase().trim();
  const resourceReply = getResourceQuickReply(text, cards);
  if (resourceReply) return resourceReply;

  if (/who\s+are\s+you|tell me about yourself/.test(q)) {
    return "I'm Brian Kim, an Electrical and Electronics Engineering student at Tufts. I like building things that sit close to hardware, embedded systems, and practical product engineering.";
  }

  if (/what are your passions|what are you passionate about/.test(q)) {
    return "I'm most interested in embedded systems, electronics, and building products that actually work in the real world. I also enjoy turning ideas into polished experiences instead of stopping at prototypes.";
  }

  if (/how did you get started in engineering|started in engineering/.test(q)) {
    return "I got into engineering through a mix of curiosity about how systems work and enjoying hands-on building. Over time that turned into a stronger focus on electronics, microcontrollers, and low-level systems work.";
  }

  if (/where do you see yourself in 5 years|in the future|future plans|what are your plans|after.*service|after.*military|return to tufts/.test(q)) {
    return "In the future, I want to keep building toward strong embedded, hardware, or semiconductor-focused engineering work. After finishing my service, I plan to return to Tufts and keep pushing deeper into practical systems work that has real technical depth.";
  }

  if (/what internship experience do you have|internship experience/.test(q)) {
    return "I've interned at KETI as a System Engineer Intern, at Stochastic as a Software Engineer Intern, and also spent time at SK hynix. Those experiences gave me exposure to embedded systems, software, and hardware-focused engineering environments.";
  }

  if (/what projects are you most proud of|projects are you most proud/.test(q)) {
    return "A few projects I'm especially proud of are the VS1003B MP3 player, the ST-P3 autonomous driving work, the pulse oximeter stabilization project, and the FPGA snake game. I like projects where I have to make the full system actually work, not just the concept.";
  }

  if (/what are your skills|skills/.test(q)) {
    return "My strongest areas are embedded systems, STM32-based development, C and C++, Python, VHDL, and general electronics work. I tend to be most comfortable when the work is close to hardware, firmware, and system-level debugging.";
  }

  if (/embedded tools|tools do you use/.test(q)) {
    return "I work most comfortably with STM32 platforms, embedded C, debugging tools, and hardware bring-up workflows. I also use Python a lot when I need fast scripting, testing, or automation around engineering work.";
  }

  if (/programming languages are you strongest|strongest in/.test(q)) {
    return "The languages I rely on most are C, C++, and Python. For hardware-oriented work, I also use VHDL and some assembly when needed.";
  }

  if (/what do you do outside of engineering/.test(q)) {
    return "Outside engineering, I like skiing, golf, baseball, travel, and staying active. Those are the things that usually help me reset and come back sharper.";
  }

  if (/skiing and golf/.test(q)) {
    return "I like skiing for the speed and focus, and I like golf for the patience and precision. They are very different, but both scratch the same competitive side of me.";
  }

  if (/where is that travel photo from/.test(q)) {
    return "That travel photo is from Switzerland. I like places with strong scenery and a sense that the whole environment is different from everyday life.";
  }

  if (/mac or pc/.test(q)) {
    return "Mac for daily use, but I'm comfortable jumping onto whatever system the work needs. If it's embedded or low-level, I care more about the toolchain than the brand.";
  }

  if (/how can i reach you|where can i reach you/.test(q)) {
    return "The easiest way to reach me is through email or LinkedIn. If you want, you can also grab my resume from the card above.";
  }

  if (/what kind of role are you looking for/.test(q)) {
    return "I'm most interested in internships or roles that lean toward embedded systems, hardware, firmware, or semiconductor-related engineering. I care a lot about strong implementation and technically meaningful work.";
  }

  if (/where are you located/.test(q)) {
    return "I'm currently based in Seoul, South Korea.";
  }

  return null;
}

function normalizeServerReply(text) {
  if (!text) return text;

  return String(text)
    .replace(/\bBrian plans to\b/g, 'I plan to')
    .replace(/\bBrian wants to\b/g, 'I want to')
    .replace(/\bBrian hopes to\b/g, 'I hope to')
    .replace(/\bBrian is interested in\b/g, "I'm interested in")
    .replace(/\bBrian currently lives in\b/g, 'I currently live in')
    .replace(/\bBrian currently studies at\b/g, 'I currently study at')
    .replace(/\bBrian Kim has\b/g, 'I have')
    .replace(/\bBrian Kim is\b/g, 'I am')
    .replace(/\bBrian Kim was\b/g, 'I was')
    .replace(/\bBrian Kim works\b/g, 'I work')
    .replace(/\bBrian Kim worked\b/g, 'I worked')
    .replace(/\bBrian Kim plans to\b/g, 'I plan to')
    .replace(/\bBrian Kim wants to\b/g, 'I want to')
    .replace(/\bBrian Kim hopes to\b/g, 'I hope to')
    .replace(/\bBrian Kim likes\b/g, 'I like')
    .replace(/\bBrian Kim enjoys\b/g, 'I enjoy')
    .replace(/\bBrian Kim's\b/g, 'my')
    .replace(/\bBrian Kim\b/g, 'I')
    .replace(/\bHe is interested in\b/g, "I'm interested in")
    .replace(/\bHe plans to\b/g, 'I plan to')
    .replace(/\bHe wants to\b/g, 'I want to')
    .replace(/\bHe hopes to\b/g, 'I hope to')
    .replace(/\bHe currently lives in\b/g, 'I currently live in')
    .replace(/\bHe currently studies at\b/g, 'I currently study at')
    .replace(/\bHe has\b/g, 'I have')
    .replace(/\bhe is\b/g, 'I am')
    .replace(/\bhe was\b/g, 'I was')
    .replace(/\bhe has\b/g, 'I have')
    .replace(/\bhe works\b/g, 'I work')
    .replace(/\bhe worked\b/g, 'I worked')
    .replace(/\bhe likes\b/g, 'I like')
    .replace(/\bhe enjoys\b/g, 'I enjoy')
    .replace(/\bhis\b/g, 'my')
    .replace(/\bhe\b/g, 'I')
    .replace(/\bI has\b/g, 'I have')
    .replace(/\bI plans\b/g, 'I plan')
    .replace(/\bI wants\b/g, 'I want')
    .replace(/\bI hopes\b/g, 'I hope')
    .replace(/\bI is\b/g, 'I am')
    .replace(/\bmy Korean military public service\b/g, 'my Korean public service')
    .replace(/\bI don't know\./g, "I'm not totally sure from the info I have.")
    .replace(/Please check .*?LinkedIn for more detailed background[^.]*\./g, 'The resume or LinkedIn card above will have the cleanest summary if you want the full version.')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderResourceCards(cards, container) {
  if (!container) return;
  if (!cards.length) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.innerHTML = cards
    .map((card) => `
      <a class="chat-resource-card" href="${card.href}" target="_blank" rel="noopener noreferrer">
        <div class="chat-resource-main">
          <p class="chat-resource-title">${card.title}</p>
          <p class="chat-resource-sub">${card.subtitle}</p>
          <p class="chat-resource-meta">${card.meta}</p>
        </div>
        <div class="chat-resource-icon">${card.icon}</div>
      </a>
    `)
    .join('');
  container.style.display = 'grid';
}

function attachChatSend() {
  const bars = [...document.querySelectorAll('.chat-bar')];
  bars.forEach((bar) => {
    const input = bar.querySelector('.chat-input');
    const send = bar.querySelector('.chat-send');
    if (!input || !send) return;

    const syncSendState = () => {
      send.classList.toggle('is-active', (input.value || '').trim().length > 0);
    };

    const submit = () => {
      const text = (input.value || '').trim() || 'Tell me about your background.';
      if (isIntroQuery(text)) {
        location.href = withLoadingParam('me.html', text);
        return;
      }
      if (isProjectsQuery(text)) {
        location.href = withLoadingParam('projects.html', text);
        return;
      }
      if (isContactQuery(text)) {
        location.href = withLoadingParam('contact.html', text);
        return;
      }

      if (current === 'chat.html' && typeof window.__sendPortfolioChat === 'function') {
        window.__sendPortfolioChat(text);
        input.value = '';
        syncSendState();
        return;
      }

      location.href = `chat.html?query=${encodeURIComponent(text)}`;
    };

    send.addEventListener('click', (event) => {
      event.preventDefault();
      submit();
    });

    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      submit();
    });

    input.addEventListener('input', syncSendState);
    syncSendState();
  });
}

function renderChatResponse() {
  if (current !== 'chat.html') return;
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('query') || 'Tell me about yourself.';

  const questionEl = document.getElementById('user-question');
  const typingEl = document.getElementById('typing');
  const answerEl = document.getElementById('chat-answer');
  const answerBody = document.getElementById('chat-answer-body');
  const cardWrap = document.getElementById('chat-resource-cards');
  const chatInput = document.querySelector('.chat-bar .chat-input');
  const chatSend = document.querySelector('.chat-bar .chat-send');
  if (!questionEl || !typingEl || !answerEl || !answerBody) return;

  async function fetchResponse(query) {
    if (isIntroQuery(query)) {
      location.href = withLoadingParam('me.html', query);
      return;
    }
    if (isProjectsQuery(query)) {
      location.href = withLoadingParam('projects.html', query);
      return;
    }
    if (isContactQuery(query)) {
      location.href = withLoadingParam('contact.html', query);
      return;
    }

    questionEl.textContent = query;

    const cards = getResourceCards(query);
    renderResourceCards(cards, cardWrap);
    const localReply = getLocalChatReply(query, cards);

    if (localReply) {
      typingEl.style.display = 'none';
      answerEl.style.display = 'block';
      answerBody.textContent = localReply;
      await typewriteEl(answerBody);
      return;
    }

    typingEl.style.display = 'flex';
    answerEl.style.display = 'none';
    if (chatInput) chatInput.disabled = true;
    if (chatSend) chatSend.disabled = true;

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch response');
      }

      const reply = normalizeServerReply(data?.reply || 'No reply returned.');
      typingEl.style.display = 'none';
      answerEl.style.display = 'block';
      answerBody.textContent = reply;
      await typewriteEl(answerBody);
    } catch (err) {
      typingEl.style.display = 'none';
      answerEl.style.display = 'block';
      answerBody.textContent = err?.message || 'Could not reach chat server. Make sure backend is running.';
      await typewriteEl(answerBody);
    } finally {
      if (chatInput) chatInput.disabled = false;
      if (chatSend) chatSend.disabled = false;
    }
  }

  window.__sendPortfolioChat = fetchResponse;
  fetchResponse(initialQuery);
}

/* =========================================================
   AI STREAMING CONTENT ANIMATION — Two-zone system
   • .ai-drop-zone  → smooth drop-in (structural UI, no typewriter)
   • p / h tags outside drop-zones → AI typewriter stream
   • chips / project-row / link-list → staggered block reveal
   ========================================================= */

/* ── Phase 1: Drop-in for structural zones ── */
function dropInZones(card) {
  const zones = [...card.querySelectorAll('.ai-drop-zone')];
  zones.forEach((zone, i) => {
    setTimeout(() => {
      zone.classList.add('drop-in');
    }, i * 90);
  });
  return zones.length * 90; // total stagger time
}

/* ── Typewriter helpers ── */
function typeParams(len) {
  const interval = 16;
  const batch = Math.max(1, Math.ceil(len / (800 / interval)));
  return { interval, batch };
}

function typewriteEl(el) {
  return new Promise((resolve) => {
    const text = el.textContent;
    el.textContent = '';
    el.classList.add('ai-streaming');

    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    el.appendChild(cursor);

    const { interval, batch } = typeParams(text.length || 1);
    let i = 0;

    const timer = setInterval(() => {
      const add = Math.min(batch, text.length - i);
      if (add <= 0) {
        clearInterval(timer);
        cursor.remove();
        el.classList.remove('ai-streaming');
        el.classList.add('ai-streaming-done');
        resolve();
        return;
      }
      el.insertBefore(document.createTextNode(text.slice(i, i + add)), cursor);
      i += add;
    }, interval);
  });
}

/* ── Block reveal ── */
function fadeBlockIn(el) {
  return new Promise((resolve) => {
    el.classList.remove('ai-hidden');
    void el.offsetWidth;
    el.classList.add('ai-block-reveal');
    setTimeout(resolve, 420);
  });
}

/* ── Collect items outside drop-zones for the streaming pass ── */
function collectStreamItems(card) {
  const items = [];
  const queued = new WeakSet();
  const BLOCK_CLASSES = ['chips', 'project-row', 'link-list', 'fun-hero-wrap'];

  function walk(el) {
    if (queued.has(el)) return;
    if (el.closest('.ai-drop-zone')) return; // skip — handled by drop-in

    if ((el.tagName === 'P' || el.tagName === 'H2' || el.tagName === 'H3') && el.textContent.trim()) {
      if (!el.closest('.project-tile')) {
        queued.add(el);
        items.push({ el, type: 'text' });
        return;
      }
    }

    if (BLOCK_CLASSES.some((c) => el.classList.contains(c))) {
      queued.add(el);
      items.push({ el, type: 'block' });
      return;
    }

    for (const child of el.children) walk(child);
  }

  for (const child of card.children) walk(child);
  return items;
}

/* ── Main entry ── */
async function animatePageContent() {
  const card = document.querySelector('.content-card');
  if (!card) return;

  const streamItems = collectStreamItems(card);
  streamItems.forEach(({ el }) => el.classList.add('ai-hidden'));

  await new Promise((r) => setTimeout(r, 40));

  // Phase 1: drop-in zones (structural) — all at once, staggered
  const dropDelay = dropInZones(card);

  // Phase 2: stream text after drop-ins settle
  await new Promise((r) => setTimeout(r, dropDelay + 200));

  for (const { el, type } of streamItems) {
    el.classList.remove('ai-hidden');
    if (type === 'text') {
      await typewriteEl(el);
      await new Promise((r) => setTimeout(r, 35));
    } else {
      await fadeBlockIn(el);
    }
  }
}

/* =========================================================
   BOOTSTRAP
   ========================================================= */

attachChatSend();
if (!staticUI) {
  ensureMoreNavButton();
  attachMoreQuestionsSheet();
}
attachNavTransitions();
initProjectCarousel();
attachProjectImageFallbacks();

// Run the arrival overlay (existing) and then kick off content streaming
(function bootPage() {
  if (staticUI) {
    // Home page — no content to stream
    runArrivalTypingReveal();
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const fromNav = params.get('loading') === '1';

  if (fromNav) {
    // Show overlay, then stream content once it's dismissed
    runArrivalTypingReveal();          // handles its own 1350 ms timeout + card reveal
    setTimeout(() => {
      animatePageContent();
    }, 1350);
  } else {
    // Direct load — short pause then stream without overlay
    const card = document.querySelector('.content-card');
    if (card) {
      card.classList.add('preload-hide');
      requestAnimationFrame(() => {
        card.classList.remove('preload-hide');
        card.classList.add('reveal');
        animatePageContent();
      });
    }
  }
})();

attachQuickHideToggle();
renderChatResponse();
