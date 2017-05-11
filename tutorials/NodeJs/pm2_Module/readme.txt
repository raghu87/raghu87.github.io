

https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04

pm2 service for node
http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/
http://pm2.keymetrics.io/docs/usage/quick-start/

commands:-
1) pm2 monit (to Monitoring CPU/Memory)
2) pm2 delete nodetest (to delete process list from pm2 service)
3) pm2 stop nodetest (to stop the process but it doen't delete the process)
4) pm2 info nodetest (to check info about process)
5) pm2 start nodetest.js --restart-delay 5000 (normally restart delay will restart process after every 5sec )

-----------

The startup subcommand generates and configures a startup script to launch PM2 and its managed processes on server boots:
-- pm2 startup systemd

-----------

The last line of the resulting output will include a command that you must run with superuser privileges:
--Output
[PM2] Init System found: systemd
[PM2] You have to run this command as root. Execute the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u sammy --hp /home/sammy

-----

Run the command that was generated (similar to the highlighted output above, but with your username instead of sammy) to set PM2 up to start on boot (use the command from your own output):

sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u sammy --hp /home/sammy

-----------

You can check the status of the systemd unit with systemctl:

--systemctl status pm2-sammy
