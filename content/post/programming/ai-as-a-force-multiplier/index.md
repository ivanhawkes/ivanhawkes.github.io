---
author: Ivan Hawkes
categories:
    - Programming
date: '2026-09-30'
tags:
    - AI
    - Local AI
    - Software Design
    - Programming
    - Go
    - Markdown
title: AI is a Force Multiplier
---

I spent this week learning about the newest AI technology, upgrading my PC, and
(after many trials) taking it for a spin.

<!--more-->

This week has been a non-stop roller-coaster ride. I've been transformed from an
AI Luddite and sceptic into a firm proponent of the technology. So what
happened?

It starts a few months ago with a casual interest in chatter I am hearing about
how AI is actually good now and it will replace all our jobs. This isn't my
first rodeo. I started coding back in 1980 using BASIC and within a year I had
improved enough to learn and use 6502 assembler. I've heard talk of AI replacing
people for that entire time, and at no time before now was it even remotely
true.

So, what's changed? Machine learning and relentless scraping of content from the
web; combined with massive data centres. Those centres are filled with servers
boasting hundreds of gigabytes of RAM, petabytes of SSDs and graphics cards that
cost multiple times the value of my car.

That in itself is somewhat interesting, but it's not the really interesting
part.

AI models can now scale down small enough to run on consumer hardware that a
computer enthusiast might be able to afford, though not in this economy.

## The Hardware Saga

And so I began my journey to see if AI was something I could afford to run, and
in particular - run it without paying a monthly subscription. The short answer
is yes. Stick around if you like rambling tales of struggle, perseverance and
final victory.

First step, can AI run on my present hardware?

- AMD Ryzen 9 3900X 12-Core Processor
- 32gb of system RAM
- NVidia GeForce RTX 4060 8gb

Finding the answer was quite the rabbit-hole. Running a local AI model requires
you to set up an inference server, host a decent model on that engine, select a
TUI or GUI to chat with the model, and know how to word questions to get the
right results. Then the really tough part, selecting a model.

I tried quite a few 6-8gb models based on chatter online. I learnt how Mixture
of Elements (MoE) would allow me to run models far larger than would fit into
the measly 8gb of V-RAM on my video card. By only loading in a small part of the
weights at a time it could run models with 27 and even 35 billion parameters
versus the 8 billion or so that my graphics card could handle natively.

Qwen 3.5 27b was tested, and the result was hopeful, so I tried Qwen 3.6 27b -
also good. Shoot for the moon; I tried Qwen 3.8 27b...and...failure. It was just
too slow, but...it was also so much better than the first two that I couldn't
give up there.

The mid sized models now fit in my V-RAM but the cost was having to copy in the
'experts' weights with every single token generated. It was thrashing the memory
bus.

Time to throw some money at the problem. I don't have any, so I prayed to PayPal
'Pay in 4' several times and was answered on each occasion.

### RAM is Good!

First, the system RAM was upgraded from 32gb to 64gb.

That was mostly motivated by my last few weeks building game code which uses
Unreal Engine 5.8. Once all the tools were loaded it could only execute four
threads with build tools due to RAM restrictions. Now is one of the worst times
ever to buy RAM, and I already had all four slots filled, so my only move
forward was to replace them all with 16gb modules. That stung, a lot, but the
modules are faster (3600mhz), have lower CAS, and now the Unreal build flies
along on 20 threads.

I fired up Qwen 3.8 27b and was still greeted with disappointment. It was
thrashing the RAM, the memory bus, **and** the PCI-e bus. It worked, but it
wasn't a great experience. I was able to test the output at a slow rate and was
impressed enough to take the next step.

### RTX 5060 TI 16gb

An RTX 5060 TI was the best graphics card I could afford and would pair well
with my 4060. It was within my PC's power limits (750 watts) in theory and the
PCI-e bus should split from 16x down to 8x for both slots. Sounds perfect...it
wasn't.

The thing I like the most as I plug $1,050 worth of new graphics card into my
system is to see it fail to boot up and POST.

I played a shell game, swapping the pair of cards from one slot to the other,
removing one, trying all the combinations. It worked with my faithful RTX 4060
in the primary slot, but that would limit my use since some hardware and
software expects the best card to be in the first slot. Lucky for me AI came to
the rescue in the form of Google AI Mode.

I told it my machine specs and we chatted back and forth until it offered up a
nugget of wisdom. The RTX 50 series of cards might not be talking nice to my six
year old motherboard. If I changed the BIOS settings for the PCI-e bus from auto
to PCI-e Gen 4 it might work. It did!

### Debian -> Nixos

