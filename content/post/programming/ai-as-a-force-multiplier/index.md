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

It starts a few months ago with a casual interest in chattter I am hearing about
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
is yes. Stick around if you like rambling tales of struggle, perserverance and
final victory.

First step, can AI run on my present hardware?

- AMD Ryzen 9 3900X 12-Core Processor
- 32gb of system RAM
- NVidia GeForce RTX 4060 8gb

Finding the answer was quite the rabbit-hole. Running a local AI model requires
you to set up an inference server, host a decent model on that engine, select a
TUI or GUI to chat with the model, and know how to word questions to get the
right results. Then the really tough part, selecting a model.

I tried quite a few 6-8gb models based on chatter online. I learnt how a Mixture
of Elements (MoE) would allow me to run models far larger than would fit into
the measly 8gb of V-RAM on my video card. Qwen 3.5 27b was tested, and the
result was hopeful, so I tried Qwen 3.6 27b - also good. Shoot for the moon; I
tried Qwen 3.8 27b...and...failure. It was just too slow, but...it was also so
much better than the first two that I couldn't give up there.

Time to throw some money at the problem. I don't have any, so I prayed to PayPal
'Pay in 4' several times and was answered on each occasion.

First, the system RAM was upgrade from 32g to 64gb. That was mostly because I am
building with Unreal Engine 5.8 and it is a total pig for RAM. Once all the
tools were loaded it could only run four threads of build tools due to RAM
restrictions. Now is one of the worst times ever to buy RAM, and I already had
all four slots filled, so my only move forward was to replace them all with 16gb
modules. That stung, a lot, but the modules are faster (3600mhz), have lower
CAS, and now the Unreal build flies along on 20 threads.

I fired up Qwen 3.8 27b and was still greeted with disappointment. It was
thrashing the RAM, the memmory bus **AND** the PCI-e bus. It worked, but it
wasn't a great experience. I was able to test the output at a slow rate and was
impressed enough to take the next step.

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

It's around this time that I made a fateful choice. I had knackered my Debian 13
Trixie months ago by mixing 'testing' and 'stable' while trying to get Hyprland
running. I didn't know it at the time, but I was atari. When I couldn't find a
direct way to fix the issue I just blew it away and churned to Nixos.

I've run Nixos before, and I liked it, but there was always some barrier of
entry that I couldn't quite hurdle and I would scamper back to Ubuntu or Debian.
I wanted to give it a good hard try this time.

Once again though, the demon seed was within me, I just didn't know it yet. I
had been running Windows 11 almost exclusively since the RAM upgrade and
everything seemed fine. It wasn't. Once I installed Nixos and was happily
configuring it I experienced a hard crash straight to black screen. I thought
maybe the power had fluctuated, but it hadn't. Over the next few hours I had a
few more hard shut downs at random intervals. There was something wrong, but
what?

The obvious answer is my PSU was too small and wasn't coping with the power draw
needed by two RTX cards. I was intending to upgrade it to 1000 watts at some
point and use the old one to restore my old PC at some point. That point came
faster than expected.

I slapped the new unit into my case, nervously wired it up (I can't afford to
release the magic smoke these days), and powered it on. Nothing! Oh, nevermind,
it was just being a tad difficult because I have to hotwire it to start it up.
The power button died mere months after I bought the machine and I've never
replaced it. The tactile button is soldered to a tiny PCB in a hard to reach
location. I just short out the pins with some scissors. Boom, booted to POST and
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
it was still flaky and Windows was now crashing.

I caught a possible issue where the RAM clock was no longer a multiple of the
F-CLOCK, so I changed that and still it was crashing.

So I turned off AI D.O.C.P. - the RAM went to it's XMP profile and the testing
phase was entered once more. Surprisingly, the RAM was still clocked at 3200mhz,
but there hasn't been a single crash in hours now. Is it possible I am now free
of this curse? Only time will tell for that.

## Using the AI to Build Something

- improved the categorisation of my recipes
- created cook and prep times
- searched for the cuisine and updated my YAML with the new field
- wrote template code to convert the time periods to minutes for display
- make multiple suggestions and corrections to my specifications

## Agentic AI

- harness
- skills
- context
- wrote go program to run hugo to create new kanbans
