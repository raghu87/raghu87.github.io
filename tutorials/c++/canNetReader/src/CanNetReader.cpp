#include "CanNetReader.h"

CanNetReader::CanNetReader () {
  static FILE *LogFile = NULL;
  //static const char *LogPath = "/var/log/obdiid/obdiid.log";
  static const char *LogPath = "/tmp/can_net_reader.log";
}

CanNetReader::~CanNetReader () {
  
}

int main(int argc, char const *argv[]) {
  cout << "inside cannetreader" << endl;
  CanNetReader* _canNetReader = new CanNetReader(); 
  return 0;
}

