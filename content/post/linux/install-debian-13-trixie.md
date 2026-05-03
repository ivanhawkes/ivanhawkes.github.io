---
author: Ivan Hawkes
categories:
- Administration
date: '2026-02-23'
tags:
- Linux
- Debian
title: Install Debian 13 (Trixie)
---

Instructions for a quick start getting all my usual software and setup on a
fresh Linux install.

<!--more-->

_WARNING:_ You MUST know your main email login account and password! You must
have your phone available and be able to accept verification requests from
Google.

Both Debian and Ubuntu installations have the Firefox browser already installed,
which makes accessing our most used websites a lot easier.

## The Firefox / BitWarden Dance

I use Firefox for web browsing on all my devices, in part because it can sync my
bookmarks. I don't actually use that feature anymore, but it can also sync my
addons, and it has BitWarden installed. That saves me a tiny bit of effort
re-installing it every time.

It's a bit of a dance getting it all authorised the first time.

- Open Firefox.

- Visit https://bitwarden.com/

- I hope you remember your password! Sign in. Now go to the settings and adjust
  the PIN and how aggressively it will lock you out.

- Be amazed at how I then need to log into Google mail to provide a verification
  code to login to bitwarden.

- Visit https://gmail.com

- Google also doesn't trust you, so it's going to make you use your phone or
  tablet to complete the authorisation.

- Now you can access all your passwords, including the one for Firefox. Use that
  to sync your Firefox account and addons.

- But not before you enter another bloody confirmation code!

- Log into the browser extension for BitWarden. It can fill in the passwords
  from here onwards.

- Guess what! Here comes another verification email.

- Breathe a sigh of relief, knowing you're done until you need to access your
  Microsoft mail account.

## Copy our SSH keys from a trusted place

We need to move a few useful pieces into our home to make the remaining tasks
easier. I use SSH to access my servers frequently, so having my private key
available saves a lot of typing passwords.

```bash { copy = true, file = "/select/muffins.bash", other="anything goes" }
scp -r ivan@YOUR_SERVER:/home/ivan/.ssh/* ~/.ssh
```

## Add Myself to the Sudoers List

Debian does not give you access to sudo by default. This differs from other
distributions, like Ubuntu 24.04. We will need to become root for a short period
to add me to the list of upstanding citizens worthy of trust.

```bash
su --login
apt install -y sudo
usermod -aG sudo ivan
```

You will need to log out and in again to make this change stick. I actually had
to do a full reboot.

## Avoid using my password for common tasks

By adding myself to a list of sudoers that are excempt from providing a password
I can make this whole process a little bit easier.

```bash
sudo visudo
```

Add these entries underneath the existing ones.

```bash {file = none.sh, }
## Allow non-priveleged users to run common commands without being pestered.
ivan ALL=(ALL) NOPASSWD: /usr/bin/systemctl /usr/sbin/service
ivan ALL=(ALL) NOPASSWD: /usr/bin/apt, /usr/bin/snap
ivan ALL=(ALL) NOPASSWD: /usr/bin/mount /usr/bin/umount
ivan ALL=(ALL) NOPASSWD: /usr/bin/chown /usr/bin/chmod
```

## Get everything up to date

```bash
sudo apt update && sudo apt upgrade
```

## Get Git installed and configured

```bash
sudo apt install -y git git-lfs
git config --global user.email "ivan.hawkes@gmail.com"
git config --global user.name "Ivan Hawkes"
git config --global init.defaultBranch main
```

## Install ZSH and make it our shell

I'm switching to ZSH and Alacritty.

```bash
sudo apt install -y zsh curl alacritty fonts-hack-ttf
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

## Move in our dot files

The complete instructions are in the original
[post](https://github.com/ivanhawkes/dotfiles) on this subject.

```bash
cd ~
sudo apt install -y stow
git clone git@github.com:ivanhawkes/dotfiles.git ~/.dotfiles

## Remove any files that typically prevent the stow command from working.
rm ~/.bashrc ~/.profile ~/.zshrc

cd ~/.dotfiles
stow .
cd ~

# Import all the ZSH environment variables into our working environment.
source .zshrc

# If you want to start using it right away. You will not to log in and out again if you don't.
zsh
```

Now is a good time to CTRL-D out of the shell and log back in again. This will
apply group permissions and your .bashrc script to the new shell. You now have
colour in your shell and access to aliases for "ls -al" and friends.

# Install some improved terminal fonts

```bash
sudo apt install fonts-jetbrains-mono fonts-hack fonts-terminus fonts-dejavu-mono fonts-cascadia-code fonts-roboto

