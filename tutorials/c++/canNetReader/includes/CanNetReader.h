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

#include <linux/can.h>
#include <linux/can/raw.h>

using namespace std;

class CanNetReader {
  public:
    CanNetReader();
    ~CanNetReader();

  protected:

  private:

};

#endif // CAN_NET_READER_H