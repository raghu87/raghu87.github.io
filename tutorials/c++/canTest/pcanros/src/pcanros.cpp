#include <stdio.h>
#include <unistd.h>
#include <asm/types.h>

#include <ros/ros.h>
#include <std_msgs/Int32.h>

#include "PCANBasic.h"
#include "pcanros/CanFrame.h"

using namespace std;

string convBase(unsigned long v, long base)
{
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
	return result;
}
 
int main(int argc, char ** argv) {
 
  TPCANMsg Message;
  TPCANStatus Status;
  unsigned long ulIndex = 0;
  
  Status = CAN_Initialize(PCAN_USBBUS1, PCAN_BAUD_500K, 0, 0, 0);
  printf("Initialize CAN: %i\n",(int)Status);


  //Initialize and start the node
  ros::init(argc, argv, "abc");
  ros::NodeHandle nh;
  
  //ros::Publisher pub = nh.advertise<std_msgs::Int32>("abc_topic", 100);
  ros::Publisher pub1 = nh.advertise<pcanros::CanFrame>("can_bus", 100);
  //Define and create some messages
  //std_msgs::Int32 abc;
  pcanros::CanFrame newabs;
//  unsigned long ulIndex = 0;
  
  //ros::Rate(200);
  
  while(ros::ok) {
    
    while ((Status=CAN_Read(PCAN_USBBUS1,&Message,NULL)) == PCAN_ERROR_QRCVEMPTY)
      usleep(1000);
    if (Status != PCAN_ERROR_OK) {
      printf("Error 0x%x\n",(int)Status);
      break;
    }
    ulIndex++;
    
    //std::cout << "hello" << Message.ID << std::endl;
    //cout << "Hex:     " << convBase(Message.ID,16) << endl;
    //cout << "Test:    " << convBase(Message.ID,32) << endl;
    //int str = Message.ID;//, (int)Message.LEN,(int)Message.DATA[0], (int)Message.DATA[1],(int)Message.DATA[2], (int)Message.DATA[3],(int)Message.DATA[4], (int)Message.DATA[5],(int)Message.DATA[6], (int)Message.DATA[7];
    newabs.header.stamp = ros::Time::now();
    newabs.header.frame_id = "PCAN_USB";
    newabs.id = convBase(Message.ID,16);
    newabs.len = convBase(Message.LEN,16); 
    newabs.data1 = convBase(Message.DATA[0],16); 
    newabs.data2 = convBase(Message.DATA[1],16); 
    newabs.data3 = convBase(Message.DATA[2],16); 
    newabs.data4 = convBase(Message.DATA[3],16); 
    newabs.data5 = convBase(Message.DATA[4],16); 
    newabs.data6 = convBase(Message.DATA[5],16); 
    newabs.data7 = convBase(Message.DATA[6],16); 
    newabs.data8 = convBase(Message.DATA[7],16); 
    string str = " - R ID: "+convBase(Message.ID,16) + " LEN: "+convBase(Message.LEN,16)+" DATA: " + convBase(Message.DATA[0],16) + " " + convBase(Message.DATA[1],16) + " " + convBase(Message.DATA[2],16) + " " + convBase(Message.DATA[3],16) + " " + convBase(Message.DATA[4],16) + " " + convBase(Message.DATA[5],16) + " " + convBase(Message.DATA[6],16) + " " + convBase(Message.DATA[7],16);// + " i: " + (string)ulIndex;
    newabs.result = str;
    //printf("  - R ID:%4x LEN:%1x DATA:%02x %02x %02x %02x %02x %02x %02x %02x\n",(int)Message.ID, (int)Message.LEN,(int)Message.DATA[0], (int)Message.DATA[1],(int)Message.DATA[2], (int)Message.DATA[3],(int)Message.DATA[4], (int)Message.DATA[5],(int)Message.DATA[6], (int)Message.DATA[7]);

    usleep(1000);
    //pub.publish(abc);
    pub1.publish(newabs);
    ros::spinOnce();               
  }
 
 }