# There's a ton of fonts we don't need for the terminal. Remove them now.
sudo rm /usr/share/consolefonts/*Arabic*
sudo rm /usr/share/consolefonts/*Armenian*
sudo rm /usr/share/consolefonts/*Cyr*
sudo rm /usr/share/consolefonts/*Ethiopian*
sudo rm /usr/share/consolefonts/*Georgian*
sudo rm /usr/share/consolefonts/*Greek*
sudo rm /usr/share/consolefonts/*Hebrew*
sudo rm /usr/share/consolefonts/*Lao*
sudo rm /usr/share/consolefonts/*Thai*
sudo rm /usr/share/consolefonts/*Vietnamese*

# We'll use the unicode set, so the latin fonts can go.
sudo rm /usr/share/consolefonts/*Lat2*
sudo rm /usr/share/consolefonts/*Lat7*
sudo rm /usr/share/consolefonts/*Lat15*
sudo rm /usr/share/consolefonts/*Lat38*

# Set a font using a command.
setfont /usr/share/consolefonts/Uni2-Terminus32x16.psf.gz

# Alternatively, choose with the UI.
sudo dpkg-reconfigure console-setup

# Bonus round - grub menu.

# Convert a font for use at the Grub menu.
grub-mkfont -o /boot/grub/fonts/jetbrains-mono.pf2 -s 32 ./JetBrainsMono-Regular.ttf
sudo nano /etc/default/grub

# Add this line.
GRUB_FONT=/boot/grub/fonts/jetbrains-mono.pf2

# Apply the updates.
sudo update-grub
```

## Groups and users

In a home lab setup it's best to stick with basic authentication and user
account synchronisation. In it's simplest form you use the same GID and UID for
each user, copying those to every machine on the network. This can be as simple
as cutting and pasteing a list of entries in the _/etc/group_ and _/etc/passwd_
files.

I like to control the GID and UID for service accounts as well as general users.
This makes it very easy to copy the users and groups between machines and for
networking with SAMBA and NFS.

First we need to create the groups. Add new group with a fixed GID for each user
and service account.

Use the lines below to quickly create your user groups. Just replace the 'xxxx'
with the group name.

```bash
sudo groupadd -g 1001 xxxx
sudo groupadd -g 1002 xxxx
sudo groupadd -g 1003 xxxx
sudo groupadd -g 1004 xxxx
sudo groupadd -g 1005 xxxx
sudo groupadd -g 1006 xxxx
sudo groupadd -g 1007 xxxx
sudo groupadd -g 1008 xxxx
sudo groupadd -g 1009 xxxx
```

I keep the group service accounts in a specific range so it's easy to know their
purpose. I add myself as a group memeber to make managing the files possible
without needing to use _sudo_.

Use the lines below to quickly create your service account groups. Just replace
the 'xxxx' with the group name.

```bash
sudo groupadd -g 2000 xxxx -U ivan
sudo groupadd -g 2001 xxxx -U ivan
sudo groupadd -g 2002 xxxx -U ivan
sudo groupadd -g 2003 xxxx -U ivan
sudo groupadd -g 2004 xxxx -U ivan
sudo groupadd -g 2005 xxxx -U ivan
sudo groupadd -g 2006 xxxx -U ivan
sudo groupadd -g 2007 xxxx -U ivan
sudo groupadd -g 2008 xxxx -U ivan
sudo groupadd -g 2009 xxxx -U ivan
```

Use the lines below to quickly create your service account groups. Just replace
the 'xxxx' with the group name which should also match the user name.

```bash
sudo useradd -u 1001 -m -g xxxx xxxx
sudo useradd -u 1002 -m -g xxxx xxxx
sudo useradd -u 1003 -m -g xxxx xxxx
sudo useradd -u 1004 -m -g xxxx xxxx
sudo useradd -u 1005 -m -g xxxx xxxx
sudo useradd -u 1006 -m -g xxxx xxxx
sudo useradd -u 1007 -m -g xxxx xxxx
sudo useradd -u 1008 -m -g xxxx xxxx
sudo useradd -u 1009 -m -g xxxx xxxx
```

Service accounts need to be locked down to reduce damage if hackers break into
them.

```bash
sudo useradd -u 2000 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2001 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2002 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2003 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2004 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2005 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2006 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2007 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2008 -M -N -g xxxx -s /sbin/nologin xxxx
sudo useradd -u 2009 -M -N -g xxxx -s /sbin/nologin xxxx
```

## SAMBA Networking for Windows

In a mixed environment SAMBA provides a (relatively) easy way to share files
between machines. It's also the software that gives me the most problems as a
service. I frequently run into issues with permissions that have opaque error
messages. Remember to check the logs in /var/log/samba if your having issues.

```bash
sudo apt install -y samba

## Give ourselves a password.
sudo smbpasswd -a $USER
```

By default, the firewall rules are pretty permissive, but just in case you may
wish to check them.

```bash
## Nmap - insecurity scanner.
sudo apt install -y nmap
nmap -p1-9999 <MACHINE>
```

Your distribution may use UFW to control the firewall. Open up the ports for
SAMBA if needed.

```bash
## UFW rules.
sudo ufw allow samba
```

## Edit the SAMBA configuration

Once installed you will need to edit the configuration file and restart the
service.

Typically, I will leave the bulk of the config file untouched and just add my
entries to the bottom of the file. Over the years that one file has been copied
from one server to another until it has become out of date. I suggest you work
with the file supplied and then compare it back with existing ones if needed.

```bash
sudo nano /etc/samba/smb.conf
sudo sysctl smbd restart
```

On a constrained system like the Raspberry Pi 2b or ODROID-HC2 memory usage
becomes critical. SAMBA has a nasty habit of breaking large files transfer
because it uses too much memory. To combat that we are going to tune it's use
down a bit. You may need to play with these settings to get it just right.

```bash
sudo nano /etc/samba/smb.conf
```

Makes some additions to the global section.

```bash
## ILH: Added these to lower the memory usage and prevent issues when
## transferring large files on a low memory system e.g. ODROID-HC2
socket options = TCP_NODELAY IPTOS_LOWDELAY SO_RCVBUF=32768 SO_SNDBUF=32768
max connections = 8
read raw = no
write raw = no
max xmit = 32768
```

Restart the service and test it.

```bash
sudo service smbd restart
sudo apt install slurm
slurm -i <NET-INTERFACE>
```

add some entries e.g.

```bash
[data]
comment = Bulk data storage.
path = /data
guest ok = yes
guest only = no
read only = no
browseable = yes
inherit acls = no
inherit permissions = no
ea support = no
store dos attributes = no
vfs objects =
printable = no
create mask = 0664
force create mode = 0664
directory mask = 0775
force directory mode = 0775
hide special files = yes
follow symlinks = yes
hide dot files = yes
read list =
write list = "xxxx",@"xxxx"
```

## Make your network share available to your workstation

It's likely you will now want to mount one or more drives. The simplest method
is to make an entry into the file system table and have them mounted on boot.
It's important to note however, that they may not always actually start up on
boot due to various reason, so check your work after a reboot.

Find out which drives are available and their block IDs.

```bash
sudo  blkid
```

Add a line like the following to your _fstab_ to mount the drive.

```bash
sudo nano /etc/fstab
```

```bash
//10.0.x.x/data /data cifs vers=3.0,uid=1000,gid=1000,credentials=/home/ivan/.smbcredentials 0 0
```

You will need to supply the .smbcredentials if you use this exact invocation.
Strictly speaking the UID and GID parts of the line are not required if you
supply the .smbcredentials file. I like a belt and braces approach.

```bash
nano ~/.smbcredentials
```

```bash
username=xxxxxxxx
password=xxxxxxxx
```

Make sure there is an underlying file system to share.

```bash
sudo mkdir /data
sudo systemctl daemon-reload
sudo mount /data
```

Visual Studio Code needs some special efforts due to proprietary MS code.

Get the dependencies installed.

```bash
sudo apt install -y gpg apt-transport-https
```

Add the Microsoft key-ring:

```bash
curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null
```

Add the VS Code repository to your system:

```bash
echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list
sudo apt update
sudo apt install -y code
```

Get everything else that I typically use.

```bash
# Apt repositories.
sudo apt install -y nmap
sudo apt install -y cmake cmake-gui cmake-curses-gui gcc g++ build-essential automake autoconf ninja-build clang
sudo apt install -y gcc-arm-none-eabi libnewlib-arm-none-eabi libstdc++-arm-none-eabi-newlib gdb-multiarch
sudo apt install -y python3-full python3-pip
sudo apt install -y handbrake vlc
sudo apt install -y slurm htop btop
```

## Node JS and Node Package Manager

Get the latest versions of Node Package Manager and Node JS. The packages in apt
tend to be stale, so it's worth going to the source for these.

```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
source ~/.zshrc
nvm install node
node -v
npm -v
```

## Go Language (GoLang)

The Debian repository is always a bit behind, so it's better to install using
the method described on the [official website](https://go.dev/doc/install).

```bash
# Get the official tarball
# NOTE: check the website for the current version!
wget https://go.dev/dl/go1.26.1.linux-amd64.tar.gz

# Remove any previous Go installations and install the new tarball.
rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.26.1.linux-amd64.tar.gz
```

Add _*/usr/local/go/bin*_ to the PATH environment variable.

