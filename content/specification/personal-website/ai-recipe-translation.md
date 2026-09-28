---
author: Ivan Hawkes
date: '2026-04-25'
description: AI Recipe Translation Context
title: AI Recipe Translation Context
type: specification
draft: true
---

I want you to translate a recipe into another document format for me. Place the
results of the translation into two files.

# Ingredients

The first file is formatted with correct YAML syntax and is called
"ingredients.yaml". An example of the structure of the file is provided in the
block quote below.

```
ingredient-list:
  - dish: Ingredients
    ingredients:
      - quantity: "400"
        measure: "g"
        ingredient: "garlic"
      - quantity: "400"
        measure: "g"
        ingredient: "ginger"
```

There is one list 'ingredient-list' which contains multiple dishes 'dish' each
of which has a list of ingredients 'ingredients'.

Each section of the recipe which has a set of instructions and a list of
ingredients must be provided as a separate 'dish' entry in the YAML.

If there is only a single 'dish' entry then make it's value 'Ingredients' rather
than using the name of the dish.

Each ingredient in the recipe is to be a separate entry into the list of
ingredients. It will have three key value pairs.

- quantity
- measure
- ingredient

Quantity refers to the quantity of that ingredient in the dish.

Measure refers to the measurement type that was used to express the quantity.
For example: tspn, tbsp, grams, cups, whole.

Ingredient refers to the remaining text that tells us about the ingredient.

Where the recipe gives both weight and volume use the weight as the quantity and
move the volume equivalent into the ingredient description so nothing is lost.

# Instructions

The second file is formatted as markdown and is called "index.md". It will be
used by the HUGO static web site generator as input content to be transformed
into a static HTML page.

The front matter should be in YAML format. An example is provided in block
quotes below.

```
author: Ivan Hawkes
categories:
  - Recipe
date: '2025-10-29'
imagecaption: A loaf of pain de mie baked in a pullman loaf pan.
portions: 4
tags:
  - French
  - Bread
  - Loaf
title: Pullman Pain De Mie
type: recipe
```

It will at a minimum include:

- the name of the recipe's author or 'Ivan Hawkes' if that is not known
- a 'type' entry that is always 'recipe'
- a category specifier that is always a single entry of 'Recipe'
- the current date in 'yyyy-mm-dd' format
- a caption for the banner image on the web page
- the number of portions this recipe will create. If it's unknown then set this
  value to '4'
- a list of tags that classify the recipe by style, region, main protein
  ingredient, etc
- a title which consisely names the recipe

The recipe begins with a section of prose that describes the recipe. It should
include it's region and an indication of how it might taste. That should be
followed by this text block (make sure to include the all of the whitespace):

```

<!--more-->

## Directions

```

The recipe is then described using a bullet point for each step in the recipe.
You may rewrite the directions to improve clarity.

## Second Step

Act as an expert SEO web developer specializing in Schema.org structured data.

Convert the plain text recipe provided below into a single, valid, and
fully-formed `<script type="application/ld+json">` block using Schema.org/Recipe
standards.

Strictly adhere to the following formatting and validation rules:

1. Valid JSON: Ensure the output is perfectly valid JSON-LD. Escape all quotes
   inside text strings, and ensure there are no trailing commas.
2. ISO 8601 Durations: Convert prep, cook, and total times into strict ISO 8601
   duration formats (e.g., 15 minutes becomes "PT15M", 1 hour 30 minutes becomes
   "PT1H30M").
3. Structured Instructions: Breakdown the instructions array into structured
   'HowToStep' objects containing '@type', 'text', and optionally 'name'. Do not
   just provide an array of raw strings.
4. Missing Information: If any standard fields (like image URL, description,
   yield, or categories) are missing from the raw text, use plausible
   placeholders or best-guess inferences based on the recipe context, but NEVER
   hallucinate incorrect preparation steps or ingredients.

Output ONLY the complete script block. Do not include introductory text,
conversational fluff, or post-code explanations.

[PASTE YOUR RAW RECIPE TEXT HERE]
