#include <can_net_reader/can_net_reader.h>

CanNetReader::CanNetReader (int argc, char ** argv) {
  string tempF;
  tempF = "/tmp/can_net_reader.log";
  debugMsg.open (tempF.c_str(), std::ofstream::out | std::ofstream::trunc);

  time(&t);
  tm_info = localtime(&t);
  strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
  debugMsg << timestr << " Inside CanNetReader " << endl;
  int ret = Init(argc,argv);
  //if(ret) {
  //  return ret;
  //} 
}

CanNetReader::~CanNetReader () {
  close(soc);
}

int CanNetReader::Init(int argc, char ** argv) {

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

  time(&t);
  tm_info = localtime(&t);
  strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
  debugMsg << timestr << " arg carType is " << carType << endl;

  string carTypeT = cfg.lookup("cartype");
  carType = carTypeT;  

  time(&t);
  tm_info = localtime(&t);
  strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
  debugMsg << timestr << " config carType is " << carType << endl;

  
  //int soc;  
  struct sockaddr_can addr;
  struct can_frame frame;
  struct ifreq ifr;
  
  const char *ifname = "vcan0";

  if((soc = socket(PF_CAN, SOCK_RAW, CAN_RAW)) < 0) {
    time(&t);
    tm_info = localtime(&t);
    strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
    debugMsg << timestr << " " << " Error while opening socket " << endl;
    //perror("Error while opening socket");
    return -1;
  } 
  
  strcpy(ifr.ifr_name, ifname);
  ioctl(soc, SIOCGIFINDEX, &ifr);
 
  addr.can_family  = AF_CAN;
  addr.can_ifindex = ifr.ifr_ifindex;

  time(&t);
  tm_info = localtime(&t);
  strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
  debugMsg << timestr << " " << ifname << " at index " << ifr.ifr_ifindex << endl;


  if(bind(soc, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
    debugMsg << timestr << " " << " Error in socket bind " << endl;
    //perror("Error in socket bind");
    close(soc);
    return -2;
  }

  OBDIICommand OBDIIMode1Commands[] = {
    { "Supported PIDs in the range 01 - 20", { 0x01, 0x00 } },
    { "Monitor status since DTCs cleared", { 0x01, 0x01 } },
    { "Freeze DTC", { 0x01, 0x02 } },
    { "Fuel system status", { 0x01, 0x03 } },
    { "Calculated engine load", { 0x01, 0x04 } },
    { "Engine coolant temperature", { 0x01, 0x05 } },
    { "Short term fuel trim—Bank 1", { 0x01, 0x06} },
    { "Long term fuel trim—Bank 1", { 0x01, 0x07 } },
    { "Short term fuel trim—Bank 2", { 0x01, 0x08} },
    { "Long term fuel trim—Bank 2", { 0x01, 0x09 } },
    { "Fuel pressure (gauge pressure)", { 0x01, 0x0A } },
    { "Intake manifold absolute pressure", { 0x01, 0x0B } },
    { "Engine RPM", { 0x01, 0x0C } },
    { "Vehicle speed", { 0x01, 0x0D } },
    { "Timing advance", { 0x01, 0x0E } },
    { "Intake air temperature", { 0x01, 0x0F } },
    { "MAF air flow rate", { 0x01, 0x10 } },
    { "Throttle position", { 0x01, 0x11 } },
    { "Commanded secondary air status", { 0x01, 0x12 } },
    { "Oxygen sensors present", { 0x01, 0x13 } },
    { "Oxygen sensor 1", { 0x01, 0x14 } },
    { "Oxygen sensor 2", { 0x01, 0x15 } },
    { "Oxygen sensor 3", { 0x01, 0x16 } },
    { "Oxygen sensor 4", { 0x01, 0x17 } },
    { "Oxygen sensor 5", { 0x01, 0x18 } },
    { "Oxygen sensor 6", { 0x01, 0x19 } },
    { "Oxygen sensor 7", { 0x01, 0x1A } },
    { "Oxygen sensor 8", { 0x01, 0x1B } },
    { "OBD standards this vehicle conforms to", { 0x01, 0x1C } },
    { "Oxygen sensors present in 4 banks", { 0x01, 0x1D } },
    { "Auxiliary input status", { 0x01, 0x1E } },
    { "Run time since engine start", { 0x01, 0x1F } },
    { "Supported PIDs in the range 21 - 40", { 0x01, 0x20 } },
    { "Distance traveled with malfunction indicator lamp on", { 0x01, 0x21 } },
    { "Fuel rail pressure (relative to mainfold vacuum", { 0x01, 0x22 } },
    { "Fuel rail gauge pressure (diesel, or gasoline direct injection", { 0x01, 0x23 } },
    { "Oxygen sensor 1", { 0x01, 0x24 } },
    { "Oxygen sensor 2", { 0x01, 0x25 } },
    { "Oxygen sensor 3", { 0x01, 0x26 } },
    { "Oxygen sensor 4", { 0x01, 0x27 } },
    { "Oxygen sensor 5", { 0x01, 0x28 } },
    { "Oxygen sensor 6", { 0x01, 0x29 } },
    { "Oxygen sensor 7", { 0x01, 0x2A } },
    { "Oxygen sensor 8", { 0x01, 0x2B } },
    { "Commanded EGR", { 0x01, 0x2C } },
    { "EGR error", { 0x01, 0x2D } },
    { "Commanded evaporative purge", { 0x01, 0x2E } },
    { "Fuel tank level input", { 0x01, 0x2F } },
    { "Warm-ups since codes cleared", { 0x01, 0x30 } },
    { "Distance traveled since codes cleared", { 0x01, 0x31 } },
    { "Evaporative system vapor pressure", { 0x01, 0x32 } },
    { "Absolute barometric pressure", { 0x01, 0x33 } },
    { "Oxygen sensor 1", { 0x01, 0x34 } },
    { "Oxygen sensor 2", { 0x01, 0x35 } },
    { "Oxygen sensor 3", { 0x01, 0x36 } },
    { "Oxygen sensor 4", { 0x01, 0x37 } },
    { "Oxygen sensor 5", { 0x01, 0x38 } },
    { "Oxygen sensor 6", { 0x01, 0x39 } },
    { "Oxygen sensor 7", { 0x01, 0x3A } },
    { "Oxygen sensor 8", { 0x01, 0x3B } },
    { "Catalyst temperature, bank 1, sensor 1", { 0x01, 0x3C } },
    { "Catalyst temperature, bank 2, sensor 1", { 0x01, 0x3D } },
    { "Catalyst temperature, bank 1, sensor 2", { 0x01, 0x3E } },
    { "Catalyst temperature, bank 2, sensor 2", { 0x01, 0x3F } },
    { "Supported PIDs in the range 41 - 60", { 0x01, 0x40 } },
    { "Monitor status this drive cycle", { 0x01, 0x41 } },
    { "Control module voltage", { 0x01, 0x42 } },
    { "Absolute load value", { 0x01, 0x43 } },
    { "Fuel–Air commanded equivalence ratio", { 0x01, 0x44 } },
    { "Relative throttle position", { 0x01, 0x45 } },
    { "Ambient air temperature", { 0x01, 0x46 } },
    { "Absolute throttle position B", { 0x01, 0x47 } },
    { "Absolute throttle position C", { 0x01, 0x48 } },
    { "Accelerator pedal position D", { 0x01, 0x49 } },
    { "Accelerator pedal position E", { 0x01, 0x4A } },
    { "Accelerator pedal position F", { 0x01, 0x4B } },
    { "Commanded throttle actuator", { 0x01, 0x4C } },
    { "Time run with MIL on", { 0x01, 0x4D } },
    { "Time since trouble codes cleared", { 0x01, 0x4E } }
  };

  ros::init(argc, argv, "can_net_reader");
  ros::NodeHandle nh;
  ros::Publisher canBusRPM = nh.advertise<can_net_reader::CanBusFrame>("can_bus/rpm", 100);
  ros::Publisher canBusSpeed = nh.advertise<can_net_reader::CanBusFrame>("can_bus/speed", 100);
  can_net_reader::CanBusFrame _canBusFrame;
  while(ros::ok) {
    struct can_frame frame_rd;
    int nbytes = read(soc, &frame_rd, sizeof(struct can_frame)); 

    if(convBase(frame_rd.can_id,16) == "7e8") {
      time(&t);
      tm_info = localtime(&t);
      strftime(timestr, 26, "%Y-%m-%d %H:%M:%S", tm_info);
      //debugMsg << timestr << " " << " nbytes is " << nbytes << endl;    
      //debugMsg << timestr << " " << " read can_id " << convBase(frame_rd.can_id,16) << endl;
      //debugMsg << timestr << " " << " read can_dlc " << convBase(frame_rd.can_dlc,16) << endl;
      //debugMsg << timestr << " " << " read can_data_0 " << convBase(frame_rd.data[0],16) << endl;
      //debugMsg << timestr << " " << " read can_data_1 " << convBase(frame_rd.data[1],16) << endl;
      //debugMsg << timestr << " " << " read can_data_2 " << convBase(frame_rd.data[2],16) << endl;
      //debugMsg << timestr << " " << " read can_data_3 " << convBase(frame_rd.data[3],16) << endl;
      //debugMsg << timestr << " " << " read can_data_4 " << convBase(frame_rd.data[4],16) << endl;
      //debugMsg << timestr << " " << " read can_data_5 " << convBase(frame_rd.data[5],16) << endl;
      //debugMsg << timestr << " " << " read can_data_6 " << convBase(frame_rd.data[6],16) << endl;
      //debugMsg << timestr << " " << " read can_data_7 " << convBase(frame_rd.data[7],16) << endl;    
      //debugMsg << timestr << " " << " OBDIIMode1Commands " << sizeof(OBDIIMode1Commands)/sizeof(OBDIIMode1Commands[0]) << endl;    
      for(size_t i = 0; i < sizeof(OBDIIMode1Commands)/sizeof(OBDIIMode1Commands[0]); i++) {      
        string sRes = "0x" + convBase(frame_rd.data[2],16);
        string oRes = "0x" + convBase(OBDIIMode1Commands[i].payload[1],16);
        if(sRes == oRes && "Engine RPM" == OBDIIMode1Commands[i].name) {
          debugMsg << timestr << " " << " OBDIIMode1Commands " << i << " " << sRes << " " << oRes << " " << OBDIIMode1Commands[i].name << endl; 
          debugMsg << "0x" + convBase(frame_rd.data[2],16) << " " << "0x" + convBase(frame_rd.data[3],16) << " " << "0x" + convBase(frame_rd.data[4],16) << " " << "0x" + convBase(frame_rd.data[5],16) << endl;
          debugMsg << convHex2Int(convBase(frame_rd.data[3],16)) << convHex2Int(convBase(frame_rd.data[4],16)) << endl;
          debugMsg << OBDIIDecodeEngineRPMs(convHex2Int(convBase(frame_rd.data[3],16)),convHex2Int(convBase(frame_rd.data[4],16))) << endl;
          double rpmVal = OBDIIDecodeEngineRPMs(convHex2Int(convBase(frame_rd.data[3],16)),convHex2Int(convBase(frame_rd.data[4],16)));
          _canBusFrame.header.stamp = ros::Time::now();
          _canBusFrame.header.frame_id = "PCAN_USB";
          _canBusFrame.carType = carType;
          _canBusFrame.data = rpmVal;          
          canBusRPM.publish(_canBusFrame);
        } else if(sRes == oRes && "Vehicle speed" == OBDIIMode1Commands[i].name) {
          debugMsg << timestr << " " << " OBDIIMode1Commands " << i << " " << sRes << " " << oRes << " " << OBDIIMode1Commands[i].name << endl; 
          debugMsg << "0x" + convBase(frame_rd.data[2],16) << " " << "0x" + convBase(frame_rd.data[3],16) << " " << "0x" + convBase(frame_rd.data[4],16) << " " << "0x" + convBase(frame_rd.data[5],16) << endl;
          debugMsg << convHex2Int(convBase(frame_rd.data[3],16)) << endl;
          debugMsg << OBDIIDecodeUInt8(convHex2Int(convBase(frame_rd.data[3],16))) << endl;
          double speedVal = OBDIIDecodeUInt8(convHex2Int(convBase(frame_rd.data[3],16)));
          _canBusFrame.header.stamp = ros::Time::now();
          _canBusFrame.header.frame_id = "PCAN_USB";
          _canBusFrame.carType = carType;
          _canBusFrame.data = speedVal;          
          canBusSpeed.publish(_canBusFrame);        
        } else {
          continue;
        }
      }  
    }
        
    usleep(1000);    
    
    ros::spinOnce();
  }  
  return 0;
}

double CanNetReader::OBDIIDecodeEngineRPMs(int a,int b) {
  return (256.0 * a + b) / 4.0;
}

double CanNetReader::OBDIIDecodeUInt8(int a) {
  return a;
}

int CanNetReader::convHex2Int(string v) {
  unsigned int x;
  std::stringstream ss;
  ss << std::hex << v;
  ss >> x;
  int dataFrame = static_cast<int>(x); 
  return dataFrame; 
}

string CanNetReader::convBase(unsigned long v, long base) {
  string digits = "0123456789abcdef";
  string result;
  if((base < 2) || (base > 16)) {
    result = "Error: base out of range.";
  }
  else {
    do {
      result = digits[v % base] + result;
      v /= base;
    }
    while(v);
  }
  if(result.size() < 2) result = "0" + result;  
  return result;
}

int main(int argc, char ** argv) {  
  CanNetReader* _canNetReader = new CanNetReader(argc,argv);
  return 0;
}

