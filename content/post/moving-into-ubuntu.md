---
type: post
title: Moving into a Fresh Ubuntu Install
date: 2021-11-19
tags: ["Linux","Ubuntu"]
category: Administration
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

Instructions for a quick start getting all my usual software and setup on a fresh Ubuntu Linux install.
<!--more-->

##### Make any changes needed to the terminal startup files.
```bash
nano ~/.bashrc
nano ~/.profile
```

##### Make a folder for our most useful binaries.
```bash
mkdir ~/bin
```

##### Copy our SSH keys from a trusted place.
```bash
scp ivan@odroid-hc2:~/.ssh/* .ssh
```

##### Get everything up to date.
```bash
sudo apt update && sudo apt upgrade
```

##### TLDR: Get all the packages...
```bash
# Skip a few steps in this process, just pull all the packages.
sudo apt update && sudo apt upgrade

# We don't want the old Jack daemon.
sudo apt -y autoremove --purge jackd jackd2 qjackctl

# Bulk install
sudo apt install git git-lfs imwheel cmake cmake-gui cmake-curses-gui gcc g++ build-essential ninja-build clang fonts-hack-ttf gcc-arm-none-eabi libnewlib-arm-none-eabi libstdc++-arm-none-eabi-newlib gdb-multiarch minicom transmission-remote-gtk handbrake vlc midisport-firmware qjackctl libjack-dev python3 python3-pip npm nodejs default-jre vulkan-tools spirv-cross renderdoc samba jackd2
```

##### Get Git installed and configured.
```bash
sudo apt install git git-lfs
git config --global user.email "ivan.hawkes@gmail.com"
git config --global user.name "Ivan Hawkes"
```

##### Now we can get some of our home comforts from a Git repo.
```bash
git clone git@github.com:ivanhawkes/linux-comforts.git
```

##### ImWheel lets us adjust the mouse scroll wheel speed.
```bash
sudo apt install imwheel
nano ~/.imwheelrc
imwheel --kill
```

##### Key development tools.
```bash
sudo apt install cmake cmake-gui cmake-curses-gui gcc g++ build-essential ninja-build clang fonts-hack-ttf
```

##### Arm development.
```bash
sudo apt install gcc-arm-none-eabi libnewlib-arm-none-eabi libstdc++-arm-none-eabi-newlib gdb-multiarch
```

##### IDE and editor.
```bash
sudo snap install code --classic
sudo snap install sublime-text --classic
```

##### Serial communications.
```bash
sudo apt install minicom
sudo usermod -a -G dialout $USER
```

##### Downloading.
```bash
sudo apt install transmission-remote-gtk
```

##### Networking for Windows
```bash
sudo apt install samba

# Update the firewall rules to allow Samba traffic.
sudo ufw allow samba

# Give ourselves a password.
sudo smbpasswd -a $USER

# Connect to your severs.
# SMB://<server_name>

```

##### Vulkan development
```bash
# Not currently working - need to fix later.
sudo add-apt-repository ppa:graphics-drivers/ppa && sudo apt upgrade
sudo apt install vulkan-tools spirv-cross renderdoc
sudo apt install nvidia-driver-535 nvidia-settings vulkan vulkan-utils
```

##### Media
```bash
sudo apt install handbrake vlc
```

##### Outboard equipment
```bash
sudo apt install midisport-firmware
```

##### Jack audio and it's development libraries.
```bash
sudo apt install qjackctl libjack-dev jackd2   # a2jmidid needed if using jackd instead.
sudo usermod -a -G audio ivan
```

##### Python 3.
```bash
sudo apt install python3 python3-pip npm nodejs
```

##### Java Runtime.
```bash
sudo apt install default-jre
```

##### QTile.
```bash
pip install qtile
```

##### Alacritty.
```bash
sudo add-apt-repository ppa:aslatter/ppa -y
sudo apt install alacritty
mkdir $HOME/.config/alacritty
cd $HOME/.config/alacritty
wget https://github.com/alacritty/alacritty/releases/download/v0.12.2/alacritty.yml
sudo npm i -g alacritty-themes
alacritty-themes
```

##### Thunar.
```bash
sudo apt install thunar
```

##### Pipewire.
```bash
sudo apt remove xxx
sudo apt install pipewire wireplumber pipewire-audio-client-libraries pipewire-pulse libpipewire-0.3-dev libldacbt-{abr,enc}2 libspa-0.2-bluetooth libspa-0.2-jack
```

##### Discord.

You will need to use a Snap to install Discord.

```bash
sudo snap install discord
```

##### Allow Grub Menu to List Other OS's.

Ubuntu 22.04 disables the other OS probing mechanism for security reasons. We really want it back again.

```bash
# Edit grub config file.
sudo nano /etc/default/grub

-- Edit this line to switch the video mode to something more sensible...
GRUB_GFXMODE=800x600x32,auto

-- Add these lines...

# Need this to have it auto-detect other OS.
GRUB_DISABLE_OS_PROBER=false

# Switching the colours to something nicer.     
GRUB_COLOR_NORMAL="light-white/blue"
GRUB_COLOR_HIGHLIGHT="yellow/blue"

-- Save the file and run...

sudo update-grub

-- NOTE: The colour changes don''t currently work in Ubuntu. Instead, edit one of the config make files directly for now.

sudo nano /etc/grub.d/05_debian_theme

                       # Set a monochromatic theme for Tanglu/Ubuntu.
                        echo "${1}set menu_color_normal=light-gray/blue"
                        echo "${1}set menu_color_highlight=yellow/blue"

-- Save the file and run...

sudo update-grub
```

#### Raspberry Pi Pico Development

##### Install OpenOCD

Make sure it's not already installed. Remove it if necesssary.

```bash
sudo apt -y autoremove --purge openocd

# Clone the Pico libraries.
~/nixos-config/users/ivan/.local/bin/clone-pico-libraries.sh
```

Install from source. Ubunutu 22.04 didn't install all the targets correctly and left it in a non-running state.

```bash
sudo apt install automake autoconf build-essential texinfo libtool libftdi-dev libusb-1.0-0-dev
cd ~/projects
git clone --recursive git@github.com:raspberrypi/openocd.git
cd openocd
./bootstrap 
./configure --enable-cmsis-dap-v2 --enable-cmsis-dap
make -j 24
sudo make install
```

NOTE: The ./configure should take those flags but it seemed to produce different output and wouldn't run make afterwards. YMMV.

Final step is to ensure there is a UDEV rule for the PicoProbe. OpenOCD can't open the probe if you don't provide the rule.

```bash
sudo cp ~/projects/openocd/contrib/60-openocd.rules /etc/udev/rules.d/
```
