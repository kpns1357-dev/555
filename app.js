/* ============================================================
   THE CASE OF THE FIFTH WORD - CLIENT JAVASCRIPT
   Interactive Features, Search, Speech Synthesis, Theme, Quiz
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. THEME TOGGLE (Dark / Light)
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const htmlEl = document.documentElement;

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('fifth-word-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('fifth-word-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // 2. PRACTICE MODE (Self-Testing / Quiz Mode)
  const practiceToggleBtn = document.getElementById('btn-practice-toggle');
  let isPracticeMode = false;

  practiceToggleBtn.addEventListener('click', () => {
    isPracticeMode = !isPracticeMode;
    document.body.classList.toggle('practice-mode', isPracticeMode);
    practiceToggleBtn.classList.toggle('active-mode', isPracticeMode);

    if (isPracticeMode) {
      practiceToggleBtn.querySelector('.action-text').textContent = 'Exit Practice';
      showToast('🎯 Practice Mode Enabled: Answers hidden! Click "Reveal" to check.');
      setupPracticeButtons();
    } else {
      practiceToggleBtn.querySelector('.action-text').textContent = 'Practice Mode';
      showToast('Practice Mode Disabled: All answers visible.');
      removePracticeButtons();
    }
  });

  function setupPracticeButtons() {
    document.querySelectorAll('.qa-item').forEach(item => {
      if (!item.querySelector('.practice-reveal-btn')) {
        const revealBtn = document.createElement('button');
        revealBtn.className = 'practice-reveal-btn';
        revealBtn.innerHTML = '👁️ Reveal Answer';
        revealBtn.addEventListener('click', () => {
          const body = item.querySelector('.qa-body');
          const isHidden = body.classList.contains('manually-revealed');
          if (isHidden) {
            body.classList.remove('manually-revealed');
            revealBtn.innerHTML = '👁️ Reveal Answer';
          } else {
            body.classList.add('manually-revealed');
            revealBtn.innerHTML = '🙈 Hide Answer';
          }
        });
        const qaBody = item.querySelector('.qa-body');
        qaBody.prepend(revealBtn);
      }
    });

    // Add inline CSS for manually revealed items in practice mode
    let practiceStyle = document.getElementById('practice-dynamic-style');
    if (!practiceStyle) {
      practiceStyle = document.createElement('style');
      practiceStyle.id = 'practice-dynamic-style';
      practiceStyle.textContent = `
        body.practice-mode .qa-body.manually-revealed .answer-pill,
        body.practice-mode .qa-body.manually-revealed .answer-explanation,
        body.practice-mode .qa-body.manually-revealed .answer-highlight,
        body.practice-mode .qa-body.manually-revealed .answer-full-text,
        body.practice-mode .qa-body.manually-revealed .sketch-wrapper,
        body.practice-mode .qa-body.manually-revealed .option-item.correct,
        body.practice-mode .qa-body.manually-revealed .option-item.false-target,
        body.practice-mode .qa-body.manually-revealed .trait-pill {
          display: block !important;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(practiceStyle);
    }
  }

  function removePracticeButtons() {
    document.querySelectorAll('.practice-reveal-btn').forEach(btn => btn.remove());
    document.querySelectorAll('.qa-body.manually-revealed').forEach(b => b.classList.remove('manually-revealed'));
  }

  // 3. COPY TO CLIPBOARD
  document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      const qaItem = button.closest('.qa-item');
      const prompt = qaItem ? qaItem.querySelector('.qa-prompt').innerText : '';

      if (targetEl) {
        const fullText = `Question: ${prompt}\n\n${targetEl.innerText}`;
        navigator.clipboard.writeText(fullText).then(() => {
          showToast('📋 Copied answer to clipboard!');
          const origText = button.innerHTML;
          button.innerHTML = '✅ Copied!';
          setTimeout(() => {
            button.innerHTML = origText;
          }, 2000);
        }).catch(err => {
          console.error('Clipboard copy error:', err);
          showToast('Failed to copy to clipboard.');
        });
      }
    });
  });

  // 4. TOAST NOTIFICATION
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // 5. LIVE SEARCH & FILTER
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const allQAItems = document.querySelectorAll('.qa-item');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length > 0) {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }

    let matchCount = 0;
    allQAItems.forEach(item => {
      const text = item.innerText.toLowerCase();
      if (text.includes(query)) {
        item.style.display = '';
        matchCount++;
      } else {
        item.style.display = 'none';
      }
    });

    // Also check sections
    document.querySelectorAll('.section-card').forEach(sec => {
      if (sec.id === 'cipher-tool') return;
      const visibleItems = sec.querySelectorAll('.qa-item:not([style*="display: none"])');
      const hasHeadingMatch = sec.querySelector('.section-title')?.innerText.toLowerCase().includes(query);
      if (visibleItems.length === 0 && !hasHeadingMatch && query !== '') {
        sec.style.display = 'none';
      } else {
        sec.style.display = '';
      }
    });
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    searchInput.focus();
  });

  // 6. PRINT / PDF BUTTON
  const printBtn = document.getElementById('btn-print');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 7. READ ALOUD (WEB SPEECH API)
  const readAloudBtn = document.getElementById('btn-read-aloud');
  let isSpeaking = false;
  let synth = window.speechSynthesis;

  if (readAloudBtn && 'speechSynthesis' in window) {
    readAloudBtn.addEventListener('click', () => {
      if (isSpeaking) {
        synth.cancel();
        isSpeaking = false;
        readAloudBtn.querySelector('.icon').textContent = '🔊';
        readAloudBtn.querySelector('.action-text').textContent = 'Listen';
        readAloudBtn.classList.remove('active-mode');
        showToast('Speech playback stopped.');
      } else {
        // Find visible text to read
        const mainText = document.querySelector('.hero-title').innerText + ". " +
                         document.querySelector('.hero-subtitle').innerText + ". " +
                         "Chapter overview and solutions from pages 107 to 110 of Poorvi.";
        
        const utterance = new SpeechSynthesisUtterance(mainText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          isSpeaking = false;
          readAloudBtn.querySelector('.icon').textContent = '🔊';
          readAloudBtn.querySelector('.action-text').textContent = 'Listen';
          readAloudBtn.classList.remove('active-mode');
        };

        utterance.onerror = () => {
          isSpeaking = false;
          readAloudBtn.querySelector('.icon').textContent = '🔊';
          readAloudBtn.querySelector('.action-text').textContent = 'Listen';
          readAloudBtn.classList.remove('active-mode');
        };

        synth.speak(utterance);
        isSpeaking = true;
        readAloudBtn.querySelector('.icon').textContent = '⏹️';
        readAloudBtn.querySelector('.action-text').textContent = 'Stop';
        readAloudBtn.classList.add('active-mode');
        showToast('Reading chapter introduction aloud...');
      }
    });
  }

  // 8. SCROLL-SPY FOR NAV TABS
  const navTabs = document.querySelectorAll('.nav-tab[data-page]');
  const pageSections = document.querySelectorAll('.page-anchor');

  window.addEventListener('scroll', () => {
    let currentId = '';
    pageSections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      if (window.scrollY >= sectionTop) {
        currentId = section.getAttribute('id');
      }
    });

    navTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('href') === `#${currentId}`) {
        tab.classList.add('active');
      }
    });
  });

});
