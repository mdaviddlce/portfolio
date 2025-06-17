/**
 * Configuración principal
 */
const CONFIG = {
    defaultLanguage: 'es',
    cvBaseName: 'CV_Marcos_DeLaCruz',
    translationPath: './lang/'
};

/**
 * Estado de la aplicación
 */
const APP_STATE = {
    currentLanguage: CONFIG.defaultLanguage,
    translations: null
};

/**
 * Elementos del DOM
 */
const DOM = {
    cvButton: document.getElementById('cvButton'),
    languageSelector: document.querySelector('.language-selector'),
    languageButtons: document.querySelectorAll('.language-selector button')
};

// Inicialización
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Función principal de inicialización
 */
async function initApp() {
    try {
        const savedLanguage = localStorage.getItem('preferredLanguage') || CONFIG.defaultLanguage;
        await loadLanguage(savedLanguage);
        setupEventListeners();
        highlightActiveLanguageButton();
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        await loadLanguage(CONFIG.defaultLanguage);
    }
    setTimeout(preloadOtherLanguage, 1000);
}

/**
 * Carga un idioma y actualiza la interfaz
 */
async function loadLanguage(lang) {
    try {
        startLanguageTransition();
        
        const response = await fetch(`${CONFIG.translationPath}${lang}.json`);
        if (!response.ok) throw new Error(`No se encontraron traducciones para ${lang}`);
        
        APP_STATE.translations = await response.json();
        APP_STATE.currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        updateUITexts();
        updateCVLink();
        highlightActiveLanguageButton();
        
    } catch (error) {
        console.error(`Error cargando idioma ${lang}:`, error);
        if (lang !== CONFIG.defaultLanguage) {
            await loadLanguage(CONFIG.defaultLanguage);
        }
    } finally {
        endLanguageTransition();
    }
}

/**
 * Animación durante el cambio de idioma
 */
function startLanguageTransition() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.classList.add('changing-language');
    });
}

function endLanguageTransition() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.classList.remove('changing-language');
    });
}

/**
 * Actualiza los textos de la interfaz
 */
function updateUITexts() {
    const isMobile = window.innerWidth < 600;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (APP_STATE.translations[key]) {
            let text = APP_STATE.translations[key];
            
            if (isMobile) {
                // En móviles, reemplazar \n por espacios para mejor ajuste
                text = text.replace(/\\n/g, ' ');
                element.textContent = text;
            } else {
                // En desktop, mantener los saltos de línea
                text = text.replace(/\\n/g, '<br>');
                element.innerHTML = text;
            }
        }
    });
}

/**
 * Actualiza el enlace del CV
 */
function updateCVLink() {
    if (!DOM.cvButton) return;
    
    const cvPath = DOM.cvButton.getAttribute(`data-cv-${APP_STATE.currentLanguage}`);
    if (cvPath) {
        DOM.cvButton.href = cvPath;
        DOM.cvButton.download = `${CONFIG.cvBaseName}_${APP_STATE.currentLanguage.toUpperCase()}.pdf`;
        DOM.cvButton.style.opacity = '1';
        DOM.cvButton.style.pointerEvents = 'auto';
    } else {
        DOM.cvButton.style.opacity = '0.5';
        DOM.cvButton.style.pointerEvents = 'none';
    }
}

/**
 * Resalta el botón del idioma activo
 */
function highlightActiveLanguageButton() {
    DOM.languageButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === APP_STATE.currentLanguage);
    });
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Botones de idioma
    DOM.languageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang && lang !== APP_STATE.currentLanguage) {
                loadLanguage(lang);
            }
        });
    });
    
    // Tracking de descargas
    if (DOM.cvButton) {
        DOM.cvButton.addEventListener('click', trackDownload);
    }
}

function trackDownload() {
    console.log(`CV descargado en ${APP_STATE.currentLanguage}`);
    // gtag('event', 'download', { 'file_name': DOM.cvButton.download });
}

/**
 * Precarga el otro idioma
 */
function preloadOtherLanguage() {
    const otherLang = APP_STATE.currentLanguage === 'es' ? 'en' : 'es';
    fetch(`${CONFIG.translationPath}${otherLang}.json`).catch(() => {});
}

// En la función initApp()
window.addEventListener('resize', handleResize);

// Nueva función
function handleResize() {
    updateUITexts();
    repositionElements();
}

function repositionElements() {
    const isMobile = window.innerWidth < 600;
    const cvButton = document.getElementById('cvButton');
    
    if (isMobile && cvButton) {
        cvButton.style.left = '50%';
        cvButton.style.transform = 'translateX(-50%)';
    } else if (cvButton) {
        cvButton.style.left = '20px';
        cvButton.style.transform = 'none';
    }
}