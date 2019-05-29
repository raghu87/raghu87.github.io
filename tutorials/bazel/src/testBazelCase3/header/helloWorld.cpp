#include "helloWorld.h"

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
