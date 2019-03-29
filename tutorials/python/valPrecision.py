#Precision Handling in Python
#https://www.geeksforgeeks.org/precision-handling-python/
variable=[0.27272728085517883,123.234234234234,0.234234234234,12.4353457878]
output = []
output1 = []
output2 = []
print(variable)
for i in range(len(variable)):
  output.append(round(variable[i],2))
  output1.append(float('%.2f'%variable[i]))
  output2.append(float("{0:.4f}".format(variable[i])))
print(output)
print(output1)
print(output2)

variable=0.27272728085517883
var1=round(variable,4)
print(var1)
var1=round(variable,2)
print(var1)
var1=round(variable,6)
print(var1)
var2="{0:.2f}".format(variable)
print(var2)
var2="{0:.2f}".format(variable)
print(var2)
