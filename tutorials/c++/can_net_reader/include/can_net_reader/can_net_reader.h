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
#include "can_net_reader/CanBusFrame.h"

using namespace std;
using namespace libconfig;

class CanNetReader {
  public:

    typedef struct {
      //char *obdname;
      /** A human-readable description of the command. */
      char *name;
      /** The raw request payload, which for all commands is simply a (mode, PID) tuple. */
      const unsigned char payload[2];
      /** The type of data contained in the response for this command. */
      //OBDIIResponseType responseType; 
      /** The expected length of a payload containing the raw response to this command. Equal to `VARIABLE_RESPONSE_LENGTH`
       * for commands whose response payloads have variable length. */
      //short expectedResponseLength;
      /** A pointer to a function that can decode a raw response payload for this command. */
      //OBDIIResponseDecoder responseDecoder;
    } OBDIICommand;



    

    time_t t;
    char timestr[26];
    struct tm* tm_info;

    Config cfg;
    std::ofstream debugMsg;

    int soc;

    CanNetReader(int argc, char ** argv);
    ~CanNetReader();
    int Init(int argc, char ** argv);
    string convBase(unsigned long v, long base);    
    int convHex2Int(string v);
    double OBDIIDecodeEngineRPMs(int a,int b);
    double OBDIIDecodeUInt8(int a);
    
  protected:

  private:

};

#endif // CAN_NET_READER_H