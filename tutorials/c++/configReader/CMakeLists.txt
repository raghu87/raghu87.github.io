
cmake_minimum_required(VERSION 2.6.4)
project(advanced_navigation_drivertesy)
add_compile_options(-std=c++11)
FIND_PATH(CONFIG++_INCLUDE_DIR libconfig.h++ /usr/include /usr/local/include)

FIND_LIBRARY(CONFIG++_LIBRARY NAMES config++ PATH /usr/lib /usr/local/lib /usr/lib/x86_64-linux-gnu) 

include_directories( 
  ${CONFIG++_INCLUDE_DIR}
)

add_executable(advanced_navigation_drivertesy main.cpp)
target_link_libraries(advanced_navigation_drivertesy ${CONFIG++_LIBRARY})
