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
        setupInteractiveTerminal();
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

    function setupInteractiveTerminal() {
      // Clear cursor animation if any
      const existingCursor = terminalBody.querySelector('.terminal-cursor');
      if (existingCursor) existingCursor.remove();

      // Create interactive input line
      const inputLine = document.createElement('div');
      inputLine.className = 'terminal-input-line';
      inputLine.innerHTML = `
        <span class="terminal-prompt">nithish@system:~$</span>
        <input type="text" id="terminal-input" autofocus autocomplete="off" spellcheck="false" />
      `;
      terminalBody.appendChild(inputLine);

      const inputEl = document.getElementById('terminal-input');
      if (inputEl) {
        // Focus input on load
        inputEl.focus();

        // Keep input focused when clicking inside terminal window
        const terminalWindow = document.querySelector('.terminal-window');
        if (terminalWindow) {
          terminalWindow.addEventListener('click', () => {
            inputEl.focus();
          });
        }

        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const command = inputEl.value.trim().toLowerCase();
            inputEl.value = ''; // clear input

            // Append command to visual output history
            const cmdOutput = document.createElement('div');
            cmdOutput.className = 'command';
            cmdOutput.innerHTML = `<span class="terminal-prompt">nithish@system:~$</span> <span style="color: var(--color-text);">${escapeHtml(command)}</span>`;
            // Insert before the input line
            terminalBody.insertBefore(cmdOutput, inputLine);

            handleCommand(command, inputLine);

            // Keep focus and scroll to bottom
            setTimeout(() => {
              terminalBody.scrollTop = terminalBody.scrollHeight;
              inputEl.focus();
            }, 10);
          }
        });
      }
    }

    function escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function printResponse(htmlContent, className = 'system') {
      const respLine = document.createElement('div');
      respLine.className = className;
      respLine.innerHTML = htmlContent;
      const inputLine = terminalBody.querySelector('.terminal-input-line');
      if (inputLine) {
        terminalBody.insertBefore(respLine, inputLine);
      } else {
        terminalBody.appendChild(respLine);
      }
    }

    function handleCommand(cmd, inputLine) {
      if (!cmd) return;

      switch (cmd) {
        case 'help':
          printResponse(`
            <div style="margin-left: 10px; font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.5;">
              <span style="color: var(--color-cyan);">help</span>      - Show this menu<br/>
              <span style="color: var(--color-cyan);">about</span>     - Brief professional profile bio<br/>
              <span style="color: var(--color-cyan);">skills</span>    - Core technical skill stack<br/>
              <span style="color: var(--color-cyan);">projects</span>  - Signature highlights & platforms<br/>
              <span style="color: var(--color-cyan);">contact</span>   - Quick contact connection paths<br/>
              <span style="color: var(--color-cyan);">clear</span>     - Clear terminal logs
            </div>
          `, 'info');
          break;

        case 'about':
          printResponse(`
            <span style="color: var(--color-primary); font-weight: 600;">Pujari Nithish Kumar</span><br/>
            💡 <span style="color: var(--color-text-muted);">Agentic AI Engineer specializing in enterprise autonomous LLM architectures ($80B+ platform scale) at Accenture, with a background in bare-metal Embedded C microcontrollers.</span>
          `);
          break;

        case 'skills':
          printResponse(`
            🤖 <span style="color: var(--color-primary); font-weight: 600;">Agentic AI:</span> Agentic Workflows, MS Foundry, Vector DBs, Prompt Opt.<br/>
            ⚙️ <span style="color: var(--color-secondary); font-weight: 600;">Software/Cloud:</span> Python, C# / .NET, Azure DevOps, Git.<br/>
            📟 <span style="color: var(--color-cyan); font-weight: 600;">Embedded:</span> Embedded C, STM32 HAL, FreeRTOS, UART/I2C/SPI.
          `);
          break;

        case 'projects':
          printResponse(`
            ✨ <span style="color: var(--color-primary); font-weight: 600;">DhanLaXmi</span> - On-device AI Advisor (AFM + Gemma 3 fallback)<br/>
            🌐 <span style="color: var(--color-cyan); font-weight: 600;">Enterprise Agentic AI</span> - Multi-agent Azure Foundry workflows in production<br/>
            🐱 <span style="color: var(--color-success); font-weight: 600;">Royal Paw Kitten</span> - Three.js 3D and React 19 care platform
          `);
          break;

        case 'contact':
          printResponse(`
            📧 <span style="color: var(--color-cyan);">Email:</span> nithishkumarpujari@gmail.com<br/>
            📱 <span style="color: var(--color-cyan);">Mobile:</span> +91 8978812882<br/>
            💼 <span style="color: var(--color-cyan);">LinkedIn:</span> linkedin.com/in/myselfnithish<br/>
            🐙 <span style="color: var(--color-cyan);">GitHub:</span> github.com/NITHISHPUJARI
          `);
          break;

        case 'clear':
          const divs = Array.from(terminalBody.querySelectorAll('div'));
          divs.forEach(div => {
            if (div !== inputLine) div.remove();
          });
          break;

        default:
          printResponse(`bash: command not found: ${escapeHtml(cmd)}. Type <span style="color: var(--color-cyan);">help</span> for available commands.`, 'system');
      }
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

  // --- Scroll Progress Bar & Dynamic Scroll Ratio ---
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  document.documentElement.style.setProperty('--scroll-ratio', '0');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const scrollRatio = docHeight > 0 ? scrollTop / docHeight : 0;
    
    if (scrollProgressBar) {
      scrollProgressBar.style.width = scrollPercent + '%';
    }
    document.documentElement.style.setProperty('--scroll-ratio', scrollRatio.toString());
  });

  // --- Card Mouse Spotlight Tracker ---
  const glassCards = document.querySelectorAll('.glass-card');
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // --- Visual Settings Controls & Overrides ---
  const settingsToggleBtn = document.getElementById('btn-settings-toggle');
  const settingsPanel = document.getElementById('theme-settings-panel');
  if (settingsToggleBtn && settingsPanel) {
    settingsToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!settingsPanel.contains(e.target) && e.target !== settingsToggleBtn) {
        settingsPanel.classList.remove('open');
      }
    });
  }

  // Segmented Theme Button Switcher
  const themeDarkBtn = document.getElementById('btn-theme-dark');
  const themeLightBtn = document.getElementById('btn-theme-light');
  const glassSlider = document.getElementById('glass-intensity');
  const glassLabel = document.getElementById('glass-value-label');

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);

    if (theme === 'light') {
      if (themeLightBtn) themeLightBtn.classList.add('active');
      if (themeDarkBtn) themeDarkBtn.classList.remove('active');
    } else {
      if (themeDarkBtn) themeDarkBtn.classList.add('active');
      if (themeLightBtn) themeLightBtn.classList.remove('active');
    }

    // Update border highlights when theme changes
    const currentValue = glassSlider ? glassSlider.value : (localStorage.getItem('portfolio-glass-intensity') || '30');
    updateGlassStyle(currentValue);
  }

  if (themeDarkBtn && themeLightBtn) {
    themeDarkBtn.addEventListener('click', () => setTheme('dark'));
    themeLightBtn.addEventListener('click', () => setTheme('light'));
  }

  // Liquid Glass intensity controls
  function updateGlassStyle(value) {
    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    const opacityPercent = 10 + (value / 100) * 70;
    const opacityHoverPercent = opacityPercent + 6;
    const blur = Math.max(1, 1 - (value / 100) * 1);
    const saturation = Math.max(120, 180 - (value / 100) * 60);
    const borderOpacityPercent = 12 + (value / 100) * 18;

    const borderOpacityDecimal = borderOpacityPercent / 100;
    
    let topLeftBorderColor, bottomRightBorderColor;
    if (isLightMode) {
      // Light Mode: bright white top-left highlight, dark transparent bottom-right edge for readability
      topLeftBorderColor = `rgba(255, 255, 255, ${Math.max(0.75, Math.min(1.0, borderOpacityDecimal * 5.0))})`;
      bottomRightBorderColor = `rgba(0, 0, 0, ${Math.max(0.12, borderOpacityDecimal * 0.8)})`;
    } else {
      // Dark Mode: white top-left highlight, dark transparent bottom-right edge to create depth/bevel shadow
      topLeftBorderColor = `rgba(255, 255, 255, ${Math.max(0.25, Math.min(1.0, borderOpacityDecimal * 4.0))})`;
      bottomRightBorderColor = `rgba(0, 0, 0, ${Math.max(0.2, borderOpacityDecimal * 1.5)})`;
    }

    document.documentElement.style.setProperty('--glass-bg-opacity', `${opacityPercent}%`);
    document.documentElement.style.setProperty('--glass-bg-opacity-hover', `${opacityHoverPercent}%`);
    document.documentElement.style.setProperty('--glass-blur', `${blur}px`);
    document.documentElement.style.setProperty('--glass-saturation', `${saturation}%`);
    document.documentElement.style.setProperty('--glass-border-opacity', `${borderOpacityPercent}%`);
    document.documentElement.style.setProperty('--glass-border-top-left', topLeftBorderColor);
    document.documentElement.style.setProperty('--glass-border-bottom-right', bottomRightBorderColor);

    let labelText = 'Frosted Glass';
    if (value <= 15) labelText = 'Ultra Glassy';
    else if (value > 15 && value <= 40) labelText = 'Frosted Glass';
    else if (value > 40 && value <= 70) labelText = 'Medium Tint';
    else labelText = 'Deeply Tinted';

    if (glassLabel) {
      glassLabel.textContent = labelText;
    }
    localStorage.setItem('portfolio-glass-intensity', value);
  }

  // Set initial saved theme & glass styles
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  setTheme(savedTheme);

  if (glassSlider) {
    glassSlider.addEventListener('input', (e) => {
      updateGlassStyle(e.target.value);
    });

    const savedGlass = localStorage.getItem('portfolio-glass-intensity') || '30';
    glassSlider.value = savedGlass;
    updateGlassStyle(savedGlass);
  }
});
