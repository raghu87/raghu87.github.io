#include "header/helloWorld.h"

int main (int argc,char** argv) {
  HelloWorld hellow;
  std::string who = "world";
  if(argc > 1) {
    who = argv[1];
  }
  std::cout << hellow.getGreet(who) << std::endl;
  hellow.printLocalTime();
  return 0;
}
