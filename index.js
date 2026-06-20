document.addEventListener('DOMContentLoaded', () => {
  // --- Terminal Typing Animation ---
  const terminalLines = [
    { text: 'npm run start-ai', delay: 500, class: 'command' },
    { text: '> pujari-nithish-kumar@3.0.0 start-ai', delay: 100, class: 'system' },
    { text: '> node agents/initialize.js', delay: 200, class: 'system' },
    { text: '⚙️ Loading hardware abstraction layer... [OK]', delay: 300, class: 'success' },
    { text: '🧠 Initializing Microsoft Foundry Agent Chains... [OK]', delay: 300, class: 'success' },
    { text: '🧬 Connecting to local SLM (Gemma-2B) vector store... [OK]', delay: 300, class: 'success' },
    { text: '⚡ System Online. Agentic Core Active.', delay: 500, class: 'info' }
  ];

  const terminalBody = document.getElementById('terminal-text');
  if (terminalBody) {
    let currentLine = 0;
    
    function typeLine() {
      if (currentLine >= terminalLines.length) {
        // Add final prompt line with flashing cursor
        const finalPrompt = document.createElement('div');
        finalPrompt.innerHTML = '<span class="terminal-prompt">nithish@system:~$</span><span class="terminal-cursor"></span>';
        terminalBody.appendChild(finalPrompt);
        return;
      }

      const lineData = terminalLines[currentLine];
      const lineDiv = document.createElement('div');
      lineDiv.className = lineData.class || '';
      
      if (lineData.class === 'command') {
        // Typewriter effect for command
        const promptSpan = document.createElement('span');
        promptSpan.className = 'terminal-prompt';
        promptSpan.textContent = 'nithish@system:~$ ';
        lineDiv.appendChild(promptSpan);
        
        const cmdSpan = document.createElement('span');
        lineDiv.appendChild(cmdSpan);
        terminalBody.appendChild(lineDiv);
        
        let charIndex = 0;
        function typeChar() {
          if (charIndex < lineData.text.length) {
            cmdSpan.textContent += lineData.text.charAt(charIndex);
            charIndex++;
            setTimeout(typeChar, 60);
          } else {
            currentLine++;
            setTimeout(typeLine, lineData.delay);
          }
        }
        typeChar();
      } else {
        // Instant print for output lines
        lineDiv.textContent = lineData.text;
        terminalBody.appendChild(lineDiv);
        currentLine++;
        setTimeout(typeLine, lineData.delay);
      }
      
      // Auto scroll terminal to bottom
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Start terminal typing
    typeLine();
  }

  // --- Scroll Animation Fallback (IntersectionObserver) ---
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Animate once
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      observer.observe(el);
    });
  }

  // --- Skills Tab Switcher ---
  const tabButtons = document.querySelectorAll('.skills-tab-btn');
  const contentPanels = document.querySelectorAll('.skills-content-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Deactivate all tabs & panels
      tabButtons.forEach(b => b.classList.remove('active'));
      contentPanels.forEach(p => p.classList.remove('active'));
      
      // Activate clicked tab & panel
      btn.classList.add('active');
      const targetPanel = document.getElementById(targetTab);
      if (targetPanel) {
        targetPanel.classList.add('active');
        
        // Trigger width animation for skill bars in the active panel
        const fills = targetPanel.querySelectorAll('.skill-fill');
        fills.forEach(fill => {
          const targetWidth = fill.getAttribute('data-width');
          fill.style.width = targetWidth;
        });
      }
    });
  });

  // Trigger first tab on load to run skill bar animations
  const defaultTab = document.querySelector('.skills-tab-btn.active');
  if (defaultTab) {
    defaultTab.click();
  }

  // --- Copy to Clipboard Utility ---
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const textToCopy = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.color = 'var(--color-success)';
        btn.style.borderColor = 'var(--color-success)';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      }).catch(err => {
        console.error('Clipboard copy failed: ', err);
      });
    });
  });

  // --- Scroll Spy & Sticky Navigation active state ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function scrollSpy() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', scrollSpy);
  
  // --- Mobile Navigation Menu Toggle ---
  const mobileMenuBtn = document.createElement('button');
  mobileMenuBtn.className = 'mobile-menu-btn';
  mobileMenuBtn.ariaLabel = 'Toggle navigation menu';
  mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
  
  const navContainer = document.querySelector('.nav-container');
  const navLinksList = document.querySelector('.nav-links');
  
  if (navContainer && navLinksList) {
    navContainer.appendChild(mobileMenuBtn);
    
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('open');
      navLinksList.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('open');
        navLinksList.classList.remove('open');
      });
    });
  }

  // --- Contact Form Submission Mailto handler ---
  const submitBtn = document.getElementById('btn-submit-message');
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-message').value;
      
      const form = document.getElementById('portfolio-contact-form');
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      const subject = encodeURIComponent(`Portfolio Message from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      
      // Creating a temporary <a> tag is a standard workaround for browser security blocks
      const mailtoLink = document.createElement('a');
      mailtoLink.href = `mailto:nithishkumarpujari@gmail.com?subject=${subject}&body=${body}`;
      document.body.appendChild(mailtoLink);
      mailtoLink.click();
      document.body.removeChild(mailtoLink);
    });
  }
});
