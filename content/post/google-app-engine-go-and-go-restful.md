---
type: post
title: Google App Engine, Go and Go-RESTful
date: 2013-10-19
tags: ["Cloud Computing","Go","go-restful","Google App Engine","JSON","Language","REST","XML"]
category: Programming
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

I've spent the better part of a week now learning about a new suite of technologies which I am interested in using to develop my TMO gaming framework.
<!--more-->

The old guard of .NET, C#, T-SQL, ASP.NET and the three tier model feel decidedly out of date. They are cumbersome, slow and bulky at a time when we really need far more agility than previously.

After giving it some thought and study I've decided that the way forward is to use the [Google App Engine](https://developers.google.com/appengine/ "Google App Engine"), the shiny new language, [Go](http://golang.org/ "Go"), and the [Go-RESTfu](https://github.com/emicklei/go-restful "Go-RESTful")l framework. Here's my reasoning.

It's a simple fact, that while computers are getting faster year on year, programmers are not. We are still very much constrained by the languages we use, the protocols we need to negotiate and simple factors like typing speed. One of the single largest expenses in any development project is programmer time, and this is bounded by programmer productivity.

Now, I'm not about to argue that .NET and it's associated technologies can't be quite productive. I am however going to argue that they are not anywhere near as productive as they could be; but let's put that aside for the moment.

I'm developing an application that will be reasonably large, require 99.999% uptime, needs to scale and be highly performant, and should work on a range of devices from phones up to hulking gaming rigs. I don't like repeating myself, so I want to try and follow the DRY principle as a general rule.

The application will need to provide services to gaming servers and players, both in game and outside via mobile features and web. It needs to scale, and I need to be able to rapidly add servers and then remove them as demand drops down. A cloud managed service would be a good fit for this requirement.

There's quite a few cloud services available. Amazon, Microsoft, Google and others are all touting their services, so the big question is who will provide the best service for me?

Amazon went straight out the window with it's ridiculous pricing model. Microsoft wants to push you into using their full suite of tools and that's the stuff I'm actually trying to move away from. More T-SQL? No, thanks! Google however...they host enormous amounts of data and never miss a beat when it comes time to serve it up. I can trust their infrastructure, something I know from over a decade of use, and they make it easy to start off small by giving you free access to the tools for small scale apps. Google wins this round.

Now, I have the choice of a few languages which will run on the [Google App Engine](https://developers.google.com/appengine/ "Google App Engine"). PHP and Python are both available, along with the new contender, Go.

I've used PHP a little bit previously, and honestly, it felt very hacky. It seemed like spaghetti code was almost a given with any decent sized project. I wanted something a little more cautious, but not overly so.

Python looked attractive, and for several days was going to be my option, until I decided to overlook the word 'experimental' and have a look at Go.

It seems like the guys who made Go had heard my complaints about languages and had decided to rewrite the rules and create a beautiful, clever and tiny language for modern day problems. It would run fast, provide a solid set of libraries, and could be used for general purpose systems programming. At the same time, it excelled in handling the modern problems with making data more slippery.

There was still one piece missing from the puzzle, a framework. Go lacks a lot of the polish you might expect from modern tools, in particular UI. If you're targeting RESTful apps on the web however, this becomes a bit of a non-issue. Still, it needed a few handy tools and that is where [Go-RESTful](https://github.com/emicklei/go-restful "Go-RESTful") comes in.

Go-RESTful provides a toolkit centred around REST based web enabled services. Features like regex routing, header handling, error handling, marshalling to and from JSON or XML and filters provide the backbone. Bonus round, it's [Swagger](http://swagger.wordnik.com/ "Swagger") enabled!

By providing a few hints within your code your project gains the ability to be automatically documented using the OPTION verb. Incredibly, it will generate an interface that is able to be consumed by a simple HTML / CSS / JS static application. The static HTML is able to not only document all of your interface's API but also provide a complete UI for making calls against the API. This is utterly invaluable, not only during your own development phase, but also when 3rd parties begin to consume your API.

So how productive is this environment?

It took me a few days to read a swathe of documentation to come up to speed on the language, GAE, Google Datastore, Go-RESTful, and the other new technologies. It took me two days to knock out a sample that implements CRUD against the datastore for a single entity that is then served up RESTfully. It will take me about 10 minutes to replicate that template code and knock out the next entity, and 10 minutes for the next after that.

There's a learning curve to climb, but the payoff is worth the effort.