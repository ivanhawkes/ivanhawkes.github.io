// kan scaffolds a kanban card by running `hugo new content` with the
// name this repo's layout expects.
//
// Usage:
//
//	kan [flags] <kind> <title words...>
//
// Flags:
//
//	-stage, -s      destination stage folder, default 01-to-do. Accepts the
//	                number (1, 2, 3), a name (to-do, in-progress, done), and
//	                an optional topic sub-folder: -s 2/ui
//	-priority, -p   priority digit 0-9, default 2
//	-dry-run, -n    print the hugo command that would run, then exit
//
// The card is written to:
//
//	content/kanban/<stage>/p<priority>-<prefix>-<slug>.md
//
// The stage folder is the card's status and the priority lives in the
// filename, so neither is stored in front matter. The two-letter kind
// prefix and the slug are the card's identity: they must be unique
// across every stage, because the specification shortcodes select cards
// with the pattern p[0-9]-<prefix>-<slug>.
//
// After Hugo writes the file, kan replaces the title-cased filename
// ("P2 Rq My Card") with a readable title, mirrors it in the body
// heading, and reduces the generated date to a plain ISO date.
package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

const (
	kanbanDir      = "content/kanban"
	defaultStage   = "01-to-do"
	defaultPrio    = 2
	maxTitleLen    = 40
	dateLayoutISO  = "2006-01-02"
	hugoBinaryName = "hugo"
)

// kind describes one kanban card kind and how it is identified.
type kind struct {
	name    string   // archetype name, e.g. "user-stories"
	prefix  string   // two-letter ID prefix, e.g. "us"
	aliases []string // words the user may type instead of the name
}

var kinds = []kind{
	{"acceptance", "ac", []string{"acceptance", "acceptance criteria"}},
	{"deliverables", "dl", []string{"deliverable"}},
	{"deployment", "dp", []string{"deploy"}},
	{"epics", "ep", []string{"epic"}},
	{"features", "ft", []string{"feature"}},
	{"ideation", "id", []string{"idea", "ideation"}},
	{"issues", "is", []string{"issue", "bug", "defect"}},
	{"releases", "rl", []string{"release"}},
	{"scaffold", "sf", []string{"scaffold"}},
	{"specifications", "sp", []string{"specification", "spec"}},
	{"testing", "ts", []string{"test", "testing"}},
	{"user-stories", "us", []string{"user story", "user stories", "user-story", "story", "request"}},
}

// stageAliases maps shorthand stage names to their folder.
var stageAliases = map[string]string{
	"1": "01-to-do", "to-do": "01-to-do", "todo": "01-to-do", "new": "01-to-do",
	"2": "02-in-progress", "in-progress": "02-in-progress", "inprogress": "02-in-progress",
	"progress": "02-in-progress", "doing": "02-in-progress", "wip": "02-in-progress",
	"3": "03-done", "done": "03-done", "complete": "03-done",
}

// cardPattern matches a card filename and captures its priority, kind
// prefix and slug.
var cardPattern = regexp.MustCompile(`^p([0-9])-([a-z]{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$`)

func main() {
	os.Exit(run(os.Args[1:]))
}

func run(args []string) int {
	opts, rest, ok := parseFlags(args)
	if !ok {
		return 2
	}
	if len(rest) < 2 {
		fmt.Fprintln(os.Stderr, "kan: needs a kind and a title")
		usage()
		return 2
	}

	k, titleWords, ok := deduceKind(rest)
	if !ok {
		fmt.Fprintf(os.Stderr, "kan: unrecognised kind %q\n", rest[0])
		usage()
		return 2
	}

	title := strings.Join(titleWords, " ")
	if len(title) > maxTitleLen {
		fmt.Fprintf(os.Stderr, "kan: title is %d characters, maximum is %d\n", len(title), maxTitleLen)
		return 1
	}
	slug := slugify(title)
	if slug == "" {
		fmt.Fprintln(os.Stderr, "kan: title contains no usable characters")
		return 1
	}

	stage, err := resolveStage(opts.stage)
	if err != nil {
		fmt.Fprintln(os.Stderr, "kan:", err)
		return 1
	}

	id := fmt.Sprintf("p%d-%s-%s", opts.priority, k.prefix, slug)
	if existing, err := findCard(k.prefix, slug); err != nil {
		fmt.Fprintln(os.Stderr, "kan:", err)
		return 1
	} else if existing != "" {
		fmt.Fprintf(os.Stderr, "kan: card %s already exists at %s\n", id, existing)
		fmt.Fprintln(os.Stderr, "       card IDs are unique across all stages; pick a different title")
		return 1
	}

	contentPath := filepath.Join("kanban", stage, id+".md")
	hugoArgs := []string{"new", "content", contentPath, "--kind", k.name}

	if opts.dryRun {
		fmt.Println(hugoBinaryName, strings.Join(hugoArgs, " "))
		return 0
	}

	cmd := exec.Command(hugoBinaryName, hugoArgs...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		fmt.Fprintln(os.Stderr, "kan: hugo failed:", err)
		return 1
	}

	path := filepath.Join(kanbanDir, stage, id+".md")
	if err := tidyCard(path, humanizeTitle(title)); err != nil {
		fmt.Fprintf(os.Stderr, "kan: created %s but could not tidy it: %v\n", path, err)
		return 1
	}

	fmt.Println(path)
	fmt.Println("next: fill in the description, the params block, and the body")
	return 0
}

