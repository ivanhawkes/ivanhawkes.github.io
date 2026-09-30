---
name: kanban-card
description:
    Create a program that will allow efficient management of kanban cards stored
    in the project.
---

# Goal

The goal is to write a program that can execute a command line on my behalf,
saving typing effort and creating consistently named markdown files with kanban
data as their contents.

The program should be called `kan` and take the following parameters:

- The `kind` of card to create. A list has been provided later in this document.
- A short title for the card of up to 40 characters.

The program will deduce which `kind` of card the user wants to create. It will
execute the correct hugo command, passing in the parameters e.g.

```
hugo new content kanban/requests/rq-022-hunt-the-wumpus.md --kind requests
```

The name of the markdown file consists of three parts:

- a two letter prefix indicating what sort of content the card contains
- a serial number. each kind has it's own bucket of serial numbers. The first
  card of a given type will be assigned serial number `001`. Each subsequent
  card will receive an auto-incremented value for it's serial number. Numbers
  are formatted`NNN`, three decimal places, with leading zeroes.
- The short title provided by the user. The program will convert it to
  lowercase, and use `-` (dashes) to separate words within the title.

# Kanban Card

Cards are markdown files saved in `content/kanban/<kind>/`. The folder must
match the kind used at creation time.

Kinds and ID prefixes:

| Kind           | Prefix |
| -------------- | ------ |
| acceptance     | ac-    |
| bugs           | bg-    |
| deliverables   | dl-    |
| deployment     | dp-    |
| epics          | ep-    |
| features       | ft-    |
| ideation       | id-    |
| meta           | mt-    |
| releases       | rl-    |
| requests       | rq-    |
| scaffold       | sf-    |
| specifications | sp-    |
| testing        | ts-    |
| user-stories   | us-    |

# Implementation

The `kan` program is implemented in Go at `cmd/kan/main.go`.

Usage:

```
kan <kind> <title>
```

The kind may be given as the full kind name (`requests`), its ID prefix (`rq` or
`rq-`), or a short alias (`request`, `bug`, `user stories`). The title is
lowercased, dash-separated, and rejected if longer than 40 characters. The next
serial number is deduced by scanning the kind's folder for existing
`<prefix>-NNN` cards.

After writing or changing the program, build it and install it to the user's bin
directory so it is available on the PATH:

```
go build -o ~/.local/bin/kan ./cmd/kan
```

# Requirements

You may choose which language you use to write the program from this list:

- python3
- node js
- go lang
- bash

Below are examples of the command line that the program must be able to execute.
It needs to be capable of executing each variation of the command as shown
below.

Within the commands the `test` text is the title of the kanban card, a parameter
which will have been passed into the program when the user executes it.

```
hugo new content kanban/acceptance/ac-001-test.md --kind acceptance
hugo new content kanban/bugs/bg-001-test.md --kind bugs
hugo new content kanban/deliverables/dl-001-test.md --kind deliverables
hugo new content kanban/deployment/dl-001-test.md --kind deployment
hugo new content kanban/epics/ep-001-test.md --kind epics
hugo new content kanban/features/ft-001-test.md --kind features
hugo new content kanban/ideation/id-001-test.md --kind ideation
hugo new content kanban/meta/mt-001-test.md --kind meta
hugo new content kanban/releases/rl-001-test.md --kind releases
hugo new content kanban/requests/rq-001-test.md --kind requests
hugo new content kanban/scaffold/sf-001-test.md --kind scaffold
hugo new content kanban/specifications/sp-001-test.md --kind specifications
hugo new content kanban/testing/ts-001-test.md --kind testing
hugo new content kanban/user-stories/us-001-test.md --kind user-stories
```