```bash
mkdir -p ~/go/bin
nano ~/.zshrc
```

Add the following line to the script.

```bash
export PATH=$PATH:/usr/local/go/bin:/$HOME/go/bin
```

And now import those changes into your present shell.

```bash
source .zshrc

# Confirm it's installed.
go version
```

## Nvidia drivers.

Follow the [instructions](https://wiki.debian.org/NvidiaGraphicsDrivers)
provided for Debian users.

```bash
# Nvidia drivers.
sudo add-apt-repository ppa:graphics-drivers/ppa && sudo apt upgrade
sudo apt install -y nvidia-driver-535 nvidia-settings
```

Flatpacks should be a decent way to install the non-critical software that can
be a little bit out of date.

```bash
# Install Flatpak
sudo apt install flatpak

# Install a helper app for Gnome.
sudo apt install gnome-software-plugin-flatpak

# Add the main repository to it.
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
```

Visit the [Flatpak Hub](https://flathub.org/en-GB) and search for the apps you
like e.g. Inkscape, Krita, KiCad, Balena Etcher.

## Docker and Portainer

Get the Docker environment up and running and manage it with Portainer.

First, the recommended method of installing Docker for
[Ubuntu](https://docs.docker.com/engine/install/ubuntu/) /
[Debian](https://docs.docker.com/engine/install/debian/) /
[Raspberry Pi OS](https://docs.docker.com/engine/install/raspberry-pi-os/).

Set it up for users to run it
[without root priveleges](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user).

WARNING: Double check the distribution you are installing. Debian, Ubuntu and
Raspbian are often identical for installations but not for this one. They have
different installation sources and commands to run.

```bash
# Grab our local machine Docker containers from github.
git clone git@github.com:ivanhawkes/lythir-containers.git ~/containers
```

## Serial communications

```bash
sudo apt install -y minicom
sudo usermod -a -G dialout $USER
```

## Outboard equipment

This is pretty specifig to me. I have a piece of outboard audio gear that needs
some firmware installed.

```bash
sudo apt install -y midisport-firmware
```

## QTile

Consider using a tile manager for the desktop. There's still issues with a good
setup using Ubuntu 24.04, so this is optional and not even recommended yet.

```bash
pip install qtile
```

## Vulkan development

Go to the [Lunar Xchange](https://vulkan.lunarg.com/home/welcome) site and
follow the instructions from there.

At a minimum you will need to do:

```bash
sudo apt install libglm-dev cmake libxcb-dri3-0 libxcb-present0 libpciaccess0 \
libpng-dev libxcb-keysyms1-dev libxcb-dri3-dev libx11-dev g++ gcc \
libwayland-dev libxrandr-dev libxcb-randr0-dev libxcb-ewmh-dev \
git python-is-python3 bison libx11-xcb-dev liblz4-dev libzstd-dev \
ocaml-core ninja-build pkg-config libxml2-dev wayland-protocols python3-jsonschema \
clang-format qtbase5-dev qt6-base-dev
```

Bonus points for installing _spirv-cross_ and _renderdoc_.

```bash
sudo apt install spirv-cross
```

## Allow Grub Menu to List Other OS's

Ubuntu 22.04 disables the other OS probing mechanism for security reasons.
Debian seems to keep it. YMMV. If you need it back again, then follow the
instructions below.

```bash
## Edit grub config file.
sudo nano /etc/default/grub
```

Edit this line to switch the video mode to something more sensible...

```bash
GRUB_GFXMODE=800x600x32,auto
```

Add these lines...

```bash
## Need this to have it auto-detect other OS.
GRUB_DISABLE_OS_PROBER=false

## Switching the colours to something nicer.
GRUB_COLOR_NORMAL="light-white/blue"
GRUB_COLOR_HIGHLIGHT="yellow/blue"
```

Save the file and run...

```bash
sudo update-grub
```

NOTE: The colour changes don''t currently work in Ubuntu. Instead, edit one of
the config make files directly for now.

```bash
sudo nano /etc/grub.d/05_debian_theme
```

```
## Set a monochromatic theme for Tanglu/Ubuntu.
echo "${1}set menu_color_normal=light-gray/blue"
echo "${1}set menu_color_highlight=yellow/blue"
```

Save the file and run...

```bash
sudo update-grub
```

#### Raspberry Pi Pico Development

## Install OpenOCD

Make sure it's not already installed. Remove it if necesssary.

```bash
sudo apt -y autoremove --purge openocd
#git clone --recursive git@github.com:openocd-org/openocd.git

## Clone the Pico libraries.
~/.local/bin/clone-pico-libraries.sh
```

Install from source. Ubunutu 22.04 didn't install all the targets correctly and
left it in a non-running state.

```bash
sudo apt install -y texinfo libtool libftdi-dev libusb-1.0-0-dev pkg-config libjim-dev libhidapi-dev
cd ~/projects/openocd
./bootstrap
./configure --enable-cmsis-dap-v2 --enable-cmsis-dap
make -j 24
sudo make install
```

The final step is to ensure there is a UDEV rule for the PicoProbe. OpenOCD
can't open the probe if you don't provide the rule.

```bash
sudo cp ~/projects/openocd/contrib/60-openocd.rules /etc/udev/rules.d/
```
