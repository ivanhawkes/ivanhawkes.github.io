// Validate the method sidecar of every recipe, the check the technical
// specification asks for. Two halves: the data, every
// `content/post/recipe/**/method.yaml` against the definition in
// `assets/recipe-method.yaml`, the way `pnpm run test:kanban` checks cards; and
// the built page, every dish rendered once as an ordered list and every step
// once, in the order the file lists them. Run after a Hugo build, through
// `pnpm run test:methods`.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import { parse as parseYaml } from 'yaml';

const definitionFile = 'assets/recipe-method.yaml';
const contentDir = 'content/post/recipe';
const publicDir = 'public';

// The list the partial writes, marked so the check finds it among the lists a
// recipe's prose may carry. The quote around the class is optional: the
// minified build the publish gate runs on drops it.
const listPattern =
    /class=["']?recipe-method-steps["']?[^>]*>([\s\S]*?)<\/ol>/g;
const itemPattern = /<li[^>]*>([\s\S]*?)<\/li>/g;

// An entity `plain` has no rule for. The check reports it rather than calling
// the step a mismatch: the build writes a substitution the comparison has not
// been taught to read back.
const entityPattern = /&[a-zA-Z][a-zA-Z0-9]*;|&#\d+;|&#x[0-9a-fA-F]+;/;

function methodFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
            files.push(...methodFiles(full));
        } else if (entry === 'method.yaml') {
            files.push(full);
        }
    }
    return files.sort();
}

const rel = (file) => path.relative('.', file).split(path.sep).join('/');

// The URL a recipe is published at: the `url` its front matter sets when it has
// one, the content path otherwise.
function pageFile(methodFile) {
    const bundle = path.dirname(methodFile);
    const frontMatter = readFileSync(
        path.join(bundle, 'index.md'),
        'utf8'
    ).match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const url = frontMatter ? parseYaml(frontMatter[1])?.url : null;
    const from = url
        ? `/${String(url).replace(/^\/+/, '')}`
        : bundle.slice('content/'.length);
    return path.join(publicDir, from, 'index.html');
}

// The text a reader sees, reduced to what the data holds: markup out, entities
// in, and the punctuation goldmark's smartypants replaces put back as the data
// writes it, so a step and its rendering compare.
function plain(text) {
    let out = text.replace(/<[^>]*>/g, '');
    for (let pass = 0; pass < 2; pass++) {
        out = out
            .replace(/&nbsp;/gi, ' ')
            .replace(/&rsquo;|&lsquo;|&#x27;|&#39;|&apos;/gi, "'")
            .replace(/&rdquo;|&ldquo;/gi, '"')
            .replace(/&hellip;|&mldr;/gi, '...')
            .replace(/&mdash;|&ndash;|&minus;/gi, '-')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;|&gt;/gi, '')
            .replace(/&quot;/gi, '"');
    }
    return out
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|`([^`]+)`/g, '$1$2$3$4')
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[\u00A0\u2026]/g, (c) => (c === '\u00A0' ? ' ' : '...'))
        .replace(/\s+/g, ' ')
        .trim();
}

function describe(error) {
    const where = error.instancePath || '/';
    const params = error.params || {};
    const named = params.additionalProperty || params.missingProperty;
    return `${where}: ${error.message}${named ? ` '${named}'` : ''}`;
}

const definition = parseYaml(readFileSync(definitionFile, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validateMethod = ajv.compile({ ...definition, $ref: '#/recipe-method' });

const problems = [];
const files = methodFiles(contentDir);
if (!existsSync(publicDir)) {
    console.error(`${publicDir}/ not built: run hugo build before this check`);
    process.exit(1);
}

let steps = 0;
let lists = 0;
let pages = 0;

for (const file of files) {
    const label = rel(file);
    let data;
    try {
        data = parseYaml(readFileSync(file, 'utf8'));
    } catch (error) {
        problems.push(`${label}: ${error.message.split('\n')[0]}`);
        continue;
    }
    if (!validateMethod(data)) {
        for (const error of validateMethod.errors) {
            problems.push(`${label}: ${describe(error)}`);
        }
        continue;
    }

    const dishes = data['method-list'];
    const page = pageFile(file);
    if (!existsSync(page)) {
        problems.push(`${label}: no built page at ${rel(page)}`);
        continue;
    }
    pages++;
    const html = readFileSync(page, 'utf8');
    // The page with the method lists cut out: what a reader sees beside the
    // steps. A step written there is a step rendered twice, prose and data.
    const beside = plain(html.replace(listPattern, ''));

    const rendered = [];
    for (const match of html.matchAll(listPattern)) {
        const items = [...match[1].matchAll(itemPattern)].map((item) =>
            plain(item[1])
        );
        rendered.push(items);
    }

    if (rendered.length !== dishes.length) {
        problems.push(
            `${label}: ${dishes.length} ${dishes.length === 1 ? 'dish' : 'dishes'} in the file, ${rendered.length} lists in ${rel(page)}`
        );
        continue;
    }

    dishes.forEach((dish, index) => {
        const expected = dish.method.map(plain);
        const found = rendered[index];
        if (found.length !== expected.length) {
            problems.push(
                `${label}: ${dish.dish}: ${expected.length} steps in the file, ${found.length} in the page`
            );
            return;
        }
        expected.forEach((step, at) => {
            steps++;
            if (step !== found[at]) {
                problems.push(
                    `${label}: ${dish.dish} step ${at + 1}: page renders ${JSON.stringify(found[at])}`
                );
            }
            const entity = found[at].match(entityPattern);
            if (entity) {
                problems.push(
                    `${label}: ${dish.dish} step ${at + 1}: ${JSON.stringify(entity[0])} in the page is an entity the comparison has no rule for`
                );
            }
            const doubled = beside.includes(step);
            if (doubled) {
                problems.push(
                    `${label}: ${dish.dish} step ${at + 1} is also prose in ${rel(page)}`
                );
            }
        });
        lists++;
    });
}

if (problems.length > 0) {
    console.error(
        `${files.length} method files checked against ${definitionFile} and ${publicDir}/: ${problems.length} deviations\n`
    );
    for (const problem of problems) {
        console.error(`  ${problem}`);
    }
    process.exit(1);
}

console.log(
    `${files.length} method files validated against ${definitionFile}: no deviations; ` +
        `rendered: ${steps} steps in ${lists} dish lists over ${pages} pages, each step once`
);
