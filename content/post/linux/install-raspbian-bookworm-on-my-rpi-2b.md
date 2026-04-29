---
author: Ivan Hawkes
categories:
- Administration
date: '2026-02-23'
tags:
- Linux
- Debian
- Raspbian
title: Installing Raspberry Pi OS (Bookworm) on my Raspberry Pi 2b
---

A brief set of instructions on installing Raspberry Pi OS (Bookworm) on my
Raspberry Pi 2b. It includes setting up Samba and Docker + Portainer.

I was going to use the latest version (Trixie), but unfortunately there are no
Docker sources for it right now.

<!--more-->

## Install media

You can find the [imager program](https://www.raspberrypi.com/software/) on the
Raspberry Pi website. Use that to download the right image for your Raspberry Pi
model and distribution.

Install the manager and use it to flash an SD card. There's no longer a need to
flash a USB stick and have that boot and install onto the SD card. It's done
directly now.

Make sure you customise the installation media. Set your user name and password,
public key, and the name of the machine. This will save you effort later as well
as making it far easier to find the machine and perform the inital SSH logon.

## First boot

Log into the machine from your workstation.

The default is to boot into the GUI without asking for a password. Change that
with the config app.

```bash
ssh <MACHINE_NAME>
raspi-config
```

Now switch to command line access only.

```bash
sudo telinit 3

## If you need to switch back to the GUI use:
sudo telinit 5
```

Make multi-user the default mode on booting.

```bash
sudo systemctl set-default multi-user.target

## If you want to switch it back to GUI mode use this command.
sudo systemctl set-default graphical.target
```

Time to purge the unclean from the drive. This will lower it's footprint,
shorten apt upgrade times, and lower the number of packages that can fail to
update.

```bash
sudo apt purge xserver*lightdm* raspberrypi-ui-mods gnome*
sudo apt autoremove
sudo apt clean
```

## Make it home

After the basic installation has been completed I like to settle in as a new
home owner and put some of the comforts of home onto my new machine.

Start by following the [instructions](../install-ubuntu-24.04) provided for a
Ubuntu machine. At a minimum you will want to copy over your SSH keys, run an
apt update, and install your dot files.

## Swapfile

Because the Raspberry Pi 2b only has 2GB of RAM it is highly likely it will need
to use a swap file. I just followed some lazy AI instructions and allocated 8GB
of swap on the root because I'm too lazy to look up any better methods. Be best!

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
