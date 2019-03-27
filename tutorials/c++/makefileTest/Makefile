CC = g++

DEBUG=@

LIBRARY_INCLUDE_DIRS = -I includes
LIBRARY_SRC_FILES=

BUILD_DIR = build

COMPILER_FLAGS += -g

SRC_DIR = src

TARGET_MAKE_CMD = $(CC) $(SRC_DIR)/canNetReader.cpp $(LIBRARY_SRC_FILES) $(COMPILER_FLAGS) -o $(BUILD_DIR)/test $(LIBRARY_INCLUDE_DIRS)

.PHONY: tests

all: canNetReader

canNetReader:
	@mkdir -p $(BUILD_DIR)
	$(DEBUG)$(TARGET_MAKE_CMD)
	
clean:
	rm -f $(BUILD_DIR)/*