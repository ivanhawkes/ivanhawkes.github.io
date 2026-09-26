{
  description = "HUGO and Node.js for creating a static website.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        nodejs_24
        pkgs.pnpm
        pkgs.tailwindcss
	      hugo
      ];

      shellHook = ''
        echo "Setting up a Node.js environment"
        echo "Versions:"
        echo "  Node.js: $(node --version)"
        echo "  npm: $(npm --version)"
        echo "  HUGO: $(hugo version)"

        # Add local node_modules binaries directly to your shell's PATH
        export PATH="$PWD/node_modules/.bin:$PATH"
      '';
    };
  };
}

