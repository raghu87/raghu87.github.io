
#include <ctime>
#include <string>
#include <iostream>

class HelloWorld {
  public:
    HelloWorld();
    ~HelloWorld();
    std::string getGreet (const std::string& who);
    void printLocalTime();
};
