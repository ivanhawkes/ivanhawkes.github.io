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

##### Get Git installed and configured.
```bash
sudo apt install git
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
sudo apt install cmake cmake-gui gcc g++ build-essential ninja-build clang fonts-hack-ttf
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

##### Vulkan development
```bash
sudo apt install vulkan-utils
```

##### Media
```bash
sudo apt install handbrake vlc
```
