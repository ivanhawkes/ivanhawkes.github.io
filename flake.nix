{
  description = "Node.js development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        nodejs_24 # Or nodejs_24, depending on your preferred version
      ];

      shellHook = ''
        echo "Node.js $(node --version)"
        echo "npm $(npm --version)"
      '';
    };
  };
}

