// plugins/json-directive/index.js
import fs from 'fs';
import path from 'path';
import {visit} from 'unist-util-visit';

export default function jsonDirective() {
  const dataDir = path.resolve('static/data');

  return (tree) => {
    visit(tree, (node) => {
      // Only look at container directives: :::json foo.json
      if (
        node.type === 'containerDirective' 
        || node.type === 'leafDirective'
      ) {
        if (node.name !== 'json') return;

        const file = node.attributes?.file;
        if (!file) return;

        const jsonPath = path.join(dataDir, file);
        if (!fs.existsSync(jsonPath)) return;

        const raw = fs.readFileSync(jsonPath, 'utf8');

        const title = node.attributes?.title || file;

        // Replace the directive with a fenced code node
        node.type = 'code';
        node.lang = 'json';
        node.value = raw;
        node.meta  = `title="${title}"`; 
        delete node.name;
      }
    });
  };
}