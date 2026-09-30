// kan creates a Kanban card by invoking `hugo new` with an
// auto-incremented serial number for the given card kind.
//
// Usage:
//
//	kan <kind> <title words...>
//
// The kind may be given as the full kind name (e.g. "requests") or by
// its ID prefix (e.g. "rq" or "rq-"). The title is lowercased,
// dash-separated, and appended to <prefix>-<NNN> to form the card
// filename.
package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
)

// kind describes one kanban card kind and how it is identified.
type kind struct {
	name    string   // folder name under content/kanban/
	prefix  string   // ID prefix, e.g. "rq"
	aliases []string // alternative words the user may type
}

var kinds = []kind{
	{"acceptance", "ac", []string{"acceptance"}},
	{"bugs", "bg", []string{"bug"}},
	{"deliverables", "dl", []string{"deliverable"}},
	{"deployment", "dp", []string{"deployment"}},
	{"epics", "ep", []string{"epic"}},
	{"features", "ft", []string{"feature"}},
	{"ideation", "id", []string{"ideation"}},
	{"meta", "mt", []string{"meta"}},
	{"releases", "rl", []string{"release"}},
	{"requests", "rq", []string{"request"}},
	{"scaffold", "sf", []string{"scaffold"}},
	{"specifications", "sp", []string{"specification"}},
	{"testing", "ts", []string{"test"}},
	{"user-stories", "us", []string{"user stories"}},
}

// serialPattern matches an existing card ID in a kind's folder.
var serialPattern = regexp.MustCompile(`^([a-z]{2})-(\d{3})(?:[-.].*)?$`)

const maxTitleLen = 30

func main() {
	os.Exit(run(os.Args[1:]))
}

func run(args []string) int {
	if len(args) < 2 {
		return usage()
	}

	k, rest, ok := deduceKind(args)
	if !ok {
		fmt.Fprintf(os.Stderr, "kan: unrecognised kind %q\n", args[0])
		return usage()
	}

	title := strings.Join(rest, " ")
	if len(title) > maxTitleLen {
		fmt.Fprintf(os.Stderr, "kan: title is %d characters, maximum is %d\n", len(title), maxTitleLen)
		return 1
	}

	slug := slugify(title)
	if slug == "" {
		fmt.Fprintln(os.Stderr, "kan: title contains no usable characters")
		return 1
	}

	serial, err := nextSerial(k)
	if err != nil {
		fmt.Fprintln(os.Stderr, "kan:", err)
		return 1
	}

	name := fmt.Sprintf("%s-%03d-%s.md", k.prefix, serial, slug)
	path := filepath.Join("content", "kanban", k.name, name)

	cmd := exec.Command("hugo", "new", path, "--kind", k.name)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		fmt.Fprintln(os.Stderr, "kan: hugo failed:", err)
		return 1
	}

	fmt.Println(path)
	return 0
}

// deduceKind inspects the leading arguments and returns the matched kind
// and the remaining title words.
// deduceKind inspects the leading arguments and returns the matched
// kind and the remaining title words. The kind may be given as the
// full name ("requests"), the ID prefix ("rq", "rq-"), or a short alias
// ("request", "user stories").
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
	name = strings.ToLower(name)
	for _, k := range kinds {
		if name == k.name || name == k.prefix || name == k.prefix+"-" {
			return k, true
		}
	}
	return kind{}, false
}

// nextSerial returns the next serial number for the kind by scanning
// its folder for existing <prefix>-<NNN> cards.
func nextSerial(k kind) (int, error) {
	entries, err := os.ReadDir(filepath.Join("content", "kanban", k.name))
	if err != nil {
		return 0, fmt.Errorf("reading %s: %w", k.name, err)
	}

	max := 0
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		m := serialPattern.FindStringSubmatch(e.Name())
		if m == nil || m[1] != k.prefix {
			continue
		}
		var n int
		fmt.Sscanf(m[2], "%d", &n)
		if n > max {
			max = n
		}
	}
	return max + 1, nil
}

// slugify lowercases the title and turns non-alphanumerics into single
// dashes.
func slugify(s string) string {
	s = strings.ToLower(s)
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		} else {
			b.WriteByte('-')
		}
	}
	return strings.Trim(strings.ReplaceAll(b.String(), "--", "-"), "-")
}

func usage() int {
	fmt.Fprintln(os.Stderr, "usage: kan <kind> <title>\n\nkinds:")
	for _, k := range kinds {
		fmt.Fprintf(os.Stderr, "  %-16s %s\n", k.name, k.prefix)
	}
	return 1
}
