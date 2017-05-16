# HOW TO SET UP PROPER START/STOP SERVICES IN LINUX USING (UPSTART / SYSTEMD)

#### Example Link Might help:-
##### https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/System_Administrators_Guide/sect-Managing_Services_with_systemd-Unit_Files.html
##### https://wiki.archlinux.org/index.php/Systemd
##### https://wiki.ubuntu.com/SystemdForUpstartUsers
##### https://blog.frd.mn/how-to-set-up-proper-startstop-services-ubuntu-debian-mac-windows/
##### http://upstart.ubuntu.com/cookbook/
##### https://www.digitalocean.com/community/tutorials/the-upstart-event-system-what-it-is-and-how-to-use-it

## example to write the service

### go to path 

	cd /lib/systemd/system/
	sudo gvim example.service
	 
### paste this code
	
	[Unit]
        Description=Job that runs the node daemon
        
        [Service]
        Group=tommy
        User=tommy
        Type=forking
        Restart=always
        RestartSec=30
        Environment=HOME=/home/tommy
        ExecStart=/usr/bin/node /home/tommy/Documents/nodetest.js
        
        [Install]
        WantedBy=multi-user.target

## Steps to Start Service:
	sudo systemctl --help
	sudo systemctl status <name of the service> 

ie: if you have service name called "example.service"

	sudo systemctl enable example
	sudo systemctl start example

to stop and kill service

	sudo systemctl disable example
	sudo systemctl stop example
	sudo systemctl kill example

## Option 2 to work on upstart linux service - this is optional

check example below but you can finish job of service with above service systemd method:

	cd /etc/init/
	sudo gvim example.conf
	
	description "node.js server"
        author      "Foo Bar"
        
        # used to be: start on startup
        # until we found some mounts weren't ready yet while booting
        
        start on started mountall
        stop on shutdown
        
        # automatically respawn
        
        respawn
        respawn limit 1 1
        #respawn limit unlimited
        
        script
            
            export HOME="/home/tommy"
            exec sudo -u tommy /usr/bin/node /home/tommy/Documents/nodeservice.js >> /var/log/node.log 2>&1
        
        end script
        
        post-start script
           
           # optionally put a script here that will notifiy you node has (re)started
           # /root/bin/hoptoad.sh "node.js has started!"
           
        end script




