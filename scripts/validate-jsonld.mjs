// Validate the structured data in the head of every built page: the one
// JSON-LD block be-best/layouts/_partials/meta/jsonld.html writes. Each block is
// checked against assets/jsonld.yaml, then read back against the page it sits
// in: the node types its kind of page should carry, the canonical URL, the
// title, the dates in its article meta tags and the breadcrumb trail it shows.
// Recipe blocks have their own check, validate-recipe-jsonld.mjs.
// Run after a Hugo build, through `pnpm run test:jsonld`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';

const definitionFile = 'assets/jsonld.yaml';
const publicDir = 'public';

// The quotes are optional: the minified build drops them.
const blockPattern =
    /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
const attr = (tag, name) =>
    tag
        .match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`))
        ?.slice(1)
        .find((v) => v !== undefined);

const definition = parseYaml(readFileSync(definitionFile, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile({
    ...definition.block,
    components: definition.components,
});

const decode = (s) =>
    s
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
            String.fromCodePoint(parseInt(n, 16))
        )
        .replace(/&rsquo;|&lsquo;/g, "'")
        .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/[\u{2018}\u{2019}]/gu, "'")
        .replace(/[\u{201C}\u{201D}]/gu, '"');
const text = (html) =>
    decode(html.replace(/<[^>]*>/g, ''))
        .replace(/\s+/g, ' ')
        .trim();

const pages = [];
(function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
            walk(full);
        } else if (entry.endsWith('.html')) {
            pages.push(full);
        }
    }
})(publicDir);

const problems = [];
const counts = {};
let checked = 0;

// The working documents and the tag and category listings are kept out of
// search: noindex in the page, and out of the sitemap, so the two never disagree.
const working = /^(kanban|specification|tags|categories)\//;
const sitemap = readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8');
const listed = new Set(
    [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => decode(m[1]))
);
let noindexed = 0;
for (const file of pages.sort()) {
    const html = readFileSync(file, 'utf8');
    const rel = path.relative(publicDir, file).split(path.sep).join('/');
    // Hugo's own redirect stubs (aliases and pagers) are not pages.
    if (/http-equiv=["']?refresh/i.test(html) && !/<body/i.test(html)) {
        continue;
    }
    checked++;
    const say = (message) => problems.push(`${rel}: ${message}`);
    const robots = attr(
        html.match(/<meta[^>]*name=["']?robots[^>]*>/i)?.[0] ?? '',
        'content'
    );
    const noindex = /noindex/.test(robots ?? '');
    if (noindex !== working.test(rel)) {
        say(`robots is "${robots}"`);
    }
    if (noindex) {
        noindexed++;
        const url = decode(
            attr(
                html.match(/<link[^>]*rel=["']?canonical[^>]*>/i)?.[0] ?? '',
                'href'
            ) ?? ''
        );
        if (listed.has(url)) {
            say('is noindex, and listed in sitemap.xml');
        }
    }
    const head = html.split(/<\/head>/i)[0];
    const blocks = [...head.matchAll(blockPattern)];
    const isHome = rel === 'index.html';
    const is404 = rel === '404.html';
    if (blocks.length !== (is404 ? 0 : 1)) {
        say(
            `${blocks.length} JSON-LD blocks in the head, expected ${is404 ? 0 : 1}`
        );
        continue;
    }
    if (is404) {
        continue;
    }
    let block;
    try {
        block = JSON.parse(blocks[0][1]);
    } catch (error) {
        say(`the block is not JSON: ${error.message}`);
        continue;
    }
    if (!validate(block)) {
        for (const error of validate.errors) {
            say(`${error.instancePath || '/'} ${error.message}`);
        }
        continue;
    }
    const nodes = Object.fromEntries(
        block['@graph'].map((node) => [node['@type'], node])
    );
    for (const type of Object.keys(nodes)) {
        counts[type] = (counts[type] ?? 0) + 1;
    }
    if (block['@graph'].length !== Object.keys(nodes).length) {
        say('a node type appears twice in the graph');
    }

    const canonical = decode(
        attr(
            html.match(/<link[^>]*rel=["']?canonical[^>]*>/i)?.[0] ?? '',
            'href'
        ) ?? ''
    );
    const h1 = text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
    const meta = (name) =>
        attr(
            html.match(
                new RegExp(`<meta[^>]*property=["']?${name}["']?[^>]*>`, 'i')
            )?.[0] ?? '',
            'content'
        );

    // The types a page of each kind carries.
    const expected = new Set(isHome ? ['WebSite'] : ['BreadcrumbList']);
    const isRecipe = /"@type":"Recipe"/.test(html);
    if (meta('og:type') === 'article' && !isRecipe) {
        expected.add('BlogPosting');
    }
    if (
        /^about\/(index\.html|(profile|project)\/index\.html|project\/[^/]+\/index\.html)$/.test(
            rel
        )
    ) {
        expected.add('AboutPage');
    }
    if (/^about\/profile\/[^/]+\/index\.html$/.test(rel)) {
        expected.add('ProfilePage');
    }
    const actual = Object.keys(nodes).sort().join(', ');
    const wanted = [...expected].sort().join(', ');
    if (actual !== wanted) {
        say(`carries ${actual}, expected ${wanted}`);
    }

    for (const node of block['@graph']) {
        if (node.url && node.url !== canonical) {
            say(
                `${node['@type']} url ${node.url} is not the canonical ${canonical}`
            );
        }
    }
    if (nodes.BlogPosting) {
        const post = nodes.BlogPosting;
        if (!h1.startsWith(post.headline.replace(/…$/, ''))) {
            say(`headline "${post.headline}" is not the title "${h1}"`);
        }
        if (post.datePublished !== meta('article:published_time')) {
            say('datePublished differs from article:published_time');
        }
        if (post.dateModified !== meta('article:modified_time')) {
            say('dateModified differs from article:modified_time');
        }
    }
    if (nodes.BreadcrumbList) {
        const items = nodes.BreadcrumbList.itemListElement;
        items.forEach((item, i) => {
            if (item.position !== i + 1) {
                say(`breadcrumb item ${i + 1} has position ${item.position}`);
            }
        });
        if (items.at(-1).item !== canonical) {
            say('the last breadcrumb is not the page itself');
        }
        // Where the page shows a trail, the data states the same one.
        const nav = html.match(
            /<nav[^>]*aria-label=["']?Breadcrumb[\s\S]*?<\/nav>/i
        )?.[0];
        if (nav) {
            const shown = [...nav.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map(
                (m) => text(m[1])
            );
            const stated = items.map((item) => decode(item.name));
            if (shown.join(' > ') !== stated.join(' > ')) {
                say(
                    `breadcrumbs show "${shown.join(' > ')}", the data states "${stated.join(' > ')}"`
                );
            }
        }
    }
}

if (problems.length > 0) {
    console.error(
        `${checked} pages checked against ${definitionFile}: ${problems.length} deviations\n`
    );
    for (const problem of problems.slice(0, 40)) {
        console.error(`  ${problem}`);
    }
    if (problems.length > 40) {
        console.error(`  ... and ${problems.length - 40} more`);
    }
    process.exit(1);
}

console.log(
    `${checked} pages validated against ${definitionFile}: no deviations; ` +
        Object.entries(counts)
            .sort()
            .map(([type, n]) => `${n} ${type}`)
            .join(', ') +
        `; ${noindexed} pages noindex and out of the sitemap`
);
