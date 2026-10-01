{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  # https://devenv.sh
  env.GREET = "devenv";

  # Enable the native delta integration
  delta.enable = true;

  # https://devenv.sh/packages/
  packages = [
    # Git LFS for repository management.
    pkgs.git
    pkgs.git-lfs
    pkgs.github-cli

    # Fast static site generator
    pkgs.hugo

    # Standalone Tailwind CSS CLI
    pkgs.tailwindcss

    # Languages for Pi and the local AI model to use.
    pkgs.go

    # Allow downloads from the web.
    pkgs.curl

    # Provide bubblewrap if you plan to use Linux sandboxing features
    pkgs.bubblewrap
  ];

  languages.python = {
    enable = true;
    # Explicitly specify the base package to guide module resolution
    package = pkgs.python3;
    venv = {
      enable = true;
      requirements = ./requirements.txt;
    };
    # Recommended: Use uv to speed up installs and handle binaries cleanly on NixOS
    uv.enable = true;
  };

  # Enable Node.js
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;

    # Enables pnpm package manager
    pnpm.enable = true;

    # Tell Corepack to handle pnpm wrappers safely
    corepack.enable = true;
  };

  # Create a clean, isolated local script to run the harness
  scripts.pi.exec = ''
    # Isolate pnpm's global state and home directories to the project folder
    export PNPM_HOME="$DEVENV_STATE/pi/pnpm"
    export HOME="$DEVENV_STATE/pi/home"

    # Ensure the local pnpm bin directory is added to the shell PATH
    export PATH="$PNPM_HOME:$PATH"

    # Silence the false-positive self-update banner
    export PI_SKIP_VERSION_CHECK=1

    # Use 'pnpm dlx' to fetch and run the package dynamically using pnpm's layout
    exec pnpm dlx @earendil-works/pi-coding-agent@latest "$@"
  '';

  # Update script for pi.
  scripts.pi-update.exec = ''
    export PNPM_HOME="$DEVENV_STATE/pi/pnpm"
    export HOME="$DEVENV_STATE/pi/home"
    export PATH="$PNPM_HOME:$PATH"

    # 1. Enforce directory generation before pnpm initializes
    mkdir -p "$DEVENV_STATE/pi/pnpm" "$DEVENV_STATE/pi/home"

    echo "Fetching the latest Pi harness and updating extensions..."
    exec pnpm dlx @earendil-works/pi-coding-agent@latest update --extensions "$@"
  '';

  # https://devenv.sh
  scripts.hello.exec = ''
    echo hello from $GREET
  '';

  # https://devenv.sh
  enterShell = ''
    hello         # Run scripts directly

    # Make sure we have Git LFS installed.
    if [ -d .git ]; then
      echo "Checking Git LFS initialization..."
      git lfs install --local --force
    else
      echo "Not a Git repository. Skipping Git LFS setup."
    fi

    echo ""
    echo "Web Dev Environment:"
    echo "  Git: $(git --version)"
    echo "  Go: $(go version)"
    echo "  HUGO: $(hugo version)"
    echo "  Node.js: $(node --version)"
    echo "  pnpm: $(pnpm --version)"
    echo "  Tailwind: $(tailwindcss --help | head -n 1)"
  '';

  # https://devenv.sh
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
