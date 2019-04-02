'''
This script saves each topic in a bagfile as a csv.

Accepts a filename as an optional argument. Operates on all bagfiles in current directory if no argument provided

Written by Nick Speal in May 2013 at McGill University's Aerospace Mechatronics Laboratory
www.speal.ca

Supervised by Professor Inna Sharf, Professor Meyer Nahon 

'''

import rosbag, sys, csv
import time
import string
import os #for file management make directory
import shutil #for file management, copy file
import math
from decimal import Decimal
from math import sin, cos, sqrt, atan2, radians

def distance(lat1,lat2,lon1,lon2):
	# approximate radius of earth in km
	R = 6371.0
	
	lat1 = radians(lat1)
	lon1 = radians(lon1)
	lat2 = radians(lat2)
	lon2 = radians(lon2)
	
	dlon = lon2 - lon1
	dlat = lat2 - lat1
	
	a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
	c = 2 * atan2(sqrt(a), sqrt(1 - a))
	
	distance = R * c
	
	#print("Result:", distance)
	#print("Should be:", 278.546, "km")
    	#radius = 6371 # km

    	#dlat = math.radians(lat2-lat1)
    	#dlon = math.radians(lon2-lon1)
    	#a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
    	#    * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    	#c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    	#d = radius * c

    	return round(distance,4)

#verify correct input arguments: 1 or 2
if (len(sys.argv) > 2):
	print "invalid number of arguments:   " + str(len(sys.argv))
	print "should be 2: 'bag2csv.py' and 'bagName'"
	print "or just 1  : 'bag2csv.py'"
	sys.exit(1)
elif (len(sys.argv) == 2):
	listOfBagFiles = [sys.argv[1]]
	numberOfFiles = "1"
	print "reading only 1 bagfile: " + str(listOfBagFiles[0])
elif (len(sys.argv) == 1):
	listOfBagFiles = [f for f in os.listdir(".") if f[-4:] == ".bag"]	#get list of only bag files in current dir.
	numberOfFiles = str(len(listOfBagFiles))
	print "reading all " + numberOfFiles + " bagfiles in current directory: \n"
	for f in listOfBagFiles:
		print f
	print "\n press ctrl+c in the next 10 seconds to cancel \n"
	time.sleep(10)
else:
	print "bad argument(s): " + str(sys.argv)	#shouldnt really come up
	sys.exit(1)

count = 0
for bagFile in listOfBagFiles:
	count += 1
	print "reading file " + str(count) + " of  " + numberOfFiles + ": " + bagFile
	#access bag
	bag = rosbag.Bag(bagFile)
	bagContents = bag.read_messages()
	bagName = bag.filename


	#create a new directory
	folder = string.rstrip(bagName, ".bag")
	try:	#else already exists
		os.makedirs(folder)
	except:
		pass
	#shutil.copyfile(bagName, folder + '/' + bagName)


	#get list of topics from the bag
	listOfTopics = []
	for topic, msg, t in bagContents:
		if topic not in listOfTopics:
			listOfTopics.append(topic)


        lat1 = lat2 = lon1 = lon2 = 0
        lon12 = 0
        lat12 = 0
        resultDis = 0 
 	resD = 0
	for topicName in listOfTopics:
                print topicName
                if topicName == '/gps/fix':
                	print topicName+" copy"
			#Create a new CSV file for each topic
			filename = folder + '/' + string.replace(topicName, '/', '_slash_') + '.csv'
			with open(filename, 'w+') as csvfile:
				filewriter = csv.writer(csvfile, delimiter = ',')
				firstIteration = True	#allows header row
				for subtopic, msg, t in bag.read_messages(topicName):	# for each instant in time that has data for topicName
					#parse data from this instant, which is of the form of multiple lines of "Name: value\n"
					#	- put it in the form of a list of 2-element lists
					msgString = str(msg)
					msgList = string.split(msgString, '\n')
					instantaneousListOfData = []
					for nameValuePair in msgList:
						splitPair = string.split(nameValuePair, ':')
						for i in range(len(splitPair)):	#should be 0 to 1
                                                        #if i == 9 or i == 10:
							splitPair[i] = string.strip(splitPair[i])
						if splitPair[0] == 'longitude' or splitPair[0] == 'latitude':
							instantaneousListOfData.append(splitPair)
							#if splitPair[0] == 'longitude':
							#	if lon12 == 0:
							#		lon12 = 1
 							#		lon1 = splitPair[1]
							#	else: 
							#		lon12 = 0
 							#		lon2 = splitPair[1]
							#if splitPair[0] == 'latitude':
							#	if lat12 == 0:
							#		lat12 = 1
 							#		lat1 = splitPair[1]
							#	else:
							#		lat12 = 0
 							#		lat2 = splitPair[1]
							#if lon1 > 0 and lon2 > 0 and lat1 > 0 and lat2 > 0:
							#	print distance(lat1,lat2,lon1,lon2)
					#write the first row from the first element of each pair
					if firstIteration:	# header
						headers = ["rosbagTimestamp"]	#first column header
						for pair in instantaneousListOfData:
							headers.append(pair[0])
						headers.append("distance")	#column header
						filewriter.writerow(headers)
						firstIteration = False
					# write the value from each pair to the file
					values = [str(t)]	#first column will have rosbag timestamp
					for pair in instantaneousListOfData:                                                     
						if len(pair) > 1:
							values.append(pair[1])
						if pair[0] == 'longitude':
							if lon12 == 0:
								lon12 = 1
 								lon1 = pair[1]
							else: 
								lon12 = 0
 								lon2 = pair[1]
						if pair[0] == 'latitude':
							if lat12 == 0:
								lat12 = 1
 								lat1 = pair[1]
							else:
								lat12 = 0
 								lat2 = pair[1]
						#if lon1 > 0 and lon2 > 0 and lat1 > 0 and lat2 > 0:
						#resultDis = Decimal(lon1) + ", " + lon2 + ", " + lat1 + ", " + lat2
						#values.append(resultDis)	#column will have rosbag distance
					if Decimal(lon1) > 0 and Decimal(lon2) > 0 and Decimal(lat1) > 0 and Decimal(lat2) > 0:
						resD += distance(Decimal(lat1),Decimal(lat2),Decimal(lon1),Decimal(lon2))
						#print resD
					values.append(resD)
					#values.append(distance(Decimal("12.9691888205"),Decimal("12.9691888205"),Decimal("77.6414527597"),Decimal("77.6414527597")))
					filewriter.writerow(values)
	bag.close()
print "Done reading all " + numberOfFiles + " bag files."



