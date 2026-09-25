/**
 * LogicLens i18n & Translation Manager
 * Supports English (en), Hindi (hi), Marathi (mr), and Gujarati (gu)
 */

(function () {
    const SUPPORTED_LANGS = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
        { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' }
    ];

    function getSavedLang() {
        return localStorage.getItem('logiclens_lang') || 'en';
    }

    function setSavedLang(lang) {
        localStorage.setItem('logiclens_lang', lang);
        setCookie('googtrans', `/en/${lang}`, 30);
        setCookie('googtrans', `/en/${lang}`, 30, window.location.hostname);
    }

    function setCookie(name, value, days, domain) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        let domainStr = domain ? "; domain=" + domain : "";
        document.cookie = name + "=" + (value || "") + expires + "; path=/" + domainStr;
    }

    window.googleTranslateElementInit = function () {
        if (window.google && window.google.translate) {
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,mr,gu',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');

            // Apply saved language after widget initializes
            const currentLang = getSavedLang();
            if (currentLang !== 'en') {
                applyLanguage(currentLang, false);
            }
        }
    };

    function loadGoogleTranslateScript() {
        if (document.getElementById('google-translate-script')) return;

        // Hidden container for Google Translate element
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.display = 'none';
            document.body.appendChild(div);
        }

        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);
    }

    function applyLanguage(langCode, shouldReload = true) {
        setSavedLang(langCode);

        const selectElem = document.querySelector('.goog-te-combo');
        if (selectElem) {
            selectElem.value = langCode;
            selectElem.dispatchEvent(new Event('change'));
        } else if (shouldReload) {
            window.location.reload();
        }
    }

    function renderLangSelector() {
        const navRight = document.querySelector('nav .nav-right') || document.querySelector('nav');
        if (!navRight || document.getElementById('logiclensLangWrapper')) return;

        const currentLang = getSavedLang();

        const wrapper = document.createElement('div');
        wrapper.id = 'logiclensLangWrapper';
        wrapper.className = 'lang-select-wrapper';

        let optionsHtml = SUPPORTED_LANGS.map(l => 
            `<option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.name}</option>`
        ).join('');

        wrapper.innerHTML = `
            <span class="lang-icon">🌐</span>
            <select id="logiclensLangSelect" class="lang-select" aria-label="Select Language">
                ${optionsHtml}
            </select>
        `;

        // Insert before theme toggle or at the end of nav controls
        const themeToggle = navRight.querySelector('.switch') || navRight.querySelector('#themeToggle');
        if (themeToggle && themeToggle.parentNode === navRight) {
            navRight.insertBefore(wrapper, themeToggle);
        } else {
            navRight.appendChild(wrapper);
        }

        const langSelect = document.getElementById('logiclensLangSelect');
        if (langSelect) {
            langSelect.addEventListener('change', function (e) {
                applyLanguage(e.target.value, true);
            });
        }
    }

    function suppressGoogleTranslateBanner() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .goog-te-banner-frame,
            iframe.goog-te-banner-frame,
            .goog-te-banner-frame.skiptranslate,
            .goog-te-balloon-frame,
            #goog-gt-tt,
            #goog-gt-vt,
            .goog-te-spinner-pos {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
            }
            body {
                top: 0px !important;
                position: static !important;
            }
            body > .skiptranslate:not(#logiclensLangWrapper) {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        // Keep body top at 0px if Google Translate attempts inline style mutations
        setInterval(function () {
            if (document.body && document.body.style.top !== '0px' && document.body.style.top !== '') {
                document.body.style.top = '0px';
            }
            const banner = document.querySelector('.goog-te-banner-frame');
            if (banner) {
                banner.style.display = 'none';
            }
        }, 300);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('logiclens_theme') || 'light';
        const themeToggle = document.getElementById('themeToggle');

        if (savedTheme === 'dark') {
            document.body.classList.remove('light');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.add('light');
            if (themeToggle) themeToggle.checked = false;
        }

        if (themeToggle && !themeToggle.dataset.themeBound) {
            themeToggle.dataset.themeBound = 'true';
            themeToggle.addEventListener('change', function () {
                if (this.checked) {
                    document.body.classList.remove('light');
                    localStorage.setItem('logiclens_theme', 'dark');
                } else {
                    document.body.classList.add('light');
                    localStorage.setItem('logiclens_theme', 'light');
                }
            });
        }
    }

    function protectCodeFromTranslation() {
        const selectors = [
            'code',
            'pre',
            'textarea',
            '.notranslate',
            '.diff-code',
            '.comp-code',
            '.code-container',
            '.code-box',
            '.op-code',
            '.code-display',
            '.modal-code-comparison',
            '#editor',
            '#codeInput',
            '#treeCodeInput',
            '#stringCodeInput',
            '#stackCodeInput',
            '#sentenceCodeInput',
            '#queueCodeInput',
            '#graphCodeInput',
            '#modalOriginalCode',
            '#modalCorrectedCode',
            '#codeDisplay',
            '#codeOutput',
            '#codeSummaryPanel',
            '[id*="CodeInput"]',
            '[id*="codeInput"]'
        ];

        function applyProtection(root) {
            if (!root || root.nodeType !== 1) return;
            selectors.forEach(selector => {
                if (root.matches && root.matches(selector)) {
                    root.classList.add('notranslate');
                    root.setAttribute('translate', 'no');
                }
                if (root.querySelectorAll) {
                    root.querySelectorAll(selector).forEach(el => {
                        el.classList.add('notranslate');
                        el.setAttribute('translate', 'no');
                    });
                }
            });
        }

        // Apply immediately
        applyProtection(document.body || document.documentElement);

        // Observe dynamic DOM insertions
        if (window.MutationObserver && document.body) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        applyProtection(node);
                    });
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    window.saveVisualizationFeedback = async function (isCorrect = false) {
        const btn = document.getElementById('incorrectVizBtn') || document.querySelector('.btn-incorrect-viz');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '⏳ Saving...';
        }

        const pathName = window.location.pathname.split('/').pop() || 'index.html';
        const pageTitle = document.title || pathName;
        
        let codeText = "";
        let arrayData = [];
        let stepsData = [];
        let algoName = "Default Algorithm";

        // Extract code
        const codeElem = document.getElementById('codeInput') || 
                         document.getElementById('treeCodeInput') || 
                         document.getElementById('stringCodeInput') || 
                         document.getElementById('stackCodeInput') || 
                         document.getElementById('sentenceCodeInput') || 
                         document.getElementById('queueCodeInput') || 
                         document.getElementById('graphCodeInput');
        if (codeElem) codeText = codeElem.value;

        // Extract array / inputs
        const arrayElem = document.getElementById('arrayInput');
        if (arrayElem) {
            arrayData = arrayElem.value.split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
        }

        // Extract algorithm mode if available
        if (window.currentAlgorithm) algoName = window.currentAlgorithm;
        else if (window.treeMode) algoName = window.treeMode + " Tree";
        else if (window.stringMode) algoName = window.stringMode + " String Search";
        else if (window.sentenceMode) algoName = window.sentenceMode + " Sentence Process";

        // Extract steps
        if (window.steps && Array.isArray(window.steps) && window.steps.length > 0) {
            stepsData = window.steps;
        } else if (window.currentSteps && Array.isArray(window.currentSteps) && window.currentSteps.length > 0) {
            stepsData = window.currentSteps;
        }

        const payload = {
            id: "viz_" + Date.now(),
            page: pageTitle,
            filename: pathName,
            algorithm: algoName,
            code: codeText,
            array: arrayData,
            steps: stepsData,
            timestamp: new Date().toISOString(),
            isCorrect: false,
            feedback: "Incorrect Visualisation"
        };

        let saved = false;

        // 1. Try Vercel / server relative API route first
        try {
            const response = await fetch('/api/save-visualization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response && response.ok) {
                saved = true;
            }
        } catch (e1) {
            // 2. Try local Node server fallback if static local preview
            try {
                const response = await fetch('http://localhost:5000/api/save-visualization', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response && response.ok) {
                    saved = true;
                }
            } catch (e2) {
                saved = false;
            }
        }

        // 3. Always back up into client storage for Vercel static deployments
        try {
            let storedList = [];
            const existing = localStorage.getItem('correctvisualisation_data');
            if (existing) {
                try { storedList = JSON.parse(existing); } catch(e) { storedList = []; }
            }
            storedList.push(payload);
            localStorage.setItem('correctvisualisation_data', JSON.stringify(storedList));
        } catch(e) {
            console.warn("LocalStorage save warning:", e);
        }

        // Success notification on all platforms (Vercel & Local)
        showToastNotification('❌ Incorrect Visualisation Logged!', 'Reported visualization data recorded successfully for creator review.');
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '❌ Logged!';
            setTimeout(() => {
                btn.innerHTML = '❌ Incorrect Visualisation?';
            }, 3500);
        }
    };

    window.saveCorrectVisualization = function () {
        window.saveVisualizationFeedback(false);
    };

    function showToastNotification(title, message) {
        let toast = document.getElementById('logiclensToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'logiclensToast';
            toast.className = 'logiclens-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-body">${message}</div>
        `;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Apply theme immediately if body is available
    if (document.body) {
        const savedTheme = localStorage.getItem('logiclens_theme') || 'light';
        if (savedTheme === 'light') {
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initTheme();
        suppressGoogleTranslateBanner();
        renderLangSelector();
        loadGoogleTranslateScript();
        protectCodeFromTranslation();
    });
})();
