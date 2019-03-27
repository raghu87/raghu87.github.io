#include <can_net_reader/can_net_reader.h>

CanNetReader::CanNetReader (int argc, char ** argv) {
  LogPath = "/tmp/can_net_reader.log";
  LogFile = fopen(LogPath, "a");

  string tempF;
  tempF = "/tmp/canBus_Log.log";
  debugMsg.open (tempF.c_str(), std::ofstream::out | std::ofstream::trunc);

  time(&t);
  tm_info = localtime(&t);
  strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
  debugMsg << timestr << " hello " << endl;


  //Log("Starting CanNetReader");
  Init(argc,argv);  
}

CanNetReader::~CanNetReader () {
  
}

void CanNetReader::Log(const char *format, ...) {
  if (LogFile) {
    time_t t;
    char timestr[26];
    struct tm* tm_info;
    time(&t);
    tm_info = localtime(&t);
    strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
    fprintf(LogFile, "%s ", timestr);
    va_list args;
    va_start(args, format);
    vfprintf(LogFile, format, args);
    va_end(args);
    fprintf(LogFile, "\n");
    fflush(LogFile);
  }
}

void CanNetReader::Log1(const char *format, ...) {
  //if (LogFile) {
    //time_t t;
    //char timestr[26];
    //struct tm* tm_info;
    //time(&t);
    //tm_info = localtime(&t);
    //strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
    //debugMsg << timestr << " ";
    ////fprintf(LogFile, "%s ", timestr);
    //va_list args;
    //va_start(args, format);
    //debugMsg << args;
    ////vfprintf(LogFile, format, args);
    //va_end(args);
    ////fprintf(LogFile, "\n");
    //debugMsg << endl;
    //fflush(LogFile);
  //}
}

void CanNetReader::Init(int argc, char ** argv) {

  const char *homeDir;
  if ((homeDir = getenv("HOME")) == NULL) {
    homeDir = getpwuid(getuid())->pw_dir;
  }
  std::string cfgFileName = (std::string)homeDir + (std::string)"/gazecfg/other.cfg";
  try {
    cfg.readFile(cfgFileName.c_str());
  } catch(const FileIOException &fioex) {
    //debugMsg << "I/O error while reading file zed.cfg." << std::endl;
  } catch(const ParseException &pex) {
    //debugMsg << "Parse error at " << pex.getFile() << ":" << pex.getLine()
    //          << " - " << pex.getError() << std::endl;
  }

  string carType = argv[1];
  Log("arg carType is %s",carType);
  string carTypeT = cfg.lookup("cartype");
  carType = carTypeT;  
  carType = "hello_world";
  int d = 0;
  Log("config carType is %s ",carType);  

  ros::init(argc, argv, "can_net_reader");
  ros::NodeHandle nh;
  ros::Publisher canBus = nh.advertise<can_net_reader::CanFrame>("can_bus/raw", 100);
  can_net_reader::CanFrame canNetFrame;
  while(ros::ok) {
    canNetFrame.header.stamp = ros::Time::now();
    canNetFrame.header.frame_id = "PCAN_USB";
    usleep(1000);    
    canBus.publish(canNetFrame);
    ros::spinOnce();
  }
}

int main(int argc, char ** argv) {  
  CanNetReader* _canNetReader = new CanNetReader(argc,argv);
  return 0;
}

