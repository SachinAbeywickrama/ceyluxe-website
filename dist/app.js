'use strict';
// Each card owns its pack selection; aria-pressed exposes that state to assistive tools.
document.querySelectorAll('.packs').forEach(group => {
  group.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    group.querySelectorAll('button').forEach(option => {
      option.setAttribute('aria-pressed', String(option === button));
    });
  });
});

const message = document.querySelector('#message');
function prepareInquiry(text) {
  message.value = text;
  document.querySelector('#inquiry-status').textContent = '';
  // Focus without jumping; the anchor handles scrolling to the section heading.
  message.focus({ preventScroll: true });
}
document.querySelectorAll('.product-inquiry').forEach(link => {
  link.addEventListener('click', () => {
    const product = link.closest('.product');
    const pack = product.querySelector('[aria-pressed="true"]').textContent;
    prepareInquiry(`${product.dataset.product} — ${pack}. Quantity: please specify. Please share LKR pricing and availability.`);
  });
});
document.querySelectorAll('[data-inquiry]').forEach(link => {
  link.addEventListener('click', () => prepareInquiry(link.dataset.inquiry));
});

// These are intentionally local demonstrations: no fetch, storage, or email calls.
function demoForm(formId, statusId, response) {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  form.addEventListener('input', event => {
    event.target.setCustomValidity('');
    status.textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of form.querySelectorAll('[required]')) {
      field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
    }
    if (!form.reportValidity()) return;
    status.textContent = response;
  });
}
demoForm('inquiry-form', 'inquiry-status', 'No inquiry was sent. Online inquiries are currently unavailable. Your details have not been saved or shared.');
demoForm('newsletter-form', 'newsletter-status', 'No subscription was created and no email was sent. Newsletter signup is currently unavailable. Your address has not been saved or shared.');


// Play the local hero film gently, respecting reduced motion and data-saving preferences.
const heroVideo = document.getElementById('hero-video');
const heroToggle = document.querySelector('.hero-video-toggle');
if (heroVideo && heroToggle) {
  const heroFrame = heroVideo.closest('.hero-image');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  const updateVideoButton = () => {
    heroToggle.setAttribute('aria-label', heroVideo.paused ? 'Play hero video' : 'Pause hero video');
    heroToggle.querySelector('span').textContent = heroVideo.paused ? '▶' : 'Ⅱ';
  };
  const revealVideo = () => {
    heroFrame.classList.add('is-video-ready');
    heroToggle.hidden = false;
    updateVideoButton();
  };
  const attemptPlay = () => heroVideo.play().catch(() => {
    // Autoplay may be blocked by a browser or power-saving mode; keep a manual play control.
    heroToggle.hidden = false;
    updateVideoButton();
  });
  const startWhenReady = () => {
    heroToggle.hidden = false;
    if (!reducedMotion.matches && !navigator.connection?.saveData && !userPaused) attemptPlay();
  };
  heroVideo.addEventListener('loadedmetadata', startWhenReady, { once: true });
  heroVideo.addEventListener('playing', revealVideo);
  heroVideo.addEventListener('pause', updateVideoButton);
  const showFallback = () => {
    heroFrame.classList.remove('is-video-ready');
    heroToggle.hidden = true;
  };
  heroVideo.addEventListener('error', showFallback);
  heroVideo.querySelector('source').addEventListener('error', showFallback);
  heroToggle.addEventListener('click', () => {
    if (heroVideo.paused) {
      userPaused = false;
      attemptPlay();
    } else {
      userPaused = true;
      heroVideo.pause();
    }
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) heroVideo.pause();
  });
  if (heroVideo.readyState >= 1) startWhenReady();
}
