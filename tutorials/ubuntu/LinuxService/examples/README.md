# STEPS IN CREATING SERVICE

###### https://linuxconfig.org/how-to-automatically-execute-shell-script-at-startup-boot-on-systemd-linux

#### The following config will discuss a basic example on how to execute shell script during a boot time on systemd Linux. There maybe various reason why you might want to execute shell script during Linux startup like for example to start a particular custom service, check disk space, create a backup etc. 

#### The following example below will serve as a basic template to be later modified to suit your specific needs. In the example below we will check a disk space of a /home/ directory during a boot time and write a report to /root/ directory.

## Systemd service unit

#### First, we need to create a systemd startup script eg.disk-space-check.service and place it into /etc/systemd/system/ directory. You can find the example of such systemd startup script below:
	[Unit]
	After=mysql.service

	[Service]
	ExecStart=/usr/local/bin/disk-space-check.sh

	[Install]
	WantedBy=default.target

#### After: Instructs systemd on when the script should be run. In our case the script will run after mysql database has started. Other example could be network.target etc.
#### ExecStart: This field provides a full path the actual script to be execute
#### WantedBy: Into what boot target the systemd unit should be installed
#### The above is an absolute minimum that our systemd service unit should contain in order to execute our script at the boot time. For more information and options to be used see systemd.service manual page:

	$ man systemd.service

## Startup shell script

#### Next, we create our custom shell script to be executed during systemd startup. The location and script name is already defined by service unit as /usr/local/bin/disk-space-check.sh. The content of the script can be simple as:

	#!/bin/bash
	
	date > /root/disk_space_report.txt
	du -sh /home/ >> /root/disk_space_report.txt

## Configure and Install

#### Before we reboot our system we need to make our script executable:
	
	chmod 744 /usr/local/bin/disk-space-check.sh

#### Next, install systemd service unit and enable it so it will be executed at the boot time:

	chmod 664 /etc/systemd/system/disk-space-check.service

	systemctl daemon-reload
	systemctl enable disk-space-check.service

#### Created symlink from /etc/systemd/system/default.target.wants/disk-space-check.service to /etc/systemd/system/disk-space-check.service.
####If you wish to test your script before you reboot run:
	
	systemctl start disk-space-check.service

	cat /root/disk_space_report.txt 

###### Thursday 7 July  11:30:25 AEST 2016
###### 1.5G    /home/

###### All ready. After rebooting your Linux system the above systemd unit will invoke shell script to be executed during the boot time.

