---
type: post
title: Installing Nginx using Docker and Portainer
date: 2021-11-24
tags: ["Linux","Ubuntu", "NGinx"]
category: Administration
image: /img/site/category/programming.jpg
image-thumbnail: /img/site/category/programming.jpg
author: "Ivan Hawkes"
---

Quick instructions on getting Nginx up and running again for my site using Docker and Portainer.
<!--more-->

It goes without saying you will need both Docker and Portainer installed on your server.

I installed Nginx using the default app templates. At one point I tried using a set being developed by Novaspirit Tech, but they didn't include 'apt' and so I couldn't install Certbot. I reverted to the old app templates after removing the install, and then proceded as usual.

First step - make a new container and call it 'nginx'.

I decided, after having a false start, to install both Plex and Nginx on the host network. This isn't the best solution, but I didn't want to spend all night finding out why Plex wasn't working correctly with Nginx proxying it on a different network segment.

Installing the baseline files worked seamlessly thanks to Docker and Portainer.

Once the container is running, jump into a BASH shell and install Certbot and configure the websites. In this case, I only need to:

* remove the default website
* create a proxy for the Plex site
* create a virtual site for my personal website

##### 
```bash
# Update any out of date software.
apt update && apt upgrade

# Ensure we have Certbot.
apt install certbot python3-certbot-nginx

# Backup the shipped config, replace it with my own, and then remove the default site.
cd /etc/nginx/
cp nginx.conf nginx.conf.orig
nano nginx.conf
rm conf.d/default.conf

# Add a proxy for the Plex site.
nano conf.d/plex.conf

# Make a new virtual site for my blog.
mkdir sites-available
mkdir sites-enabled
nano sites-available/hawkes.info
cd sites-enabled/
ln -s ../sites-available/hawkes.info hawkes.info
cat hawkes.info
cd ..

# Create fresh certificates for the site(s).
certbot --nginx

# Reload the web server.
service nginx reload

# We're done, probably.
exit
```
