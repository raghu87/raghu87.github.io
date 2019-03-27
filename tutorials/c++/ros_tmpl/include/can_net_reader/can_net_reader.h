#ifndef CAN_NET_READER_H
#define CAN_NET_READER_H

#include <stdio.h>
#include <iostream>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <net/if.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <vector>
#include <pwd.h>
#include <asm/types.h>
#include <fstream>
#include <sstream>
#include <stdarg.h>
#include <time.h>
#include <errno.h>
#include <sys/un.h>
#include <sys/socket.h>

#include <linux/can.h>
#include <linux/can/raw.h>

#include <libconfig.h++>

#include <ros/ros.h>
#include <std_msgs/Int32.h>

#include "can_net_reader/CanFrame.h"

using namespace std;
using namespace libconfig;

class CanNetReader {
  public:
    time_t t;
    char timestr[26];
    struct tm* tm_info;
    

    Config cfg;
    std::ofstream debugMsg;
    FILE *LogFile = NULL;
    //static const char *LogPath = "/var/log/obdiid/obdiid.log";
    const char *LogPath;// = "/tmp/can_net_reader.log";

    CanNetReader(int argc, char ** argv);
    ~CanNetReader();
    void Init(int argc, char ** argv);
    void Log(const char *format, ...);
    void Log1(const char *format, ...);
    
  protected:

  private:

};

#endif // CAN_NET_READER_H