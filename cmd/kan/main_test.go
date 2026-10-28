package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestSlugify(t *testing.T) {
	cases := []struct{ in, want string }{
		{"Hunt the Wumpus", "hunt-the-wumpus"},
		{"  Fix   the Menu! ", "fix-the-menu"},
		{"v2 Release, take 3", "v2-release-take-3"},
		{"***", ""},
		{"Already--Slugged", "already-slugged"},
	}
	for _, c := range cases {
		if got := slugify(c.in); got != c.want {
			t.Errorf("slugify(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestHumanizeTitle(t *testing.T) {
	cases := []struct{ in, want string }{
		{"hunt the wumpus", "Hunt the Wumpus"},
		{"add a menu for the docs", "Add a Menu for the Docs"},
		{"fix the nav and the footer", "Fix the Nav and the Footer"},
		{"FIX MENUS", "Fix Menus"},
		{"v2 release", "V2 Release"},
	}
	for _, c := range cases {
		if got := humanizeTitle(c.in); got != c.want {
			t.Errorf("humanizeTitle(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

// TestEveryKindHasArchetype keeps the kind table in step with Hugo's
// archetypes, which are looked up by kind name.
func TestEveryKindHasArchetype(t *testing.T) {
	for _, k := range kinds {
		path := filepath.Join("..", "..", "be-best", "archetypes", k.name+".md")
		if _, err := os.Stat(path); err != nil {
			t.Errorf("kind %q has no archetype at %s", k.name, path)
		}
	}
}

func TestDeduceKind(t *testing.T) {
	cases := []struct {
		args   []string
		prefix string
		title  string
	}{
		{[]string{"issues", "fix", "menus"}, "is", "fix menus"},
		{[]string{"is", "fix", "menus"}, "is", "fix menus"},
		{[]string{"is-", "fix", "menus"}, "is", "fix menus"},
		{[]string{"IS", "fix", "menus"}, "is", "fix menus"},
		{[]string{"issue", "fix", "menus"}, "is", "fix menus"},
		{[]string{"bug", "fix", "menus"}, "is", "fix menus"},
		{[]string{"user", "stories", "wumpus"}, "us", "wumpus"},
		{[]string{"user-story", "wumpus"}, "us", "wumpus"},
		{[]string{"user-stories", "wumpus"}, "us", "wumpus"},
		{[]string{"request", "fix", "menus"}, "us", "fix menus"},
		{[]string{"sp", "write", "specs"}, "sp", "write specs"},
		{[]string{"spec", "write", "specs"}, "sp", "write specs"},
		{[]string{"acceptance", "criteria"}, "ac", "criteria"},
	}
	for _, c := range cases {
		k, rest, ok := deduceKind(c.args)
		if !ok {
			t.Errorf("deduceKind(%v) reported no match", c.args)
			continue
		}
		if k.prefix != c.prefix {
			t.Errorf("deduceKind(%v) matched %s, want %s", c.args, k.prefix, c.prefix)
		}
		if got := strings.Join(rest, " "); got != c.title {
			t.Errorf("deduceKind(%v) title = %q, want %q", c.args, got, c.title)
		}
	}
}

func TestDeduceKindRejects(t *testing.T) {
	for _, args := range [][]string{
		{"wumpus", "title"},
		{"", "x"},
		{"requests", "fix", "menus"}, // the requests kind was merged into user stories
		{"bugs", "fix", "menus"},     // bugs is now issues
		{"meta", "fix", "menus"},     // meta was dropped as a kind
	} {
		if _, _, ok := deduceKind(args); ok {
			t.Errorf("deduceKind(%v) matched, want no match", args)
		}
	}
}

// TestRunNeedsTitle: "user stories" is a valid two-word kind, so a card
// title is still required.
func TestRunNeedsTitle(t *testing.T) {
	chdirRepo(t)
	if code := run([]string{"-n", "user", "stories"}); code == 0 {
		t.Error("run(user stories) exited 0, want a usage error")
	}
}

func TestResolveStage(t *testing.T) {
	chdirRepo(t)
	for _, c := range []struct{ in, want string }{
		{"01-to-do", "01-to-do"},
		{"1", "01-to-do"},
		{"to-do", "01-to-do"},
		{"todo", "01-to-do"},
		{"02-in-progress", "02-in-progress"},
		{"2", "02-in-progress"},
		{"in-progress", "02-in-progress"},
		{"wip", "02-in-progress"},
		{"03-done", "03-done"},
		{"2/ui", filepath.Join("02-in-progress", "ui")},
		{"02-in-progress/features/", filepath.Join("02-in-progress", "features")},
	} {
		got, err := resolveStage(c.in)
		if err != nil {
			t.Errorf("resolveStage(%q): %v", c.in, err)
			continue
		}
		if got != c.want {
			t.Errorf("resolveStage(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestResolveStageRejects(t *testing.T) {
	chdirRepo(t)
	for _, in := range []string{"04-later", "review", "2/wumpus", "3/ui", ""} {
		if got, err := resolveStage(in); err == nil {
			t.Errorf("resolveStage(%q) = %q, want an error", in, got)
		}
	}
}

func TestFindCard(t *testing.T) {
	chdirRepo(t)
	writeCard(t, "01-to-do", "p2-us-html-check.md")
	writeCard(t, filepath.Join("02-in-progress", "ui"), "p1-ft-menu-system.md")
	writeCard(t, "03-done", "p2-us-code-to-clipboard.md")

	cases := []struct {
		prefix, slug, want string
	}{
		{"us", "html-check", filepath.Join(kanbanDir, "01-to-do", "p2-us-html-check.md")},
		{"ft", "menu-system", filepath.Join(kanbanDir, "02-in-progress", "ui", "p1-ft-menu-system.md")},
		{"us", "code-to-clipboard", filepath.Join(kanbanDir, "03-done", "p2-us-code-to-clipboard.md")},
		{"us", "menu-system", ""},  // slug exists under another kind
		{"ft", "html-check", ""},   // prefix exists, slug does not
		{"us", "html_check", ""},   // not a card filename
		{"us", "html-check-2", ""}, // near miss
		{"ac", "html-check", ""},
	}
	for _, c := range cases {
		got, err := findCard(c.prefix, c.slug)
		if err != nil {
			t.Fatalf("findCard(%q, %q): %v", c.prefix, c.slug, err)
		}
		if got != c.want {
			t.Errorf("findCard(%q, %q) = %q, want %q", c.prefix, c.slug, got, c.want)
		}
	}
}

func TestFindCardNoKanbanDir(t *testing.T) {
	t.Chdir(t.TempDir())
	if _, err := findCard("is", "x"); err == nil {
		t.Error("findCard with no content/kanban reported no error")
	}
}

func TestTidyCard(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "p2-is-hunt-the-wumpus.md")
	body := `---
title: "P2 Is Hunt The Wumpus"
description: 'Limit to 50 characters'
date: '2026-10-22T15:58:17'
author: null
params:
  completionDate: null
  due: null
  dependencies: null
  references: null
---

A brief description.

<!--more-->

# P2 Is Hunt The Wumpus

## Goals

    - Steps
`
	if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := tidyCard(path, "Hunt the Wumpus"); err != nil {
		t.Fatal(err)
	}

	got, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	text := string(got)
	for _, want := range []string{
		`title: 'Hunt the Wumpus'`,
		"# Hunt the Wumpus",
		"date: '" + time.Now().Format(dateLayoutISO) + "'",
		"  dependencies: null",
		"    - Steps",
	} {
		if !strings.Contains(text, want) {
			t.Errorf("tidied card is missing %q:\n%s", want, text)
		}
	}
	for _, unwanted := range []string{"P2 Is", "T15:58:17"} {
		if strings.Contains(text, unwanted) {
			t.Errorf("tidied card still contains %q:\n%s", unwanted, text)
		}
	}
	if strings.Count(text, "title:") != 1 {
		t.Errorf("tidied card has more than one title field:\n%s", text)
	}
}

func TestTidyCardEscapesQuotes(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "p2-is-it-s-fine.md")
	if err := os.WriteFile(path, []byte("---\ntitle: x\ndate: y\n---\n\n# x\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := tidyCard(path, "It's Fine"); err != nil {
		t.Fatal(err)
	}
	data, _ := os.ReadFile(path)
	if !strings.Contains(string(data), "title: 'It''s Fine'") {
		t.Errorf("quote not escaped:\n%s", data)
	}
}

func TestRunDefaultStageIsTodo(t *testing.T) {
	chdirRepo(t)
	out := captureStdout(t, func() {
		if code := run([]string{"-n", "is", "hunt", "the", "wumpus"}); code != 0 {
			t.Fatalf("run exit code %d", code)
		}
	})
	if !strings.Contains(out, "kanban"+string(filepath.Separator)+"01-to-do"+string(filepath.Separator)+"p2-is-hunt-the-wumpus.md") {
		t.Errorf("default stage is not 01-to-do: %s", out)
	}
	if !strings.Contains(out, "--kind issues") {
		t.Errorf("dry run did not pass --kind issues: %s", out)
	}
	if _, err := os.Stat(filepath.Join(kanbanDir, "01-to-do", "p2-is-hunt-the-wumpus.md")); !os.IsNotExist(err) {
		t.Error("-dry-run created a card")
	}
}

func TestRunRespectsFlags(t *testing.T) {
	chdirRepo(t)
	out := captureStdout(t, func() {
		if code := run([]string{"-s", "2/ui", "-p", "1", "user", "stories", "hunt", "wumpus"}); code != 0 {
			t.Fatalf("run exit code %d", code)
		}
	})
	want := filepath.Join("kanban", "02-in-progress", "ui", "p1-us-hunt-wumpus.md")
	if !strings.Contains(out, want) {
		t.Errorf("dry run = %q, want a command writing %s", out, want)
	}
}

func TestRunRejects(t *testing.T) {
	chdirRepo(t)
	writeCard(t, "01-to-do", "p2-us-html-check.md")
	cases := [][]string{
		{"-n", "wumpus", "title"},               // unknown kind
		{"-n", "is"},                            // no title
		{"-n", "is", strings.Repeat("x", 41)},   // title too long
		{"-n", "is", "***"},                     // no usable characters
		{"-s", "04-later", "-n", "is", "title"}, // unknown stage
		{"-p", "2", "-n", "us", "html", "check"},
		{"-p", "9", "-n", "us", "html", "check"}, // same prefix and slug, other priority
		{"-priority", "12", "-n", "is", "title"}, // priority out of range
	}
	for _, args := range cases {
		code := run(args)
		if code == 0 {
			t.Errorf("run(%v) exited 0, want non-zero", args)
		}
	}
}

func TestTitleLengthBoundary(t *testing.T) {
	chdirRepo(t)
	title := strings.Repeat("a", maxTitleLen)
	if code := run([]string{"-n", "is", title}); code != 0 {
		t.Errorf("title of %d characters rejected", maxTitleLen)
	}
	if code := run([]string{"-n", "is", title + "b"}); code == 0 {
		t.Errorf("title of %d characters accepted", maxTitleLen+1)
	}
}

// helpers

// chdirRepo moves the test into a throwaway directory holding the
// kanban stages kan needs, plus the repo's archetypes when a test walks
// the kind table.
func chdirRepo(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	for _, stage := range []string{"01-to-do", "02-in-progress", "03-done"} {
		if err := os.MkdirAll(filepath.Join(dir, kanbanDir, stage), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	for _, topic := range []string{"ui", "features"} {
		if err := os.MkdirAll(filepath.Join(dir, kanbanDir, "02-in-progress", topic), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	t.Chdir(dir)
	return dir
}

func writeCard(t *testing.T, stage, name string) {
	t.Helper()
	path := filepath.Join(kanbanDir, stage, name)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte("---\ntitle: x\n---\n"), 0o644); err != nil {
		t.Fatal(err)
	}
}

// captureStdout runs fn with os.Stdout redirected to a file and returns
// what was written.
func captureStdout(t *testing.T, fn func()) string {
	t.Helper()
	f, err := os.CreateTemp(t.TempDir(), "stdout")
	if err != nil {
		t.Fatal(err)
	}
	saved := os.Stdout
	os.Stdout = f
	defer func() { os.Stdout = saved }()

	fn()

	if err := f.Close(); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(f.Name())
	if err != nil {
		t.Fatal(err)
	}
	return string(data)
}
