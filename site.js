const page = document.body.dataset.page;
const announce = document.createElement('div');
announce.className = 'site-status';
announce.setAttribute('role', 'status');
announce.hidden = true;
document.body.append(announce);
let timeout;
function status(message) {
  announce.textContent = message;
  announce.hidden = false;
  clearTimeout(timeout);
  timeout = setTimeout(() => { announce.hidden = true; }, 3500);
}

for (const link of document.querySelectorAll('header nav a[data-path]')) {
  if (link.dataset.path === page) link.setAttribute('aria-current', 'page');
}

const header = document.querySelector('header');
const primaryNav = header?.querySelector('nav');
if (primaryNav) {
  const mobileNav = primaryNav.cloneNode(true);
  mobileNav.id = 'compact-navigation';
  mobileNav.className = 'site-compact-nav';
  mobileNav.setAttribute('aria-label', '主导航');
  mobileNav.hidden = true;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'site-menu-toggle';
  toggle.textContent = '菜单';
  toggle.setAttribute('aria-controls', mobileNav.id);
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    mobileNav.hidden = !open;
  };
  setMenu(false);
  toggle.addEventListener('click', () => setMenu(mobileNav.hidden));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
  primaryNav.after(toggle, mobileNav);
}

for (const article of document.querySelectorAll('article[data-case]')) {
  article.classList.add('site-case-card');
  article.addEventListener('click', event => {
    if (!event.target.closest('a[href], input, select, video')) location.assign(article.dataset.case);
  });
}

for (const article of document.querySelectorAll('article[data-preview]')) {
  const image = article.querySelector('img');
  if (!image?.parentElement || !matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) continue;
  const video = document.createElement('video');
  video.className = 'site-hover-preview';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.hidden = true;
  image.after(video);
  article.addEventListener('pointerenter', () => {
    video.src ||= article.dataset.preview;
    video.play().then(() => { video.hidden = video.paused; }).catch(() => {});
  });
  article.addEventListener('pointerleave', () => {
    video.pause();
    video.hidden = true;
  });
}

const choices = { 'ALL / 全览 (05)': 'all', 'DESIGN (02)': 'design', 'VIDEO (03)': 'video' };
if (page === 'home') {
  const cards = [...document.querySelectorAll('#selected-works article')];
  const filters = [...document.querySelectorAll('#selected-works span')].filter(span => choices[span.textContent.trim()]);
  const buttons = filters.map(span => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = span.className;
    button.textContent = span.textContent;
    button.dataset.filter = choices[span.textContent.trim()];
    span.replaceWith(button);
    return button;
  });
  const select = button => {
    for (const control of buttons) {
      const active = control === button;
      control.setAttribute('aria-pressed', String(active));
      control.classList.toggle('bg-primary-container', active);
      control.classList.toggle('text-on-primary-container', active);
      control.classList.toggle('bg-surface-container', !active);
      control.classList.toggle('text-on-surface-variant', !active);
    }
    for (const card of cards) card.hidden = button.dataset.filter !== 'all' && card.dataset.kind !== button.dataset.filter;
  };
  for (const button of buttons) button.addEventListener('click', () => select(button));
  if (buttons[0]) select(buttons[0]);
}

const form = document.querySelector('#inquiry-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  status('在线发送暂未开通。请使用页面上的邮箱直接联系。');
});

document.addEventListener('click', event => {
  const control = event.target.closest('button, a[aria-disabled]');
  if (!control || control.closest('article[data-case]')) return;
  const label = control.textContent.trim().replace(/\s+/g, ' ');
  if (document.querySelector('#playback') && /PLAY DIRECTOR|WATCH TEASER|^play_arrow$|fullscreen|^play_circle PAUSE$/.test(label)) {
    const player = document.querySelector('#playback video');
    if (!player) return status('视频素材待提供。');
    player.scrollIntoView();
    if (/fullscreen/.test(label)) player.requestFullscreen?.();
    else if (/PAUSE/.test(label)) player.pause();
    else player.play().catch(() => status('暂时无法播放，请使用播放器重试。'));
    return;
  }
  if (/LOAD MORE/.test(label)) status('当前已显示可用作品。');
  if (control.matches('a[aria-disabled]')) status('此入口的资料待提供。');
});

const top = document.createElement('button');
top.type = 'button';
top.className = 'site-top';
top.textContent = '↑';
top.setAttribute('aria-label', '返回顶部');
top.hidden = true;
top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', () => { top.hidden = window.scrollY < 700; }, { passive: true });
document.body.append(top);