It's around this time that I made a fateful choice. I had knackered my Debian 13
Trixie several months back by mixing 'testing' and 'stable' while trying to get
Hyprland running. I didn't know it at the time, but I was tsumu. When I couldn't
find a direct way to fix the issue I just blew it away and churned to Nixos.

<div>
  <blockquote>
    <p>
        tsumu: In shogi, the verb tsumu (詰む) means "to checkmate". When a game reaches the definitive state of checkmate where the king is trapped and has absolutely no legal moves remaining to escape capture - it is called tsumi (詰み).

Saying "tsunda" is using the past/perfective tense of the verb ("It has
checkmated" or "It's cornered"). </p>
<cite><a href="https://en.wikipedia.org/wiki/Tsume_shogi">Source -
Wikipedia</a></cite>
  </blockquote>
</div>

I've run Nixos before, and I liked it, but there was always some barrier of
entry that I couldn't quite hurdle and I would slink back to Ubuntu or Debian. I
wanted to give it a good hard try this time.

Once again though, the demon seed was within me; I just didn't know it yet. I
had been running Windows 11 almost exclusively since the RAM upgrade and
everything seemed fine - it wasn't. Once I installed Nixos and was happily
configuring it I experienced a hard crash straight to a black screen. I thought
maybe the power had fluctuated, but it hadn't. Over the next few hours I had a
few more hard shut downs at random intervals. There was something wrong, but
what?

### The PSU as a Suspect

The obvious answer is my PSU was too small and wasn't coping with the power draw
needed by two RTX cards. I was intending to upgrade it to 1,000 watts at some
point and use my current one to restore my old PC at some point. That point came
faster than expected.

I slapped the new unit into my case, nervously wired it up (I can't afford to
release the magic smoke these days), and powered it on. Nothing! Oh, never mind,
it was just being a tad difficult because I have to hot-wire it to start it up.

The power button died mere months after I bought the machine and I've never
replaced it. The tactile button is soldered to a tiny PCB in a hard to reach
location. I just short out the pins with some scissors. Boom! Booted to POST and
it all looks good.

Back to configuring Nixos, filled with hope and $300 less cash. Except, the
problem didn't go away, it was still randomly rebooting and I had a dark and
cold place start to form in my guts.

I jumped back to Windows to try and confirm something I suspected. It wasn't
crashing, so it was Linux either pushing it harder or responding to some signal
from the motherboard when Windows was ignoring it.

I asked AI again, and it informed me that my issue was quite possibly due to the
new RAM pulling too much current on the 'infinity fibre' that is the AMD AM4
memory bus. I went back and forth with it a few times, adjusted some more BIOS
settings, and finally decided I had to switch off the AI D.O.C.P. in the BIOS. I
did try and adjust it manually first, dropping it to 3400mhz, then 3200mhz, but
it was still flaky and Windows was now crashing within a minute of booting.

I caught a possible issue where the RAM clock was no longer a multiple of the
F-CLOCK, so I changed that and still it was crashing.

So I turned off AI D.O.C.P. - the RAM went to it's XMP profile and the testing
phase was entered once more. Surprisingly, the RAM was still clocked at 3200mhz,
but there hasn't been a single crash in hours now. Is it possible I am now free
of this curse? Only time will tell for that.

NOTE: In the interests of reducing tension arising from not knowing the result I
would like to state it has now been ten hours without a crash. The demon seed
has been expelled.

### Side quest: Apply new Thermal Paste

Google AI was concerned about my CPU idle temperatures. At 66c while idling it
was pretty high. It suggested I replace the thermal paste on my CPU. I had some
left over from six years ago...would it still be good? It seemed ok. I cleaned
off the old muck and slapped on the new muck. Temperatures dropped about 7°c,
which wasn't enough to satisfy the AI until I told it I am still using the stock
cooler. That's a normal range for the stock cooler. I should pop down to u-mart
and get a better cooler one day soon.

## Dip our Toes into the Water

Flushed with the success of not crashing randomly I was ready to start wading
into the shallow end of the AI pool. I decided it was time to fix all the
glaring errors and omissions on my personal blog. Over the course of the next
six hours I achieved more than would have expected to get done in several
frustrating days of effort.

I had set up Pi as an agentic harness for my LLM. I hosted it locally in the
blog project and gave it access to some useful languages and tools. I was
constantly amazed and delighted by how well it could infer the meaning of my
prompts, reason about the expected result and then use the tooling to achieve
that result. It did so with few stumbles or errors.

I had it do the following:

- rewrite the markdown and YAML so the recipes made it clear which set of steps
  was associated with a list of ingredients
- help me adjust my layouts to iterate over the dishes and emit each in order
- make an estimate for preparation and cooking times based on the recipe
- deduce which national cuisine the recipe was from and set this as it's
  'cuisine'
- make the front matter consistent so it's easier for a machine to work through
  without second-guessing itself
- use the recipe description and instructions to improve my tagging e.g. major
  ingredients, and cooking techniques
- fix an inconsistent use of 'depends-on' and 'dependencies' in my kanban cards

During this process I was watching the reasoning, scanning the code it would
write and shell commands it executed. I was gaining respect for the power of
this model and the agentic process. It was time to up the ante.

There is a point of friction in my local kanban system. You really should use
HUGO to create new cards so the archetype attributes are applied correctly. This
requires you to copy and paste a lengthy command from the README.md into the
command line, making changes to suit your particular case. There had to be a
better way.

I tried using a skill to do it, but it just spent so long thinking about doing
the work it was actually a step backwards. I decided to try and write a skill
that would in turn write a program that could take some of the clickity-clackity
out of the task.

I thought about it for about five minutes, then I hammered out a first pass of
my idea. A prompt to Pi was able to let me know where to place it and scaffolded
the idea for me. A little cut and paste and I had a markdown file and a new
skill in my menu. Let's fire it up and see what happens!

Delight is what happens, sheer delight.

I gave it a choice of languages and it chose [Go](https://go.dev/). It worked
through my skill instructions and about three minutes later I was staring at the
Go code it had written and tested.

I parsed the code, it looked about right. I ran the code, it worked! Another
parse reveals a simple error, a missing option from the table that converts
'kind' shortcut prefixes to the equivalent word. I told the AI about the error
and it fixed it for me.

**Is this what human emotion feels like?**

I asked it to change the input title limit from 30 characters to 40. It made the
changes then ran some tests it designed (which I hadn't even asked for) before
confirming it was working. **Ship it!**

## Round 2 - Diff, Commit, and Push

One of the primary reasons programmers love using a CLI interface in Linux is
because of how capable the command line and shell are. Autocompletion, history,
grep, pipes - Linux loves CLI and text and that is absolutely perfect for AI.

I usually have a couple of shells open at once, primarily because my projects
have servers that need to be running. I keep a shell for my commands, and one or
two running various services. There are ways to have a development environment
run those for you, I just haven't gotten around to learning and implementing
them yet.

Even though Codium (VS Code stripped bare) has a perfectly good UI for
inspecting file changes and seeing a diff, it's very clicky. It means a context
switch in my IDE and those add up.

I usually find it faster to use the aliases provided by oh-my-zsh.

```
# Add all the files I touched to staging.
ga .

# Quick look to see if it appears right.
gst

# Commit
gc -m "Pithy comment"

# Push it, push it real good...
gp
```

All done in just a couple of keystrokes.

_A thought bubble appears above my head._

Let's prompt the AI to write another skill. The skill will perform a diff, and
if that is approved, a commit followed by a push. Less than a minute later i'm
testing 'dcp' (diff-commit-push) - a new skill.

It works pretty well, except it doesn't give a damn what I think of the diff,
it's publish or perish and it won't be the one to perish. I ask it politely
twice to do it and I think we got there in the end...probably.

So now **`/dcp'** is all I have to type to have it show me a diff, wait for my
response, and write up a commit message and push the changes. I don't even need
to context switch away from Pi, I'm doing it all at the TUI prompt window now.

## Summary

That's a pretty epic week. I've gone from thinking about AI as slop to really
respecting the tools and the models. It will become an invaluable part of my
process. One that will be a force multiplier, allowing me to go from idea to
execution in a fraction of the time.

My head is buzzing; ablaze with half-formed ideas and inspiration to knuckle
down and get some of my back catalog finished. This is not the result I
expected.

## Postscript

Just a few loose and brief thoughts on two of the supporting technologies that
synergise with AI.

### Why Markdown is King

I've been using markdown for perhaps ten years now. Over time it's become my
favourite way to store textual information. It's fast to type, pithy, clear,
concise and has tooling that allows transforms to be performed on it.

I can write specifications, ideas, plans, to-do lists, etc in markdown, and know
that I can output them as HTML or PDF if needed. AI can parse it with ease, edit
it, and turn it into a razor sharp tool. "I don't even see the code anymore. All
I see is blonde, brunette, redhead."

### Why YAML is Queen

If markdown is the king of freeform text, then YAML is the queen of structured
text. It has all the same properties as markdown, but is in a rigid format that
is not open to interpretation. This is how I store all my ideas that will one
day need to be data assets, be deterministic, etc.

What I like in a nutshell:

- it's terse - which saves on typing
- tables / lists
- tools
    - formatting
    - merging
- easy to reason about

Thanks for coming to my Ted Talk.