type options struct {
	stage    string
	priority int
	dryRun   bool
}

// parseFlags reads kan's flags and returns them with the remaining
// positional arguments.
func parseFlags(args []string) (options, []string, bool) {
	opts := options{stage: defaultStage, priority: defaultPrio}

	fs := flag.NewFlagSet("kan", flag.ContinueOnError)
	fs.SetOutput(os.Stderr)
	fs.Usage = usage
	fs.StringVar(&opts.stage, "stage", opts.stage, "stage folder, e.g. 01-to-do")
	fs.StringVar(&opts.stage, "s", opts.stage, "shorthand for -stage")
	fs.IntVar(&opts.priority, "priority", opts.priority, "priority digit 0-9")
	fs.IntVar(&opts.priority, "p", opts.priority, "shorthand for -priority")
	fs.BoolVar(&opts.dryRun, "dry-run", false, "print the hugo command and exit")
	fs.BoolVar(&opts.dryRun, "n", false, "shorthand for -dry-run")

	if err := fs.Parse(args); err != nil {
		return opts, nil, false
	}
	if opts.priority < 0 || opts.priority > 9 {
		fmt.Fprintf(os.Stderr, "kan: priority must be a single digit 0-9, got %d\n", opts.priority)
		return opts, nil, false
	}
	return opts, fs.Args(), true
}

// deduceKind matches the leading arguments against a kind's name, ID
// prefix (with or without a trailing dash) or alias, and returns the
// remaining title words.
func deduceKind(args []string) (kind, []string, bool) {
	if k, ok := byName(args[0]); ok {
		return k, args[1:], true
	}
	for _, k := range kinds {
		for _, alias := range k.aliases {
			parts := strings.Fields(alias)
			if len(parts) > len(args) {
				continue
			}
			match := true
			for i, p := range parts {
				if !strings.EqualFold(args[i], p) {
					match = false
					break
				}
			}
			if match {
				return k, args[len(parts):], true
			}
		}
	}
	return kind{}, nil, false
}

func byName(name string) (kind, bool) {
	name = strings.ToLower(strings.TrimSuffix(name, "-"))
	for _, k := range kinds {
		if name == k.name || name == k.prefix {
			return k, true
		}
	}
	return kind{}, false
}

// resolveStage turns a stage shorthand into a folder under
// content/kanban, keeping any topic sub-folder. The folder must already
// exist, so a typo fails loudly instead of scattering cards into new
// stages.
func resolveStage(spec string) (string, error) {
	parts := strings.Split(strings.Trim(spec, "/"), "/")
	stage, err := resolveStageName(parts[0])
	if err != nil {
		return "", err
	}
	rel := append([]string{stage}, parts[1:]...)
	path := filepath.Join(kanbanDir, filepath.Join(rel...))
	info, err := os.Stat(path)
	if err != nil || !info.IsDir() {
		topics, terr := listSubfolders(filepath.Join(kanbanDir, stage))
		if terr == nil && len(topics) > 0 {
			return "", fmt.Errorf("no stage %q; %s has topics: %s",
				spec, stage, strings.Join(topics, ", "))
		}
		return "", fmt.Errorf("no stage %q; stages are: %s", spec, strings.Join(stages(), ", "))
	}
	return filepath.Join(rel...), nil
}

func resolveStageName(name string) (string, error) {
	norm := strings.ToLower(strings.TrimSpace(name))
	norm = strings.ReplaceAll(norm, "_", "-")
	if stage, ok := stageAliases[norm]; ok {
		return stage, nil
	}
	for _, s := range stages() {
		if strings.EqualFold(s, norm) {
			return s, nil
		}
	}
	return "", fmt.Errorf("unknown stage %q", name)
}

