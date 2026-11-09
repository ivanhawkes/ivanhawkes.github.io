{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  packages = with pkgs; [
    # Git LFS for repository management.
    git
    git-lfs
    github-cli

    # Node and PNPM added directly via standard system package attributes
    nodejs_24
    pnpm

    # Pi Coding Agent - simple, light, customise for the project.
    pi-coding-agent

    # Bring worktrunk into the project.
    worktrunk

    # Get access to copy and paste.
    wl-clipboard
    
    # Extra command line tools for agents.
    go
    curl
    ripgrep
    jq
    fd

    # Python tooling (version-agnostic CLIs; the interpreter comes from languages.python)
    uv
    ruff
    black
    mypy
    python314Packages.pytest
    python314Packages.ipython

    # Fast static site generator
    hugo

    # Standalone Tailwind CSS CLI
    tailwindcss

    # Provide bubblewrap if you plan to use Linux sandboxing features
    bubblewrap
  ];

  languages.python = {
    enable = true;
    package = pkgs.python314;
    venv.enable = true;
  };

  # Environment Variables
  env = {
    TMPDIR = "/tmp";
    WAYLAND_DISPLAY = "wayland-1";
    DISPLAY = ":0";
  };

  # Enable the native delta integration for improved Git diff views.
  delta.enable = true;

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
