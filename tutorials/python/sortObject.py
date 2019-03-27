valObj = {'classname': ['keyboard', 'train', 'dining table', 'suitcase', 'snowboard', 'elephant', 'kite', 'sink', 'handbag', 'cup', 'giraffe', 'couch', 'apple', 'hot dog', 'frisbee', 'bed', 'horse', 'donut', 'remote', 'oven', 'banana', 'book', 'fork', 'cow', 'scissors', 'bowl', 'car', 'sandwich', 'tennis racket', 'mouse', 'cell phone', 'spoon', 'surfboard', 'bear', 'dog', 'toaster', 'airplane', 'tv', 'sports ball', 'traffic light', 'refrigerator', 'skis', 'boat', 'backpack', 'bottle', 'person', 'tie', 'microwave', 'teddy bear', 'bus', 'toilet', 'baseball glove', 'parking meter', 'wine glass', 'cake', 'pizza', 'bicycle', 'baseball bat', 'chair', 'broccoli', 'orange', 'fire hydrant', 'hair drier', 'skateboard', 'cat', 'umbrella', 'motorcycle', 'bench', 'carrot', 'zebra', 'toothbrush', 'stop sign', 'bird', 'clock', 'laptop', 'truck', 'sheep', 'potted plant', 'knife', 'vase'], 'total_img': [1471, 2464, 8378, 1631, 1170, 1518, 1625, 3291, 4861, 6518, 1798, 3170, 1171, 821, 1511, 2539, 2068, 1062, 2180, 2003, 1618, 3734, 2537, 1389, 673, 5028, 8606, 1645, 2368, 1290, 3322, 2493, 2343, 668, 3041, 151, 2243, 3191, 2986, 2893, 1671, 2209, 2098, 3924, 5968, 45174, 2667, 1089, 1510, 2791, 2317, 1884, 481, 1771, 2080, 2202, 2287, 1804, 8950, 1340, 1216, 1205, 128, 2511, 2818, 2749, 2442, 3844, 1186, 1324, 700, 1214, 2241, 3159, 2475, 4321, 1105, 3084, 3097, 2530], 'total_ann': [1980, 3159, 11167, 4251, 1960, 3905, 6560, 3933, 8778, 14513, 3596, 4113, 4308, 2023, 1862, 2905, 4666, 4977, 4122, 2302, 6912, 17315, 3918, 5686, 1073, 10064, 30785, 3089, 3411, 1517, 4460, 4287, 4161, 903, 3774, 156, 3833, 4036, 4392, 9159, 1875, 4698, 7590, 6200, 16983, 185316, 4497, 1189, 3442, 4327, 2873, 2689, 833, 5618, 4551, 4001, 4955, 2400, 27147, 4927, 4597, 1316, 135, 4012, 3301, 7865, 6021, 6751, 5539, 3685, 1377, 1372, 7290, 4328, 3415, 7050, 6654, 5918, 5536, 4623]}
iArr = {}
for i in range(len(valObj["total_img"])):
  iArr[valObj["total_img"][i]] = {"classname":valObj["classname"][i],"total_img":valObj["total_img"][i],"total_ann":valObj["total_ann"][i]}
sortedVal = sorted(iArr,reverse=True)
valObj1 = {"classname":[],"total_img":[],"total_ann":[]}
for i in range(len(sortedVal)):
  valObj1["classname"].append(iArr[sortedVal[i]]["classname"])
  valObj1["total_img"].append(iArr[sortedVal[i]]["total_img"])
  valObj1["total_ann"].append(iArr[sortedVal[i]]["total_ann"])

iArr1 = {}
for i in range(len(valObj["total_ann"])):
  iArr1[valObj["total_ann"][i]] = {"classname":valObj["classname"][i],"total_img":valObj["total_img"][i],"total_ann":valObj["total_ann"][i]}
sortedVal1 = sorted(iArr1,reverse=True)
valObj2 = {"classname":[],"total_img":[],"total_ann":[]}
for i in range(len(sortedVal1)):
  valObj2["classname"].append(iArr1[sortedVal1[i]]["classname"])
  valObj2["total_img"].append(iArr1[sortedVal1[i]]["total_img"])
  valObj2["total_ann"].append(iArr1[sortedVal1[i]]["total_ann"])

print(valObj)
print(valObj1)
print(valObj2)
