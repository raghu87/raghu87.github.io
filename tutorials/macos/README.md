# Installing Apache, PHP, and MySQL on Mac OS X

![Mac Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/170px-Apple_logo_black.svg.png)

##### First, open Terminal and switch to root to avoid permission issues while running these commands.


	sudo su -
  
###### Enable Apache on Mac OS X

	apachectl start

###### Verify It works! by accessing http://localhost

## Enable PHP for Apache

##### First, make a backup of the default Apache configuration. This is good practice and serves as a comparison against future versions of Mac OS X.

	cd /etc/apache2/
	cp httpd.conf httpd.conf.bak

###### Now edit the Apache configuration. Feel free to use TextEdit if you are not familiar with vi.

	vi httpd.conf

####### Uncomment the following line (remove #):

###### LoadModule php5_module libexec/apache2/libphp5.so
##### Restart Apache:

	apachectl restart
	
## Creating VirtualHosts

###### You could stop here. PHP, MySQL, and Apache are all running. However, all of your sites would have URLs like http://localhost/somesite/ pointing to /Library/WebServer/Documents/somesite. Not ideal for a local development environment.

###### To run sites individually you need to enable VirtualHosts. To do so, we’ll edit the Apache Configuration again.

	vi /etc/apache2/httpd.conf

###### Uncomment the following line:

	Include /private/etc/apache2/extra/httpd-vhosts.conf

###### Now Apache will load httpd-vhosts.conf. Let’s edit this file.

	vi /etc/apache2/extra/httpd-vhosts.conf

###### Here is an example of VirtualHosts I’ve created.

	<VirtualHost *:80>
   		DocumentRoot "/Library/WebServer/Documents"
	</VirtualHost>

	<VirtualHost *:80>
        DocumentRoot "/Users/Jason/Documents/workspace/dev"
        ServerName jason.local
        ErrorLog "/private/var/log/apache2/jason.local-error_log"
        CustomLog "/private/var/log/apache2/jason.local-access_log" common

        <Directory "/Users/Jason/Documents/workspace/dev">
                AllowOverride All
                Order allow,deny
                Allow from all
        </Directory>
	</VirtualHost>
	
###### The first VirtualHost points to /Library/WebServer/Documents. The first VirtualHost is important as it behaves like the default Apache configuration and used when no others match.

###### The second VirtualHost points to my dev workspace and I can access it directly from http://jason.local. For ease of development, I also configured some custom logs.

###### Note: I use the extension local. This avoids conflicts with any real extensions and serves as a reminder I’m in my local environment.

##### Restart Apache:

	apachectl restart
	
###### In order to access, you need to edit your hosts file.
	http://jason.local

	vi /etc/hosts

###### Add the following line to the bottom:

	127.0.0.1       jason.local

###### I run the following to clear the local DNS cache:

	dscacheutil -flushcache

###### Now you can access http://jason.local.

###### Note: You will need to create a new VirtualHost and edit your hosts file each time you make a new local site.