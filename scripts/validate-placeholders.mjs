// Pair the image placeholder classes and rules of the generated pages.
//
// An image box carries the class `imgB-<md5>-<format>`, where the md5 is of the
// image's own address and the format is `LQIP` for a blurred copy or `GIP` for a
// gradient, and `be-best/layouts/_partials/images/image-process.html` writes the
// `.imgB-<md5>-<format>` rule for every image the page drew, in a
// `<style media="screen">` block in that page's head. A class with no rule leaves
// an image box unpainted while the picture loads; a rule with no class carries a
// base64 image no visitor sees. Both are reported here, page by page.
//
// Run after a Hugo build, as `pnpm run test:placeholders`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const publicDir = 'public';

// The class an image box carries, and the rule that paints it, as the name of a
// placeholder: `<md5>-<format>`.
const PLACE = /class="[^"]*\bimgB-([0-9a-f]{32}-[A-Z]+)\b[^"]*"/g;
const RULE = /\.imgB-([0-9a-f]{32}-[A-Z]+)\s*\{/g;

function htmlFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
            files.push(...htmlFiles(full));
        } else if (entry.endsWith('.html')) {
            files.push(full);
        }
    }
    return files.sort();
}

const names = (text, pattern) =>
    new Set([...text.matchAll(pattern)].map((m) => m[1]));

// The placeholder names an element on the page carries, and the names the page's
// style blocks define.
const pagesWithPlaceholders = [];
const offenders = [];
let classCount = 0;
let ruleCount = 0;

for (const file of htmlFiles(publicDir)) {
    const html = readFileSync(file, 'utf8');
    const classes = names(html, PLACE);
    const rules = new Set();
    for (const block of html.matchAll(
        /<style media="screen">([\s\S]*?)<\/style>/g
    )) {
        for (const m of block[1].matchAll(RULE)) rules.add(m[1]);
    }
    if (!classes.size && !rules.size) continue;
    pagesWithPlaceholders.push(file);
    classCount += classes.size;
    ruleCount += rules.size;
    const page = path.relative(publicDir, file).split(path.sep).join('/');
    for (const name of classes) {
        if (!rules.has(name)) offenders.push({ page, name, why: 'no rule' });
    }
    for (const name of rules) {
        if (!classes.has(name))
            offenders.push({ page, name, why: 'no element' });
    }
}

if (offenders.length) {
    console.error(
        `placeholders: ${offenders.length} unmatched in ` +
            `${pagesWithPlaceholders.length} pages carrying images`
    );
    for (const { page, name, why } of offenders) {
        console.error(`  ${page}: imgB-${name} ${why}`);
    }
    process.exit(1);
}

console.log(
    `placeholders: ${pagesWithPlaceholders.length} pages carrying images, ` +
        `${classCount} classes and ${ruleCount} rules, every class painted ` +
        'and every rule asked for'
);
