// Validate the structured data of every recipe page. Two halves, the way
// `pnpm run test:methods` splits its own subject: the block against the data
// definition in `assets/recipe-jsonld.yaml`, and the block read back against
// the content it states - the front matter, `ingredients.yaml` and
// `method.yaml` - so the JSON-LD says what the page shows and nothing else.
// Run after a Hugo build, through `pnpm run test:jsonld`.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';

const definitionFile = 'assets/recipe-jsonld.yaml';
const contentDir = 'content/post/recipe';
const publicDir = 'public';
const siteConfig = 'config/_default/hugo.yaml';

// The block, marked by its type. The quote around the class and the type is
// optional: the minified build the publish gate runs on drops it.
const blockPattern =
    /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;

// An entity `plain` has no rule for. Reported as that, not as a mismatch: the
// build writes a substitution the comparison has not been taught to read back.
const entityPattern = /&[a-zA-Z][a-zA-Z0-9]*;|&#\d+;|&#x[0-9a-fA-F]+;/;

const isoPattern = /^PT(?:(\d+)H)?(?:(\d+)M)?$/;

function recipeBundles(dir, bundles = []) {
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
            recipeBundles(full, bundles);
        } else if (entry === 'index.md') {
            const front = frontMatter(readFileSync(full, 'utf8'));
            if (front?.type === 'recipe') {
                bundles.push(path.dirname(full));
            }
        }
    }
    return bundles.sort();
}

// The YAML block between the leading pair of `---` fences.
function frontMatter(text) {
    const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return block ? parseYaml(block[1]) : null;
}

const rel = (file) => path.relative('.', file).split(path.sep).join('/');

// The URL a recipe is published at: the `url` its front matter sets when it has
// one, the content path otherwise. The same rule the method check follows.
function pageFile(bundle, front) {
    const from = front?.url
        ? `/${String(front.url).replace(/^\/+/, '')}`
        : bundle.slice('content/'.length);
    return path.join(publicDir, from, 'index.html');
}

