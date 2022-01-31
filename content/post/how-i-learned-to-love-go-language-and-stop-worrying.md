---
type: post
title: How I Learned to Love Go (Language) And Stop Worrying
date: 2013-10-12
tags: ["Go","go","Language","Languages","Ohio Scientific","software design","Software Development","Visual Basic"]
category: Programming
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

There's a new love in my life, and she's petite, versatile, responsive and modern - it's the language, [Go](http://golang.org/ "Go Language"). I'm still in the honeymoon stage, getting to know the ways she likes to play and the things she can do for me, but I can tell you now - it's going to be a long romance.
<!--more-->

But first, let's have a look back at the types I've been hanging out with in the past.

In the very early days I used [Microsoft BASIC](http://en.wikipedia.org/wiki/Microsoft_BASIC "Wikipedia - Microsoft BASIC") which shipped in the ROM of my very first PC, the [Ohio Scientific C1P - Challenger](http://en.wikipedia.org/wiki/Ohio_Scientific#Challenger "Ohio Scientific Challenger"). It wasn't too long before I was cranking out 6502 assembly code with a [line oriented editor](http://en.wikipedia.org/wiki/Line_editor "Line Oriented Editor") to push that machine to it's limits. Years passed and I moved out of home to attend [QUT University](http://www.qut.edu.au/ "Queensland University of Technology") and there I was introduced to, somewhat at gun point, first Pascal, then Modula II, and C. The cycle of pain was complete when I learnt C++ for a job.

Around 1998 I found myself having to abandon the very capable and ruthlessly complex and unforgiving C++ in favour of Visual Basic, again for a new job. Visual Basic had seemed like a toy in comparison to C++ but it had one thing running in it's favour, it was simple, and it caught on because of that. Years of gruelling programming using VB, COM+, T-SQL and other cronies ensued, until C# came along to provide much needed relief.

By this time the 3-tier programming model was in full swing along with heavy methodologies like Waterfall and RUP. Later, SCRUM and Agile would try to win our hearts with pointless meetings, and two programmers chatting at one desk instead of coding. We were drowning in methodologies, frameworks, standards, excessive encapsulation, and dirty old languages trying to convince us they were still worth a damn.

After nearly a decade of this I left the industry for health reasons and put all those woes behind me. Lately however I've been finding myself interested in just creating some software for the joy of programming and that's where Go comes in.

I was looking into how I would go about making a project with near real-time data needs, high availability, and scalability. I went to my 'go to' toolkit and pulled out C#, made new friends with [Mongo DB](http://www.mongodb.org/ "Mongo DB"), dusted off ASP.NET and started looking into the crusted up scab that is the membership provider for IIS. That, combined with the horror of their entity class implementation, the MVC and a myriad of other things made me think - sod this; there has to be a better way than all this old junk.

Flip back about three years and I was putting together a wish list of all the things I would like in a new language for general purpose web application programming. For me, most important was to cut down on the sheer amount of typing and double / triple entry required to get something from a web page in a database table and back. There are frameworks that help out, and of course I had made my own which I had used for years that did all the heavy lifting, but it still felt like a crutch.

The languages themselves had also become unwieldy after years of different committees adding their two cents to the pile. What I needed was a good simple scripting like language with strong typing, solid support for network, html, web technologies, JSON and XML, multi-threading and parallelism - and that's when I met Go.

Let's have a look at what makes Go so damn awesome:

* Go has only 25 reserved words in it's language, it's svelte
* Go is 'C like' so you already have a good handle of how it works
* Go saves on typing by ditching semi-colons and the like unless they are required
* Go has the best implementation of a 'it just works' multi-threading model I've seen
* Go has libraries that support all the workaday labour for web applications
* Go ditched a lot of old language kruft in the interests of making it faster to read / write / compile and deploy
* Go enforces warnings as errors to stop lazy peeps from pissing in your code pool
* Go compiles fast - and runs fast, real fast
* Go has one and only one standard for code formatting so there's no fighting over how much space to put where or the placement of braces
* Go plays nice with Git and Mercurial, it will automatically grab libraries for you and aids in publishing yours to others
* Go doesn't force you to shoehorn all your code into one file or use headers or any other malarky

If you want a thorough book on the subject that is up to date and packed with useful information then take a look at [The Way To Go](http://www.amazon.com/gp/product/B0083RVAJW/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=B0083RVAJW&linkCode=as2&tag=ivanhawkesper-20 "Amazon - The Way to Go: A Thorough Introduction to the Go Programming Language"). Kindle owners, get the digital copy which is a steal currently at only $3.49.