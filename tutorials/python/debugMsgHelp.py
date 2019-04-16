import os
import getpass
import time
start_time = time.time()
def debugInit(debugHash,debugFileName):
  storeDir = "/home/"+getpass.getuser()+"/Desktop/"
  #debugFileName = open("testfile.txt","w")

def debugMsg(*args,**kwargs):
  debugHash.append({str(time.time()):args})
  debugHash.append({str(time.time()):kwargs})
  debugHash.append({kwargs['time']:kwargs['msg']})
  #storeDir = "/tmp/"+


debugHash = []

debugMsg(time=time.time(),msg="time is "+str(time.time()))

#print __file__
#print os.path.basename(__file__)
#print os.path.dirname()

print(debugHash)

logFile = "/tmp/"+__file__+"_"+str(int(time.time()))+".log"
print logFile
file = open(logFile,"w") 
file.write("Total Time... "+str((time.time() - start_time)/60)+" min") 
file.close() 



