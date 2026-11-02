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

    # Node and PNPM added directly via standard system package attributes
    pkgs.nodejs_24
    pkgs.pnpm

    # Bring worktrunk into the project.
    pkgs.worktrunk

    # Pi Coding Agent - simple, light, customise for the project.
    pkgs.pi-coding-agent

    # Oh My Pi Coding Agent - evaluate for useful features.
    pkgs.omp

    # Get access to copy and paste.
    pkgs.wl-clipboard

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

  # Environment Variables
  env = {
    TMPDIR = "/tmp";
    WAYLAND_DISPLAY = "wayland-1";
    DISPLAY = ":0";
  };

  # Enable the native delta integration for improved Git diff views.
  delta.enable = true;

  # Commented out completely to break the global fallback dependency chain
  # languages.javascript = { ... };

  enterShell = ''
    if [ -d .git ]; then
      echo "Checking Git LFS initialization..."
      git lfs install --local --force
    else
      echo "Not a Git repository. Skipping Git LFS setup."
    fi

    export HUGO_AUTHOR=`getent passwd $USER | cut -d: -f5 | cut -d, -f1`

    echo "Welcome $HUGO_AUTHOR"
    echo "Web Dev Environment:"
    echo "  Git: $(git --version)"
    echo "  Go: $(go version)"
    echo "  HUGO: $(hugo version)"
    echo "  Node.js: $(node --version)"
    echo "  pnpm: $(pnpm --version)"
    echo "  Tailwind: $(tailwindcss --help | head -n 1)"

    if [ ! -f ".config/wt.toml" ]; then
      echo "💡 Run 'wt config create --project' to link this repo."
    fi

    wt step copy-ignored
  '';

  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
    hugo version
  '';

  tasks."project:init" = {
    exec = "${pkgs.pnpm}/bin/pnpm install";
    before = [ "devenv:enterShell" ];
  };
}
