import { Node } from '@tiptap/core';

export default Node.create({
  name: 'gallery',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      images: { default: [] },
      columns: { default: 3 }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="gallery"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'gallery', ...HTMLAttributes }];
  }
});