// stages lists the numbered stage folders in content/kanban.
func stages() []string {
	dirs, err := listSubfolders(kanbanDir)
	if err != nil {
		return []string{defaultStage}
	}
	return dirs
}

func listSubfolders(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var dirs []string
	for _, e := range entries {
		if e.IsDir() {
			dirs = append(dirs, e.Name())
		}
	}
	return dirs, nil
}

// findCard searches every stage, including topic sub-folders, for a card
// whose kind prefix and slug match. Card IDs are unique site-wide, so
// any hit is a collision. An empty result means the ID is free.
func findCard(prefix, slug string) (string, error) {
	var found string
	err := filepath.WalkDir(kanbanDir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		m := cardPattern.FindStringSubmatch(d.Name())
		if m == nil {
			return nil
		}
		if m[2] == prefix && m[3] == slug {
			found = path
			return filepath.SkipAll
		}
		return nil
	})
	if err != nil {
		return "", fmt.Errorf("scanning %s: %w", kanbanDir, err)
	}
	return found, nil
}

// tidyCard replaces the filename-derived title Hugo generated with a
// readable title, mirrors it in the body's first heading, and reduces
// the date to a plain ISO date, matching the existing cards.
func tidyCard(path, title string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	text := string(data)

	fence := strings.Index(text[3:], "\n---")
	if !strings.HasPrefix(text, "---") || fence < 0 {
		return fmt.Errorf("no front matter block found")
	}
	end := fence + 3 + len("\n---")
	front, body := text[:end], text[end:]

	front = setFrontField(front, "title", yamlQuote(title))
	front = setFrontField(front, "date", yamlQuote(time.Now().Format(dateLayoutISO)))
	body = setHeading(body, title)

	return os.WriteFile(path, []byte(front+body), 0o644)
}

func setFrontField(front, field, value string) string {
	pattern := regexp.MustCompile(`(?m)^` + field + `:.*$`)
	replacement := field + ": " + value
	if !pattern.MatchString(front) {
		return strings.TrimSuffix(front, "\n") + "\n" + replacement + "\n"
	}
	return pattern.ReplaceAllString(front, replacement)
}

func setHeading(body, title string) string {
	pattern := regexp.MustCompile(`(?m)^# .*$`)
	if !pattern.MatchString(body) {
		return body
	}
	return pattern.ReplaceAllString(body, "# "+title)
}

// yamlQuote wraps s in single quotes, escaping embedded quotes.
func yamlQuote(s string) string {
	return "'" + strings.ReplaceAll(s, "'", "''") + "'"
}

// humanizeTitle turns a card title into a readable title, capitalising
// words and leaving small words lowercase inside the title.
func humanizeTitle(title string) string {
	words := strings.FieldsFunc(slugify(title), func(r rune) bool { return r == '-' })
	small := map[string]bool{"a": true, "an": true, "and": true, "as": true, "at": true,
		"but": true, "by": true, "for": true, "from": true, "in": true, "into": true,
		"nor": true, "of": true, "on": true, "or": true, "the": true, "to": true,
		"up": true, "via": true, "with": true}
	for i, w := range words {
		if i > 0 && small[w] {
			words[i] = w
			continue
		}
		words[i] = strings.ToUpper(w[:1]) + w[1:]
	}
	return strings.Join(words, " ")
}

// slugify lowercases the title and turns non-alphanumerics into single
// dashes.
func slugify(s string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(s) {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		} else {
			b.WriteByte('-')
		}
	}
	out := b.String()
	for strings.Contains(out, "--") {
		out = strings.ReplaceAll(out, "--", "-")
	}
	return strings.Trim(out, "-")
}

func usage() {
	fmt.Fprintln(os.Stderr, `usage: kan [flags] <kind> <title words...>

flags:
  -stage, -s     destination stage (default `+defaultStage+`); accepts 1|2|3,
                 to-do|in-progress|done, plus an optional topic: -s 2/ui
  -priority, -p  priority digit 0-9 (default `+strconv.Itoa(defaultPrio)+`)
  -dry-run, -n   print the hugo command and exit

kinds (name, prefix):`)
	for _, k := range kinds {
		fmt.Fprintf(os.Stderr, "  %-16s %s\n", k.name, k.prefix)
	}
	fmt.Fprintln(os.Stderr, `
example: kan -p 1 is hunt the wumpus
         -> content/kanban/01-to-do/p1-is-hunt-the-wumpus.md`)
}
