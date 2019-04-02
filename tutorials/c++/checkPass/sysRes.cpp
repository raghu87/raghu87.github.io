//#include <unistd.h>
//#include <sys/reboot.h>

//int main() {
//  sync();
//  setuid(0);
//  //reboot(RB_AUTOBOOT);
//  reboot(RB_POWER_OFF);
//  return 0;
//}


#include <pwd.h> /* 'struct passwd', getpwnam(). */
#include <sys/types.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h> /* strcmp() */
#include <iostream>
#include<stdlib.h>

char user[21];
char * password;
char * crypt(const char *password, const char *salt);
char salt[2];
struct passwd* user_info;
using namespace std;

int attempts = 0;
int main() {
  //system("dbus-send --system --print-reply --dest=org.freedesktop.login1 /org/freedesktop/login1 \"org.freedesktop.login1.Manager.PowerOff\" boolean:true");
  //system("dbus-send --system --print-reply --dest=org.freedesktop.login1 /org/freedesktop/login1 \"org.freedesktop.login1.Manager.Reboot\" boolean:true");

//printf("User name: "); fflush(stdin);
//fgets(user, 20, stdin);
//
//if (strchr(user, '\n'))
//(*(strchr(user, '\n'))) = '\0';
//
//user_info = getpwnam(user);
//if (!user_info) {
//printf("User does not exist.\n");
//exit(1);
//}
//
//password = getpass("Password: ");
//cout << password << endl;
//strncpy(salt, user_info->pw_passwd, 2);
//
////if (strcmp(user_info->pw_passwd, crypt(password,salt)) != 0) {
////printf("Login incorrect.\n");
////exit(1);
////}
//
//printf("Login successful.\n"); 
  string pwd = "vidteq";
  string msg = "echo "+pwd+" | sudo -kS whoami";  
  int r = system(msg.c_str());
  cout << "hsdfhj " << r << endl;
  if(r != 0) {
    cout << "Enter Password is wrong" << endl;
  } else {
    cout << "Password successful" << endl;
  }

  return 0;
}
