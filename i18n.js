// AndroidPlus - Internationalization (i18n) Manager
// 国际化管理器

class I18n {
    constructor() {
        this.currentLocale = this.detectLocale();
        this.translations = {};
        this.fallbackLocale = 'en';
        this.supportedLocales = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'ru'];
    }

    // 检测用户语言
    detectLocale() {
        // 优先从 localStorage 读取
        const saved = localStorage.getItem('androidplus_locale');
        if (saved) return saved;

        // 检测浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;

        // 简体中文
        if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh-Hans')) {
            return 'zh-CN';
        }
        // 繁体中文
        if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-Hant') || browserLang.startsWith('zh-HK')) {
            return 'zh-TW';
        }
        // 日语
        if (browserLang.startsWith('ja')) {
            return 'ja';
        }
        // 韩语
        if (browserLang.startsWith('ko')) {
            return 'ko';
        }
        // 西班牙语
        if (browserLang.startsWith('es')) {
            return 'es';
        }
        // 法语
        if (browserLang.startsWith('fr')) {
            return 'fr';
        }
        // 德语
        if (browserLang.startsWith('de')) {
            return 'de';
        }
        // 俄语
        if (browserLang.startsWith('ru')) {
            return 'ru';
        }

        // 默认英语
        return 'en';
    }

    // 加载语言包
    async loadLocale(locale) {
        if (this.translations[locale]) {
            return; // 已加载
        }

        try {
            // 尝试从 locales/ 目录加载
            const response = await fetch(`locales/${locale}.json`);
            if (response.ok) {
                this.translations[locale] = await response.json();
                return;
            }
        } catch (error) {
            console.warn(`Failed to load locale file: locales/${locale}.json`);
        }

        // 如果加载失败，使用内置语言包
        if (window.LOCALES && window.LOCALES[locale]) {
            this.translations[locale] = window.LOCALES[locale];
        }
    }

    // 切换语言
    async setLocale(locale) {
        if (!this.supportedLocales.includes(locale)) {
            console.warn(`Locale ${locale} not supported`);
            return;
        }

        await this.loadLocale(locale);
        this.currentLocale = locale;
        localStorage.setItem('androidplus_locale', locale);
        this.updateUI();
    }

    // 获取翻译文本
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLocale];

        // 遍历嵌套键
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }

        // 如果当前语言没有翻译，回退到英语
        if (value === undefined && this.currentLocale !== this.fallbackLocale) {
            let fallback = this.translations[this.fallbackLocale];
            for (const k of keys) {
                if (fallback && typeof fallback === 'object') {
                    fallback = fallback[k];
                } else {
                    fallback = undefined;
                    break;
                }
            }
            value = fallback;
        }

        // 如果还是没有，返回键名
        if (value === undefined) {
            console.warn(`Translation missing: ${key}`);
            return key;
        }

        // 替换参数
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match;
            });
        }

        return value;
    }

    // 更新 UI 中的所有文本
    updateUI() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = text;
                } else {
                    element.value = text;
                }
            } else {
                element.textContent = text;
            }
        });

        // 更新所有带有 data-i18n-html 属性的元素（支持 HTML）
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const html = this.t(key);
            element.innerHTML = html;
        });

        // 更新所有带有 data-i18n-title 属性的元素
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // 更新文档标题
        const titleKey = document.querySelector('meta[name="i18n-title"]');
        if (titleKey) {
            document.title = this.t(titleKey.content);
        }

        // 触发语言更改事件
        document.dispatchEvent(new CustomEvent('localeChanged', {
            detail: { locale: this.currentLocale }
        }));
    }

    // 获取当前语言
    getLocale() {
        return this.currentLocale;
    }

    // 获取支持的语言列表
    getSupportedLocales() {
        return this.supportedLocales.map(locale => ({
            code: locale,
            name: this.getLocaleName(locale)
        }));
    }

    // 获取语言名称
    getLocaleName(locale) {
        const names = {
            'en': 'English',
            'zh-CN': '简体中文',
            'zh-TW': '繁體中文',
            'ja': '日本語',
            'ko': '한국어',
            'es': 'Español',
            'fr': 'Français',
            'de': 'Deutsch',
            'ru': 'Русский'
        };
        return names[locale] || locale;
    }

    // 格式化日期
    formatDate(date, format = 'short') {
        const options = {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' }
        };

        return new Intl.DateTimeFormat(this.currentLocale, options[format]).format(date);
    }

    // 格式化数字
    formatNumber(number, decimals = 0) {
        return new Intl.NumberFormat(this.currentLocale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        const units = this.t('common.file_size_units').split(',');
        if (bytes === 0) return `0 ${units[0]}`;

        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = (bytes / Math.pow(k, i)).toFixed(2);

        return `${size} ${units[i]}`;
    }
}

// 创建全局实例
window.i18n = new I18n();

// 初始化
(async () => {
    await window.i18n.loadLocale(window.i18n.currentLocale);
    if (window.i18n.currentLocale !== window.i18n.fallbackLocale) {
        await window.i18n.loadLocale(window.i18n.fallbackLocale);
    }

    // 等待 DOM 加载完成后更新 UI
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.i18n.updateUI();
        });
    } else {
        window.i18n.updateUI();
    }
})();
