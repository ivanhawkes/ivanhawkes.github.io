// Validate the front matter of every kanban card against the data definition
// in assets/kanban-card-front-matter.yaml. This is the check the technical
// specification asks for: every card must conform, and every deviation is
// reported. Run through `pnpm run test:kanban`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';

const definitionFile = 'assets/kanban-card-front-matter.yaml';
const cardsDir = 'content/kanban';

// Card identity is the filename: `p<priority>-<prefix>-<slug>.md`, as the
// technical specification defines it. So the cards are the markdown files in
// the Kanban tree named like that: section indexes and the pages that live in
// the tree, such as the grid view's `grid/index.md`, are not cards.
const cardName = /^p\d-[a-z]{2}-[a-z0-9-]+\.md$/;

function cardFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
            files.push(...cardFiles(full));
        } else if (entry.endsWith('.md') && cardName.test(entry)) {
            files.push(full);
        }
    }
    return files.sort();
}

// The YAML block between the leading pair of `---` fences.
function frontMatter(text) {
    const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return block ? block[1] : null;
}

function describe(error) {
    const where = error.instancePath || '/';
    const params = error.params || {};
    const named = params.additionalProperty || params.missingProperty;
    const detail = named
        ? ` '${named}'`
        : error.allowedValues
          ? ` (allowed: ${error.allowedValues.join(', ')})`
          : '';
    return `${where}: ${error.message}${detail}`;
}

const definition = parseYaml(readFileSync(definitionFile, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateCard = ajv.compile({
    ...definition,
    $ref: '#/kanban-card',
});

const problems = [];
const files = cardFiles(cardsDir);

for (const file of files) {
    const yaml = frontMatter(readFileSync(file, 'utf8'));
    if (yaml === null) {
        problems.push(`${file}: no YAML front matter`);
        continue;
    }
    let data;
    try {
        data = parseYaml(yaml);
    } catch (error) {
        problems.push(`${file}: ${error.message.split('\n')[0]}`);
        continue;
    }
    if (!validateCard(data)) {
        for (const error of validateCard.errors) {
            problems.push(`${file}: ${describe(error)}`);
        }
    }
}

if (problems.length > 0) {
    console.error(
        `${files.length} cards checked against ${definitionFile}: ${problems.length} deviations\n`
    );
    for (const problem of problems) {
        console.error(`  ${problem}`);
    }
    process.exit(1);
}

console.log(
    `${files.length} cards validated against ${definitionFile}: no deviations`
);
