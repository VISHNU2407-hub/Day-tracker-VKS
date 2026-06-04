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

    // Close nav on link click
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

    // Scroll to top button
    if (scrollTopBtn) {
      if (scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
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
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // ─── Carousel ───
  if (carousel && track && slides.length > 0) {
    let currentIndex = 0;
    const slideCount = slides.length;

    // Create dots
    if (dotsContainer) {
      for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Go to screenshot ${i + 1}`);
        dot.dataset.index = i;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }
    }

    const dots = dotsContainer?.querySelectorAll('.carousel-dot');

    function updateSlides() {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
      });

      if (dots) {
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }

      // Scroll track into position
      const slideWidth = slides[0].offsetWidth;
      const gap = 24; // matches --space-xl
      track.scrollTo({
        left: (slideWidth + gap) * currentIndex,
        behavior: 'smooth',
      });
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, slideCount - 1));
      updateSlides();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    }

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToSlide(currentIndex + 1);
        else goToSlide(currentIndex - 1);
      }
    }, { passive: true });

    // Init
    updateSlides();

    let autoAdvance = setInterval(() => {
      const next = (currentIndex + 1) % slideCount;
      goToSlide(next);
    }, 5000);

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoAdvance));
    carousel.addEventListener('mouseleave', () => {
      autoAdvance = setInterval(() => {
        const next = (currentIndex + 1) % slideCount;
        goToSlide(next);
      }, 5000);
    });
  }

  // ─── Scroll Animations (Intersection Observer) ───
  if (aosElements.length > 0 && 'IntersectionObserver' in window) {
    const aosObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-visible');
            aosObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    aosElements.forEach(el => aosObserver.observe(el));
  } else {
    // Fallback: show all elements
    aosElements.forEach(el => el.classList.add('aos-visible'));
  }

  // ─── FAQ: Auto-close others on open ───
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
  // FIREBASE — COMMUNITY FEEDBACK
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

  // Initialize Firebase
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

  // DOM refs for feedback
  const feedbackList = document.querySelector('[data-feedback-list]');
  const feedbackEmpty = document.querySelector('[data-feedback-empty]');
  const feedbackLoading = document.querySelector('[data-feedback-loading]');
  const feedbackSuccess = document.querySelector('[data-feedback-success]');
  const feedbackError = document.querySelector('[data-feedback-error]');

  // ─── Rating Filter State ───
  var allFeedbackDocs = [];
  var currentRatingFilter = 0;

  // ─── Helper: Escape HTML ───
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Helper: Relative Time ───
  function getRelativeTime(timestamp) {
    if (!timestamp) return null;
    var date = timestamp.toMillis ? timestamp.toMillis() : timestamp;
    if (typeof date === 'number' && date < 1e12) date *= 1000; // seconds to ms
    var now = Date.now();
    var diff = now - date;

    var seconds = Math.floor(diff / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    var weeks = Math.floor(days / 7);
    var months = Math.floor(days / 30);

    if (seconds < 5) return 'Just now';
    if (seconds < 60) return seconds + 's ago';
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (days < 7) return days + 'd ago';
    if (weeks < 5) return weeks + 'w ago';
    if (months < 12) return months + 'mo ago';
    return Math.floor(months / 12) + 'y ago';
  }

  // ─── Helper: Render Stars ───
  function renderStars(rating) {
    rating = Math.min(5, Math.max(0, Math.round(rating || 0)));
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<span class="feedback-star' + (i <= rating ? ' filled' : '') + '">' + (i <= rating ? '\u2605' : '\u2606') + '</span>';
    }
    return html;
  }

  // ─── Render Single Feedback Item ───
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
        '<button class="feedback-reply-btn" data-reply-btn="' + id + '" aria-expanded="false">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
          '<span data-reply-text>' + 'Reply' + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="feedback-replies" data-replies="' + id + '" hidden>' +
        '<div class="feedback-replies-loading" data-replies-loading="' + id + '" hidden>' +
          '<div class="spinner"></div>' +
        '</div>' +
      '</div>' +
      '<div class="feedback-reply-form" data-reply-form="' + id + '" hidden>' +
        '<input type="text" class="feedback-reply-name" placeholder="Your Name" required>' +
        '<textarea class="feedback-reply-message" rows="2" placeholder="Write a reply..." required></textarea>' +
        '<div class="feedback-reply-actions">' +
          '<button class="feedback-reply-submit" type="button">Post Reply</button>' +
          '<button class="feedback-reply-cancel" type="button">Cancel</button>' +
        '</div>' +
        '<p class="feedback-msg feedback-reply-success" data-reply-msg="' + id + '-success" hidden>\u2713 Reply posted!</p>' +
        '<p class="feedback-msg feedback-reply-error" data-reply-msg="' + id + '-error" hidden>\u26A0 Failed to post reply.</p>' +
      '</div>';

    return item;
  }

  // ─── Reply Functions ───
  var replyStates = {};
  var replyUnsubscribers = {};

  function cleanupReplies() {
    Object.keys(replyUnsubscribers).forEach(function (key) {
      if (replyUnsubscribers[key]) {
        replyUnsubscribers[key]();
      }
    });
    replyUnsubscribers = {};
    replyStates = {};
  }

  function handleReplyClick(btn) {
    var id = btn.dataset.replyBtn;
    var repliesContainer = document.querySelector('[data-replies="' + id + '"]');
    var formContainer = document.querySelector('[data-reply-form="' + id + '"]');
    if (!repliesContainer || !formContainer) return;

    var isExpanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');

    repliesContainer.hidden = isExpanded;
    formContainer.hidden = isExpanded;

    var textSpan = btn.querySelector('[data-reply-text]');
    if (textSpan) textSpan.textContent = isExpanded ? 'Reply' : 'Hide Replies';

    if (isExpanded) return;

    // Load replies on first open
    if (!replyStates[id]) {
      replyStates[id] = true;
      loadReplies(id, repliesContainer);
    }
  }

  function loadReplies(feedbackId, container) {
    if (!db) return;

    // Clean up existing listener for this feedback
    if (replyUnsubscribers[feedbackId]) {
      replyUnsubscribers[feedbackId]();
    }

    var loadingEl = container.querySelector('[data-replies-loading="' + feedbackId + '"]');
    if (loadingEl) loadingEl.hidden = false;

    replyUnsubscribers[feedbackId] = db.collection('feedback').doc(feedbackId).collection('replies')
      .orderBy('createdAt', 'asc')
      .onSnapshot(function (snapshot) {
        if (loadingEl) loadingEl.hidden = true;

        var oldItems = container.querySelectorAll('.feedback-reply-item');
        oldItems.forEach(function (el) { el.remove(); });

        if (snapshot.empty) return;

        snapshot.forEach(function (doc) {
          container.appendChild(renderReplyItem(doc));
        });
      }, function (error) {
        console.error('Reply load error:', error);
        if (loadingEl) loadingEl.hidden = true;
      });
  }

  function renderReplyItem(doc) {
    var data = doc.data();
    var timeStr = getRelativeTime(data.createdAt);

    var item = document.createElement('div');
    item.className = 'feedback-reply-item';

    item.innerHTML =
      '<div class="feedback-reply-item-header">' +
        '<span class="feedback-reply-item-name">' + escapeHtml(data.name || 'Anonymous') + '</span>' +
        (timeStr ? '<span class="feedback-reply-item-time">' + timeStr + '</span>' : '') +
      '</div>' +
      '<p class="feedback-reply-item-message">' + escapeHtml(data.message || '') + '</p>';

    return item;
  }

  function handleReplySubmit(btn) {
    var form = btn.closest('.feedback-reply-form');
    if (!form) return;

    var id = form.dataset.replyForm;
    var nameInput = form.querySelector('.feedback-reply-name');
    var messageInput = form.querySelector('.feedback-reply-message');
    var name = nameInput ? nameInput.value.trim() : '';
    var message = messageInput ? messageInput.value.trim() : '';

    if (!name || !message) return;

    btn.textContent = 'Posting...';
    btn.disabled = true;

    var successMsg = form.querySelector('[data-reply-msg="' + id + '-success"]');
    var errorMsg = form.querySelector('[data-reply-msg="' + id + '-error"]');
    if (errorMsg) errorMsg.hidden = true;
    if (successMsg) successMsg.hidden = true;

    db.collection('feedback').doc(id).collection('replies').add({
      name: name,
      message: message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      if (nameInput) nameInput.value = '';
      if (messageInput) messageInput.value = '';
      if (successMsg) successMsg.hidden = false;
      setTimeout(function () {
        if (successMsg) successMsg.hidden = true;
      }, 3000);
    }).catch(function (error) {
      console.error('Reply submit error:', error);
      if (errorMsg) errorMsg.hidden = false;
      setTimeout(function () {
        if (errorMsg) errorMsg.hidden = true;
      }, 3000);
    }).finally(function () {
      btn.textContent = 'Post Reply';
      btn.disabled = false;
    });
  }

  // ─── Rating Filter Functions ───
  function renderFilteredFeedback() {
    if (!feedbackList) return;

    var filtered = allFeedbackDocs;
    if (currentRatingFilter > 0) {
      filtered = [];
      for (var i = 0; i < allFeedbackDocs.length; i++) {
        var d = allFeedbackDocs[i];
        if (d.data().rating >= currentRatingFilter) {
          filtered.push(d);
        }
      }
    }

    feedbackList.innerHTML = '';

    if (filtered.length === 0) {
      if (feedbackEmpty) {
        feedbackEmpty.hidden = false;
        feedbackEmpty.querySelector('p').textContent =
          currentRatingFilter > 0
            ? 'No feedback with ' + currentRatingFilter + '+ stars yet.'
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

    cleanupReplies();
    renderFilteredFeedback();
  }

  function initFilterBar() {
    var feedHeader = document.querySelector('.feedback-feed-header');
    if (!feedHeader) return;

    var existingBar = document.querySelector('.feedback-filter-bar');
    if (existingBar) return;

    var filterBar = document.createElement('div');
    filterBar.className = 'feedback-filter-bar';

    var filters = [
      { label: 'All', value: 0 },
      { label: '5 ★', value: 5 },
      { label: '4+ ★', value: 4 },
      { label: '3+ ★', value: 3 },
      { label: '2+ ★', value: 2 }
    ];

    for (var i = 0; i < filters.length; i++) {
      (function (f) {
        var btn = document.createElement('button');
        var isActive = f.value === 0;
        btn.className = 'feedback-filter-btn' + (isActive ? ' active' : '');
        btn.dataset.filterBtn = f.value;
        btn.textContent = f.label;
        btn.setAttribute('aria-label', f.value === 0 ? 'Show all feedback' : 'Show feedback with ' + f.value + '+ stars');
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        btn.addEventListener('click', function () {
          setRatingFilter(f.value);
        });
        filterBar.appendChild(btn);
      })(filters[i]);
    }

    feedHeader.parentNode.insertBefore(filterBar, feedHeader.nextSibling);
  }

  // ─── Load Feedback from Firestore (real-time) ───
  var feedbackUnsubscribe = null;

  function loadFeedback() {
    if (!db || !feedbackList) return;

    if (feedbackUnsubscribe) {
      feedbackUnsubscribe();
    }

    feedbackUnsubscribe = db.collection('feedback')
      .orderBy('createdAt', 'desc')
      .onSnapshot(function (snapshot) {
        // Clean up reply listeners before re-render
        cleanupReplies();

        // Hide loading
        if (feedbackLoading) {
          feedbackLoading.style.display = 'none';
        }

        // Store all docs for client-side filtering
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
        if (feedbackLoading) {
          feedbackLoading.style.display = 'none';
        }
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
      var originalContent = btn.innerHTML;
      var nameInput = feedbackForm.querySelector('#feedback-name');
      var ratingInput = feedbackForm.querySelector('input[name="rating"]:checked');
      var messageInput = feedbackForm.querySelector('#feedback-message');

      var name = nameInput ? nameInput.value.trim() : '';
      var rating = ratingInput ? ratingInput.value : '';
      var message = messageInput ? messageInput.value.trim() : '';

      // Validation
      if (!name || !rating || !message) {
        btn.textContent = 'Please fill in all fields';
        btn.style.opacity = '0.6';
        setTimeout(function () {
          btn.innerHTML = originalContent;
          btn.style.opacity = '1';
        }, 2000);
        return;
      }

      btn.textContent = 'Submitting...';
      btn.disabled = true;

      if (feedbackError) feedbackError.hidden = true;
      if (feedbackSuccess) feedbackSuccess.hidden = true;

      db.collection('feedback').add({
        name: name,
        rating: parseInt(rating, 10),
        message: message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () {
        // Success
        feedbackForm.reset();
        if (feedbackSuccess) feedbackSuccess.hidden = false;

        setTimeout(function () {
          if (feedbackSuccess) feedbackSuccess.hidden = true;
        }, 4000);
      }).catch(function (error) {
        console.error('Feedback submit error:', error);
        if (feedbackError) feedbackError.hidden = false;
      }).finally(function () {
        btn.innerHTML = originalContent;
        btn.disabled = false;
      });
    });
  }

  // ─── Event Delegation: Reply buttons & form actions ───
  if (feedbackList) {
    feedbackList.addEventListener('click', function (e) {
      var replyBtn = e.target.closest('[data-reply-btn]');
      if (replyBtn) {
        e.preventDefault();
        handleReplyClick(replyBtn);
        return;
      }

      var submitBtn = e.target.closest('.feedback-reply-submit');
      if (submitBtn) {
        e.preventDefault();
        handleReplySubmit(submitBtn);
        return;
      }

      var cancelBtn = e.target.closest('.feedback-reply-cancel');
      if (cancelBtn) {
        e.preventDefault();
        var form = cancelBtn.closest('.feedback-reply-form');
        if (!form) return;
        var id = form.dataset.replyForm;
        form.querySelector('.feedback-reply-name').value = '';
        form.querySelector('.feedback-reply-message').value = '';
        form.hidden = true;
        var btn = document.querySelector('[data-reply-btn="' + id + '"]');
        if (btn) {
          btn.setAttribute('aria-expanded', 'false');
          var textSpan = btn.querySelector('[data-reply-text]');
          if (textSpan) textSpan.textContent = 'Reply';
        }
        var repliesContainer = document.querySelector('[data-replies="' + id + '"]');
        if (repliesContainer) repliesContainer.hidden = true;
      }
    });
  }

  // ─── Initialize Feedback Load ───
  if (feedbackList) {
    initFilterBar();
    loadFeedback();
  }

  // ─── APK Download ───
  if (apkDownload) {
    apkDownload.addEventListener('click', (e) => {
      /* ─── INTEGRATION GUIDE ───
       * Replace the href attribute with your actual APK URL:
       * <a href="https://example.com/day-tracker-v1.0.apk" data-apk-download>
       *
       * Or track downloads before redirecting:
       * e.preventDefault();
       * console.log('APK download initiated');
       * window.location.href = 'https://example.com/day-tracker.apk';
       */
    });
  }

})();
