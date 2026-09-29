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
    pkgs.python3

    # Allow downloads from the web.
    pkgs.curl
  ];

  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24; # Installs Node.js
    pnpm.enable = true;       # Enables pnpm package manager
    
    # Tell Corepack to handle pnpm wrappers safely
    corepack.enable = true; 
  };

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
    
    echo "--- Syncing Node Dependencies ---"
    pnpm install  # Ensures tailwindcss and all package.json deps are installed

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
}