// The text a reader sees, reduced to what the data holds: markup out, entities
// in, and the punctuation goldmark's smartypants replaces put back as the data
// writes it, so a page's words and a block's text compare.
function plain(text) {
    let out = String(text).replace(/<[^>]*>/g, '');
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

// The words of one ingredient: quantity, measure and the ingredient, as the
// ingredients table prints them and as the block states them.
function ingredientText(item) {
    return [item.quantity, item.measure, item.ingredient]
        .map((part) => (part === undefined || part === null ? '' : plain(part)))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Minutes in an ISO 8601 duration, and the duration the minutes write: the pair
// the recipe page's time table adds from its own front matter.
function minutes(iso) {
    const parts = isoPattern.exec(String(iso ?? '').toUpperCase());
    if (!parts) {
        return null;
    }
    return Number(parts[1] ?? 0) * 60 + Number(parts[2] ?? 0);
}

function isoTotal(total) {
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    if (!total) {
        return 'PT0M';
    }
    return `PT${hours ? `${hours}H` : ''}${rest ? `${rest}M` : ''}`;
}

// The words of a page, with every space taken out: the minified build the
// publish gate runs on leaves no space at a paragraph break, where the text of
// a block carries the one a block element leaves behind. A page's prose and a
// block's text then compare in both builds.
function squash(text) {
    return plain(text).replace(/\s+/g, '');
}

function describe(error) {
    const where = error.instancePath || '/';
    const params = error.params || {};
    const named = params.additionalProperty || params.missingProperty;
    return `${where}: ${error.message}${named ? ` '${named}'` : ''}`;
}

// The site facts a block falls back to: the author a recipe without one names,
// and the locale a block states as its language.
const site = parseYaml(readFileSync(siteConfig, 'utf8'));
const siteAuthor = site?.params?.author?.name ?? site?.title;
const locale = String(site?.locale ?? 'en');
const language =
    locale.length > 2
        ? `${locale.slice(0, 2).toLowerCase()}-${locale.slice(3).toUpperCase()}`
        : locale;

const definition = parseYaml(readFileSync(definitionFile, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateBlock = ajv.compile({ ...definition, $ref: '#/recipe-jsonld' });

const bundles = recipeBundles(contentDir);
if (!existsSync(publicDir)) {
    console.error(`${publicDir}/ not built: run hugo build before this check`);
    process.exit(1);
}

const problems = [];
const entities = [];
let pages = 0;
let ingredients = 0;
let steps = 0;
let imaged = 0;
let unimaged = 0;

for (const bundle of bundles) {
    const label = rel(bundle);
    const front = frontMatter(
        readFileSync(path.join(bundle, 'index.md'), 'utf8')
    );
    const page = pageFile(bundle, front);
    if (!existsSync(page)) {
        problems.push(`${label}: no built page at ${rel(page)}`);
        continue;
    }
    const html = readFileSync(page, 'utf8');
    const found = [...html.matchAll(blockPattern)];
    if (found.length !== 1) {
        problems.push(
            `${label}: ${found.length} application/ld+json blocks in ${rel(page)}, expected 1`
        );
        continue;
    }
    pages++;

    let block;
    try {
        block = JSON.parse(found[0][1]);
    } catch (error) {
        problems.push(`${label}: block does not parse: ${error.message}`);
        continue;
    }
    if (!validateBlock(block)) {
        for (const error of validateBlock.errors) {
            problems.push(`${label}: ${describe(error)}`);
        }
        continue;
    }

    const where = (field, expected, actual) => {
        const want = JSON.stringify(expected);
        const got = JSON.stringify(actual);
        if (want !== got) {
            problems.push(`${label}: ${field} is ${got}, page states ${want}`);
        }
    };

    // The page's own words, with the blocks cut out: the prose a reader sees. A
    // block's description is the page's summary, so it must stand in that prose.
    const prose = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ');

    const at = new URL(block.url);
    const want = `/${rel(page)
        .slice(publicDir.length + 1)
        .replace(/\/index\.html$/, '/')}`;
    where('url path', want, at.pathname);
    where('@id', `${block.url}#recipe`, block['@id']);
    where('mainEntityOfPage', block.url, block.mainEntityOfPage?.['@id']);

    where('name', front.title, block.name);
    where('datePublished', String(front.date), block.datePublished);
    where(
        'dateModified',
        String(front.lastmod ?? front.date),
        block.dateModified
    );
    where('author', front.author ?? siteAuthor, block.author.name);
    where('publisher', siteAuthor, block.publisher.name);
    where('inLanguage', language, block.inLanguage);
    where('cuisine', front.cuisine, block.recipeCuisine);
    where('categories', front.categories, block.recipeCategory);
    where('keywords', (front.tags ?? []).join(', '), block.keywords);
    where(
        'recipeYield',
        front.portions === undefined
            ? undefined
            : `${front.portions} ${front.portions === 1 ? 'portion' : 'portions'}`,
        block.recipeYield
    );

    const prep = minutes(front['prep-time']);
    const cook = minutes(front['cook-time']);
    where('prepTime', front['prep-time'], block.prepTime);
    where('cookTime', front['cook-time'], block.cookTime);
    where(
        'totalTime',
        prep === null || cook === null ? null : isoTotal(prep + cook),
        block.totalTime
    );

    if (
        block.description &&
        !squash(prose).includes(squash(block.description))
    ) {
        problems.push(`${label}: description is not prose of ${rel(page)}`);
    }

    // The ingredients: one line per entry of every dish, in file order.
    const file = path.join(bundle, 'ingredients.yaml');
    if (existsSync(file)) {
        const data = parseYaml(readFileSync(file, 'utf8'));
        const expected = (data['ingredient-list'] ?? []).flatMap(
            (dish) => dish.ingredients ?? []
        );
        if (expected.length !== block.recipeIngredient.length) {
            problems.push(
                `${label}: ${expected.length} ingredients in ingredients.yaml, ${block.recipeIngredient.length} in the block`
            );
        } else {
            expected.forEach((item, index) => {
                ingredients++;
                const want = ingredientText(item);
                if (want !== block.recipeIngredient[index]) {
                    problems.push(
                        `${label}: ingredient ${index + 1}: block states ${JSON.stringify(block.recipeIngredient[index])}, page shows ${JSON.stringify(want)}`
                    );
                }
            });
        }
    }

    // The steps: one HowToStep per step of every dish, in file order, each
    // named by its dish where the recipe has more than one dish to name and the
    // page is not named for it. The rule the dish heading of method.html sets.
    const method = path.join(bundle, 'method.yaml');
    if (existsSync(method)) {
        const data = parseYaml(readFileSync(method, 'utf8'));
        const dishes = data['method-list'] ?? [];
        const named = dishes.length > 1;
        const expected = dishes.flatMap((dish) =>
            (dish.method ?? []).map((step) => ({
                dish: dish.dish,
                step: plain(step),
                name:
                    named &&
                    String(dish.dish).toLowerCase() !==
                        String(front.title).toLowerCase()
                        ? dish.dish
                        : undefined,
            }))
        );
        if (expected.length !== block.recipeInstructions.length) {
            problems.push(
                `${label}: ${expected.length} steps in method.yaml, ${block.recipeInstructions.length} in the block`
            );
        } else {
            expected.forEach((item, index) => {
                steps++;
                const found = block.recipeInstructions[index];
                if (item.step !== found.text) {
                    problems.push(
                        `${label}: step ${index + 1}: block states ${JSON.stringify(found.text)}, file writes ${JSON.stringify(item.step)}`
                    );
                }
                if (found.name !== item.name) {
                    problems.push(
                        `${label}: step ${index + 1}: dish is ${JSON.stringify(found.name)}, file names ${JSON.stringify(item.name)}`
                    );
                }
                if (found.position !== index + 1) {
                    problems.push(
                        `${label}: step ${index + 1}: position is ${found.position}, expected ${index + 1}`
                    );
                }
            });
        }
    }

    // The image: the bundle's own featured image, and no image where the bundle
    // has none. A section's photograph is never borrowed for a recipe.
    const image = existsSync(path.join(bundle, 'featured.webp'));
    if (image) {
        imaged++;
        const links = block.image ?? [];
        if (links.length !== 1) {
            problems.push(
                `${label}: ${links.length} images in the block, bundle has one featured.webp`
            );
        } else if (!links[0].endsWith(`${want}featured.webp`)) {
            problems.push(
                `${label}: image is ${JSON.stringify(links[0])}, not the bundle's featured.webp at ${want}`
            );
        }
    } else {
        unimaged++;
        if (block.image) {
            problems.push(
                `${label}: block states ${block.image.length} image(s), bundle has no featured.webp`
            );
        }
    }

    // A substitution the reduction has no rule for, in anything the block says.
    for (const [field, value] of [
        ['name', block.name],
        ['description', block.description],
        ['keywords', block.keywords],
        ...block.recipeIngredient.map((text) => ['ingredient', text]),
        ...block.recipeInstructions.map((step) => ['step', step.text]),
    ]) {
        if (value) {
            const entity = String(value).match(entityPattern);
            if (entity) {
                entities.push(
                    `${label}: ${field}: ${JSON.stringify(entity[0])} is an entity the reduction has no rule for`
                );
            }
        }
    }
}

// No page that is not a recipe carries a Recipe block: the block belongs to the
// recipe layout, and a block written elsewhere states a recipe no page shows.
const recipePages = new Set(
    bundles.map((bundle) =>
        rel(
            pageFile(
                bundle,
                frontMatter(readFileSync(path.join(bundle, 'index.md'), 'utf8'))
            )
        )
    )
);
const htmlPages = [];
(function walk(dir) {
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
            walk(full);
        } else if (entry.endsWith('.html')) {
            htmlPages.push(full);
        }
    }
})(publicDir);
for (const page of htmlPages) {
    if (recipePages.has(page)) {
        continue;
    }
    for (const match of readFileSync(page, 'utf8').matchAll(blockPattern)) {
        let block;
        try {
            block = JSON.parse(match[1]);
        } catch {
            continue;
        }
        if (block?.['@type'] === 'Recipe') {
            problems.push(
                `${rel(page)}: carries a Recipe block, and is no recipe page`
            );
        }
    }
}

if (problems.length > 0) {
    console.error(
        `${pages} recipe pages checked against ${definitionFile} and ${contentDir}/: ${problems.length} deviations\n`
    );
    for (const problem of problems) {
        console.error(`  ${problem}`);
    }
    process.exit(1);
}

console.log(
    `${pages} recipe pages validated against ${definitionFile}: no deviations; ` +
        `${ingredients} ingredients and ${steps} steps match the sidecars, ` +
        `${imaged} pages state their featured image, ${unimaged} state none; ` +
        `${entities.length} entity substitutions the reduction has no rule for`
);
