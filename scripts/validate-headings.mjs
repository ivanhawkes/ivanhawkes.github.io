// Count the top level headings of every generated page, the check the
// "Pages Have No Top Level Heading" issue asks for: each page must carry
// exactly one `h1`, the page title. Pages with none, or with more than one, are
// reported and fail `pnpm run test:headings`. Run after a Hugo build.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const publicDir = 'public';

// Pages we do not check, with the reason:
// - Hugo's pagination stubs (`.../page/1/index.html`) are meta-refresh
//   redirects with no body, so they can never hold a heading.
// - `dashboard/raw/` holds the CSS test page, whose whole purpose is to show
//   every element, headings included.
// A page can also opt out with an `<!-- h1-check: ignore -->` comment.
const skippedDirs = ['dashboard/raw'];

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

const rel = (file) => path.relative(publicDir, file).split(path.sep).join('/');

function skipReason(file) {
    const page = rel(file);
    if (/(^|\/)page\/\d+\//.test(page)) return 'pagination stub';
    if (skippedDirs.some((dir) => page.startsWith(`${dir}/`)))
        return 'layout: raw test page';
    return null;
}

// Headings in the markup, ignoring comments and code samples.
function headings(text) {
    const body = text
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<pre[\s\S]*?<\/pre>/gi, '')
        .replace(/<code[\s\S]*?<\/code>/gi, '');
    return [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
        m[1]
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
    );
}

const offenders = [];
let checked = 0;
for (const file of htmlFiles(publicDir)) {
    if (skipReason(file)) continue;
    const text = readFileSync(file, 'utf8');
    if (/<!--\s*h1-check:\s*ignore\s*-->/.test(text)) continue;
    const found = headings(text);
    checked += 1;
    if (found.length !== 1) offenders.push({ page: rel(file), found });
}

if (offenders.length) {
    console.error(
        `headings: ${offenders.length} of ${checked} pages do not have exactly one h1`
    );
    for (const { page, found } of offenders) {
        console.error(
            `  ${page}: ${found.length} h1 ${found.length === 1 ? 'element' : 'elements'}` +
                (found.length ? ` -> ${JSON.stringify(found)}` : '')
        );
    }
    process.exit(1);
}

console.log(`headings: ${checked} pages, each with exactly one h1`);
