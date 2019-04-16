def debugMsg(*args,**kwargs):
  print(args)
  print(kwargs)

a = 1
b = 2
c={'hello':1}
d="one=1"

debugMsg(a,b,c,d,wait=1)

#a,b,c,d is non-keyword arg
#wait=1 is a keyword arg
#SyntaxError: non-keyword arg after keyword arg
