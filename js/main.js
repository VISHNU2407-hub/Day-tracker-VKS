/**
 * Day Tracker — Main JavaScript
 * Handles navigation, carousel, scroll animations, and interactivity.
 */

(function () {
  'use strict';

  // ─── DOM Cache ───
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const scrollTopBtn = document.querySelector('[data-scroll-top]');
  const carousel = document.querySelector('[data-carousel]');
  const track = document.querySelector('[data-carousel-track]');
  const slides = document.querySelectorAll('[data-carousel-slide]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  const dotsContainer = document.querySelector('[data-carousel-dots]');
  const aosElements = document.querySelectorAll('[data-aos]');
  const feedbackForm = document.querySelector('[data-feedback-form]');
  const apkDownload = document.querySelector('[data-apk-download]');

  // ─── Mobile Nav Toggle ───
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isOpen);
      navLinks.classList.toggle('open');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── Header scroll effect ───
  let lastScroll = 0;
  const onScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', scrollY > 400);
    }
    lastScroll = scrollY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── Scroll to top ───
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Smooth scroll for anchor links ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offsetPosition = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });

  // ─── Carousel ───
  if (carousel && track && slides.length > 0) {
    let currentIndex = 0;
    const slideCount = slides.length;

    if (dotsContainer) {
      for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to screenshot ' + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }
    const dots = dotsContainer?.querySelectorAll('.carousel-dot');

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, slideCount - 1));
      slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
      if (dots) dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
      const sw = slides[0].offsetWidth;
      track.scrollTo({ left: (sw + 24) * currentIndex, behavior: 'smooth' });
    }

    prevBtn?.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn?.addEventListener('click', () => goToSlide(currentIndex + 1));
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    let tx = 0;
    carousel.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].screenX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      const diff = tx - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) goToSlide(currentIndex + (diff > 0 ? 1 : -1));
    }, { passive: true });

    goToSlide(0);
    let autoAdvance = setInterval(() => goToSlide((currentIndex + 1) % slideCount), 5000);
    carousel.addEventListener('mouseenter', () => clearInterval(autoAdvance));
    carousel.addEventListener('mouseleave', () => {
      autoAdvance = setInterval(() => goToSlide((currentIndex + 1) % slideCount), 5000);
    });
  }

  // ─── Scroll Animations ───
  if (aosElements.length > 0 && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('aos-visible'); obs.unobserve(e.target); } });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    aosElements.forEach(el => obs.observe(el));
  } else {
    aosElements.forEach(el => el.classList.add('aos-visible'));
  }

  // ─── FAQ ───
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq-item[open]').forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // ════════════════════════════════════════════
  // FIREBASE
  // ════════════════════════════════════════════

  const firebaseConfig = {
    apiKey: 'AIzaSyAftumpBvszPA0IJIHC3_1YGE5hpsuYbYI',
    authDomain: 'day-tracker-website.firebaseapp.com',
    projectId: 'day-tracker-website',
    storageBucket: 'day-tracker-website.firebasestorage.app',
    messagingSenderId: '347794062838',
    appId: '1:347794062838:web:11cac3a2d81380d8495bd7',
    measurementId: 'G-6F97F6SZY1'
  };

  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

  // ─── DOM refs ───
  const feedbackList = document.querySelector('[data-feedback-list]');
  const feedbackEmpty = document.querySelector('[data-feedback-empty]');
  const feedbackLoading = document.querySelector('[data-feedback-loading]');
  const feedbackSuccess = document.querySelector('[data-feedback-success]');
  const feedbackError = document.querySelector('[data-feedback-error]');

  // ─── State ───
  var allFeedbackDocs = [];
  var currentRatingFilter = 0;
  var feedbackUnsubscribe = null;

  // ─── Helpers ───
  function escapeHtml(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function getRelativeTime(timestamp) {
    if (!timestamp) return null;
    var date = timestamp.toMillis ? timestamp.toMillis() : timestamp;
    if (typeof date === 'number' && date < 1e12) date *= 1000;
    var diff = Date.now() - date;
    var s = Math.floor(diff / 1000);
    if (s < 5) return 'Just now';
    if (s < 60) return s + 's ago';
    var m = Math.floor(s / 60);
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    var d = Math.floor(h / 24);
    if (d < 7) return d + 'd ago';
    var w = Math.floor(d / 7);
    if (w < 5) return w + 'w ago';
    var mo = Math.floor(d / 30);
    if (mo < 12) return mo + 'mo ago';
    return Math.floor(mo / 12) + 'y ago';
  }

  function renderStars(rating) {
    rating = Math.min(5, Math.max(0, Math.round(rating || 0)));
    var h = '';
    for (var i = 1; i <= 5; i++) {
      h += '<span class="feedback-star' + (i <= rating ? ' filled' : '') + '">\u2605</span>';
    }
    return h;
  }

  function renderFeedbackItem(doc) {
    var id = doc.id;
    var data = doc.data();
    var timeStr = getRelativeTime(data.createdAt);

    var item = document.createElement('div');
    item.className = 'feedback-item';
    item.dataset.feedbackId = id;

    item.innerHTML =
      '<div class="feedback-item-header">' +
        '<span class="feedback-item-name">' + escapeHtml(data.name || 'Anonymous') + '</span>' +
        '<span class="feedback-item-stars">' + renderStars(data.rating || 0) + '</span>' +
      '</div>' +
      '<p class="feedback-item-message">' + escapeHtml(data.message || '') + '</p>' +
      '<div class="feedback-item-footer">' +
        (timeStr ? '<span class="feedback-item-time">' + timeStr + '</span>' : '') +
      '</div>';

    return item;
  }

  // ─── Rating Filter ───
  function renderFilteredFeedback() {
    if (!feedbackList) return;

    var filtered = allFeedbackDocs;
    if (currentRatingFilter > 0) {
      filtered = [];
      for (var i = 0; i < allFeedbackDocs.length; i++) {
        var d = allFeedbackDocs[i];
        if (d.data().rating === currentRatingFilter) filtered.push(d);
      }
    }

    feedbackList.innerHTML = '';

    if (filtered.length === 0) {
      if (feedbackEmpty) {
        feedbackEmpty.hidden = false;
        feedbackEmpty.querySelector('p').textContent =
          currentRatingFilter > 0
            ? 'No ' + currentRatingFilter + '-star feedback yet.'
            : 'No feedback yet. Be the first to share!';
      }
      return;
    }

    if (feedbackEmpty) feedbackEmpty.hidden = true;

    var fragment = document.createDocumentFragment();
    for (var j = 0; j < filtered.length; j++) {
      fragment.appendChild(renderFeedbackItem(filtered[j]));
    }
    feedbackList.appendChild(fragment);
  }

  function setRatingFilter(minRating) {
    if (currentRatingFilter === minRating) return;
    currentRatingFilter = minRating;
    var btns = document.querySelectorAll('[data-filter-btn]');
    for (var i = 0; i < btns.length; i++) {
      var val = parseInt(btns[i].dataset.filterBtn, 10);
      btns[i].classList.toggle('active', val === minRating);
      btns[i].setAttribute('aria-pressed', val === minRating ? 'true' : 'false');
    }
    renderFilteredFeedback();
  }

  function initFilterBar() {
    var feedHeader = document.querySelector('.feedback-feed-header');
    if (!feedHeader) return;
    if (document.querySelector('.feedback-filter-bar')) return;

    var bar = document.createElement('div');
    bar.className = 'feedback-filter-bar';

    var filters = [
      { label: 'All', value: 0 },
      { label: '5 \u2605', value: 5 },
      { label: '4 \u2605', value: 4 },
      { label: '3 \u2605', value: 3 },
      { label: '2 \u2605', value: 2 },
      { label: '1 \u2605', value: 1 }
    ];

    for (var i = 0; i < filters.length; i++) {
      (function (f) {
        var btn = document.createElement('button');
        btn.className = 'feedback-filter-btn' + (f.value === 0 ? ' active' : '');
        btn.dataset.filterBtn = f.value;
        btn.textContent = f.label;
        btn.setAttribute('aria-pressed', f.value === 0 ? 'true' : 'false');
        btn.addEventListener('click', function () { setRatingFilter(f.value); });
        bar.appendChild(btn);
      })(filters[i]);
    }

    feedHeader.parentNode.insertBefore(bar, feedHeader.nextSibling);
  }

  // ─── Load Feedback from Firestore ───
  function loadData() {
    if (!db || !feedbackList) return;

    if (feedbackUnsubscribe) feedbackUnsubscribe();

    feedbackUnsubscribe = db.collection('feedback')
      .orderBy('createdAt', 'desc')
      .onSnapshot(function (snapshot) {
        if (feedbackLoading) feedbackLoading.style.display = 'none';

        allFeedbackDocs = [];
        snapshot.forEach(function (doc) {
          allFeedbackDocs.push(doc);
        });

        if (allFeedbackDocs.length === 0) {
          feedbackList.innerHTML = '';
          if (feedbackEmpty) feedbackEmpty.hidden = false;
          return;
        }

        renderFilteredFeedback();
      }, function (error) {
        console.error('Firestore load error:', error);
        if (feedbackLoading) feedbackLoading.style.display = 'none';
        if (feedbackList) {
          feedbackList.innerHTML = '<p class="feedback-empty">Failed to load feedback. Please refresh.</p>';
        }
      });
  }

  // ─── Feedback Form Submit ───
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!db) {
        if (feedbackError) feedbackError.hidden = false;
        return;
      }

      var btn = feedbackForm.querySelector('.feedback-submit');
      var orig = btn.innerHTML;
      var name = feedbackForm.querySelector('#feedback-name').value.trim();
      var rating = feedbackForm.querySelector('input[name="rating"]:checked');
      var message = feedbackForm.querySelector('#feedback-message').value.trim();
      var rv = rating ? rating.value : '';

      if (!name || !rv || !message) {
        btn.textContent = 'Please fill in all fields';
        btn.style.opacity = '0.6';
        setTimeout(function () { btn.innerHTML = orig; btn.style.opacity = '1'; }, 2000);
        return;
      }

      btn.textContent = 'Submitting...';
      btn.disabled = true;
      if (feedbackError) feedbackError.hidden = true;
      if (feedbackSuccess) feedbackSuccess.hidden = true;

      db.collection('feedback').add({
        name: name,
        rating: parseInt(rv, 10),
        message: message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () {
        feedbackForm.reset();
        if (feedbackSuccess) feedbackSuccess.hidden = false;
        setTimeout(function () { if (feedbackSuccess) feedbackSuccess.hidden = true; }, 4000);
      }).catch(function (error) {
        console.error('Feedback submit error:', error);
        if (feedbackError) feedbackError.hidden = false;
      }).finally(function () {
        btn.innerHTML = orig;
        btn.disabled = false;
      });
    });
  }

  // ─── Initialize ───
  if (feedbackList) {
    initFilterBar();
    loadData();
  }

  // ─── APK Download ───
  if (apkDownload) {
    apkDownload.addEventListener('click', (e) => {});
  }

})();
