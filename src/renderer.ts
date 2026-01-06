import { PluginSDK } from '@micropress/plugin-sdk';

export function beforeConversion(json: any, sdk: PluginSDK) {
  return json;
}

export function afterConversion(html: string, sdk: PluginSDK) {
  return html.replace(/<div data-type="gallery"[^>]*>/g, '<div class="gallery-grid">');
}

export function injectAssets() {
  return {
    css: `.gallery-grid { display: grid; gap: 1rem; grid-template-columns: repeat(var(--gallery-cols, 3), 1fr); }`,
    js: ''
  };
}
