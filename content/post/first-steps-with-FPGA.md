---
type: post
title: First Steps with FPGA
date: 2022-01-17
category: FPGA
image: /img/site/category/fpga.jpg
image-thumbnail: /img/site/category/fpga.jpg
author: "Ivan Hawkes"
---

The title of this post suggests that this is the first step into programming an FPGA, but that's not quite true. We need to take a few steps back into the past to see the real truth.

Jump back 31 years and you will find a very young version of me taking his first steps into the world of computing. My options at this point are limited in ways I wouldn't be able to see for decades.

I had no way of knowing just how large the field of computer science would become, or how much I would be excluded from it by nature of birth, locality, sex (not for me but for the other half), financial status, social status, or any of the myriad of other reasons that preclude people from joining. The world is a different place for those born male, white, affluent and in the Bay Area. That said, I still hit my mark.

I've been blessed with an abundance of time lately, though it comes at the cost of being able to afford to live in the modern world. It also comes with all the mental illness anyone could ever need, and a few bushels more. So fuck it, I just slowly plink away at projects like someone cheesing an encounter in Dark Souls (1/2/3).

I'm slowly moving back in time, trying to learn all the things I was never able to access. Some of it is due to situation, and some is because we have this amazing internet now, and open source, and youtube videos...

I started my journey learning BASIC on a 5KB 6502 / 16KB Z80 machine.

Life was good back then. You could know almost all there was to know about your chosen machine. They shipped with really good manuals which included schematics, memory locations, all sorts of arcana.

And so, I harken back to those days where it was possible to know everything about a single machine...something that is now all but impossible.

First stop, the [Ben Eater 6502 Project](https://eater.net/6502). This was my first real physical project and it took me perhaps 30 - 40 hours to complete. I needed to learn to read schematics, cut some wire, read those damn schematics, cut even more wire, understand basic electronics, etc. This project gave me the confidence to move on. It proved I could learn about hardware.

Next step - redesign the clock he provided. His clock was pretty good, but I had some ideas on how to make it better. I made one from logic chips that allows me to combine up to 8 clock sources into a single clock signal.

# One Small Step Forward

Last night I managed to install the Quartus toolchain and work my way through the my_first_fpga project. It took a few hours just for the project part, but by the time I finished I had a decent idea of how to use the tool. Sure, it's the equivalent of typing in a game from a magazine listing - but you have to start from somewhere.

# Arduino is a Gateway Drug.

This all started with Arduino, but it was spiralling out of control now. I was looking at the Raspberry Pi Pico and liking it. I ordered three of them and thought it would be enough for the near future...it wasn't. Last report, I ordered another 10.

This stupidly cheap board has insanely high clock rates, a lot of pins, and c++17. I was hooked.

I'm currently using the Pi Pico to make an old fashioned arcade joystick which can immitate several USB devices. My plan is to sit on my comfy armchair with a home-made joystick and play 1980s arcade games like Space Invaders and Galaga.

# Go for Gold

"Conan, what is best in life?"...

I'd like to offer an alternative version to Conan's answer:

* Program a game using Verilog
* Build an arcade stick from orignal parts using a suitable micro-controller
* Get the high score before your friends arrive and make you look like a bitch

# Long Way to go

My journey continues. I started with BASIC, then 6502, then 8086, then a whole bunch of bullshit for the internet...now it's finally becoming interesting again as I return to the basics, learn Verilog, electronics, etc.

I'm improving my understanding of computers, right down to the transistor level and that's something I've wanted for a very long time now.