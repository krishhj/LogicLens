/**
 * LogicLens i18n & Translation Manager
 * Supports English (en), Hindi (hi), and Marathi (mr)
 */

(function () {
    const SUPPORTED_LANGS = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' }
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
                includedLanguages: 'en,hi,mr',
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

    document.addEventListener('DOMContentLoaded', function () {
        suppressGoogleTranslateBanner();
        renderLangSelector();
        loadGoogleTranslateScript();
    });
})();
