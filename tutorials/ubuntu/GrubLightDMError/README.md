boot ubuntu 16.04 into command line / do not start GUI
---
  ( you can try to clean and then start if needed
    ---  sudo apt-get clean
         sudo apt-get autoclean
         sudo apt-get autoremove
         sudo dpkg-reconfigure -phigh -a
         reboot
         above commands might not work
  )
  sudo telinit 5
  sudo service lightdm start
  if needed try ( sudo systemctl start lightdm )

---------------------------------------------------------
ubuntu black screen after boot logo

    ---   go to sudo -H vi /etc/default/grub
          add GRUB_GFXMODE=1280x1024x24
    ---   sudo update-grub
---------------------------------------------------------
ubuntu boot logo doen't appear and stuck
    ---   go to sudo -H vi /etc/default/grub
          add GRUB_GFXMODE=1280x1024x24
    ---   echo FRAMEBUFFER=y | sudo tee /etc/initramfs-tools/conf.d/splash
    ---   sudo update-initramfs -u
    ---   sudo update-grub
---------------------------------------------------------
 
finally found the way to solve gui problem of above issue
   --- sudo start lightdm
   --- once u enter to gui version
   --- sudo dpkg-reconfigure lightdm
   --- sudo systemctl set-default graphical.target
   
   now we need to update the grub so lightdm start a default service (init=/lib/systemd/systemd)
   to boot under systemd by default edit 
   --- sudo vi /etc/default/grub
   --- GRUB_CMDLINE_LINUX_DEFAULT="quiet splash init=/lib/systemd/systemd"
   save the file
   --- sudo update-grub
   --- sudo reboot

---------------------------------------------------------
