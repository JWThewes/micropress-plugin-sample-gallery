import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gallery: {
      insertGallery: (options?: { images?: string[]; columns?: number }) => ReturnType;
      updateGallery: (options: { images?: string[]; columns?: number }) => ReturnType;
    };
  }
}

export interface GalleryOptions {
  HTMLAttributes: Record<string, any>;
  defaultColumns: number;
}

export default Node.create<GalleryOptions>({
  name: 'gallery',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      defaultColumns: 3,
    };
  },

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: element => {
          const data = element.getAttribute('data-images');
          return data ? JSON.parse(data) : [];
        },
        renderHTML: attributes => ({
          'data-images': JSON.stringify(attributes.images),
        }),
      },
      columns: {
        default: this.options.defaultColumns,
        parseHTML: element => parseInt(element.getAttribute('data-columns') || '3', 10),
        renderHTML: attributes => ({
          'data-columns': attributes.columns,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gallery"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'gallery' })];
  },

  addCommands() {
    return {
      insertGallery:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              images: options.images || [],
              columns: options.columns || this.options.defaultColumns,
            },
          });
        },
      updateGallery:
        options =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, options);
        },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div');
      dom.className = 'gallery-node-view';
      dom.setAttribute('data-type', 'gallery');

      const renderGallery = () => {
        const images: string[] = node.attrs.images || [];
        const columns: number = node.attrs.columns || 3;

        if (images.length === 0) {
          dom.innerHTML = `
            <div class="gallery-empty" style="
              border: 2px dashed #ccc;
              border-radius: 8px;
              padding: 32px;
              text-align: center;
              background: #f9f9f9;
              cursor: pointer;
            ">
              <div style="font-size: 24px; margin-bottom: 8px;">🖼️</div>
              <div style="color: #666; margin-bottom: 12px;">Image Gallery</div>
              <button class="gallery-add-btn" style="
                background: #4a90d9;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
              ">Add Images</button>
              <div style="margin-top: 8px; font-size: 12px; color: #999;">
                Columns: ${columns}
              </div>
            </div>
          `;
        } else {
          dom.innerHTML = `
            <div class="gallery-grid" style="
              display: grid;
              grid-template-columns: repeat(${columns}, 1fr);
              gap: 8px;
              padding: 8px;
              background: #f5f5f5;
              border-radius: 8px;
            ">
              ${images.map((src, i) => `
                <div class="gallery-item" style="position: relative; aspect-ratio: 1;">
                  <img src="${src}" alt="Gallery image ${i + 1}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 4px;
                  " />
                  <button class="gallery-remove-btn" data-index="${i}" style="
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    font-size: 14px;
                    line-height: 1;
                  ">×</button>
                </div>
              `).join('')}
              <div class="gallery-add" style="
                aspect-ratio: 1;
                border: 2px dashed #ccc;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                background: white;
              ">
                <span style="font-size: 24px; color: #999;">+</span>
              </div>
            </div>
            <div style="text-align: center; padding: 4px; font-size: 12px; color: #666;">
              ${images.length} image${images.length !== 1 ? 's' : ''} • ${columns} columns
            </div>
          `;
        }

        // Add event listeners
        const addBtn = dom.querySelector('.gallery-add-btn');
        const addCell = dom.querySelector('.gallery-add');
        const removeBtns = dom.querySelectorAll('.gallery-remove-btn');

        const handleAddImages = () => {
          const url = window.prompt('Enter image URL:');
          if (url && typeof getPos === 'function') {
            const newImages = [...(node.attrs.images || []), url];
            editor.chain().focus().updateAttributes('gallery', { images: newImages }).run();
          }
        };

        addBtn?.addEventListener('click', handleAddImages);
        addCell?.addEventListener('click', handleAddImages);

        removeBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt((btn as HTMLElement).dataset.index || '0', 10);
            if (typeof getPos === 'function') {
              const newImages = [...(node.attrs.images || [])];
              newImages.splice(index, 1);
              editor.chain().focus().updateAttributes('gallery', { images: newImages }).run();
            }
          });
        });
      };

      renderGallery();

      return {
        dom,
        update: updatedNode => {
          if (updatedNode.type.name !== this.name) return false;
          node = updatedNode;
          renderGallery();
          return true;
        },
      };
    };
  },
});
