# Go CLI Scaffold (cobra, testing)

Thin binary, cobra for argument parsing, standard-library `testing`. Layout:

```
<project>/
├── go.mod
├── main.go                 # cobra root command
├── cmd/
│   └── root.go             # persistent flags
├── internal/
│   └── <domain>/
│       └── <domain>.go     # logic — no flag parsing in here
└── <domain>/
    └── <domain>_test.go    # unit tests
```

## go.mod

```
module github.com/<you>/<project>

go 1.24

require github.com/spf13/cobra v1.8.1
```

## main.go

```go
package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "<project>",
	Short: "<one-line description>",
	Long:  "<multi-line description>",
	RunE: func(cmd *cobra.Command, args []string) error {
		return cmd.Help()
	},
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
```

## cmd/root.go

```go
package cmd

import (
	"github.com/spf13/cobra"
)

var verbose bool

func init() {
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")
}
```

Add subcommands as `cmd/<name>.go`, each with its own `cobra.Command`,
registered in `init()`:

```go
var greetCmd = &cobra.Command{
	Use:   "greet [name]",
	Short: "Greet someone",
	Args:  cobra.MaximumNArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := "world"
		if len(args) == 1 {
			name = args[0]
		}
		return cmd.Printf("Hello, %s!\n", name)
	},
}

func init() {
	rootCmd.AddCommand(greetCmd)
}
```

## Logic in internal/, parsing in cmd/

Never put business logic inside a cobra `RunE`. Hand off to a function in
`internal/<domain>/` and unit-test that function directly:

```go
package greet

func Greet(name string) string {
	if name == "" {
		name = "world"
	}
	return "Hello, " + name + "!"
}
```

## Tests

```go
package greet

import "testing"

func TestGreet(t *testing.T) {
	got := Greet("Sri")
	want := "Hello, Sri!"
	if got != want {
		t.Errorf("Greet() = %q, want %q", got, want)
	}
}
```

Run: `go test ./...`. Exit-code behavior for errors: nonzero via
`os.Exit(1)` in `main`, never `panic`.

## Build

```bash
go build -o bin/<project> ./...
```

## CI

Workflow at `reference/templates/ci-github-actions.md` — Go section
(`go build ./...`, `go vet ./...`, `go test ./...`).

## Init checklist

- [ ] `go mod init`
- [ ] root command + one real subcommand wired in `init()`
- [ ] one unit test on the domain function
- [ ] `.gitignore` Go block (or `vendor/` if vendoring)