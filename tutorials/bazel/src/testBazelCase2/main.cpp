#include "main.h"
HelloWorld::HelloWorld () {
  std::cout << "hello world constructor" << std::endl;
}

HelloWorld::~HelloWorld () {
  std::cout << "hello world destructor" << std::endl;
}

std::string HelloWorld::getGreet (const std::string& who) {
  return "Hello "+who;
}

void HelloWorld::printLocalTime() {
  std::time_t result = std::time(NULL);
  std::cout << std::asctime(std::localtime(&result));
}

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
