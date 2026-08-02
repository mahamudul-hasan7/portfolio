import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(projectRoot, 'portfolio');

const requiredFiles = [
  'vercel.json',
  'api/contact.js',
  'database/schema.sql',
  'portfolio/index.html',
  'portfolio/projects.html',
  'portfolio/blogs.html',
  'portfolio/gallery.html',
  'portfolio/resume.html',
  'portfolio/contact.html',
  'portfolio/css/styles.css',
  'portfolio/data/content.json',
  'portfolio/js/content-loader.js',
  'portfolio/js/profile-images.config.js',
  'portfolio/js/script.js',
  'portfolio/assets/documents/Md_Mahamudul_Hasan_Professional_CV.pdf'
];

const forbiddenPaths = [
  'experience-portfolio',
  'output',
  'deliverables',
  'portfolio/netlify',
  'portfolio/_headers',
  'portfolio/_redirects',
  'portfolio/cover.jpg'
];

const failures = [];
const fail = message => failures.push(message);

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(projectRoot, relativePath))) fail(`Missing required file: ${relativePath}`);
}

for (const relativePath of forbiddenPaths) {
  if (fs.existsSync(path.join(projectRoot, relativePath))) fail(`Legacy path still exists: ${relativePath}`);
}

for (const jsonFile of ['vercel.json', 'portfolio/data/content.json', 'package.json']) {
  try {
    JSON.parse(fs.readFileSync(path.join(projectRoot, jsonFile), 'utf8'));
  } catch (error) {
    fail(`Invalid JSON: ${jsonFile} (${error.message})`);
  }
}

for (const scriptFile of [
  'api/_api-utils.js',
  'api/_contact-store.js',
  'api/contact.js',
  'portfolio/js/content-loader.js',
  'portfolio/js/profile-images.config.js',
  'portfolio/js/script.js'
]) {
  try {
    new Function(fs.readFileSync(path.join(projectRoot, scriptFile), 'utf8'));
  } catch (error) {
    fail(`Invalid JavaScript: ${scriptFile} (${error.message})`);
  }
}

const htmlFiles = fs.readdirSync(publicRoot)
  .filter(file => file.endsWith('.html'))
  .map(file => path.join(publicRoot, file));

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const referencePattern = /(?:href|src|data-img)="([^"]*)"/g;
  for (const match of html.matchAll(referencePattern)) {
    const rawReference = match[1].trim();
    if (!rawReference || /^(?:#|https?:|mailto:|tel:|data:)/i.test(rawReference)) continue;

    const cleanReference = rawReference.split('#')[0].split('?')[0];
    if (!cleanReference) continue;
    const referencedPath = path.resolve(path.dirname(htmlFile), decodeURIComponent(cleanReference));

    if (referencedPath !== publicRoot && !referencedPath.startsWith(`${publicRoot}${path.sep}`)) {
      fail(`Reference escapes public root: ${path.basename(htmlFile)} -> ${rawReference}`);
      continue;
    }
    if (!fs.existsSync(referencedPath)) {
      fail(`Broken local reference: ${path.basename(htmlFile)} -> ${rawReference}`);
    }
  }

  if (/rakib\d*\.jpg/i.test(html)) fail(`Legacy image name remains in ${path.basename(htmlFile)}`);
}

const pdfPath = path.join(publicRoot, 'assets', 'documents', 'Md_Mahamudul_Hasan_Professional_CV.pdf');
if (fs.existsSync(pdfPath)) {
  const signature = fs.readFileSync(pdfPath).subarray(0, 5).toString('ascii');
  if (signature !== '%PDF-') fail('Public CV is not a valid PDF package.');
}

if (failures.length) {
  console.error(failures.map(message => `- ${message}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Project validation passed: ${htmlFiles.length} HTML pages checked.`);
}
