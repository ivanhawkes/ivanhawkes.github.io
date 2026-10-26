{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  packages = [
    # Git LFS for repository management.
    pkgs.git
    pkgs.git-lfs
    pkgs.github-cli

    # Bring worktrunk into the project.
    pkgs.worktrunk

    # Pi Coding Agent - simple, light, customise for the project.
    pkgs.pi-coding-agent

    # Oh My Pi Coding Agent - evaluate for useful features.
    pkgs.omp

    # Get access to copy and paste.
    pkgs.wl-clipboard

    # Playwright will allow us to iterate on the web design.
    #pkgs.playwrightMcp

    # Languages for Pi and the local AI model to use.
    pkgs.go

    # Allow downloads from the web.
    pkgs.curl

    # Fast static site generator
    pkgs.hugo

    # Standalone Tailwind CSS CLI
    pkgs.tailwindcss

    # Provide bubblewrap if you plan to use Linux sandboxing features
    pkgs.bubblewrap

    # Extra command line tools for agents.
    pkgs.ripgrep
    pkgs.jq
    pkgs.fd
  ];

  # 3. Environment Variables (Add the Wayland passthrough here)
  env = {
    TMPDIR = "/tmp";

    # Pass through Wayland & Noctalia/Niri environment contexts
    WAYLAND_DISPLAY = "wayland-1";
    DISPLAY = ":0"; # Fallback for XWayland bridges inside the shell
  };

  # Enable the native delta integration for improved Git diff views.
  delta.enable = true;

  # Enable Node.js
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;

    # Enables pnpm package manager
    pnpm.enable = true;

    # Tell Corepack to handle pnpm wrappers safely
    corepack.enable = true;
  };

  enterShell = ''
    # Make sure we have Git LFS installed.
    if [ -d .git ]; then
      echo "Checking Git LFS initialization..."
      git lfs install --local --force
    else
      echo "Not a Git repository. Skipping Git LFS setup."
    fi

    # Find the full name of the OS user.
    export HUGO_AUTHOR=`getent passwd $USER | cut -d: -f5 | cut -d, -f1`

    echo "Welcome $HUGO_AUTHOR"
    echo "Web Dev Environment:"
    echo "  Git: $(git --version)"
    echo "  Go: $(go version)"
    echo "  HUGO: $(hugo version)"
    echo "  Node.js: $(node --version)"
    echo "  pnpm: $(pnpm --version)"
    echo "  Tailwind: $(tailwindcss --help | head -n 1)"

    # Ensures worktrunk hook bindings exist inside this project's sandbox
    if [ ! -f ".config/wt.toml" ]; then
      echo "💡 Run 'wt config create --project' to link this repo."
    fi

    # Ensure work trunk can copy files from the .gitignore - this is mostly for .env style files.
    wt step copy-ignored

    # Force the devenv evaluation cache to look at the shared git layer
    # Keep hooks non-interactive so they don't break Pi's terminal UI
    if [ -n "$DIRENV_IN_ENVRC" ]; then
      # Quietly check or configure paths if necessary, avoiding any dynamic stdin blocks
      true
    fi
  '';

  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
    hugo version
  '';

  tasks."project:init" = {
    exec = "pnpm install";
    before = [ "devenv:enterShell" ]; # Ensures it runs right before you get shell access
  };
}
