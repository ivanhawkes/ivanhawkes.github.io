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

    # Install the Nixos unstable version of Pi Harness.
    pkgs.pi-coding-agent

    # Get access to copy and paste.
    pkgs.wl-clipboard

    # Playwright will allow us to iterate on the web design.
    #pkgs.playwrightMcp
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

  enterShell = ''
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
