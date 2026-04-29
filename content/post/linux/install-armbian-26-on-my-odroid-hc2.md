---
author: Ivan Hawkes
categories:
- Administration
date: '2026-02-23'
tags:
- Linux
- Debian
- Armbian
title: Installing Armbian 26 on my ODROID-HC2
---

A brief set of instructions on installing Armbian 26 on an ODROID-HC2 machine.
It includes setting up Samba and Docker + Portainer.

After nearly a decade of faithful service I was thinking about giving my aging
ODROID-HC2.

<!--more-->

## Install media

The operating system I have choosen is [Armbian](https://www.armbian.com/). It
has [images](https://www.armbian.com/odroid-xu4/) available for the ODROID
series of SBC from HardKernel. It is recommended you install the image using
their own [installation manager](https://github.com/armbian/imager/releases).
I'm using an x64 bit Ubuntu 24.04 operating system so I selected the
[closest match](https://github.com/armbian/imager/releases/download/v1.2.8/Armbian.Imager_1.2.8_amd64.deb)
for my setup. Your millage may vary. Look for an installation package suitable
for you.

```bash
curl -L https://github.com/armbian/imager/releases/download/v1.2.8/Armbian.Imager_1.2.8_amd64.deb -o ~/Armbian.Imager_1.2.8_amd64.deb
sudo dpkg -i ~/Armbian.Imager_1.2.8_amd64.deb
```

Install the manager and use it to flash an SD card. There's no longer a need to
flash a USB stick and have that boot and install onto the SD card. It's done
directly now.

```bash
sudo dpkg -i ~/Armbian.Imager_1.2.8_amd64.deb
```

## First boot

The first boot can be a little tricky since you are doing this headless. I log
into my router / pi-hole and watch for the new machine to appear on the list of
connected devices. I copy the MAC address for it into my DHCP server list of
reserved addresses and assign it an IP. Next boot I can just SSH straight into
it at it's new IP address.

First though, see need to use a root shell to get some configuration changes
done.

Log into the machine as root from your workstation.

```bash
ssh root@10.0.0.x
armbian-config
```

Armbian suggest we make a customisation for the specific device which will tune
it accordingly. It's meant to improve boot speed and lower power consumption.

_*>> system >> kernel >> select odroid configuration*_

Select ODROID HC1/HC2.

_*>> software >> containers*_

Install docker and portainer for container management.

_*>> software >> DevTools*_

Install git and git-lfs. This will save you a little effort later on.

## Make it home

After the basic installation has been completed I like to settle in as a new
home owner and put some of the comforts of home onto my new machine.

Start by following the [instructions](../install-ubuntu-24.04) provided for a
Ubuntu machine. At a minimum you will want to copy over your SSH keys, run an
apt update, and install your dot files.

## Swapfile

Because the ODROID-HC2 only has 2GB of RAM it is highly likely it will need to
use a swap file. I just followed some lazy AI instructions and allocated 8GB of
swap on the root because I'm too lazy to look up any better methods. Be best!

```bash
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo systemctl daemon-reload
```

You can check if it worked.

```bash
## You should see a swapfile entry added at the end of this file.
cat /etc/fstab

## See if Linux is using the swap file.
free -m
```
