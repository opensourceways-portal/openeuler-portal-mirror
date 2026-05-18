import fs from 'node:fs';
import path from 'node:path';

export function renderTemplate(templatePath, mapping) {
  const tpl = fs.readFileSync(templatePath, 'utf-8');
  return tpl.replace(/\$\{([A-Z0-9_]+)\}/g, (m, k) =>
    Object.prototype.hasOwnProperty.call(mapping, k) ? String(mapping[k]) : m
  );
}

export function stripEmptyTlsSecret(manifest) {
  return manifest.replace(/^[ \t]*secretName:[ \t]*\n/gm, '');
}

export function resolveTemplate(name) {
  const here = path.dirname(new URL(import.meta.url).pathname);
  return path.join(here, '..', 'templates', `${name}.yaml`);
}
