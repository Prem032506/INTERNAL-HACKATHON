const fs = require('fs');
const vm = require('vm');

// 1. Load HTML and extract all elements with data-i18n
const html = fs.readFileSync('./index.html', 'utf8');

// 2. Setup mock browser DOM
const elements = [];
const regex = /<([a-z0-9-]+)([^>]*)>(.*?)<\/\1>/gis;

const attrRegex = /data-i18n(?:-([a-z]+))?=["']([^"']+)["']/g;

// Parse DOM-like structure for verification
const i18nMatches = [...html.matchAll(/data-i18n(?:-[a-z]+)?=["']([^"']+)["']/g)].map(m => m[1]);
console.log(`[DOM Test] Total data-i18n instances in index.html: ${i18nMatches.length}`);

// 3. Test I18nManager
const i18nCode = fs.readFileSync('./js/i18n.js', 'utf8');
const domElements = i18nMatches.map(key => ({
  key,
  textContent: '',
  getAttribute: (attr) => attr === 'data-i18n' ? key : null
}));

const ctx = {
  window: {},
  document: {
    querySelectorAll: (sel) => {
      if (sel === '[data-i18n]') return domElements;
      return [];
    },
    getElementById: (id) => null,
    documentElement: { lang: 'en', dir: 'ltr' }
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  dispatchEvent: () => {},
  CustomEvent: class {}
};
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(i18nCode, ctx);

// Test English
ctx.window.i18n.setLanguage('en');
ctx.window.i18n.applyTranslations();
console.log('[EN] appTitle:', ctx.window.i18n.get('appTitle'));
console.log('[EN] navCommandCenter:', ctx.window.i18n.get('navCommandCenter'));
console.log('[EN] metricMonitoredCorridors:', ctx.window.i18n.get('metricMonitoredCorridors'));
console.log('[EN] fleetTracking:', ctx.window.i18n.get('fleetTracking'));
console.log('[EN] routeModalTitle:', ctx.window.i18n.get('routeModalTitle'));

// Test Hindi (hi)
ctx.window.i18n.setLanguage('hi');
ctx.window.i18n.applyTranslations();
console.log('\n[HI] appTitle:', ctx.window.i18n.get('appTitle'));
console.log('[HI] navCommandCenter:', ctx.window.i18n.get('navCommandCenter'));
console.log('[HI] navPitchDeck:', ctx.window.i18n.get('navPitchDeck'));
console.log('[HI] metricMonitoredCorridors:', ctx.window.i18n.get('metricMonitoredCorridors'));
console.log('[HI] metric18Active:', ctx.window.i18n.get('metric18Active'));
console.log('[HI] metricFieldConvoys:', ctx.window.i18n.get('metricFieldConvoys'));
console.log('[HI] sectorConnectivityHealth:', ctx.window.i18n.get('sectorConnectivityHealth'));
console.log('[HI] fleetTracking:', ctx.window.i18n.get('fleetTracking'));
console.log('[HI] labelSpeed:', ctx.window.i18n.get('labelSpeed'));
console.log('[HI] routeModalTitle:', ctx.window.i18n.get('routeModalTitle'));
console.log('[HI] chipNER:', ctx.window.i18n.get('chipNER'));
console.log('[HI] weatherRadarHeader:', ctx.window.i18n.get('weatherRadarHeader'));
console.log('[HI] fieldReportModalTitle:', ctx.window.i18n.get('fieldReportModalTitle'));
console.log('[HI] photoUploadLabel:', ctx.window.i18n.get('photoUploadLabel'));

// Verify that all domElements received non-empty translated content
const emptyElements = domElements.filter(el => !el.textContent || el.textContent.trim() === '');
if (emptyElements.length === 0) {
  console.log('\n✅ ALL', domElements.length, 'DOM elements successfully received Hindi translations!');
} else {
  console.error('\n❌ Elements missing translation:', emptyElements);
  process.exit(1);
}
