# Bazel Tutorial

##### + Installation Guide Ubuntu [Install Link](https://docs.bazel.build/versions/master/build-ref.html#installing-menu)
+ Step 1: Install required packages
	+ First, install the prerequisites: <span style="color:red;font-size:14px;">pkg-config</span>, <span style="color:red;font-size:14px;">zip</span>, <span style="color:red;font-size:14px;">g++</span>, <span style="color:red;font-size:14px;">zlib1g-dev</span>, <span style="color:red;font-size:14px;">unzip</span>, and <span style="color:red;font-size:14px;">python</span>.<br> 
	`sudo apt-get install pkg-config zip g++ zlib1g-dev unzip python`
+ Step 2: Download Bazel
	+ Next, download the Bazel binary installer named <span style="color:red;font-size:14px;">bazel-<version>-installer-linux-x86_64.sh</span> from the Bazel releases page on [GitHub](https://github.com/bazelbuild/bazel/releases).
+ Step 3: Run the installer
	+ Run the Bazel installer as follows:<br>
		`chmod +x bazel-<version>-installer-linux-x86_64.sh`<br>
		`./bazel-<version>-installer-linux-x86_64.sh --user`
        
		The --user flag installs Bazel to the $HOME/bin directory on your system and sets the .bazelrc path to $HOME/.bazelrc. Use the --help command to see additional installation options.

+ Step 4: Set up your environment<br>
	+ If you ran the Bazel installer with the `--user` flag as above, the Bazel executable is installed in your <span style="color:red;font-size:14px;">$HOME/bin</span> directory. It’s a good idea to add this directory to your default paths, as follows:<br>
	
		`export PATH="$PATH:$HOME/bin"`<br>
        
    	You can also add this command to your <span style="color:red;font-size:14px;">~/.bashrc</span> file.

##### +  Workspace, Packages and Targets
+ Workspace<br>
A workspace is a directory on your filesystem that contains the source files for the software you want to build, as well as symbolic links to directories that contain the build outputs. Each workspace directory has a text file named <span style="color:red;font-size:14px;">WORKSPACE</span> which may be empty, or may contain references to [external dependencies](https://docs.bazel.build/versions/master/external.html) required to build the outputs. See also the [Workspace Rules](https://docs.bazel.build/versions/master/be/workspace.html) section in the Build Encyclopedia.
+ Examples
```c++
mkdir bazel
touch WORKSPACE
bazel build
        
mkdir src        

+++ case 1
mkdir -p src/testBazelCase1
gvim src/testBazelCase1/BUILD
cc_binary(
  name = "testBazelCase1",
  srcs = ["main.cpp"],
  deps = []
)

gvim src/testBazelCase1/main.cpp
#include <iostream>
#include <string>
int main (int argc,char** argv) {
  std::string who = "world";
  if(argc > 1) {
    who = argv[1];
  }
  std::cout << "hello " << who << std::endl;
  return 0;
}
bazel build src/testBazelCase1/...
```
```c++
+++ case 2
mkdir -p src/testBazelCase2
gvim src/testBazelCase2/BUILD
cc_library(
  name = "testBazelCase2-lib",
  srcs = ["main.cpp"],
  hdrs = ["main.h"],
)
cc_binary(
  name = "testBazelCase2",
  srcs = ["main.cpp"],
  deps = [":testBazelCase2-lib"]
)

gvim src/testBazelCase2/main.h
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

gvim src/testBazelCase2/main.cpp
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
bazel build src/testBazelCase2/...
```
```c++
+++ case 3
mkdir -p src/testBazelCase3
mkdir -p src/testBazelCase3/header
gvim src/testBazelCase3/header/BUILD
cc_library(
  name = "hello-greet",
  srcs = ["helloWorld.cpp"],
  hdrs = ["helloWorld.h"],
  visibility = ["//src/testBazelCase3:__pkg__"],
)

gvim src/testBazelCase3/header/helloWorld.h
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

gvim src/testBazelCase3/header/helloWorld.cpp
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

gvim src/testBazelCase3/BUILD
cc_binary(
  name = "HelloWorld",
  srcs = ["main.cpp"],
  deps = [
    "//src/testBazelCase3/header:hello-greet",
  ],
)

gvim src/testBazelCase3/main.cpp
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

bazel build src/testBazelCase3/...
```
```c++
+++ case 4
mkdir -p src/testBazelCase4
mkdir -p src/testBazelCase4/header
gvim src/testBazelCase4/header/BUILD
cc_library(
  name = "hello-greet",
  srcs = ["helloWorld.cpp"],
  hdrs = ["helloWorld.h"],
  visibility = ["//testBazelCase3:__pkg__"],
)

gvim src/testBazelCase4/header/helloWorld.h
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

gvim src/testBazelCase4/header/helloWorld.cpp
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

gvim src/testBazelCase4/BUILD
cc_binary(
  name = "HelloWorld",
  srcs = ["main.cpp"],
  deps = [
    "//testBazelCase3/header:hello-greet",
  ],
)

gvim src/testBazelCase4/main.cpp
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

bazel build src/testBazelCase4/...
```
