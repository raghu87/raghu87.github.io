# Installation
The git version control system is installed with the following command

	sudo apt install git

Configuration

Every git user should first introduce himself to git, by running these two commands:

	git config --global user.email "you@example.com"
	git config --global user.name "Your Name"

Basic usage

On the local machine, creating a repository can be done with:

	git init

Any client with SSH access to the machine can then clone the repository with:

	git clone username@hostname:/path/to/repository

or you can use

 	git clone <http repository url>

can check status of repository

	git status

to add content or file or folder use command

	git add <folder name|file name>

then commit the changes mode files or newly added file with message

	git commit -m"<any message>" <folder name|file name>

then push data to git cloud repository

	git push origin 

or 

	git push origin master

to update the changes made in browser to system try

	git pull

----------------
Git push requires username and password

	gvim ~/.netrc 
	machine github.com
	login <user>
	password <password>




--------------------
git jekyll

#for docs blogs
https://jekyllrb.com/
https://github.com/jekyll/jekyll/tree/master/docs
http://jekyllthemes.org/
https://github.com/jekyll/jekyll/wiki/themes

http://inloop.github.io/sqlite-viewer/
https://github.com/inloop/sqlite-viewer


