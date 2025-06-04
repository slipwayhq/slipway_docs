import fs from 'fs';
import path from 'path';
import {visit} from 'unist-util-visit';

export default function jsonDirective() {
  const dataDir = path.resolve('static/data');

  return (tree) => {
    visit(tree, (node) => {
      // Only look at container directives: ::insert{file=foo.json}
      if (
        node.type === 'containerDirective' 
        || node.type === 'leafDirective'
      ) {
        if (node.name !== 'insert') return;

        const file = node.attributes?.file;
        if (!file) return;

        const fullPath = path.join(dataDir, file);
        if (!fs.existsSync(fullPath)) return;

        const raw = fs.readFileSync(fullPath, 'utf8');

        const title = node.attributes?.title || file;
        const highlight = node.attributes?.highlight; // e.g. "2,4-5"

        // Get file extension to determine language
        const ext = path.extname(file).slice(1).toLowerCase();

        // Build meta string for code block
        let meta = `showLineNumbers title="${title}"`;
        if (highlight) {
          meta += ` {${highlight}}`;
        }

        // Replace the directive with a fenced code node
        node.type = 'code';
        node.lang = ext;
        node.value = raw;
        node.meta  = meta; 
        delete node.name;
      }
    });
  };
}