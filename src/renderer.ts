import {PluginSDK} from '@micropress/plugin-sdk';

export function beforeConversion(json: any, sdk: PluginSDK) {
    return json;
}

export function afterConversion(html: string, sdk: PluginSDK) {
    return html.replace(
        /<div data-type="gallery"([^>]*)><\/div>/g,
        (match, attrs) => {
            // Extract images from data-images attribute
            const imagesMatch = attrs.match(/data-images="([^"]*)"/);
            const columnsMatch = attrs.match(/data-columns="([^"]*)"/);

            let images: string[] = [];
            try {
                if (imagesMatch) {
                    // Decode HTML entities and parse JSON
                    const decoded = imagesMatch[1]
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>');
                    images = JSON.parse(decoded);
                }
            } catch (e) {
                console.error('Failed to parse gallery images:', e);
            }

            const columns = columnsMatch ? columnsMatch[1] : '3';

            if (images.length === 0) {
                return '';
            }

            const imagesHtml = images
                .map(src => `<img src="${src}" alt="" loading="lazy">`)
                .join('\n');

            return `<div class="gallery-grid" style="--gallery-cols: ${columns}">\n${imagesHtml}\n</div>`;
        }
    );
}

export function injectAssets() {
    return {
        css: `.gallery-grid { display: grid; gap: 1rem; grid-template-columns: repeat(var(--gallery-cols, 3), 1fr); }
.gallery-grid img { width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; border-radius: 4px; }`,
        js: ''
    };
}
