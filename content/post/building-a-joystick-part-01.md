---
type: post
title: Building A Joystick (Part 1)
date: 2021-12-15
category: Garden
image: /img/site/category/general.jpg
image-thumbnail: /img/site/category/general.jpg
author: "Ivan Hawkes"
images: ["/img/project/game-controller/arcade-joystick-01.jpg",
		 "/img/project/game-controller/arcade-joystick-02.jpg",
		 "/img/project/game-controller/arcade-joystick-03.jpg",
		 "/img/project/game-controller/arcade-joystick-04.jpg"
]
---

The long and boring story of how I went from a 12 year old boy in the 80's to a 50 year old man in the 2020's making a joystick to play retro-arcade games from the 80's.

<!--more-->

Flashback to the the very early 80s. I'm an almost teenage boy, and I've just discovered both arcade machines and general purpose computers. Both of these discoveries will have significant impact on the rest of my life.

The first, is a __Space Invaders__ machine at the local corner store. It goes __PEW PEW__ and has a merciless gameplay loop that demands mastery. It costs 20 cents for each attempt, and it's a harsh task-master. It requires skill, patience, timing, and an abundance of coins that I just don't have.

It's possible to die within seconds of dropping your coin into the slot. It's also possible to learn the moves and, over time, last all the way to the end of the first level. The reward for doing so is re-entering the level, with less lives, and potentially slightly faster invaders. Were they faster or was it just my nerves as I attempted to clear the level for a second time?

Drop enough coins into the guts of the machine and you will begin to clock it on the regular.

The second machine was far more important over the long timeline, though it may not have seemed so at the time.

At the local library was a [Dick Smith System 80](https://collection.maas.museum/object/456918) computer.

It's the 80s, and I'm twelve, so I have no idea about the specs of the machine. All I know is it's a computer, it runs BASIC, the library has a book that can teach me BASIC, and they will let me book time slots to use the machine. The book promises to teach me BASIC in 8 hours...I am skeptical.

That's not how it starts, of course. It starts with me sitting there and playing games for hours on end.

Every day I run straight from school to the library. I book a time slot and borrow a cassette with a game on it. I load that game and play it.

At some point, a change agent enters the scene. A slighter older teen with a little arcane knowledge. They show me how to hold down CTRL-C and interupt the game.

This doesn't always work. Some cassettes switch off this ability, but enough have left it open that we can start to look at the guts of the programs. It's code written in the BASIC language.

He shows me the code, and how to change a few lines. It's mostly PRINT statements getting changed for now but that's enough to spark my interest.

I've learnt that the computer runs on something called BASIC, and I can learn BASIC right there in the library. I place a reserve on the book and become the first and only person to check out that book. I keep that book out for weeks as I learn the language that can control this machine.

IF, THEN, ELSE, FOR, NEXT, GOTO, PRINT..there's so much power in so few statements. I start by hacking on the programs the library has on cassette, but in time I start to write my own code from scratch. I read the book twice.

I'm addicted. I want more and there's only one path forward.

I get a job washing cars at 7am in a second hand car lot. It's not bad work in Summer, but it's pretty hellish in Winter. I save up enough money to buy an entry level machine.

I'm a 12 year old living in the poor suburbs of Sydney, so my options are limited. I find an ad in a paper for an [Ohio Scientific Superboard II computer](http://www.oldcomputers.net/osi-600.html). The price which is approximately $250AUD is within my budget - though it's not quite what I've grown to expect from the machines in Tandy and the Apple / etc store.

Arriving at the house of a tech enthusiast, I see the Superboard is literally just a PCB with a keyboard on it. Lucky, the guy has a couple of other things on offer - including a Commodore Pet. I don't go for the PET, it's also out of my range, but he has an OSI C1P and I can just barely afford it.

It has 8KB of RAM, 5KB of which was addressable. It has a case, which is a big step up from the Superboard II. It's also got a very useful mod - a "dah-bug" he called it...though I've never seen any information on it since. It allowed for a 40x12 (IIRC) video mode, and quick-key entry of common BASIC statements e.g. hit a key and Q and the word NEXT appeared in the BASIC editor. As you can imagine, my FOR loops looked like this:

```BASIC
FOR Q = 1 to 10
    LET X = Q
NEXT Q
```

Saving keystrokes FTW.

Back then, the machines came with user manuals which contained block diagrams, schematics, and all sorts of information I wasn't equipped to understand.

With my own machine, I am finally no longer limited to the opening hours of the library. I start to crank out code till the wee hours. I purchase a few books on BASIC programming, some with listings. I type in listings from magazines and books I borrow or purchase. I flip through, and then (cheekily) start to flat out read the books at a local computer store. God knows why they tolerated me spending hours on their showroom floor flipping through their magazines, playing with their machines...but they did, bless.

On my machine there's no sound, no colour, no sprites, nothing but a 40x25 character matrix, the PETSCI character set, and BASIC...but that's enough. Except, there was one more thing...a monitor that let you enter machine code.

I pushed my BASIC skills to the limit, along with the very low limit of 5KB of addressable RAM. I hit a wall...one that would only be unlocked by learning 6502 Assembly language.

That long suffering computer store had their second purchase from me, a book on how to program a KIM-1 in assembly code. The first was a floppy disk I used for scratch.

I'll finish up here, although there's plenty left to tell. Twelve year old me is now thirteen, can program in 6502 assembler, and is hoping like heck to write their own version of Space Invaders. I never complete that dream, though I come pretty close at the time. I'm still planning on finishing my teenage aspirations...but first, some side quests.