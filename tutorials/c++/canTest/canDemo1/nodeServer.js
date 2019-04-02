(function () {
  if(typeof(vidteq) == 'undefined') { vidteq = {}; }
  
  vidteq._nodeServer = function() {
    this.addLibs();        
    this.debugInit();      
    this.debug = true;
    this.homePath = "";
    this.rosStarted = false;
    this.port = 3000;    
    this.rosCorepresent = false;
    if(process.env && process.env['HOME']) {
      this.homePath = process.env['HOME'] + "/Desktop";
    }    
    this.optionDefinitions = [
      { 
        name: 'debug'
        ,type: Boolean
        ,alias: 'd'
        ,default: ""
        ,details:"`Boolean` do not need to supply a value. Setting `debug` or `d` will set that option's value to `true` else `false`." 
      }
      ,{
        name: 'help'
        ,type: Boolean
        ,alias: 'h'
        ,default: ""
        ,details:"`Boolean` do not need to supply a value. Setting `help` or `h` will set that option's value to `true` else `false`." 
      }
      ,{
        name: 'port'
        ,type: Number
        ,alias: 'p'
        ,default: this.port
        ,details:"`Number` default port value is "+this.port+"" 
      }
    ];
    options = this.commandLineArgs(this.optionDefinitions);
    if(!this.optionsValidate(options)) {
      this.printHelp(this.optionDefinitions);
      return;
    }
    this.setOptions(options,this.optionDefinitions);    
    this.init();
    var that = this;
    this.rosPreviewResults = {
      yaw:''
      ,fix:''
      ,sideLeft:''
      ,sideRight:''
      ,rearNear:''
      ,frontNear:''
    };
   

    //this.rosnodejs.initNode('/imu/yaw','/gps/fix',{ onTheFly: true })
    //.then((rosNode) => {
    //});

    this.fiximage = false;
    if(this.cacheRosTopicsTimer) clearInterval(this.cacheRosTopicsTimer);
    this.cacheRosTopicsTimer = setInterval(function () {
      that.cacheRosTopics(); 
    },1000);

    //this.gazePath = "/home/gaze3/Desktop/IMAGEDATA";
    //this.gazeFileList = [];
    //this.serialNList = ['15398978','15398982','15398985','15399084','15399085','15399086','16363225',"14970_zed_l","14970_zed_r"];
  }

  vidteq._nodeServer.prototype.addLibs = function () {
    this.http = require('http');
    this.fs = require('fs');
    this.url = require("url");
    this.path = require("path");
    this.rosnodejs = require('rosnodejs');
  }

  vidteq._nodeServer.prototype.debugInit = function () {    
    var path = this.path || require('path');
    var fs = this.fs || require('fs');
    var scriptName = path.basename(__filename);
    this.debugFileName = "/tmp/"+scriptName+".log";
    if (fs.existsSync(this.debugFileName)) { fs.unlinkSync(this.debugFileName); }
  }

  vidteq._nodeServer.prototype.debugMsg = function () {    
    if(this.debug) {
      if(arguments && arguments.length) {
        for(var i=0;i<arguments.length;i++) {
          var arg = arguments[i];
          if(typeof(arguments[i]) == 'undefined') {
            arg = "undefined";
          }
          if(typeof(arguments[i]) == 'object') {
            arg = JSON.stringify(arguments[i]);
          }
          this.fs.appendFileSync(this.debugFileName,arg.toString() + "\n");
        }
      }
    }
  }

  vidteq._nodeServer.prototype.printHelp = function (optionDefinitions) {
    console.log("Command Line Help");
    console.log("---------------------------------------------\n");
    var options = "Detailed Usage: \n\tnode nodeServer.js";
    var optionsShort = "Short Usage: \n\tnode nodeServer.js";
    var optionCond = "Options: \n";
    for(var i in optionDefinitions) {
      if(optionDefinitions[i]['name'] != 'help') {
        if(optionDefinitions[i]['type'] == Boolean) {
          options += " " + optionDefinitions[i]['name'];
          optionsShort += " " + optionDefinitions[i]['alias'];
        } else {
          options += " " + optionDefinitions[i]['name'] + "=" + optionDefinitions[i]['default'];
          optionsShort += " " + optionDefinitions[i]['alias'] + "=" + optionDefinitions[i]['default'];
        }
      }    
      optionCond += " "+i+") `" + optionDefinitions[i]['name'] + "` or `" + optionDefinitions[i]['alias'] + "`: " + optionDefinitions[i]['details'] + "\n";
    } 
    console.log(options);
    console.log(optionsShort);
    console.log(optionCond);
  }

  vidteq._nodeServer.prototype.commandLineArgs = function (optionDefinitions) {  
    var options = {};
    process.argv.forEach(function (val, index, array) {
      var splitVal = val.split("=");    
      if(splitVal.length > 0) {
        for(var i in optionDefinitions) {
          if(optionDefinitions[i]['name'] == splitVal[0] || optionDefinitions[i]['alias'] == splitVal[0]) {
            if(optionDefinitions[i]['type'] == Boolean) {
              options[optionDefinitions[i]['name']] = true;
            } else {
              if(splitVal.length > 1) {
                if(optionDefinitions[i]['type'] == Number) {
                  options[optionDefinitions[i]['name']] = Number(splitVal[1]);
                } else {
                  options[optionDefinitions[i]['name']] = splitVal[1];
                }      
              }            
            }
          }
        }
      }
    });
    return options;
  }

  vidteq._nodeServer.prototype.optionsValidate = function (options) {
    var optionSize = this.objectSize(options);
    //if(optionSize < 1) { return false; }  
    if(options.help) { return false; }
    //var foundVal = false;
    //if(!foundVal) { return false; }
    return true;
  }

  vidteq._nodeServer.prototype.objectSize = function(obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  }

  vidteq._nodeServer.prototype.setOptions = function(options,optionDefinitions) {
    if(options) {
      for(var i in optionDefinitions) {
        if(options[optionDefinitions[i]['name']]) {
          this[optionDefinitions[i]['name']] = options[optionDefinitions[i]['name']];        
          this.debugMsg(this[optionDefinitions[i]['name']]);
        }    
      }
    }
  }
  
  vidteq._nodeServer.prototype.init = function () {    
    var http = this.http || require('http');
    var port = this.port || 3000;
    var that = this;
    var requestHandlerWrap = function (request, response) {
      that.requestHandler(request, response);
    };
    this.server = http.createServer(requestHandlerWrap)
    this.server.listen(port, (err) => {
      if (err) {
        return that.debugMsg('something bad happened', err)
      }
      that.debugMsg(`server is listening on ${port}`)
    });

    //this.walkFileSync(this.gazePath + '/',this.gazeFileList);
    //this.debugMsg(this.gazeFileList);
  }

  function isJsonStringify(json) {
    try {
        JSON.stringify(json);
    } catch (e) {
        return false;
    }
    return true;
  }

  function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  vidteq._nodeServer.prototype.requestHandler = function (request, response) {
    var that = this;    
    switch(request.url) {
      case '/' : 
        request.url = "index.html";
        this.renderFiles (request, response);
        break;
      case '/gazeuploader' :
        var steerFileJson = {"error":"gazeuploader not found"};
        if(isJsonStringify(steerFileJson)) {
          response.setHeader('Content-type' , 'text/json');
          response.end(JSON.stringify(steerFileJson));
        } else {
          response.setHeader('Content-type' , 'text/json');
          var result1 = {};
          response.end(JSON.stringify(result1));
        }
        break;
      case '/detectDateFolder' :
        console.log('detectDataFolder');
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var selectedDisk = "";
          if(data.selectDisk) { selectedDisk = data.selectDisk; }
          var fs = require('fs');
          var dir = selectedDisk+"/IMAGEDATA";
          console.log(dir);
          if (fs.existsSync(dir)) {
            fs.readdir(dir, (err, files) => {
              console.log(files.length);
              if(files.length) {
                var steerFileJson = {files:files};
                console.log(steerFileJson);
                response.setHeader('Access-Control-Allow-Origin' , '*');
                response.setHeader('Content-type' , 'text/json');
                response.end(JSON.stringify(steerFileJson));
              }
            });
          } else {           
            var steerFileJson = {"error":"detectDateFolder not found"};
            response.setHeader('Access-Control-Allow-Origin' , '*');
            response.setHeader('Content-type' , 'text/json');
            response.end(JSON.stringify(steerFileJson));
          }
        });
        break;
      case '/getDateStrFromServer' :
        console.log('getDateStrFromServer');
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var selectedDisk = diskPath = "";
          if(data.selectDisk) { selectedDisk = data.selectDisk; }
          if(data.diskPath) { diskPath = data.diskPath; }
          var dateStr = data.dateStr || '';
          var fs = require('fs');
          var dir = diskPath+"/IMAGEDATA/"+dateStr;
          console.log(dir);
          if (fs.existsSync(dir)) {
            fs.readdir(dir, (err, files) => {
              console.log(files.length);
              if(files.length) {
                var steerFileJson = {files:files};
                console.log(steerFileJson);
                response.setHeader('Access-Control-Allow-Origin' , '*');
                response.setHeader('Content-type' , 'text/json');
                response.end(JSON.stringify(steerFileJson));
              }
            });
          } else {           
            var steerFileJson = {"error":"detectDateFolder not found"};
            response.setHeader('Access-Control-Allow-Origin' , '*');
            response.setHeader('Content-type' , 'text/json');
            response.end(JSON.stringify(steerFileJson));
          }
        });
        break;
      case '/gazeUploadToServer' :
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var jsonOnly = data.jsonOnly || 'yes';
          var diskPath = data.diskPath || '';
          var dateStr = data.dateStr || '';
          var lastPath = data.lastPath || '';
          var userName = "swuser";
          var pwd = "swuser";
          var tDP = diskPath + "/IMAGEDATA/" + dateStr+"/"+lastPath;// + "/";
          console.log(tDP);
          console.log(jsonOnly);
          ////rsync -av --exclude='CVS' --exclude='.*' --exclude='node_modules' /media/intel/SSD7/IMAGEDATA/December-18/ vidteq@10.4.71.100:/data/samba/Bangalore/prod/Bangalore_Gaze_Raw_Data/IMAGEDATA/test/
          
          var strMsg = "sshpass";
          var argMsg = ["-p",pwd,"rsync","-av","--exclude='CVS'","--exclude='.*'","--exclude='node_modules'"];
          if(jsonOnly == 'yes') {
            argMsg.push("--exclude","*.jpg","--include","*_0[0-9][0-9].json$");
          }
          argMsg.push(tDP);
          argMsg.push(userName+"@10.4.71.100:/data/tmp/","--chmod=777");
          console.log(argMsg);
          const spawn = require('child_process').spawn; 
          var optUploader = spawn(strMsg,argMsg,{ detached: true, stdio: 'inherit' });
          optUploader.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });
          
          optUploader.on('data', (data) => {
            console.log(`stderr: ${data}`);
          });
                    
          optUploader.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            console.log("rsync done now do apache copy");             
            var steerFileJson = {"success":true};
            response.setHeader('Access-Control-Allow-Origin' , '*');
            response.setHeader('Content-type' , 'text/json');
            response.end(JSON.stringify(steerFileJson));
          });

          //var strMsg = "node";
          //var argMsg = ["/usr/src/gaze/uploader/gazeUploader.js","--value","pack","--debug","yes","--exdisk","no","--jsononly",jsonOnly,"--diskpath",tDP,"--hostip","10.4.71.100","--hostusername",userName,"--hostpassword",pwd];
          //const spawn = require('child_process').spawn; 
          //console.log(argMsg);
          //var optUploader = spawn(strMsg,argMsg,{ detached: true, stdio: 'inherit' });
          //optUploader.on('error', function(err) {
          //  console.log('Failed to start child process.');
          //});
          //console.log("uploader started");             
          //var steerFileJson = {"error":"detectDateFolder not found"};
          //response.setHeader('Access-Control-Allow-Origin' , '*');
          //response.setHeader('Content-type' , 'text/json');
          //response.end(JSON.stringify(steerFileJson));
        });
        break;
      case '/steerFiles' :
        this.debugMsg("inside steerFiles");
        var homePath = "";
        if(process.env && process.env['HOME']) {
          homePath = process.env['HOME'];
        }
        var steerFilePath = homePath + "/Desktop/steerFiles.json";
        var steerFileJson = {"error":"steerFiles not found"};
        if (this.fs.existsSync(steerFilePath)) {
          steerFileJson = this.fs.readFileSync(steerFilePath).toString();
          if(typeof(steerFileJson) == 'string') steerFileJson = JSON.parse(steerFileJson);
        }
        this.debugMsg(steerFileJson);
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(steerFileJson));
        break;
      case '/loadData' :
        var gazeDataList = {};
        //this.getImageList(gazeDataList);
        //response.setHeader('Content-type' , 'text/json');
        //response.end(JSON.stringify(gazeDataList));
        break;
      case '/detectDisk' :
        this.startStopRosGaze({
          operation:"detectDisk"
          ,request:request
          ,response:response
        });
        break;
      case '/detectDiskSpace' :
        console.log("inside de");
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var diskMount = "";
          if(data.diskMount) { diskMount = data.diskMount; }
          that.startStopRosGaze({
            operation:"detectDiskSpace"
            ,request:request
            ,response:response
            ,diskMount:diskMount
          });
        });
        break;
      case '/getConfig' :
        this.startStopRosGaze({
          operation:"getConfig"
          ,request:request
          ,response:response
        });
        break;
      case '/setConfig' :
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var rosCfgFormat = {};
          if(data.rosCfgFormat) { rosCfgFormat = data.rosCfgFormat; }
          that.startStopRosGaze({
            operation:"setConfig"
            ,request:request
            ,response:response
            ,rosCfgFormat:rosCfgFormat
          });
        });
        break;
      case '/startRos' :
        var fs = require('fs');
        if (fs.existsSync('/tmp/rosCheck.log')) {
          fs.unlinkSync("/tmp/rosCheck.log");
        }
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var rosCfgFormat = {};
          if(data.rosCfgFormat) { rosCfgFormat = data.rosCfgFormat; }
          that.startStopRosGaze({
            operation:"start"
            ,request:request
            ,response:response
            ,rosCfgFormat:rosCfgFormat
          });
        });
        break;
      case '/stopRos' :
        var fs = require('fs');
        if (fs.existsSync('/tmp/rosCheck.log')) {
          fs.unlinkSync("/tmp/rosCheck.log");
        }
        this.startStopRosGaze({
          operation:"stop"
          ,request:request
          ,response:response
        });
        break;
      case '/saveRos' :
        var fs = require('fs');
        fs.writeFileSync("/tmp/rosCheck.log","",{mode:'777'});
        this.killRos("rviz",function () {
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var rosCfgFormat = {};
          if(data.rosCfgFormat) { rosCfgFormat = data.rosCfgFormat; }
          that.startStopRosGaze({
            operation:"save"
            ,request:request
            ,response:response
            ,rosCfgFormat:rosCfgFormat
          });
        });
        });
        break;
      case '/saveStopRos' :
        this.startStopRosGaze({
          operation:"savestop"
          ,request:request
          ,response:response
        });
        break;
      case '/previewRosGaze' :
        this.startStopRosGaze({
          operation:"previewRosGaze"
          ,request:request
          ,response:response
        });
        break;

      case '/displayNewCCExtrinsic' :
        var fs = require('fs');
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var camera1 = camera2 = "";
          if(data.camera1) { camera1 = data.camera1; }  
          var file1 = camera1+".txt";
          if(camera1 == "frontNear" || camera1 == "rearNear") {
            file1 = camera1 + "RTC.txt";
          } else if(camera1 == "sideLeft" || camera1 == "sideRight") {
            file1 = camera1 + "RT.txt";
          }
          if(data.camera2) { camera2 = data.camera2; }
          var file2 = camera2+".txt";
          if(camera2 == "frontNear" || camera2 == "rearNear") {
            file2 = camera2 + "RTC.txt";
          } else if(camera2 == "sideLeft" || camera2 == "sideRight") {
            file2 = camera2 + "RT.txt";
          }
          var gazeDataList = {"cam1":"","cam2":""};
          var fileStr = "/usr/local/bin/gazebin/" + file1;
          if (fs.existsSync(fileStr)) {
            var res = fs.readFileSync(fileStr).toString(); 
            var lines = res.split(/[\r\n]+/);
            if(res) gazeDataList['cam1'] = lines;
          }
          var fileStr = "/usr/local/bin/gazebin/" + file2;
          if (fs.existsSync(fileStr)) {
            var res = fs.readFileSync(fileStr).toString(); 
            var lines = res.split(/[\r\n]+/);
            if(res) gazeDataList['cam2'] = lines;
          }
          response.setHeader('Content-type' , 'text/json');
          response.end(JSON.stringify(gazeDataList));
        });
        break;
      case '/displayNewCLExtrinsic' :
        var fs = require('fs');
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var camera1 = lidar1 = "";
          if(data.camera1) { camera1 = data.camera1; }  
          var file1 = camera1+".txt";
          if(camera1 == "frontNear" || camera1 == "rearNear") {
            file1 = camera1 + "RTC.txt";
          } else if(camera1 == "sideLeft" || camera1 == "sideRight") {
            file1 = camera1 + "RT.txt";
          }
          var file2 = "lidarRT.txt";
          var gazeDataList = {"cam1":"","cam2":""};
          var fileStr = "/usr/local/bin/gazebin/" + file1;
          if (fs.existsSync(fileStr)) {
            var res = fs.readFileSync(fileStr).toString(); 
            var lines = res.split(/[\r\n]+/);
            if(res) gazeDataList['cam1'] = lines;
          }
          var fileStr = "/usr/local/bin/gazebin/" + file2;
          if (fs.existsSync(fileStr)) {
            var res = fs.readFileSync(fileStr).toString(); 
            var lines = res.split(/[\r\n]+/);
            if(res) gazeDataList['cam2'] = lines;
          }
          response.setHeader('Content-type' , 'text/json');
          response.end(JSON.stringify(gazeDataList));
        });
        break;


      case '/displayNewIntrinsic' :
        var fs = require('fs');
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var cameraName = "";
          if(data.cameraName) { cameraName = data.cameraName; }
          var gazeDataList = {left:"",right:""};
          var fileStr = "/usr/local/bin/gazebin/" + cameraName + "_left" + ".ini"; 
          if (fs.existsSync(fileStr)) {
            var res = fs.readFileSync(fileStr).toString(); 
            var lines = res.split(/[\r\n]+/);
            if(res) gazeDataList['left'] = lines;
          }
          var fileStr = "/usr/local/bin/gazebin/" + cameraName + "_right" + ".ini"; 
          if (fs.existsSync(fileStr)) {
            var res = fs.readFileSync(fileStr).toString(); 
            var lines = res.split(/[\r\n]+/);
            if(res) gazeDataList['right'] = lines;
          }
          response.setHeader('Content-type' , 'text/json');
          response.end(JSON.stringify(gazeDataList));
        });
        break;
      case '/getIntrinsicValues' :
        var fs = require('fs');
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var cameraName = "";
          if(data.cameraName) { cameraName = data.cameraName; }
          var gazeDataList = {left:"",right:""};
          var fileStr = "/usr/local/bin/gazebin/" + cameraName + "_left" + ".ini"; 
          if (fs.existsSync(fileStr)) {
            var res = fs.readFileSync(fileStr).toString(); 
            var lines = res.split(/[\r\n]+/);
            if(res) gazeDataList['left'] = lines;
          }
          var fileStr = "/usr/local/bin/gazebin/" + cameraName + "_right" + ".ini"; 
          if (fs.existsSync(fileStr)) {
            var res = fs.readFileSync(fileStr).toString(); 
            var lines = res.split(/[\r\n]+/);
            if(res) gazeDataList['right'] = lines;
          }
          response.setHeader('Content-type' , 'text/json');
          response.end(JSON.stringify(gazeDataList));
        });
        break;
      case '/startVPN' :
        //request.on("data",function (chunk) {
        //  var data = JSON.parse(chunk.toString('utf8'));
        //  var spawn = require('child_process').spawn; 
        //});        
        //var str = "";
        //var spawnVPN = spawn(str,arg,{ detached: true, stdio: 'inherit' });
        //opt['roslaunch'+showCamCount].on('error', function(err) {
        //  console.log('Failed to start child process.');
        //});
        //var fs = require('fs');
        //var gazeDataList = {result:"0"};
        //if (fs.existsSync('/tmp/stereoCalibration.log')) {
        //  var res = fs.readFileSync("/tmp/stereoCalibration.log").toString(); 
        //  if(res) gazeDataList['result'] = res;
        //}
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));
        break;
      case '/displayIntrinsic' :
        var fs = require('fs');
        var gazeDataList = {result:"0"};
        if (fs.existsSync('/tmp/stereoCalibration.log')) {
          var res = fs.readFileSync("/tmp/stereoCalibration.log").toString(); 
          if(res) gazeDataList['result'] = res;
        }
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));
        break;
      case '/cameraIntrinsic' :
        var fs = require('fs');
        if (fs.existsSync('/tmp/stereoCalibration.log')) {
          fs.unlinkSync("/tmp/stereoCalibration.log");
        }
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var calibSide = intBoardMatrix = intSquareSize = "";
          if(data.calibSide) { calibSide = data.calibSide; }
          if(data.intBoardMatrix) { intBoardMatrix = data.intBoardMatrix; }
          if(data.intSquareSize) { intSquareSize = data.intSquareSize; }
          that.startStopRosGaze({
            operation:"cameraIntrinsic"
            ,request:request
            ,response:response
            ,calibSide:calibSide
            ,intBoardMatrix:intBoardMatrix
            ,intSquareSize:intSquareSize
          });
        });        
        break;
      case '/cameraExtrinsic' :
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var camera1 = camera2 = "";                    
          var camera2ExtrinsicMarkers = camera2ExtrinsicS1_Length1 = "";
          var camera2ExtrinsicS2_Breadth1 = camera2ExtrinsicBWAL_B11 = "";
          var camera2ExtrinsicBWAB_B21 = camera2Extrinsiceloam_e1 = camera2Extrinsicms = "";
          if(data.camera1) { camera1 = data.camera1; }
          if(data.camera2) { camera2 = data.camera2; }          
          if(data.camera2ExtrinsicMarkers) { camera2ExtrinsicMarkers = data.camera2ExtrinsicMarkers; }
          if(data.camera2ExtrinsicS1_Length1) { camera2ExtrinsicS1_Length1 = data.camera2ExtrinsicS1_Length1; }
          if(data.camera2ExtrinsicS2_Breadth1) { camera2ExtrinsicS2_Breadth1 = data.camera2ExtrinsicS2_Breadth1; }
          if(data.camera2ExtrinsicBWAL_B11) { camera2ExtrinsicBWAL_B11 = data.camera2ExtrinsicBWAL_B11; }
          if(data.camera2ExtrinsicBWAB_B21) { camera2ExtrinsicBWAB_B21 = data.camera2ExtrinsicBWAB_B21; }
          if(data.camera2Extrinsiceloam_e1) { camera2Extrinsiceloam_e1 = data.camera2Extrinsiceloam_e1; }
          if(data.camera2Extrinsicms) { camera2Extrinsicms = data.camera2Extrinsicms; }
          that.startStopRosGaze({
            operation:"cameraExtrinsic"
            ,request:request
            ,response:response
            ,camera1:camera1
            ,camera2:camera2
            ,camera2ExtrinsicMarkers:camera2ExtrinsicMarkers
            ,camera2ExtrinsicS1_Length1:camera2ExtrinsicS1_Length1
            ,camera2ExtrinsicS2_Breadth1:camera2ExtrinsicS2_Breadth1
            ,camera2ExtrinsicBWAL_B11:camera2ExtrinsicBWAL_B11
            ,camera2ExtrinsicBWAB_B21:camera2ExtrinsicBWAB_B21
            ,camera2Extrinsiceloam_e1:camera2Extrinsiceloam_e1
            ,camera2Extrinsicms:camera2Extrinsicms
          });
        });        
        break;
      case '/lidarExtrinsic' :
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var camera3 = "";                    
          var camera3ExtrinsicMarkers = camera3ExtrinsicS1_Length1 = "";
          var camera3ExtrinsicS2_Breadth1 = camera3ExtrinsicBWAL_B11 = "";
          var camera3ExtrinsicBWAB_B21 = camera3Extrinsiceloam_e1 = camera3Extrinsicms = "";
          var extXPlus = extXMinus = extYPlus = extYMinus = extZPlus = extZMinus = extroilidarX = "";
          var extroilidarY = extroilidarZ = extMaxIt = extLidarIntensity = "";
          if(data.camera3) { camera3 = data.camera3; }          
          if(data.camera3ExtrinsicMarkers) { camera3ExtrinsicMarkers = data.camera3ExtrinsicMarkers; }
          if(data.camera3ExtrinsicS1_Length1) { camera3ExtrinsicS1_Length1 = data.camera3ExtrinsicS1_Length1; }
          if(data.camera3ExtrinsicS2_Breadth1) { camera3ExtrinsicS2_Breadth1 = data.camera3ExtrinsicS2_Breadth1; }
          if(data.camera3ExtrinsicBWAL_B11) { camera3ExtrinsicBWAL_B11 = data.camera3ExtrinsicBWAL_B11; }
          if(data.camera3ExtrinsicBWAB_B21) { camera3ExtrinsicBWAB_B21 = data.camera3ExtrinsicBWAB_B21; }
          if(data.camera3Extrinsiceloam_e1) { camera3Extrinsiceloam_e1 = data.camera3Extrinsiceloam_e1; }
          if(data.camera3Extrinsicms) { camera3Extrinsicms = data.camera3Extrinsicms; }

          if(data.extXPlus) { extXPlus = data.extXPlus; }
          if(data.extXMinus) { extXMinus = data.extXMinus; }
          if(data.extYPlus) { extYPlus = data.extYPlus; }
          if(data.extYMinus) { extYMinus = data.extYMinus; }
          if(data.extZPlus) { extZPlus = data.extZPlus; }
          if(data.extZMinus) { extZMinus = data.extZMinus; }
          if(data.extroilidarX) { extroilidarX = data.extroilidarX; }
          if(data.extroilidarY) { extroilidarY = data.extroilidarY; }
          if(data.extroilidarZ) { extroilidarZ = data.extroilidarZ; }
          if(data.extMaxIt) { extMaxIt = data.extMaxIt; }
          if(data.extLidarIntensity) { extLidarIntensity = data.extLidarIntensity; }
          
          that.startStopRosGaze({
            operation:"lidarExtrinsic"
            ,request:request
            ,response:response
            ,camera3:camera3            
            ,camera3ExtrinsicMarkers:camera3ExtrinsicMarkers
            ,camera3ExtrinsicS1_Length1:camera3ExtrinsicS1_Length1
            ,camera3ExtrinsicS2_Breadth1:camera3ExtrinsicS2_Breadth1
            ,camera3ExtrinsicBWAL_B11:camera3ExtrinsicBWAL_B11
            ,camera3ExtrinsicBWAB_B21:camera3ExtrinsicBWAB_B21
            ,camera3Extrinsiceloam_e1:camera3Extrinsiceloam_e1
            ,camera3Extrinsicms:camera3Extrinsicms
            ,extXPlus:extXPlus
            ,extXMinus:extXMinus
            ,extYPlus:extYPlus
            ,extYMinus:extYMinus
            ,extZPlus:extZPlus
            ,extZMinus:extZMinus
            ,extroilidarX:extroilidarX
            ,extroilidarY:extroilidarY
            ,extroilidarZ:extroilidarZ
            ,extMaxIt:extMaxIt
            ,extLidarIntensity:extLidarIntensity
          });
        });        
        break;
      case '/emptyDisk' :
        request.on("data",function (chunk) {
          var data = JSON.parse(chunk.toString('utf8'));
          var disk = {};
          if(data.disk) { disk = data.disk; }
          that.startStopRosGaze({
            operation:"emptyDisk"
            ,request:request
            ,response:response
            ,disk:disk
          });
        });   
        break;
      case '/previewRos' :
        //console.log('preview done');
        var res = {results:[{yaw:0,latitude:0,longitude:0,sideLeft:"",sideRight:"",frontNear:"",rearNear:""}]};
        //console.log(JSON.stringify(that.rosPreviewResults));
        if(that.rosPreviewResults && that.rosPreviewResults.sideLeft) {
          res.results[0].sideLeft = that.rosPreviewResults.sideLeft; 
        }
        if(that.rosPreviewResults && that.rosPreviewResults.sideRight) {
          res.results[0].sideRight = that.rosPreviewResults.sideRight; 
        }
        if(that.rosPreviewResults && that.rosPreviewResults.frontNear) {
          res.results[0].frontNear = that.rosPreviewResults.frontNear; 
        }
        if(that.rosPreviewResults && that.rosPreviewResults.rearNear) {
          res.results[0].rearNear = that.rosPreviewResults.rearNear; 
        }
        if(that.rosPreviewResults && that.rosPreviewResults.yaw) {
          var yaw = that.rosPreviewResults.yaw;
          if(typeof(that.rosPreviewResults.yaw) == 'string') {
            yaw = JSON.parse(that.rosPreviewResults.yaw);
          }
          res.results[0].yaw = yaw; 
        }
        if(that.rosPreviewResults && that.rosPreviewResults.fix) {
          var fix = that.rosPreviewResults.fix;
          if(typeof(that.rosPreviewResults.fix) == 'string') {
            fix = JSON.parse(that.rosPreviewResults.fix);
          }
          if(fix && fix.longitude) {
            res.results[0].longitude = fix.longitude; 
          }
          if(fix && fix.latitude) {
            res.results[0].latitude = fix.latitude; 
          }
        }
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(res));
        break;
      default:
        this.renderFiles (request, response);
    }
  }

  vidteq._nodeServer.prototype.processIntrinsicRoslaunch = function(opt,cb) {
    //roslaunch zed_cpu_ros camera_calibration.launch 
    //config_file_location:=/usr/src/gazeros/catkin_ws/src/zed_cpu_ros/config/SN000016716.conf 
    //device_index:=/dev/v4l/by-path/pci-0000:0e:00.0-usb-0:4:1.0-video-index0 
    //resolution:=1 frame_rate:=15 
    //use_zed_config:=true camera_namespace:=frontNear
    const spawn = require('child_process').spawn; 
    var intBoardMatrix = intSquareSize = calibSide = deviceIndex = namespace = cfgLocation = "";       
    if(opt && opt.intBoardMatrix) { intBoardMatrix = opt.intBoardMatrix; }
    if(opt && opt.intSquareSize) { intSquareSize = opt.intSquareSize; }
    if(opt && opt.calibSide) { calibSide = opt.calibSide; }    
    if(calibSide == "frontNear") {
      deviceIndex = "/dev/v4l/by-path/pci-0000:0e:00.0-usb-0:4:1.0-video-index0 ";      
      cfgLocation = "$(find zed_cpu_ros)/config/SN000016716.conf";
    } else if(calibSide == "sideRight") {
      deviceIndex = "/dev/v4l/by-path/pci-0000:10:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation = "$(find zed_cpu_ros)/config/SN000016717.conf";
    } else if(calibSide == "sideLeft") {
      deviceIndex = "/dev/v4l/by-path/pci-0000:04:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation = "$(find zed_cpu_ros)/config/SN000016718.conf";
    } else if(calibSide == "rearNear") {
      deviceIndex = "/dev/v4l/by-path/pci-0000:06:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation = "$(find zed_cpu_ros)/config/SN0000014527.conf";
    } else if(calibSide == "vidteq") {
      deviceIndex = "";      
      cfgLocation = "$(find zed_cpu_ros)/config/SN0000014970.conf";
    }    


    var that = this;
    var str = 'roslaunch';
    //var arg = ['/usr/src/gazeros/catkin_ws/src/usb_cam/launch/usb_cam-mulmy.launch'];
    var arg = ['zed_cpu_ros','camera_calibration.launch','resolution:=1','frame_rate:=15','use_zed_config:=true'];
    if(calibSide != "") {
      arg.push("camera_namespace:="+calibSide);
    }
    if(deviceIndex != "") {
      arg.push("device_index:="+deviceIndex);
    }
    if(cfgLocation != "") {
      arg.push("config_file_location:="+cfgLocation);
    }
    if(intBoardMatrix != "") {
      arg.push("size:="+intBoardMatrix);
    }
    if(intSquareSize != "") {
      arg.push("square:="+intSquareSize);
    }
    console.log(arg);
    var showCamCount = 0;
    opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
    opt['roslaunch'+showCamCount].on('error', function(err) {
      console.log('Failed to start child process.');
    });
    console.log("roslaunch started");             
    if(cb) cb();
  }

  vidteq._nodeServer.prototype.processCameraExtRoslaunch = function(opt,cb) {    
    const spawn = require('child_process').spawn; 
    var camera1 = camera2 = "";    
    var camera2ExtrinsicMarkers = camera2ExtrinsicS1_Length1 = "";
    var camera2ExtrinsicS2_Breadth1 = camera2ExtrinsicBWAL_B11 = "";
    var camera2ExtrinsicBWAB_B21 = camera2Extrinsiceloam_e1 = camera2Extrinsicms = "";
    if(opt && opt.camera1) { camera1 = opt.camera1; }
    if(opt && opt.camera2) { camera2 = opt.camera2; }
    if(opt && opt.camera2ExtrinsicMarkers) { camera2ExtrinsicMarkers = opt.camera2ExtrinsicMarkers; }
    if(opt && opt.camera2ExtrinsicS1_Length1) { camera2ExtrinsicS1_Length1 = opt.camera2ExtrinsicS1_Length1; }
    if(opt && opt.camera2ExtrinsicS2_Breadth1) { camera2ExtrinsicS2_Breadth1 = opt.camera2ExtrinsicS2_Breadth1; }
    if(opt && opt.camera2ExtrinsicBWAL_B11) { camera2ExtrinsicBWAL_B11 = opt.camera2ExtrinsicBWAL_B11; }
    if(opt && opt.camera2ExtrinsicBWAB_B21) { camera2ExtrinsicBWAB_B21 = opt.camera2ExtrinsicBWAB_B21; }
    if(opt && opt.camera2Extrinsiceloam_e1) { camera2Extrinsiceloam_e1 = opt.camera2Extrinsiceloam_e1; }
    if(opt && opt.camera2Extrinsicms) { camera2Extrinsicms = opt.camera2Extrinsicms; }

    var num_of_markers1 = num_of_markers2 = camera2ExtrinsicMarkers;    
    var marker_size1 = marker_size2 = camera2Extrinsicms;

    var camera_name1 = "";
    var image_raw_topic1 = "/"+camera1+"/left/image_raw";
    var config_file_location1 = "/usr/local/bin/gazebin/"+camera1+"_left.ini";      
    var camera_info_topic1 = "/"+camera1+"/left/camera_info"; 
    var deviceIndex1 = cfgLocation1 = "";  
    var child_topic1 = "frontNear";     
    if(camera1 == "frontNear") {
      camera_name1 = camera1 + "RTC";  
      deviceIndex1 = "/dev/v4l/by-path/pci-0000:0e:00.0-usb-0:4:1.0-video-index0 ";      
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN000016716.conf";    
      child_topic1 = "frontNear";
    } else if(camera1 == "sideRight") {
      camera_name1 = camera1 + "RT";      
      deviceIndex1 = "/dev/v4l/by-path/pci-0000:10:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN000016717.conf";  
      child_topic1 = "frontNear";  
    } else if(camera1 == "sideLeft") {
      camera_name1 = camera1 + "RT";      
      deviceIndex1 = "/dev/v4l/by-path/pci-0000:04:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN000016718.conf";    
      child_topic1 = "frontNear";
    } else if(camera1 == "rearNear") {
      camera_name1 = camera1 + "RTC";      
      deviceIndex1 = "/dev/v4l/by-path/pci-0000:06:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN0000014527.conf";    
      child_topic1 = "rearNear";
    } else if(camera1 == "vidteq") {
      camera_name1 = camera1 + "RT";      
      deviceIndex1 = "";
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN0000014970.conf";       
      child_topic1 = "vidteq";
    }     

    var camera_name2 = "";
    var image_raw_topic2 = "/"+camera2+"/left/image_raw";
    var config_file_location2 = "/usr/local/bin/gazebin/"+camera2+"_left.ini";
    var camera_info_topic2 = "/"+camera2+"/left/camera_info";
    var deviceIndex2 = cfgLocation2 = "";    
    var child_topic2 = "frontNear";
    if(camera2 == "frontNear") {      
      camera_name2 = camera2 + "RTC";  
      deviceIndex2 = "/dev/v4l/by-path/pci-0000:0e:00.0-usb-0:4:1.0-video-index0 ";      
      cfgLocation2 = "$(find zed_cpu_ros)/config/SN000016716.conf";      
      child_topic2 = "frontNear";
    } else if(camera2 == "sideRight") {
      camera_name2 = camera2 + "RT";      
      deviceIndex2 = "/dev/v4l/by-path/pci-0000:10:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation2 = "$(find zed_cpu_ros)/config/SN000016717.conf";   
      child_topic2 = "frontNear";
    } else if(camera2 == "sideLeft") {
      camera_name2 = camera2 + "RT";      
      deviceIndex2 = "/dev/v4l/by-path/pci-0000:04:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation2 = "$(find zed_cpu_ros)/config/SN000016718.conf";    
      child_topic2 = "frontNear";
    } else if(camera2 == "rearNear") {
      camera_name2 = camera2 + "RTC";      
      deviceIndex2 = "/dev/v4l/by-path/pci-0000:06:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation2 = "$(find zed_cpu_ros)/config/SN0000014527.conf";   
      child_topic2 = "rearNear";
    } else if(camera2 == "vidteq") {
      camera_name2 = camera2 + "RT";      
      deviceIndex2 = "";
      cfgLocation2 = "$(find zed_cpu_ros)/config/SN0000014970.conf";    
      child_topic2 = "vidteq";
    } 

    var that = this;
    var str = 'roslaunch';
    var arg = ['usb_cam','usb_cam-test.launch','config_file_location:='+cfgLocation1
      ,'resolution:=1','frame_rate:=15','use_zed_config:=false','device_index:='+deviceIndex1
      ,'camera_namespace:='+camera1,'camera_name:='+camera1,'framerate:=15'
      ,'frame_id:=zed','video_device:='+deviceIndex1
      ,'child_topic:='+child_topic1,'calib_file:='+camera_name1];  

    console.log(arg);
    var showCamCount = 0;
    opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
    opt['roslaunch'+showCamCount].on('error', function(err) {
      console.log('Failed to start child process.');
    });
    console.log("roslaunch started");             
    var that = this;
    this.waitAndProcess(function () {  
      var str = 'roslaunch';
      var arg = ['usb_cam','usb_cam-test.launch','config_file_location:='+cfgLocation2
        ,'resolution:=1','frame_rate:=15','use_zed_config:=false','device_index:='+deviceIndex2
        ,'camera_namespace:='+camera2,'camera_name:='+camera2,'framerate:=15'
        ,'frame_id:=zed','video_device:='+deviceIndex2
        ,'child_topic:='+child_topic2,'calib_file:='+camera_name2];

      console.log(arg);
      showCamCount = 1;
      opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
      opt['roslaunch'+showCamCount].on('error', function(err) {
        console.log('Failed to start child process.');
      });
      console.log("roslaunch started");             
     
      that.waitAndProcess(function () {  
        var str = 'roslaunch';
        var arg = ['camera_camera_calibration','find_camera.launch'
          ,'image_raw_topic1:='+image_raw_topic1      
          ,"config_file_location1:="+config_file_location1,'camera_name1:='+camera_name1
          ,'camera_info_topic1:='+camera_info_topic1,'num_of_markers1:='+num_of_markers1
          ,'marker_size1:='+marker_size1

          ,'no_of_markers:='+camera2ExtrinsicMarkers
          ,'length_S1_1:='+camera2ExtrinsicS1_Length1
          ,'breadth_S2_1:='+camera2ExtrinsicS2_Breadth1
          ,'border_width_along_length_b1_1:='+camera2ExtrinsicBWAL_B11
          ,'border_width_along_breadth_b2_1:='+camera2ExtrinsicBWAB_B21
          ,'edge_length_of_ArUco_marker_e_1:='+camera2Extrinsiceloam_e1

          ,'image_raw_topic2:='+image_raw_topic2
          ,"config_file_location2:="+config_file_location2,'camera_name2:='+camera_name2
          ,'camera_info_topic2:='+camera_info_topic2,'num_of_markers2:='+num_of_markers2
          ,'marker_size2:='+marker_size2
          
          ,'length_S1_2:='+camera2ExtrinsicS1_Length1
          ,'breadth_S2_2:='+camera2ExtrinsicS2_Breadth1
          ,'border_width_along_length_b1_2:='+camera2ExtrinsicBWAL_B11
          ,'border_width_along_breadth_b2_2:='+camera2ExtrinsicBWAB_B21
          ,'edge_length_of_ArUco_marker_e_2:='+camera2Extrinsiceloam_e1
        ];  

        console.log(arg);
        showCamCount = 2;
        opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
        opt['roslaunch'+showCamCount].on('error', function(err) {
          console.log('Failed to start child process.');
        });
        console.log("roslaunch started");             
        if(cb) cb();
      });    
    });
  }

  vidteq._nodeServer.prototype.processLidarExtRoslaunch = function(opt,cb) {    
    const spawn = require('child_process').spawn; 
    var camera1 = "";    
    var camera3ExtrinsicMarkers = camera3ExtrinsicS1_Length1 = "";
    var camera3ExtrinsicS2_Breadth1 = camera3ExtrinsicBWAL_B11 = "";
    var camera3ExtrinsicBWAB_B21 = camera3Extrinsiceloam_e1 = camera3Extrinsicms = "";
    var extXPlus = extXMinus = extYPlus = extYMinus = extZPlus = extZMinus = extroilidarX = "";
    var extroilidarY = extroilidarZ = extMaxIt = extLidarIntensity = "";
    if(opt && opt.camera3) { camera1 = opt.camera3; }    
    if(opt && opt.camera3ExtrinsicMarkers) { camera3ExtrinsicMarkers = opt.camera3ExtrinsicMarkers; }
    if(opt && opt.camera3ExtrinsicS1_Length1) { camera3ExtrinsicS1_Length1 = opt.camera3ExtrinsicS1_Length1; }
    if(opt && opt.camera3ExtrinsicS2_Breadth1) { camera3ExtrinsicS2_Breadth1 = opt.camera3ExtrinsicS2_Breadth1; }
    if(opt && opt.camera3ExtrinsicBWAL_B11) { camera3ExtrinsicBWAL_B11 = opt.camera3ExtrinsicBWAL_B11; }
    if(opt && opt.camera3ExtrinsicBWAB_B21) { camera3ExtrinsicBWAB_B21 = opt.camera3ExtrinsicBWAB_B21; }
    if(opt && opt.camera3Extrinsiceloam_e1) { camera3Extrinsiceloam_e1 = opt.camera3Extrinsiceloam_e1; }
    if(opt && opt.camera3Extrinsicms) { camera3Extrinsicms = opt.camera3Extrinsicms; }

    if(opt && opt.extXPlus) { extXPlus = opt.extXPlus; }
    if(opt && opt.extXMinus) { extXMinus = opt.extXMinus; }
    if(opt && opt.extYPlus) { extYPlus = opt.extYPlus; }
    if(opt && opt.extYMinus) { extYMinus = opt.extYMinus; }
    if(opt && opt.extZPlus) { extZPlus = opt.extZPlus; }
    if(opt && opt.extZMinus) { extZMinus = opt.extZMinus; }
    if(opt && opt.extroilidarX) { extroilidarX = opt.extroilidarX; }
    if(opt && opt.extroilidarY) { extroilidarY = opt.extroilidarY; }
    if(opt && opt.extroilidarZ) { extroilidarZ = opt.extroilidarZ; }
    if(opt && opt.extMaxIt) { extMaxIt = opt.extMaxIt; }
    if(opt && opt.extLidarIntensity) { extLidarIntensity = opt.extLidarIntensity; }    

    var num_of_markers1 = camera3ExtrinsicMarkers;    
    var marker_size1 = camera3Extrinsicms;

    var camera_name1 = "";
    var image_raw_topic1 = "/"+camera1+"/left/image_raw";
    var config_file_location1 = "/usr/local/bin/gazebin/"+camera1+"_left.ini";      
    var camera_info_topic1 = "/"+camera1+"/left/camera_info"; 
    var deviceIndex1 = cfgLocation1 = "";  
    var child_topic1 = "frontNear";     
    if(camera1 == "frontNear") {
      camera_name1 = camera1 + "RTC";  
      deviceIndex1 = "/dev/v4l/by-path/pci-0000:0e:00.0-usb-0:4:1.0-video-index0 ";      
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN000016716.conf";    
      child_topic1 = "frontNear";
    } else if(camera1 == "sideRight") {
      camera_name1 = camera1 + "RT";      
      deviceIndex1 = "/dev/v4l/by-path/pci-0000:10:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN000016717.conf";  
      child_topic1 = "frontNear";  
    } else if(camera1 == "sideLeft") {
      camera_name1 = camera1 + "RT";      
      deviceIndex1 = "/dev/v4l/by-path/pci-0000:04:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN000016718.conf";    
      child_topic1 = "frontNear";
    } else if(camera1 == "rearNear") {
      camera_name1 = camera1 + "RTC";      
      deviceIndex1 = "/dev/v4l/by-path/pci-0000:06:00.0-usb-0:4:1.0-video-index0";      
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN0000014527.conf";    
      child_topic1 = "rearNear";
    } else if(camera1 == "vidteq") {
      camera_name1 = camera1 + "RT";      
      deviceIndex1 = "";
      cfgLocation1 = "$(find zed_cpu_ros)/config/SN0000014970.conf";       
      child_topic1 = "vidteq";
    }         

    var that = this;
    var str = 'roslaunch';
    var arg = ['usb_cam','usb_cam-test.launch','config_file_location:='+cfgLocation1
      ,'resolution:=1','frame_rate:=15','use_zed_config:=false','device_index:='+deviceIndex1
      ,'camera_namespace:='+camera1,'camera_name:='+camera1,'framerate:=15'
      ,'frame_id:=zed','video_device:='+deviceIndex1
      ,'child_topic:='+child_topic1,'calib_file:='+camera_name1];  

    console.log(arg);
    var showCamCount = 0;
    opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
    opt['roslaunch'+showCamCount].on('error', function(err) {
      console.log('Failed to start child process.');
    });
    console.log("roslaunch started");             
    var that = this;
    this.waitAndProcess(function () {  
      var str = 'roslaunch';
      var arg = ['velodyne_pointcloud','VLP16_points.launch'
        ,'child_topic:='+child_topic1,'calib_file:=lidarRT'];

      console.log(arg);
      showCamCount = 1;
      opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
      opt['roslaunch'+showCamCount].on('error', function(err) {
        console.log('Failed to start child process.');
      });
      console.log("roslaunch started");             
     
      that.waitAndProcess(function () { 
        var str = 'roslaunch';
        var arg = ['lidar_camera_calibration','find_transform.launch'
          ,'image_raw_topic:='+image_raw_topic1      
          ,"config_file_location:="+config_file_location1,'camera_name:='+camera_name1
          ,'camera_name_ini:='+camera1,'num_of_markers:='+num_of_markers1
          ,'marker_size:='+marker_size1

          ,'no_of_markers:='+camera3ExtrinsicMarkers
          ,'length_S1_1:='+camera3ExtrinsicS1_Length1
          ,'breadth_S2_1:='+camera3ExtrinsicS2_Breadth1
          ,'border_width_along_length_b1_1:='+camera3ExtrinsicBWAL_B11
          ,'border_width_along_breadth_b2_1:='+camera3ExtrinsicBWAB_B21
          ,'edge_length_of_ArUco_marker_e_1:='+camera3Extrinsiceloam_e1
          
          ,'length_S1_2:='+camera3ExtrinsicS1_Length1
          ,'breadth_S2_2:='+camera3ExtrinsicS2_Breadth1
          ,'border_width_along_length_b1_2:='+camera3ExtrinsicBWAL_B11
          ,'border_width_along_breadth_b2_2:='+camera3ExtrinsicBWAB_B21
          ,'edge_length_of_ArUco_marker_e_2:='+camera3Extrinsiceloam_e1 
    
          ,"extXPlus:="+extXPlus
          ,"extXMinus:="+extXMinus
          ,"extYPlus:="+extYPlus
          ,"extYMinus:="+extYMinus
          ,"extZPlus:="+extZPlus
          ,"extZMinus:="+extZMinus
          ,"extroilidarX:="+extroilidarX
          ,"extroilidarY:="+extroilidarY
          ,"extroilidarZ:="+extroilidarZ
          ,"extMaxIt:="+extMaxIt
          ,"extLidarIntensity:="+extLidarIntensity

        ];  

        console.log(arg);
        showCamCount = 2;
        opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
        opt['roslaunch'+showCamCount].on('error', function(err) {
          console.log('Failed to start child process.');
        });
        console.log("roslaunch started");             
        if(cb) cb();
      });    
    });
  }

  vidteq._nodeServer.prototype.processRoslaunch = function(opt,showCamCount,cameraWidth,cameraHeight,cameraFPS,cb) {
    const spawn = require('child_process').spawn;        
    var cameraCount = 0;
    if(opt && opt.cameraCount) { cameraCount = opt.cameraCount; }
    if(opt && opt.listCameraDev) { listCameraDev = opt.listCameraDev; }
    var that = this;
    var str = 'roslaunch';
    //var arg = ['/usr/src/gazeros/catkin_ws/src/usb_cam/launch/usb_cam-mulmy.launch'];
    var arg = ['/usr/local/bin/gazebin/ros/src/usb_cam-mulmy.launch'];
    console.log(arg);
    opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
    opt['roslaunch'+showCamCount].on('error', function(err) {
      console.log('Failed to start child process.');
    });
    console.log("roslaunch started");             
    if(cb) cb();
  }

  vidteq._nodeServer.prototype.cacheRosTopics = function() {
    var that = this;
    //if(!this.rosnodejs.ok()) {
    //this.rosnodejs.reset();
    //}
    //const nh = this.rosnodejs.nh;
    //const callback = function(msg) {
    //  console.log(msg.data);
    //}
    //const sub = nh.subscribe('/imu/yaw', 'std_msgs/Float32', callback);
    //const callback1 = function(msg) {
    //  console.log(msg.data);
    //}
    //const sub1 = nh.subscribe('/gps/fix', 'sensor_msgs/NavSatFix', callback1);
    //console.log(sub1.getNumPublishers());
    ////if(sub1.getNumPublishers() < 0) {
    ////  sub1.shutdown();
    ////}
    //console.log("sub "+sub.getNumPublishers());
    ////if(sub.getNumPublishers() < 0) {
    ////  sub.shutdown();
    ////}
    //console.log("shutdwn "+this.rosnodejs.ok());

    if(this.rosStarted) {
      //console.log("cacheRosTopics if ");
      //,{ onTheFly: true })
      this.rosnodejs.initNode('/imu/yaw','/gps/fix','/sideRight/left/image_raw','/sideLeft/left/image_raw','/rearNear/left/image_raw','/frontNear/left/image_raw')
      .then((rosNode) => {
        if(typeof(that.yawFound) == 'undefined') that.yawFound = false;
        if(!that.yawFound) {
          that.yawFound = true;
          const sub = rosNode.subscribe('/imu/yaw', 'std_msgs/Float32', (msg) => {
            //console.log('Got msg on chatter: %j', msg);
            //{"data":166.151611328125}
            that.rosPreviewResults.yaw = msg; 
            that.yawFound = false;
          });
        }
      
        if(typeof(that.fixFound) == 'undefined') that.fixFound = false;
        if(!that.fixFound) {
          that.fixFound = true;
          const sub1 = rosNode.subscribe('/gps/fix', 'sensor_msgs/NavSatFix', (msg) => {
            //console.log('Got fix msg on chatter: %j', msg);
            that.rosPreviewResults.fix = msg;
            //{"header":{"seq":6390,"stamp":{"secs":1527744994,"nsecs":450106000},"frame_id":"Advanced Navigation Spatial"},"status":{"status":1,"service":1},"latitude":12.969199357658672,"longitude":77.64145511743017,"altitude":813.9320678710938,"position_covariance":[1.5859709842698635,0,0,0,1.585973686550247,0,0,0,0.2991624989610955],"position_covariance_type":2}
            that.fixFound = false;
          });
        }

//        const sub2 = rosNode.subscribe('/sideRight/left/image_raw', 'sensor_msgs/Image', (msg) => {
//          //console.log('Got msg on chatter: %j', msg);
//          //{"data":166.151611328125}
//          //console.log(msg.height);         
//          var fs = require('fs')
//          var jpg = require('libjpeg').Jpeg;
//          //if(!that.fiximage) { 
//            var jpeg = new jpg(msg.data, msg.width, msg.height, 'rgb');
//            var jpeg_image = jpeg.encodeSync();
//            var base64Image = new Buffer(jpeg_image, 'binary').toString('base64');
//            if(typeof(that.sideRightCount) == 'undefined') {
//              that.sideRightCount = 0;
//            }
//            var fol = "/tmp/sideRightRos";
//            if (!fs.existsSync(fol)) {
//              fs.mkdirSync(fol,{mode:'777'});
//            }
//            const sharp = require('sharp');
//                        sharp(jpeg_image)
//              .resize(320,240)
//              .toBuffer()
//              .then( data => {
//              var fSR = fol+"/sideRightRos"+that.sideRightCount+".jpg";
//              fs.writeFileSync(fSR,data,{mode:'777'});
//              that.sideRightCount++;
//              if(that.sideRightCount > 30) { that.sideRightCount = 0; }
//            })
//            .catch( err => {} );
//            //var fSR = fol+"/sideRightRos"+that.sideRightCount+".jpg";
//            //fs.writeFileSync(fSR,jpeg_image,{mode:'777'});
//            //that.sideRightCount++;
//            //if(that.sideRightCount > 30) { that.sideRightCount = 0; }
//            
//
//            //var resizeImage = require('resize-image');
//            //var data = resizeImage.resize(base64Image, 320, 240, resizeImage.PNG);
//            //that.rosPreviewResults.sideRight = data; 
//
//            //var img = new Image();
//            //img.onload= function () {
//            //  console.log(data);
//            //  that.rosPreviewResults.sideRight = data; 
//            //};
//            //img.src = base64Image; // local image url
//
//
//           // base64Image.resize(200, 200, function(err, image){
//    // encode resized image to jpeg and get a Buffer object
//    //image.toBuffer('jpg', function(err, buffer){
//    //    // save buffer to disk / send over network / etc.
//    //});
////});
//            //var h = "<html><body>" + "<img src=\"data:image/jpg;base64," + base64Image + "\" />" + "</body></html>";
//            //fs.writeFileSync("/tmp/1.html",h,{mode:'777'});
//            //fs.writeFileSync("/tmp/1.jpg",jpeg_image,{mode:'777'});
//            //that.fiximage = true; 
//          //}
//          //that.rosPreviewResults.sideRight = base64Image; 
//        });
//        const sub3 = rosNode.subscribe('/sideLeft/left/image_raw', 'sensor_msgs/Image', (msg) => {
//          //console.log('Got msg on chatter: %j', msg);
//          //{"data":166.151611328125}
//          //that.rosPreviewResults.sideLeft = msg; 
//          var fs = require('fs')
//          var jpg = require('libjpeg').Jpeg;
//          //if(!that.fiximage) { 
//            var jpeg = new jpg(msg.data, msg.width, msg.height, 'rgb');
//            var jpeg_image = jpeg.encodeSync();
//            var base64Image = new Buffer(jpeg_image, 'binary').toString('base64');
//            if(typeof(that.sideLeftCount) == 'undefined') {
//              that.sideLeftCount = 0;
//            }
//            var fol = "/tmp/sideLeftRos";
//            if (!fs.existsSync(fol)) {
//              fs.mkdirSync(fol,{mode:'777'});
//            }
//            const sharp = require('sharp');
//                        sharp(jpeg_image)
//              .resize(320,240)
//              .toBuffer()
//              .then( data => {
//              var fSL = fol+"/sideLeftRos"+that.sideLeftCount+".jpg";
//              fs.writeFileSync(fSL,data,{mode:'777'});
//              that.sideLeftCount++;
//              if(that.sideLeftCount > 30) { that.sideLeftCount = 0; }
//            })
//            .catch( err => {} );
//            //var fSL = fol+"/sideLeftRos"+that.sideLeftCount+".jpg";
//            //fs.writeFileSync(fSL,jpeg_image,{mode:'777'});
//            //that.sideLeftCount++;
//            //if(that.sideLeftCount > 30) { that.sideLeftCount = 0; }
//            //var h = "<html><body>" + "<img src=\"data:image/jpg;base64," + base64Image + "\" />" + "</body></html>";
//            //fs.writeFileSync("/tmp/1.html",h,{mode:'777'});
//            //fs.writeFileSync("/tmp/1.jpg",jpeg_image,{mode:'777'});
//            //that.fiximage = true; 
//          //}
//          //that.rosPreviewResults.sideLeft = base64Image; 
//        });
//        const sub4 = rosNode.subscribe('/rearNear/left/image_raw', 'sensor_msgs/Image', (msg) => {
//          //console.log('Got msg on chatter: %j', msg);
//          //{"data":166.151611328125}
//          //that.rosPreviewResults.rearNear = msg; 
//          var fs = require('fs')
//          var jpg = require('libjpeg').Jpeg;
//          //if(!that.fiximage) { 
//            var jpeg = new jpg(msg.data, msg.width, msg.height, 'rgb');
//            var jpeg_image = jpeg.encodeSync();
//            var base64Image = new Buffer(jpeg_image, 'binary').toString('base64');
//            if(typeof(that.rearNearCount) == 'undefined') {
//              that.rearNearCount = 0;
//            }
//            var fol = "/tmp/rearNearRos";
//            if (!fs.existsSync(fol)) {
//              fs.mkdirSync(fol,{mode:'777'});
//            }
//            const sharp = require('sharp');
//                        sharp(jpeg_image)
//              .resize(320,240)
//              .toBuffer()
//              .then( data => {
//              var fRN = fol+"/rearNearRos"+that.rearNearCount+".jpg";
//              fs.writeFileSync(fRN,data,{mode:'777'});
//              that.rearNearCount++;
//              if(that.rearNearCount > 30) { that.rearNearCount = 0; }
//            })
//            .catch( err => {} );
//            //var fRN = fol+"/rearNearRos"+that.rearNearCount+".jpg";
//            //fs.writeFileSync(fRN,jpeg_image,{mode:'777'});
//            //that.rearNearCount++;
//            //if(that.rearNearCount > 30) { that.rearNearCount = 0; }
//            //var h = "<html><body>" + "<img src=\"data:image/jpg;base64," + base64Image + "\" />" + "</body></html>";
//            //fs.writeFileSync("/tmp/1.html",h,{mode:'777'});
//            //fs.writeFileSync("/tmp/1.jpg",jpeg_image,{mode:'777'});
//            //that.fiximage = true; 
//          //}
//         // that.rosPreviewResults.rearNear = base64Image; 
//        });
//        const sub5 = rosNode.subscribe('/frontNear/left/image_raw', 'sensor_msgs/Image', (msg) => {
//          //console.log('Got msg on chatter: %j', msg);
//          //{"data":166.151611328125}
//          //that.rosPreviewResults.frontNear = msg; 
//          var fs = require('fs')
//          var jpg = require('libjpeg').Jpeg;
//          //if(!that.fiximage) { 
//            var jpeg = new jpg(msg.data, msg.width, msg.height, 'rgb');
//            var jpeg_image = jpeg.encodeSync();
//            var base64Image = new Buffer(jpeg_image, 'binary').toString('base64');
//            if(typeof(that.frontNearCount) == 'undefined') {
//              that.frontNearCount = 0;
//            }
//            var fol = "/tmp/frontNearRos";
//            if (!fs.existsSync(fol)) {
//              fs.mkdirSync(fol,{mode:'777'});
//            }
//            const sharp = require('sharp');
//                        sharp(jpeg_image)
//              .resize(320,240)
//              .toBuffer()
//              .then( data => {
//              var fFN = fol+"/frontNearRos"+that.frontNearCount+".jpg";
//              fs.writeFileSync(fFN,data,{mode:'777'});
//              that.frontNearCount++;
//              if(that.frontNearCount > 30) { that.frontNearCount = 0; }
//            })
//            .catch( err => {} );
//
//            //var fFN = fol+"/frontNearRos"+that.frontNearCount+".jpg";
//            //fs.writeFileSync(fFN,jpeg_image,{mode:'777'});
//            //that.frontNearCount++;
//            //if(that.frontNearCount > 30) { that.frontNearCount = 0; }
//            //var h = "<html><body>" + "<img src=\"data:image/jpg;base64," + base64Image + "\" />" + "</body></html>";
//            //fs.writeFileSync("/tmp/1.html",h,{mode:'777'});
//            //fs.writeFileSync("/tmp/1.jpg",jpeg_image,{mode:'777'});
//            //that.fiximage = true; 
//          //}
//          //that.rosPreviewResults.frontNear = base64Image; 
//        });
      });
      //const nh = this.rosnodejs.nh;
      //const callback = function(msg) {
      //  console.log(msg.data);
      //}
      //console.log(nh);
      ////const sub = nh.subscribe('/imu/yaw', 'std_msgs/Float32', callback);
    } else {
      //console.log("cacheRosTopics if else");
      this.rosnodejs.reset();
      if(!this.rosnodejs.ok()) {
        this.rosStarted = true;
      }
      //this.rosnodejs = require('rosnodejs');
      this.rosPreviewResults = {
        yaw:''
        ,fix:''
        ,sideLeft:''
        ,sideRight:''
        ,rearNear:''
        ,frontNear:''
      };
    }
    //response.setHeader('Content-type' , 'text/json');
    //response.end(JSON.stringify(results));
  }

  vidteq._nodeServer.prototype.previewRos = function(opt,cb) {
    const spawn = require('child_process').spawn;        
    var that = this;
    var str = '/usr/local/bin/gazebin/rospackviewer';
    var arg = [];
    //console.log(arg);
    opt['rospackviewer'] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
    opt['rospackviewer'].on('error', function(err) {
      console.log('Failed to start child process.');
    });
    //console.log("rospackviewer started");             
    if(cb) cb();
  }

  vidteq._nodeServer.prototype.processRosBag = function(opt,cb) {
    const spawn = require('child_process').spawn;        
    const exec = require('child_process').exec;        
    //console.log("inside saveRos ");
    var cameraCount = 0;
    var gpsCount = 0;
    var lidarCount = 0;
    if(opt && opt.cameraCount) { cameraCount = opt.cameraCount; }
    if(opt && opt.gpsCount) { gpsCount = opt.gpsCount; }
    if(opt && opt.lidarCount) { lidarCount = opt.lidarCount; }
    if(opt && opt.saveRosArr) { saveRosArr = opt.saveRosArr; }
    var city_name = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.city_name && opt.rosCfgFormat.city_name.val) {
      city_name = opt.rosCfgFormat.city_name.val;
    }
    var primaryStorage_All = "";
    //console.log( opt.rosCfgFormat.primaryStorage_All );
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.primaryStorage_All && opt.rosCfgFormat.primaryStorage_All.val) {
      primaryStorage_All = opt.rosCfgFormat.primaryStorage_All.val;
    }
    var secondaryStorage_All = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.secondaryStorage_All && opt.rosCfgFormat.secondaryStorage_All.val) {
      secondaryStorage_All = opt.rosCfgFormat.secondaryStorage_All.val;
    }
    var thirdStorage_All = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.thirdStorage_All && opt.rosCfgFormat.thirdStorage_All.val) {
      thirdStorage_All = opt.rosCfgFormat.thirdStorage_All.val;
    }
    var fourthStorage_All = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.fourthStorage_All && opt.rosCfgFormat.fourthStorage_All.val) {
      fourthStorage_All = opt.rosCfgFormat.fourthStorage_All.val;
    }
    var primaryStorage_video01 = "";
    //console.log( opt.rosCfgFormat.primaryStorage_video01 );
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.primaryStorage_video01 && opt.rosCfgFormat.primaryStorage_video01.val) {
      primaryStorage_video01 = opt.rosCfgFormat.primaryStorage_video01.val;
    }
    var secondaryStorage_video01 = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.secondaryStorage_video01 && opt.rosCfgFormat.secondaryStorage_video01.val) {
      secondaryStorage_video01 = opt.rosCfgFormat.secondaryStorage_video01.val;
    }
    var primaryStorage_video23 = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.primaryStorage_video23 && opt.rosCfgFormat.primaryStorage_video23.val) {
      primaryStorage_video23 = opt.rosCfgFormat.primaryStorage_video23.val;
    }
    var secondaryStorage_video23 = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.secondaryStorage_video23 && opt.rosCfgFormat.secondaryStorage_video23.val) {
      secondaryStorage_video23 = opt.rosCfgFormat.secondaryStorage_video23.val;
    }
    var primaryStorage_lidargps = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.primaryStorage_lidargps && opt.rosCfgFormat.primaryStorage_lidargps.val) {
      primaryStorage_lidargps = opt.rosCfgFormat.primaryStorage_lidargps.val;
    }
    var secondaryStorage_lidargps = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.secondaryStorage_lidargps && opt.rosCfgFormat.secondaryStorage_lidargps.val) {
      secondaryStorage_lidargps = opt.rosCfgFormat.secondaryStorage_lidargps.val;
    }
    //console.log("save has been started");
    //console.log(cameraCount,saveRosArr,city_name,primaryStorage_All,secondaryStorage_All,thirdStorage_All,fourthStorage_All,primaryStorage_video01,secondaryStorage_video01,primaryStorage_video23,secondaryStorage_video23,primaryStorage_lidargps,secondaryStorage_lidargps);

    var that = this;
    var str = 'roslaunch';
    //var arg = ['/usr/src/gazeros/catkin_ws/src/usb_cam/launch/allRosBagRecord.launch'];
    var arg = ['/usr/local/bin/gazebin/ros/src/allRosBagRecord.launch'];
    if(primaryStorage_All) {
      arg.push("primary_storage:="+primaryStorage_All+"_"+city_name);
    }
    if(secondaryStorage_All) {
      arg.push("secondary_storage:="+secondaryStorage_All+"_"+city_name);
    }
    if(thirdStorage_All) {
      arg.push("third_storage:="+thirdStorage_All+"_"+city_name);
    }
    //if(cameraCount > 0) {
    //  for ( var i = 0; i < cameraCount; i++ ) {
    //    if(i == 0) {
    //      arg.push("primary_storage:="+primaryStorage_All+"_"+city_name);
    //    } else if(i == 2) {
    //      arg.push("secondary_storage:="+secondaryStorage_All+"_"+city_name);
    //    }
    //  }
    //}
    //var primary_topics = "";
    //var secondary_topics = "";
    //exec('rostopic list', (err, stdout, stderr) => {
    //  //console.log(stdout);
    //  var topics = stdout.split("\n");
    //  console.log(topics);
    //  for(var i in topics) {
    //    if(
    //       topics[i]=="/lidar/velodyne_points" ||
    //       topics[i]=="/imu/data" ||

    //       topics[i]=="/frontNear/left/image_raw" ||
    //       topics[i]=="/frontNear/left/camera_info" ||
    //       topics[i]=="/frontNear/right/image_raw" ||
    //       topics[i]=="/frontNear/right/camera_info" ||

    //       topics[i]=="/sideRight/left/image_raw" ||
    //       topics[i]=="/sideRight/left/camera_info" ||
    //       topics[i]=="/sideRight/right/image_raw" ||
    //       topics[i]=="/sideRight/right/camera_info" 
    //      ) {
    //      primary_topics +=topics[i] + " ";
    //    } else if(
    //       topics[i]=="/gps/fix" ||
    //       topics[i]=="/imu/mag" || 

    //       topics[i]=="/sideLeft/left/image_raw" ||
    //       topics[i]=="/sideLeft/left/camera_info" ||
    //       topics[i]=="/sideLeft/right/image_raw" ||
    //       topics[i]=="/sideLeft/right/camera_info" ||

    //       topics[i]=="/rearNear/left/image_raw" ||
    //       topics[i]=="/rearNear/left/camera_info" ||
    //       topics[i]=="/rearNear/right/image_raw" ||
    //       topics[i]=="/rearNear/right/camera_info"
    //    ) {
    //      secondary_topics += topics[i] + " ";
    //    }
    //  }  
    //  if(primary_topics != "" && secondary_topics != "") {
    //    arg.push("primary_topics:="+primary_topics);
    //    arg.push("secondary_topics:="+secondary_topics);
    //    arg.push('priamry_duration:=900');
    //    arg.push('secondary_duration:=900');
        //console.log(arg);
        opt['roslaunchBag'] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
        opt['roslaunchBag'].on('error', function(err) {
          console.log('Failed to start child process.');
        });
        if(cb) cb();
    //  } else {
    //    if(cb) cb();
    //  }
    //});
  }

  vidteq._nodeServer.prototype.processCamera = function(opt,showCamCount,cameraWidth,cameraHeight,cameraFPS,cb) {
    const spawn = require('child_process').spawn;        
    //console.log("inside processCamera ");
    var cameraCount = 0;
    if(opt && opt.cameraCount) { cameraCount = opt.cameraCount; }
    if(opt && opt.listCameraDev) { listCameraDev = opt.listCameraDev; }
    //console.log(cameraCount,showCamCount,cameraWidth,cameraHeight,cameraFPS);
    var that = this;
    var str = 'roslaunch';
    //var camFound = false;
    //for(var i in this.listCameraDev) {
    //  if(this.listCameraDev[i].match(new RegExp(showCamCount,"gi"))) {
    //    camFound = true;
    //    break;
    //  }
    //}
    //if(!camFound) {
    //  showCamCount++;
    //  cameraCount++;
    //  if(showCamCount < cameraCount) {
    //    that.processCamera(opt,showCamCount,cameraWidth,cameraHeight,cameraFPS,cb);
    //  } else {
    //    if(cb) cb();
    //  }
    //  return;
    //}
    var arg = ['usb_cam', 'usb_cam-test.launch' ,'camera_name:='+listCameraDev[showCamCount]['cameraSide'], 'video_device:='+listCameraDev[showCamCount]['prefix']+'/'+listCameraDev[showCamCount]['videoPath'], 'framerate:='+cameraFPS, 'image_width:='+cameraWidth ,'image_height:='+cameraHeight,'frame_id:='+listCameraDev[showCamCount]['frameId']];
    //console.log(arg);
    opt['roslaunch'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
    opt['roslaunch'+showCamCount].on('error', function(err) {
      console.log('Failed to start child process.');
    });
    this.waitAndProcess(function () {
      //console.log("roslaunch started");             
      showCamCount++;
      if(showCamCount < cameraCount) {
        that.processCamera(opt,showCamCount,cameraWidth,cameraHeight,cameraFPS,cb);
      } else {
        if(cb) cb();
      }
    });
  }

  vidteq._nodeServer.prototype.saveRos = function(opt,cb) {
    const spawn = require('child_process').spawn;        
    const exec = require('child_process').exec;        
    //console.log("inside saveRos ");
    var cameraCount = 0;
    var gpsCount = 0;
    var lidarCount = 0;
    if(opt && opt.cameraCount) { cameraCount = opt.cameraCount; }
    if(opt && opt.gpsCount) { gpsCount = opt.gpsCount; }
    if(opt && opt.lidarCount) { lidarCount = opt.lidarCount; }
    if(opt && opt.saveRosArr) { saveRosArr = opt.saveRosArr; }
    var city_name = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.city_name && opt.rosCfgFormat.city_name.val) {
      city_name = opt.rosCfgFormat.city_name.val;
    }
    var primaryStorage_All = "";
    //console.log( opt.rosCfgFormat.primaryStorage_All );
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.primaryStorage_All && opt.rosCfgFormat.primaryStorage_All.val) {
      primaryStorage_All = opt.rosCfgFormat.primaryStorage_All.val;
    }
    var secondaryStorage_All = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.secondaryStorage_All && opt.rosCfgFormat.secondaryStorage_All.val) {
      secondaryStorage_All = opt.rosCfgFormat.secondaryStorage_All.val;
    }
    var thirdStorage_All = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.thirdStorage_All && opt.rosCfgFormat.thirdStorage_All.val) {
      thirdStorage_All = opt.rosCfgFormat.thirdStorage_All.val;
    }
    var fourthStorage_All = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.fourthStorage_All && opt.rosCfgFormat.fourthStorage_All.val) {
      fourthStorage_All = opt.rosCfgFormat.fourthStorage_All.val;
    }
    var primaryStorage_video01 = "";
    //console.log( opt.rosCfgFormat.primaryStorage_video01 );
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.primaryStorage_video01 && opt.rosCfgFormat.primaryStorage_video01.val) {
      primaryStorage_video01 = opt.rosCfgFormat.primaryStorage_video01.val;
    }
    var secondaryStorage_video01 = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.secondaryStorage_video01 && opt.rosCfgFormat.secondaryStorage_video01.val) {
      secondaryStorage_video01 = opt.rosCfgFormat.secondaryStorage_video01.val;
    }
    var primaryStorage_video23 = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.primaryStorage_video23 && opt.rosCfgFormat.primaryStorage_video23.val) {
      primaryStorage_video23 = opt.rosCfgFormat.primaryStorage_video23.val;
    }
    var secondaryStorage_video23 = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.secondaryStorage_video23 && opt.rosCfgFormat.secondaryStorage_video23.val) {
      secondaryStorage_video23 = opt.rosCfgFormat.secondaryStorage_video23.val;
    }
    var primaryStorage_lidargps = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.primaryStorage_lidargps && opt.rosCfgFormat.primaryStorage_lidargps.val) {
      primaryStorage_lidargps = opt.rosCfgFormat.primaryStorage_lidargps.val;
    }
    var secondaryStorage_lidargps = "";
    if(opt && opt.rosCfgFormat && opt.rosCfgFormat.secondaryStorage_lidargps && opt.rosCfgFormat.secondaryStorage_lidargps.val) {
      secondaryStorage_lidargps = opt.rosCfgFormat.secondaryStorage_lidargps.val;
    }
    //console.log("save has been started");
    //console.log(cameraCount,saveRosArr,city_name,primaryStorage_All,secondaryStorage_All,thirdStorage_All,fourthStorage_All,primaryStorage_video01,secondaryStorage_video01,primaryStorage_video23,secondaryStorage_video23,primaryStorage_lidargps,secondaryStorage_lidargps);

    var that = this;
    //rosbag record -o /media/intel/SSD0/video01 /video0/usb_cam/imagraw /video1/usb_cam/image_raw
    //var str = '/usr/local/bin/rosbag';
    var str = 'rosbag';
    var arg = ['record','-o'];
    var storageStr = ['record','-o'];
    var primaryVideo01 = ['record','-o'];
    var primaryVideo23 = ['record','-o'];
    var primaryLidarGPS = ['record','-o'];
    var secVideo01 = ['record','-o'];
    var secVideo23 = ['record','-o'];
    var secLidarGPS = ['record','-o'];
    //if(cameraCount > 0) {
    //  for ( var i = 0; i < cameraCount; i++ ) {
    //    if(i == 0) {
    //      primaryVideo01.push(primaryStorage_video01+"/");
    //      secVideo01.push(secondaryStorage_video01+"/");
    //    } else if(i == 2) {
    //      primaryVideo23.push(primaryStorage_video23+"/");
    //      secVideo23.push(secondaryStorage_video23+"/");
    //    }
    //  }
    //}
    //if(gpsCount > 0 || lidarCount > 0) {
    //  primaryLidarGPS.push(primaryStorage_lidargps+"/");
    //  secLidarGPS.push(secondaryStorage_lidargps+"/");
    //}

    if(cameraCount > 0) {
      for ( var i = 0; i < cameraCount; i++ ) {
        if(i == 0) {
          primaryVideo01.push(primaryStorage_All+"_"+city_name);
        } else if(i == 2) {
          primaryVideo23.push(secondaryStorage_All+"_"+city_name);
        }
      }
    }
    if(gpsCount > 0 || lidarCount > 0) {
      primaryLidarGPS.push(thirdStorage_All+"_"+city_name);
    }
    //if(cameraCount > 0 || gpsCount > 0 || lidarCount > 0) {
    //  var p0 = primaryStorage_All+"_"+secondaryStorage_All+"_"+thirdStorage_All+"_"+city_name;
    //  storageStr.push(p0);
    //}
    exec('rostopic list', (err, stdout, stderr) => {
      //console.log(stdout);
      var topics = stdout.split("\n");
      //console.log(topics);
      for(var i in topics) {
        if(
           topics[i]=="/frontNear/left/image_raw" ||
           topics[i]=="/frontNear/left/camera_info" ||
           topics[i]=="/frontNear/right/image_raw" ||
           topics[i]=="/frontNear/right/camera_info" ||

           topics[i]=="/sideRight/left/image_raw" ||
           topics[i]=="/sideRight/left/camera_info" ||
           topics[i]=="/sideRight/right/image_raw" ||
           topics[i]=="/sideRight/right/camera_info" 
          ) {
          primaryVideo01.push(topics[i]);
        } else if(

           topics[i]=="/sideLeft/left/image_raw" ||
           topics[i]=="/sideLeft/left/camera_info" ||
           topics[i]=="/sideLeft/right/image_raw" ||
           topics[i]=="/sideLeft/right/camera_info" ||

           topics[i]=="/rearNear/left/image_raw" ||
           topics[i]=="/rearNear/left/camera_info" ||
           topics[i]=="/rearNear/right/image_raw" ||
           topics[i]=="/rearNear/right/camera_info"
        ) {
          primaryVideo23.push(topics[i]);
        } else if(
           topics[i]=="/lidar/velodyne_points" ||

           topics[i]=="/gps/fix" ||
           topics[i]=="/imu/data" ||
           topics[i]=="/imu/mag" 
          ) {
          primaryLidarGPS.push(topics[i]);
        }
      }  

      //for(var i in topics) {
      //  //if(topics[i].match("/\/video0\/usb_cam\/image_right_raw")) { }
      //  if(topics[i]=="/video0/usb_cam/image_right_raw") {
      //    primaryVideo01.push(topics[i]);
      //    secVideo01.push(topics[i]);
      //  //} else if(topics[i].match("/\/video0\/usb_cam\/image_left_raw")) {
      //  } else if(topics[i] == "/video0/usb_cam/image_left_raw") {
      //    primaryVideo01.push(topics[i]);
      //    secVideo01.push(topics[i]);
      //  } else if(topics[i] == "/video1/usb_cam/image_right_raw") {
      //  //} else if(topics[i].match("/\/video1\/usb_cam\/image_right_raw")) {
      //    primaryVideo01.push(topics[i]);
      //    secVideo01.push(topics[i]);
      //  } else if(topics[i] == "/video1/usb_cam/image_left_raw") {
      //  //} else if(topics[i].match("/\/video1\/usb_cam\/image_left_raw")) {
      //    primaryVideo01.push(topics[i]);
      //    secVideo01.push(topics[i]);
      //  } else if(topics[i] == "/video2/usb_cam/image_right_raw") {
      //  //} else if(topics[i].match("/\/video2\/usb_cam\/image_right_raw")) {
      //    primaryVideo23.push(topics[i]);
      //    secVideo23.push(topics[i]);
      //  } else if(topics[i] == "/video2/usb_cam/image_left_raw") {
      //  //} else if(topics[i].match("/\/video2\/usb_cam\/image_left_raw")) {
      //    primaryVideo23.push(topics[i]);
      //    secVideo23.push(topics[i]);
      //  } else if(topics[i] == "/video3/usb_cam/image_right_raw") {
      //  //} else if(topics[i].match("/\/video3\/usb_cam\/image_right_raw")) {
      //    primaryVideo23.push(topics[i]);
      //    secVideo23.push(topics[i]);
      //  } else if(topics[i] == "/video3/usb_cam/image_left_raw") {
      //  //} else if(topics[i].match("/\/video3\/usb_cam\/image_left_raw")) {
      //    primaryVideo23.push(topics[i]);
      //    secVideo23.push(topics[i]);
      //  //} else if(topics[i].match("/\/an_device\/Imu/")) {
      //  } else if(topics[i] == "/an_device/Imu") {
      //    primaryLidarGPS.push(topics[i]);
      //    secLidarGPS.push(topics[i]);
      //  //} else if(topics[i].match("/\/an_device\/NavSatFix/")) {
      //  } else if(topics[i]=="/an_device/NavSatFix") {
      //    primaryLidarGPS.push(topics[i]);
      //    secLidarGPS.push(topics[i]);
      //  //} else if(topics[i].match("/\/velodyne_points")) {
      //  } else if(topics[i]=="/velodyne_points") {
      //    primaryLidarGPS.push(topics[i]);
      //    secLidarGPS.push(topics[i]);
      //  }
      //}  
      //primaryVideo01.push('--split','--duration=900');
      //primaryVideo23.push('--split','--duration=900');
      //primaryLidarGPS.push('--split','--duration=900');
      
      that.killRos("rosbag",function () {
        //console.log("all kill done"); 
        //console.log(str);
        //console.log( storageStr);
        //console.log( primaryVideo01);
        //console.log( primaryVideo23);
        //console.log( primaryLidarGPS);
        that.spawnPrimaryProcess(str,storageStr,primaryVideo01,primaryVideo23,primaryLidarGPS,secVideo01,secVideo23,secLidarGPS,opt,cb);
      });




   
      //if(that.primaryOrSecTimer) clearInterval(that.primaryOrSecTimer);
      //that.primaryOrSec = "prime";
      //that.primaryOrSecTimer = setInterval(function () {
      //  if(that.primaryOrSec == 'prime') {
      //    that.primaryOrSec = "run";
      //    that.killRos("rosbag",function () {
      //      console.log("all kill done"); 
      //      that.spawnPrimaryProcess(str,primaryVideo01,primaryVideo23,primaryLidarGPS,secVideo01,secVideo23,secLidarGPS,opt,cb,primaryOrSec);
      //      if(that.primaryOrSecTimerStart) clearTimeout(that.primaryOrSecTimerStart);
      //      that.primaryOrSecTimerStart = setTimeout(function () {
      //        that.primaryOrSec = "sec";
      //      },1774800);
      //    });
      //  } else if(that.primaryOrSec == 'sec') {
      //    that.primaryOrSec = "run";
      //    that.killRos("rosbag",function () {
      //      console.log("all kill done"); 
      //      that.spawnSecondaryProcess(str,primaryVideo01,primaryVideo23,primaryLidarGPS,secVideo01,secVideo23,secLidarGPS,opt,cb,primaryOrSec);
      //      if(that.primaryOrSecTimerStart) clearTimeout(that.primaryOrSecTimerStart);
      //      that.primaryOrSecTimerStart = setTimeout(function () {
      //        that.primaryOrSec = "prime";
      //      },1774800);
      //    });
      //  }
      //},1800000);//1.2e+6);
      if(cb) cb();
    });

    //opt['rosbag'+showCamCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
    //opt['roslaunch'+showCamCount].on('error', function(err) {
    //  console.log('Failed to start child process.');
    //});
    //this.waitAndProcess(function () {
    //  console.log("roslaunch started");             
    //  showCamCount++;
    //  if(showCamCount < cameraCount) {
    //    that.processCamera(opt,showCamCount,cameraWidth,cameraHeight,cameraFPS,cb);
    //  } else {
    //    if(cb) cb();
    //  }
    //});
  }

  vidteq._nodeServer.prototype.spawnPrimaryProcess = function(str,storageStr,primaryVideo01,primaryVideo23,primaryLidarGPS,secVideo01,secVideo23,secLidarGPS,opt,cb) {
    const spawn = require('child_process').spawn;        
    const exec = require('child_process').exec;        
    //if(storageStr.length > 2) {
    //  opt['rosbag0'] = spawn(str,storageStr,{ detached: true, stdio: 'inherit' });
    //  opt['rosbag0'].on('error', function(err) {
    //    console.log('Failed to start child process.');
    //  });
    //}
    if(primaryVideo01.length > 2) {
      opt['rosbag0'] = spawn(str,primaryVideo01,{ detached: true, stdio: 'inherit' });
      opt['rosbag0'].on('error', function(err) {
        console.log('Failed to start child process.');
      });
    }
    if(primaryVideo23.length > 2) {
      opt['rosbag1'] = spawn(str,primaryVideo23,{ detached: true, stdio: 'inherit' });
      opt['rosbag1'].on('error', function(err) {
        console.log('Failed to start child process.');
      });
    }
    if(primaryLidarGPS.length > 2) {
      opt['rosbag2'] = spawn(str,primaryLidarGPS,{ detached: true, stdio: 'inherit' });
      opt['rosbag2'].on('error', function(err) {
        console.log('Failed to start child process.');
      });
    }
  }

  vidteq._nodeServer.prototype.spawnSecondaryProcess = function(str,primaryVideo01,primaryVideo23,primaryLidarGPS,secVideo01,secVideo23,secLidarGPS,opt,cb) {
    if(secVideo01.length > 2) {
      opt['rosbag3'] = spawn(str,secVideo01,{ detached: true, stdio: 'inherit' });
      opt['rosbag3'].on('error', function(err) {
        console.log('Failed to start child process.');
      });
    }
    if(secVideo23.length > 2) {
      opt['rosbag4'] = spawn(str,secVideo23,{ detached: true, stdio: 'inherit' });
      opt['rosbag4'].on('error', function(err) {
        console.log('Failed to start child process.');
      });
    }
    if(secLidarGPS.length > 2) {
      opt['rosbag5'] = spawn(str,secLidarGPS,{ detached: true, stdio: 'inherit' });
      opt['rosbag5'].on('error', function(err) {
        console.log('Failed to start child process.');
      });
    }
  }

  vidteq._nodeServer.prototype.processGPS = function(opt,cb) {
    const spawn = require('child_process').spawn;        
    //console.log("inside processGPS ");
    var gpsCount = 0;
    if(opt && opt.gpsCount) { gpsCount = opt.gpsCount; }
    //console.log(gpsCount);
    var that = this;
    var str = 'rosrun';
    var arg = ['advanced_navigation_driver', 'advanced_navigation_driver' ,'/dev/ttyUSB0', '115200'];
    if(gpsCount > 0) {
      opt['rosrun'+gpsCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
      opt['rosrun'+gpsCount].on('error', function(err) {
        console.log('Failed to start child process.');
      });
      this.waitAndProcess(function () {
        //console.log("rosrun started");             
        if(cb) cb();
      });
    } else {
      if(cb) cb();
    }
  }

  vidteq._nodeServer.prototype.processLidar = function(opt,cb) {
    const spawn = require('child_process').spawn;        
    //console.log("inside processLidar ");
    var lidarCount = 0;
    if(opt && opt.lidarCount) { lidarCount = opt.lidarCount; }
    //console.log(lidarCount);
    var that = this;
    var str = 'roslaunch';
    var arg = ['velodyne_pointcloud', 'VLP16_points.launch'];
    if(lidarCount > 0) {
      opt['roslaunch'+lidarCount] = spawn(str,arg,{ detached: true, stdio: 'inherit' });
      opt['roslaunch'+lidarCount].on('error', function(err) {
        console.log('Failed to start child process.');
      });
      this.waitAndProcess(function () {
        //console.log("roslaunch started");             
        if(cb) cb();
      });
    } else {
      if(cb) cb();
    }
  }

  vidteq._nodeServer.prototype.checkDiskAvail = function(diskList,cb) {
    var exec = require("child_process").exec;
    exec('lsblk -fJ', (err, stdout, stderr) => {
      //console.log(stdout);
      var driveList = JSON.parse(stdout);
      //console.log(driveList);
      for(var dl in driveList) {
        //console.log(driveList[dl]);
        for(var dl1 in driveList[dl]){
          //console.log(driveList[dl][dl1]);
          for(var cdl in driveList[dl][dl1]) {
            if(cdl == 'children') {
              for(var cdl1 in driveList[dl][dl1][cdl]) {
                if(driveList[dl][dl1][cdl][cdl1]['mountpoint'] == "[SWAP]") {
                  continue;
                }
                if(driveList[dl][dl1][cdl][cdl1]['mountpoint'] == "/") {
                  //continue;
                  // console.log(driveList[dl][dl1][cdl][cdl1]);
                  if(process.env && process.env['HOME']) {
                    driveList[dl][dl1][cdl][cdl1]['mountpoint'] = process.env['HOME'] + "/Desktop/";
                  }
                }
                //console.log(driveList[dl][dl1][cdl][cdl1]);
                diskList.push(driveList[dl][dl1][cdl][cdl1]);
          
              }
            }
          }
        }
      }
      if(cb) cb(diskList);
    });
  }

  vidteq._nodeServer.prototype.startStopRosGaze = function(opt) {
    opt = opt || {};
    var that = this;
    var operation = "";
    if(opt.operation) {
      operation = opt.operation;
    } 
    this.listCameraDev = [];
    var request = opt.request || "";
    var response = opt.response || "";
    if(operation == "") {
      this.debugMsg("operation is null");
      var gazeDataList = {"error":"operation is null"};
      response.setHeader('Content-type' , 'text/json');
      response.end(JSON.stringify(gazeDataList));
      return;
    }
    if(operation == "start") {
      var rosCfgFormat = {
        "monoPtGreyCameraCount":{"type":"string","val":""}
        ,"stereoPtGreyCameraCount":{"type":"string","val":""}
        ,"zedCameraCount":{"type":"string","val":""}
        ,"zedWidth":{"type":"string","val":""}
        ,"zedHeight":{"type":"string","val":""}
        ,"zedFPS":{"type":"string","val":""}
        ,"gpsCount":{"type":"string","val":""}
        ,"lidarCount":{"type":"string","val":""}

        ,"primaryStorage_video01":{"type":"string","val":""}
        ,"secondaryStorage_video01":{"type":"string","val":""}
        ,"primaryStorage_video23":{"type":"string","val":""}
        ,"secondaryStorage_video23":{"type":"string","val":""}
        ,"primaryStorage_lidargps":{"type":"string","val":""}
        ,"secondaryStorage_lidargps":{"type":"string","val":""}

        ,"diskmount":{"type":"string","val":""}
      };
      if(opt && opt.rosCfgFormat) {
        rosCfgFormat = opt.rosCfgFormat;
      }
      //console.log(rosCfgFormat);
      var cameraCount = 0;
      if(rosCfgFormat && rosCfgFormat.zedCameraCount && rosCfgFormat.zedCameraCount.val) {
        cameraCount += parseInt(rosCfgFormat.zedCameraCount.val);
      }
      var cameraWidth = 3840;
      if(rosCfgFormat && rosCfgFormat.zedWidth && rosCfgFormat.zedWidth.val) {
        cameraWidth = parseInt(rosCfgFormat.zedWidth.val);
      }
      var cameraHeight = 1080;
      if(rosCfgFormat && rosCfgFormat.zedHeight && rosCfgFormat.zedHeight.val) {
        cameraHeight = parseInt(rosCfgFormat.zedHeight.val);
      }
      var cameraFPS = 30;
      if(rosCfgFormat && rosCfgFormat.zedFPS && rosCfgFormat.zedFPS.val) {
        cameraFPS = parseInt(rosCfgFormat.zedFPS.val);
      }
      var gpsCount = 0;
      if(rosCfgFormat && rosCfgFormat.gpsCount && rosCfgFormat.gpsCount.val) {
        gpsCount = parseInt(rosCfgFormat.gpsCount.val);
      }
      var lidarCount = 0;
      if(rosCfgFormat && rosCfgFormat.lidarCount && rosCfgFormat.lidarCount.val) {
        lidarCount = parseInt(rosCfgFormat.lidarCount.val);
      }
      const spawn = require('child_process').spawn;        
      const exec = require('child_process').exec;
      this.processArray = [];
      this.killRos("roslaunch",function () {
        that.killGPS("advanced_navigation_driver",function () {
          that.killRos("roscore",function () { 
            that.killRos("rviz",function () {
          //that.killRos("rospackviewer",function () { 
            //console.log("all kill done"); 
            //console.log(process.env);
            var roscore = spawn('roscore',[],{ detached: true, stdio: 'inherit' });
            roscore.on('error', function(err) {
              console.log('Failed to start child process.');
            });
            that.rosCorepresent = true;
            that.waitAndProcess(function () {
              //console.log("roscore started");             

              var fs = require('fs');
              var dir = '/dev/v4l/by-path';
              var listCameras = 0;
              fs.readdir(dir, (err, files) => {
                //console.log(files.length);
                for(var i in files) {
                  if(files[i].match(/pci/)) {
                    //console.log(i);
                    //console.log("files found "+files[i]);   
                    var cameraSide = "";         
                    if(files[i] == "pci-0000:0e:00.0-usb-0:4:1.0-video-index0" 
                      || files[i] == "pci-0000:0f:00.0-usb-0:4:1.0-video-index0"
                      || files[i] == "pci-0000:03:00.0-usb-0:4:1.0-video-index0"
                      || files[i] == "pci-0000:00:1a.0-usb-0:1.5:1.0-video-index0"
                      || files[i] == "pci-0000:00:14.0-usb-0:3:1.0-video-index0") {                  
                      cameraSide = "frontNear";
                    } else if(files[i] == "pci-0000:10:00.0-usb-0:4:1.0-video-index0" 
                      || files[i] == "pci-0000:11:00.0-usb-0:4:1.0-video-index0"
                      || files[i] == "pci-0000:04:00.0-usb-0:4:1.0-video-index0"
                        || files[i] == "pci-0000:00:14.0-usb-0:4:1.0-video-index0") {
                      cameraSide = "sideRight";
                    } else if(files[i] == "pci-0000:03:00.0-usb-0:4:1.0-video-index0" 
                      || files[i] == "pci-0000:04:00.0-usb-0:4:1.0-video-index0"
                        || files[i] == "pci-0000:00:14.0-usb-0:5:1.0-video-index0") {
                      cameraSide = "sideLeft";
                    } else if(files[i] == "pci-0000:05:00.0-usb-0:4:1.0-video-index0"
                      || files[i] == "pci-0000:06:00.0-usb-0:4:1.0-video-index0"
                        || files[i] == "pci-0000:00:14.0-usb-0:6:1.0-video-index0") {
                      cameraSide = "rearNear";
                    } else if(files[i] == "pci-0000:00:14.0-usb-0:1:1.0-video-index0" 
                        || files[i] == "pci-0000:00:14.0-usb-0:5:1.0-video-index0") {
                      cameraSide = "vidteq";
                    }

                    var cameraHashDev = {prefix:"/dev/v4l/by-path",videoPath:files[i],cameraSide:cameraSide,frameId:"zed"};
                    that.listCameraDev.push(cameraHashDev);
                    listCameras++;
                  }
                  if(i == files.length - 1) {
                    if(listCameras < cameraCount) {
                      cameraCount = listCameras;
                    }
                    //console.log("total count Camera to run "+cameraCount); 
                    //console.log("total list cameras is "+listCameras);
             
                    var showCamCount = 0;
                    that.processRoslaunch({roscore:roscore,cameraCount:cameraCount,gpsCount:gpsCount,lidarCount:lidarCount,listCameraDev:that.listCameraDev},showCamCount,cameraWidth,cameraHeight,cameraFPS,function () {
                      that.waitAndProcess(function () {
                        that.rosStarted = true;
                        //that.previewRos({},function () {
                          var gazeDataList = {"success":"operation is start"};
                          response.setHeader('Content-type' , 'text/json');
                          response.end(JSON.stringify(gazeDataList));
                        //});
                      });
                    });
                    //if(showCamCount < cameraCount) {
                    //  
                    //  //that.processCamera({roscore:roscore,cameraCount:cameraCount,gpsCount:gpsCount,lidarCount:lidarCount,listCameraDev:that.listCameraDev},showCamCount,cameraWidth,cameraHeight,cameraFPS,function () {
                    //  //  
                    //  //  that.processGPS({cameraCount:cameraCount,gpsCount:gpsCount,lidarCount:lidarCount},function () {
                    //  //    that.processLidar({cameraCount:cameraCount,gpsCount:gpsCount,lidarCount:lidarCount},function () {
                    //  //      var gazeDataList = {"success":"operation is start"};
                    //  //      response.setHeader('Content-type' , 'text/json');
                    //  //      response.end(JSON.stringify(gazeDataList));
                    //  //    });
                    //  //  });
                    //  //});
                    //}
                  }
                }
              });
            });
            
              /*exec(`rosrun pointgrey_camera_driver list_cameras`,function (error, stdout, stderr) {
                //console.log('stdout: ' + stdout);
                var listCamerasTmp = stdout.split("\n");
                var listCameras = [];
                for(var i in listCamerasTmp) {
                  if(listCamerasTmp[i] != "") {
                    listCameras.push(listCamerasTmp[i]);
                  }
                }
                console.log(listCameras);
                var gazeDataList = {"success":"operation is start"};
                response.setHeader('Content-type' , 'text/json');
                response.end(JSON.stringify(gazeDataList));
              });*/
          //});
          });
          });
        });
      });
    } else if (operation == "stop") {
      this.rosCorepresent = false;
      this.killRos("roslaunch",function () {
        that.killGPS("advanced_navigation_driver",function () {
          that.killRos("roscore",function () { 
            that.killRos("rviz",function () {
          //that.killRos("rospackviewer",function () { 
            //console.log("all kill done"); 
            //that.rosnodejs.reset();
            //if(that.rosnodejs.ok()) that.rosnodejs.shutdown();
            that.rosStarted = false;
            that.rosCorepresent = false;
            var gazeDataList = {"success":"operation is stop"};
            response.setHeader('Content-type' , 'text/json');
            response.end(JSON.stringify(gazeDataList));
          //});
            });
          });
        });
      });
    } else if (operation == "save") {
      var rosCfgFormat = {
        "monoPtGreyCameraCount":{"type":"string","val":""}
        ,"stereoPtGreyCameraCount":{"type":"string","val":""}
        ,"zedCameraCount":{"type":"string","val":""}
        ,"zedWidth":{"type":"string","val":""}
        ,"zedHeight":{"type":"string","val":""}
        ,"zedFPS":{"type":"string","val":""}
        ,"gpsCount":{"type":"string","val":""}
        ,"lidarCount":{"type":"string","val":""}

        ,"city_name":{"type":"string","val":""}
        ,"primaryStorage_All":{"type":"string","val":""}
        ,"secondaryStorage_All":{"type":"string","val":""}
        ,"thirdStorage_All":{"type":"string","val":""}
        ,"fourthStorage_All":{"type":"string","val":""}
        ,"primaryStorage_video01":{"type":"string","val":""}
        ,"secondaryStorage_video01":{"type":"string","val":""}
        ,"primaryStorage_video23":{"type":"string","val":""}
        ,"secondaryStorage_video23":{"type":"string","val":""}
        ,"primaryStorage_lidargps":{"type":"string","val":""}
        ,"secondaryStorage_lidargps":{"type":"string","val":""}

        ,"diskmount":{"type":"string","val":""}
      };
      if(opt && opt.rosCfgFormat) {
        rosCfgFormat = opt.rosCfgFormat;
      }
      //console.log(rosCfgFormat);
      var cameraCount = 0;
      if(rosCfgFormat && rosCfgFormat.zedCameraCount && rosCfgFormat.zedCameraCount.val) {
        cameraCount += parseInt(rosCfgFormat.zedCameraCount.val);
      }
      var gpsCount = 0;
      if(rosCfgFormat && rosCfgFormat.gpsCount && rosCfgFormat.gpsCount.val) {
        gpsCount = parseInt(rosCfgFormat.gpsCount.val);
      }
      var lidarCount = 0;
      if(rosCfgFormat && rosCfgFormat.lidarCount && rosCfgFormat.lidarCount.val) {
        lidarCount = parseInt(rosCfgFormat.lidarCount.val);
      }
      var city_name = "";
      var primaryStorage_All = "";
      var secondaryStorage_All = "";
      var thirdStorage_All = "";
      var fourthStorage_All = "";
      var primaryStorage_video01 = "";
      var secondaryStorage_video01 = "";
      var primaryStorage_video23 = "";
      var secondaryStorage_video23 = "";
      var primaryStorage_lidargps = "";
      var secondaryStorage_lidargps = "";
      if(rosCfgFormat && rosCfgFormat.city_name && rosCfgFormat.city_name.val) {
        city_name = parseInt(rosCfgFormat.city_name.val);
      }
      if(rosCfgFormat && rosCfgFormat.primaryStorage_All && rosCfgFormat.primaryStorage_All.val) {
        primaryStorage_All = parseInt(rosCfgFormat.primaryStorage_All.val);
      }
      if(rosCfgFormat && rosCfgFormat.secondaryStorage_All && rosCfgFormat.secondaryStorage_All.val) {
        secondaryStorage_All = parseInt(rosCfgFormat.secondaryStorage_All.val);
      }
      if(rosCfgFormat && rosCfgFormat.thirdStorage_All && rosCfgFormat.thirdStorage_All.val) {
        thirdStorage_All = parseInt(rosCfgFormat.thirdStorage_All.val);
      }
      if(rosCfgFormat && rosCfgFormat.fourthStorage_All && rosCfgFormat.fourthStorage_All.val) {
        fourthStorage_All = parseInt(rosCfgFormat.fourthStorage_All.val);
      }
      if(rosCfgFormat && rosCfgFormat.primaryStorage_video01 && rosCfgFormat.primaryStorage_video01.val) {
        primaryStorage_video01 = parseInt(rosCfgFormat.primaryStorage_video01.val);
      }
      if(rosCfgFormat && rosCfgFormat.secondaryStorage_video01 && rosCfgFormat.secondaryStorage_video01.val) {
        secondaryStorage_video01 = parseInt(rosCfgFormat.secondaryStorage_video01.val);
      }
      if(rosCfgFormat && rosCfgFormat.primaryStorage_video23 && rosCfgFormat.primaryStorage_video23.val) {
        primaryStorage_video23 = parseInt(rosCfgFormat.primaryStorage_video23.val);
      }
      if(rosCfgFormat && rosCfgFormat.secondaryStorage_video23 && rosCfgFormat.secondaryStorage_video23.val) {
        secondaryStorage_video23 = parseInt(rosCfgFormat.secondaryStorage_video23.val);
      }
      if(rosCfgFormat && rosCfgFormat.primaryStorage_lidargps && rosCfgFormat.primaryStorage_lidargps.val) {
        primaryStorage_lidargps = parseInt(rosCfgFormat.primaryStorage_lidargps.val);
      }
      if(rosCfgFormat && rosCfgFormat.secondaryStorage_lidargps && rosCfgFormat.secondaryStorage_lidargps.val) {
        secondaryStorage_lidargps = parseInt(rosCfgFormat.secondaryStorage_lidargps.val);
      }
      const spawn = require('child_process').spawn;        
      const exec = require('child_process').exec;
      this.processArray = [];
            
      var fs = require('fs');
      var dir = '/dev/v4l/by-path';
      var listCameras = 0;
      fs.readdir(dir, (err, files) => {
        //console.log(files.length);
        for(var i in files) {
          if(files[i].match(/pci/)) {
            //console.log(i);
            //console.log("files found "+files[i]);
            listCameras++;
          }
          if(i == files.length - 1) {
            if(listCameras < cameraCount) {
              cameraCount = listCameras;
            }
            //console.log("total count Camera to run "+cameraCount); 
            //console.log("total list cameras is "+listCameras);
             
            var saveRosArr = [];
            if(cameraCount > 0) {
              that.processRosBag({cameraCount:cameraCount,gpsCount:gpsCount,lidarCount:lidarCount,rosCfgFormat:rosCfgFormat,saveRosArr:saveRosArr},function () {
                var gazeDataList = {"success":"operation is save"};
                response.setHeader('Content-type' , 'text/json');
                response.end(JSON.stringify(gazeDataList));
              });
              //that.saveRos({cameraCount:cameraCount,gpsCount:gpsCount,lidarCount:lidarCount,rosCfgFormat:rosCfgFormat,saveRosArr:saveRosArr},function () {
              //  var gazeDataList = {"success":"operation is save"};
              //  response.setHeader('Content-type' , 'text/json');
              //  response.end(JSON.stringify(gazeDataList));
              //});
            }
          }
        }
      });
    } else if (operation == "savestop") {
      this.killRos("rosbag",function () {
        //console.log("all kill done"); 
        var gazeDataList = {"success":"operation is save stop"};
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));
      });
    } else if (operation == "previewRosGaze") {
      console.log('sdfdf',this.rosCorepresent);
      if(this.rosCorepresent) {
        this.killRos("rosbag",function () {
          that.waitAndProcess(function () {
            const spawnnew = require('child_process').spawn;        
            var str = 'roslaunch';
            var arg = ['/usr/local/bin/gazebin/ros/src/previewRviz.launch'];
            opt['roslaunchnew'] = spawnnew(str,arg,{ detached: true, stdio: 'inherit' });
            opt['roslaunchnew'].on('error', function(err) {
              console.log('Failed to start child process.');
            });
            console.log("roslaunch started");             
            //console.log("all kill done"); 
            var gazeDataList = {"success":"operation is save stop"};
            response.setHeader('Content-type' , 'text/json');
            response.end(JSON.stringify(gazeDataList));
          });
        });
      } else { 
            var gazeDataList = {"error":"operation is save stop 1"};
            response.setHeader('Content-type' , 'text/json');
            response.end(JSON.stringify(gazeDataList));
      }
    } else if(operation == "cameraIntrinsic") {
      var calibCfgFormat = this.calibrationConfReader()      
      
      //console.log("inside cameraIntrinsic");
      var calibSide = "";
      var intBoardMatrix = calibCfgFormat['intBoardMatrix'].val;
      var intSquareSize = calibCfgFormat['intSquareSize'].val;
      if(opt && opt.calibSide) { calibSide = opt.calibSide; }
      if(opt && opt.intBoardMatrix) { intBoardMatrix = opt.intBoardMatrix; }
      if(opt && opt.intSquareSize) { intSquareSize = opt.intSquareSize; }
      if(calibSide == "") {
        var gazeDataList = {"success":"operation is cameraIntrinsic"};
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));   
      } else {        
        const spawn = require('child_process').spawn;        
        const exec = require('child_process').exec;

        this.killRos("roslaunch",function () {
          that.killGPS("advanced_navigation_driver",function () {
            that.killRos("roscore",function () { 
              //console.log("all kill done"); 
              that.rosStarted = false;
           
              var roscore = spawn('roscore',[],{ detached: true, stdio: 'inherit' });
              roscore.on('error', function(err) {
                console.log('Failed to start child process.');
              });
              that.waitAndProcess(function () {
                //console.log("roscore started");

                that.processIntrinsicRoslaunch(
                  {
                    intBoardMatrix:intBoardMatrix
                    ,intSquareSize:intSquareSize
                    ,calibSide:calibSide
                  }
                  ,function () {
                    var gazeDataList = {"success":"operation is cameraIntrinsic"};
                    response.setHeader('Content-type' , 'text/json');
                    response.end(JSON.stringify(gazeDataList));
                  }
                );

              });

            });
          });
        });         
      }
   
    
    } else if(operation == "cameraExtrinsic") {
      
      var calibCfgFormat = this.calibrationConfReader()      
      
      //console.log("inside cameraExtrinsic");
      var camera1 = camera2 = "";    
      var camera2ExtrinsicMarkers = camera2ExtrinsicS1_Length1 = "";
      var camera2ExtrinsicS2_Breadth1 = camera2ExtrinsicBWAL_B11 = "";
      var camera2ExtrinsicBWAB_B21 = camera2Extrinsiceloam_e1 = camera2Extrinsicms = "";
      if(opt && opt.camera1) { camera1 = opt.camera1; }
      if(opt && opt.camera2) { camera2 = opt.camera2; }
      if(opt && opt.camera2ExtrinsicMarkers) { camera2ExtrinsicMarkers = opt.camera2ExtrinsicMarkers; }
      if(opt && opt.camera2ExtrinsicS1_Length1) { camera2ExtrinsicS1_Length1 = opt.camera2ExtrinsicS1_Length1; }
      if(opt && opt.camera2ExtrinsicS2_Breadth1) { camera2ExtrinsicS2_Breadth1 = opt.camera2ExtrinsicS2_Breadth1; }
      if(opt && opt.camera2ExtrinsicBWAL_B11) { camera2ExtrinsicBWAL_B11 = opt.camera2ExtrinsicBWAL_B11; }
      if(opt && opt.camera2ExtrinsicBWAB_B21) { camera2ExtrinsicBWAB_B21 = opt.camera2ExtrinsicBWAB_B21; }
      if(opt && opt.camera2Extrinsiceloam_e1) { camera2Extrinsiceloam_e1 = opt.camera2Extrinsiceloam_e1; }
      if(opt && opt.camera2Extrinsicms) { camera2Extrinsicms = opt.camera2Extrinsicms; }          
      if(camera1 == "") {
        var gazeDataList = {"success":"operation is cameraExtrinsic"};
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));   
      } else if(camera2 == "") {
        var gazeDataList = {"success":"operation is cameraExtrinsic"};
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));         
      } else {
        const spawn = require('child_process').spawn;        
        const exec = require('child_process').exec;

        this.killRos("roslaunch",function () {
          that.killGPS("advanced_navigation_driver",function () {
            that.killRos("roscore",function () { 
              //console.log("all kill done"); 
              that.rosStarted = false;
           
              var roscore = spawn('roscore',[],{ detached: true, stdio: 'inherit' });
              roscore.on('error', function(err) {
                console.log('Failed to start child process.');
              });
              that.waitAndProcess(function () {
                //console.log("roscore started");

                that.processCameraExtRoslaunch(
                  {
                    camera1:camera1,camera2:camera2
                    ,camera2ExtrinsicMarkers:camera2ExtrinsicMarkers
                    ,camera2ExtrinsicS1_Length1:camera2ExtrinsicS1_Length1
                    ,camera2ExtrinsicS2_Breadth1:camera2ExtrinsicS2_Breadth1
                    ,camera2ExtrinsicBWAL_B11:camera2ExtrinsicBWAL_B11
                    ,camera2ExtrinsicBWAB_B21:camera2ExtrinsicBWAB_B21
                    ,camera2Extrinsiceloam_e1:camera2Extrinsiceloam_e1
                    ,camera2Extrinsicms:camera2Extrinsicms
                  }
                  ,function () {
                    var gazeDataList = {"success":"operation is cameraExtrinsic"};
                    response.setHeader('Content-type' , 'text/json');
                    response.end(JSON.stringify(gazeDataList));
                  }
                );

              });

            });
          });
        });         
      }

    } else if(operation == "lidarExtrinsic") {
      
   
      var calibCfgFormat = this.calibrationConfReader()      
      
      //console.log("inside LidarExtrinsic");
      var camera3 = "";    
      var camera3ExtrinsicMarkers = camera3ExtrinsicS1_Length1 = "";
      var camera3ExtrinsicS2_Breadth1 = camera3ExtrinsicBWAL_B11 = "";
      var camera3ExtrinsicBWAB_B21 = camera3Extrinsiceloam_e1 = camera3Extrinsicms = "";
      var extXPlus = extXMinus = extYPlus = extYMinus = extZPlus = extZMinus = extroilidarX = "";
      var extroilidarY = extroilidarZ = extMaxIt = extLidarIntensity = "";
      if(opt && opt.camera3) { camera3 = opt.camera3; }      
      if(opt && opt.camera3ExtrinsicMarkers) { camera3ExtrinsicMarkers = opt.camera3ExtrinsicMarkers; }
      if(opt && opt.camera3ExtrinsicS1_Length1) { camera3ExtrinsicS1_Length1 = opt.camera3ExtrinsicS1_Length1; }
      if(opt && opt.camera3ExtrinsicS2_Breadth1) { camera3ExtrinsicS2_Breadth1 = opt.camera3ExtrinsicS2_Breadth1; }
      if(opt && opt.camera3ExtrinsicBWAL_B11) { camera3ExtrinsicBWAL_B11 = opt.camera3ExtrinsicBWAL_B11; }
      if(opt && opt.camera3ExtrinsicBWAB_B21) { camera3ExtrinsicBWAB_B21 = opt.camera3ExtrinsicBWAB_B21; }
      if(opt && opt.camera3Extrinsiceloam_e1) { camera3Extrinsiceloam_e1 = opt.camera3Extrinsiceloam_e1; }
      if(opt && opt.camera3Extrinsicms) { camera3Extrinsicms = opt.camera3Extrinsicms; }          

      if(opt && opt.extXPlus) { extXPlus = opt.extXPlus; }
      if(opt && opt.extXMinus) { extXMinus = opt.extXMinus; }
      if(opt && opt.extYPlus) { extYPlus = opt.extYPlus; }
      if(opt && opt.extYMinus) { extYMinus = opt.extYMinus; }
      if(opt && opt.extZPlus) { extZPlus = opt.extZPlus; }
      if(opt && opt.extZMinus) { extZMinus = opt.extZMinus; }
      if(opt && opt.extroilidarX) { extroilidarX = opt.extroilidarX; }
      if(opt && opt.extroilidarY) { extroilidarY = opt.extroilidarY; }
      if(opt && opt.extroilidarZ) { extroilidarZ = opt.extroilidarZ; }
      if(opt && opt.extMaxIt) { extMaxIt = opt.extMaxIt; }
      if(opt && opt.extLidarIntensity) { extLidarIntensity = opt.extLidarIntensity; }

      if(camera3 == "") {
        var gazeDataList = {"success":"operation is LidarExtrinsic"};
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));   
      } else {
        const spawn = require('child_process').spawn;        
        const exec = require('child_process').exec;

        this.killRos("roslaunch",function () {
          that.killGPS("advanced_navigation_driver",function () {
            that.killRos("roscore",function () { 
              //console.log("all kill done"); 
              that.rosStarted = false;
           
              var roscore = spawn('roscore',[],{ detached: true, stdio: 'inherit' });
              roscore.on('error', function(err) {
                console.log('Failed to start child process.');
              });
              that.waitAndProcess(function () {
                //console.log("roscore started");

                that.processLidarExtRoslaunch(
                  {
                    camera3:camera3
                    ,camera3ExtrinsicMarkers:camera3ExtrinsicMarkers
                    ,camera3ExtrinsicS1_Length1:camera3ExtrinsicS1_Length1
                    ,camera3ExtrinsicS2_Breadth1:camera3ExtrinsicS2_Breadth1
                    ,camera3ExtrinsicBWAL_B11:camera3ExtrinsicBWAL_B11
                    ,camera3ExtrinsicBWAB_B21:camera3ExtrinsicBWAB_B21
                    ,camera3Extrinsiceloam_e1:camera3Extrinsiceloam_e1
                    ,camera3Extrinsicms:camera3Extrinsicms
                    ,extXPlus:extXPlus
                    ,extXMinus:extXMinus
                    ,extYPlus:extYPlus
                    ,extYMinus:extYMinus
                    ,extZPlus:extZPlus
                    ,extZMinus:extZMinus
                    ,extroilidarX:extroilidarX
                    ,extroilidarY:extroilidarY
                    ,extroilidarZ:extroilidarZ
                    ,extMaxIt:extMaxIt
                    ,extLidarIntensity:extLidarIntensity
                  }
                  ,function () {
                    var gazeDataList = {"success":"operation is LidarExtrinsic"};
                    response.setHeader('Content-type' , 'text/json');
                    response.end(JSON.stringify(gazeDataList));
                  }
                );

              });

            });
          });
        });         
      }


    } else if (operation == "emptyDisk") {
      var disk = "";
      if(opt && opt.disk) {
        disk = opt.disk;
      }
      this.deleteFiles(disk,function () {
        //console.log("all delete done"); 
        var gazeDataList = {"success":"operation is emptyDisk"};
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));
      });
    } else if (operation == "setConfig") {
      //console.log("setConfig");
      var fs = require('fs');
      var rosCfg = process.env['HOME'] + "/gazecfg/ros.cfg";
      var rosCfgFormat = {
        "monoPtGreyCameraCount":{"type":"string","val":""}
        ,"stereoPtGreyCameraCount":{"type":"string","val":""}
        ,"zedCameraCount":{"type":"string","val":""}
        ,"zedWidth":{"type":"string","val":""}
        ,"zedHeight":{"type":"string","val":""}
        ,"zedFPS":{"type":"string","val":""}
        ,"gpsCount":{"type":"string","val":""}
        ,"lidarCount":{"type":"string","val":""}

        ,"city_name":{"type":"string","val":""}
        ,"primaryStorage_All":{"type":"string","val":""}
        ,"secondaryStorage_All":{"type":"string","val":""}
        ,"thirdStorage_All":{"type":"string","val":""}
        ,"fourthStorage_All":{"type":"string","val":""}
        ,"primaryStorage_video01":{"type":"string","val":""}
        ,"secondaryStorage_video01":{"type":"string","val":""}
        ,"primaryStorage_video23":{"type":"string","val":""}
        ,"secondaryStorage_video23":{"type":"string","val":""}
        ,"primaryStorage_lidargps":{"type":"string","val":""}
        ,"secondaryStorage_lidargps":{"type":"string","val":""}

        ,"diskmount":{"type":"string","val":""}
      };
      if(opt && opt.rosCfgFormat) {
        rosCfgFormat = opt.rosCfgFormat;
      }
      //console.log(rosCfgFormat);
      var diskList = [];
      this.checkDiskAvail(diskList,function (diskList) {
        for(var j in rosCfgFormat) {
          if(j == 'diskmount') {
            //rosCfgFormat[j]['val'] = JSON.stringify(diskList);
            var dl = JSON.stringify(diskList);
            rosCfgFormat[j]['val'] = dl.replace(new RegExp("\"","gi"),"\'");
          }
        }
        var resIni = "";
        for(var j in rosCfgFormat) {
          if(rosCfgFormat[j].type == "string") {
            resIni += j + " = \"" + rosCfgFormat[j].val + "\";\n";
          } else if(rosCfgFormat[j].type == "int") {
            resIni += j + " = " + parseInt(rosCfgFormat[j].val) + ";\n";
          } else if(rosCfgFormat[j].type == "float") {
            resIni += j + " = " + parseFloat(rosCfgFormat[j].val) + ";\n";
          } else if(rosCfgFormat[j].type == "double") {
            resIni += j + " = " + parseDouble(rosCfgFormat[j].val) + ";\n";
          } else if(rosCfgFormat[j].type == "bool") {
            if(resIT[i].value) {
              resIni += j + " = " + true + ";\n";
            } else {
              resIni += j + " = " + false + ";\n";
            }
          }
        }
        //console.log("new config is added");
        //console.log(resIni);
        fs.writeFileSync(rosCfg,resIni,{mode:'777'});
        var gazeDataList = {"success":"operation is set config"};
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));
      });
    } else if (operation == "detectDisk") {
      var diskList = [];
      this.checkDiskAvail(diskList,function (diskList) {
        var diskListNew = [];
        for(var i in diskList) {
          if(diskList[i]['label'] && diskList[i]['label'].match(/^SSD/)) {
            diskListNew.push(diskList[i]);
          }
        } 
        var gazeDataList = {"success":"operation is get config",diskList:diskListNew};
        response.setHeader('Access-Control-Allow-Origin' , '*');
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));
      });
    } else if (operation == "detectDiskSpace") {
      var diskMount = "";
      if(opt && opt.diskMount) {
        diskMount = opt.diskMount;
      }
      this.detectDiskSpace(diskMount,function (diskStatus,rosCfgFormat,gazeCfgFormat) {
        var gazeDataList = {"success":"operation is get config",diskStatus:diskStatus,rosCfgFormat:rosCfgFormat,gazeCfgFormat:gazeCfgFormat};
        response.setHeader('Access-Control-Allow-Origin' , '*');
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));
      })
    } else if (operation == "getConfig") {
      //console.log("getCOnfig");
      var fs = require('fs');
      //var execSync = require("child_process").execSync;
      var diskList = [];
      this.checkDiskAvail(diskList,function (diskList) {
        //console.log("all fone");console.log(diskList);

        var rosCfgFormat = {
          "monoPtGreyCameraCount":{"type":"string","val":""}
          ,"stereoPtGreyCameraCount":{"type":"string","val":""}
          ,"zedCameraCount":{"type":"string","val":""}
          ,"zedWidth":{"type":"string","val":""}
          ,"zedHeight":{"type":"string","val":""}
          ,"zedFPS":{"type":"string","val":""}
          ,"gpsCount":{"type":"string","val":""}
          ,"lidarCount":{"type":"string","val":""}

          ,"city_name":{"type":"string","val":""}
          ,"primaryStorage_All":{"type":"string","val":""}
          ,"secondaryStorage_All":{"type":"string","val":""}
          ,"thirdStorage_All":{"type":"string","val":""}
          ,"fourthStorage_All":{"type":"string","val":""}
          ,"primaryStorage_video01":{"type":"string","val":""}
          ,"secondaryStorage_video01":{"type":"string","val":""}
          ,"primaryStorage_video23":{"type":"string","val":""}
          ,"secondaryStorage_video23":{"type":"string","val":""}
          ,"primaryStorage_lidargps":{"type":"string","val":""}
          ,"secondaryStorage_lidargps":{"type":"string","val":""}

          ,"diskmount":{"type":"string","val":""}

          ,"intBoardMatrix":{"type":"string","val":"8x6"}
          ,"intSquareSize":{"type":"string","val":"0.108"}

          ,"camera2ExtrinsicMarkers":{"type":"string","val":"2"}
          ,"camera2ExtrinsicS1_Length1":{"type":"string","val":"54.5"}
          ,"camera2ExtrinsicS2_Breadth1":{"type":"string","val":"57.0"}
          ,"camera2ExtrinsicBWAL_B11":{"type":"string","val":"1.0"}
          ,"camera2ExtrinsicBWAB_B21":{"type":"string","val":"1.0"}
          ,"camera2Extrinsiceloam_e1":{"type":"string","val":"28.0"}
          //,"camera2ExtrinsicS1_Length2":{"type":"string","val":"54.5"}
          //,"camera2ExtrinsicS2_Breadth2":{"type":"string","val":"57.0"}
          //,"camera2ExtrinsicBWAL_B12":{"type":"string","val":"1.0"}
          //,"camera2ExtrinsicBWAB_B22":{"type":"string","val":"1.0"}
          //,"camera2Extrinsiceloam_e2":{"type":"string","val":"28.0"}
          //,"camera2Extrinsicms":{"type":"string","val":"0.280"}

          ,"camera3ExtrinsicMarkers":{"type":"string","val":"2"}
          ,"camera3ExtrinsicS1_Length1":{"type":"string","val":"54.5"}
          ,"camera3ExtrinsicS2_Breadth1":{"type":"string","val":"57.0"}
          ,"camera3ExtrinsicBWAL_B11":{"type":"string","val":"1.0"}
          ,"camera3ExtrinsicBWAB_B21":{"type":"string","val":"1.0"}
          ,"camera3Extrinsiceloam_e1":{"type":"string","val":"28.0"}


          //,"extNoOfMarkers":{"type":"string","val":"2"}
          //,"extMarkerSize":{"type":"string","val":"0.152"}
          ,"extXPlus":{"type":"string","val":"2.5"}
          ,"extXMinus":{"type":"string","val":"-2.5"}
          ,"extYPlus":{"type":"string","val":"4.0"}
          ,"extYMinus":{"type":"string","val":"-4.0"}
          ,"extZPlus":{"type":"string","val":"0.0"}
          ,"extZMinus":{"type":"string","val":"10.5"}
          ,"extroilidarX":{"type":"string","val":"1.5708"}
          ,"extroilidarY":{"type":"string","val":"-1.5708"}
          ,"extroilidarZ":{"type":"string","val":"0.0"}
          ,"extMaxIt":{"type":"string","val":"1"}
          ,"extLidarIntensity":{"type":"string","val":"0.0082000"}
          //JSON.stringify(diskList)}
        };
        var rosCfg = process.env['HOME'] + "/gazecfg/ros.cfg";
        if (fs.existsSync(rosCfg)) {
          //console.log("get file exists");
          var res = fs.readFileSync(rosCfg).toString();
          //console.log(res);
          var resIni = res.split(";\n");
          var resIT = [];
          for(var i in resIni) {
            if(resIni[i] == '') continue;
            var t = resIni[i].split("=");
            if(t.length > 1) {
              t[1] = t[1].replace(new RegExp("\"","gi"),"");
              if("diskmount" == t[0].trim()) {
                //rosCfgFormat[j].val = JSON.stringify(diskList); 
                var dl = JSON.stringify(diskList);
                var dll = dl.replace(new RegExp("\"","gi"),"\'");
                resIT.push({header:t[0].trim(),value:dll});
              } else {
                resIT.push({header:t[0].trim(),value:t[1].trim()});
              }
            }
          }


          //console.log(resIT);
          for(var i in resIT) {
            for(var j in rosCfgFormat) {
              if(j == resIT[i].header) {
                if(rosCfgFormat[j].type == "string") {
                  rosCfgFormat[j].val = resIT[i].value; 
                } else if(rosCfgFormat[j].type == "int") {
                  rosCfgFormat[j].val = parseInt(resIT[i].value); 
                } else if(rosCfgFormat[j].type == "float") {
                  rosCfgFormat[j].val = parseFloat(resIT[i].value); 
                } else if(rosCfgFormat[j].type == "double") {
                  rosCfgFormat[j].val = parseDouble(resIT[i].value); 
                } else if(rosCfgFormat[j].type == "bool") {
                  if(resIT[i].value) {
                    rosCfgFormat[j].val = true;
                  } else {
                    rosCfgFormat[j].val = false;
                  }
                }
              }
            }
          }
          //console.log(rosCfgFormat);
        } else {
          for(var j in rosCfgFormat) {
            if(j == 'diskmount') {
              var dl = JSON.stringify(diskList);
              rosCfgFormat[j]['val'] = dl.replace(new RegExp("\"","gi"),"\'");
            }
          }
          var resIni = "";
          for(var j in rosCfgFormat) {
            if(rosCfgFormat[j].type == "string") {
              resIni += j + " = \"" + rosCfgFormat[j].val + "\";\n";
            } else if(rosCfgFormat[j].type == "int") {
              resIni += j + " = " + parseInt(rosCfgFormat[j].val) + ";\n";
            } else if(rosCfgFormat[j].type == "float") {
              resIni += j + " = " + parseFloat(rosCfgFormat[j].val) + ";\n";
            } else if(rosCfgFormat[j].type == "double") {
              resIni += j + " = " + parseDouble(rosCfgFormat[j].val) + ";\n";
            } else if(rosCfgFormat[j].type == "bool") {
              if(resIT[i].value) {
                resIni += j + " = " + true + ";\n";
              } else {
                resIni += j + " = " + false + ";\n";
              }
            }
          }
          //console.log("new config is added");
          //console.log(resIni);
          fs.writeFileSync(rosCfg,resIni,{mode:'777'});
        }
        var gazeDataList = {"success":"operation is get config",rosCfgFormat:rosCfgFormat};
        response.setHeader('Content-type' , 'text/json');
        response.end(JSON.stringify(gazeDataList));
      });
    }
  }

  vidteq._nodeServer.prototype.detectDiskSpace = function (diskMount,cb) {
    var that = this;
    var fs = require('fs');
    var gazeCfgFormat = {
      "primaryStoragePath":{"type":"string","val":""}
      ,"secondaryStoragePath":{"type":"string","val":""}
    };
    var rosCfg = process.env['HOME'] + "/gazecfg/gaze.cfg";
    if (fs.existsSync(rosCfg)) {
      var res = fs.readFileSync(rosCfg).toString();
      var resIni = res.split(";\n");
      var resIT = [];
      for(var i in resIni) {
        if(resIni[i] == '') continue;
        var t = resIni[i].split("=");
        if(t.length > 1) {
          t[1] = t[1].replace(new RegExp("\"","gi"),"");
          resIT.push({header:t[0].trim(),value:t[1].trim()});
        }
      }
      //console.log(resIT);
      for(var i in resIT) {
        for(var j in gazeCfgFormat) {
          if(j == resIT[i].header) {
            if(gazeCfgFormat[j].type == "string") {
              gazeCfgFormat[j].val = resIT[i].value; 
            } else if(gazeCfgFormat[j].type == "int") {
              gazeCfgFormat[j].val = parseInt(resIT[i].value); 
            } else if(gazeCfgFormat[j].type == "float") {
              gazeCfgFormat[j].val = parseFloat(resIT[i].value); 
            } else if(gazeCfgFormat[j].type == "double") {
              gazeCfgFormat[j].val = parseDouble(resIT[i].value); 
            } else if(gazeCfgFormat[j].type == "bool") {
              if(resIT[i].value) {
                gazeCfgFormat[j].val = true;
              } else {
                gazeCfgFormat[j].val = false;
              }
            }
          }
        }
      }
    }


    var rosCfgFormat = {
      "primaryStorage_All":{"type":"string","val":""}
      ,"secondaryStorage_All":{"type":"string","val":""}
      ,"thirdStorage_All":{"type":"string","val":""}
    };
    var rosCfg = process.env['HOME'] + "/gazecfg/ros.cfg";
    if (fs.existsSync(rosCfg)) {
      var res = fs.readFileSync(rosCfg).toString();
      var resIni = res.split(";\n");
      var resIT = [];
      for(var i in resIni) {
        if(resIni[i] == '') continue;
        var t = resIni[i].split("=");
        if(t.length > 1) {
          t[1] = t[1].replace(new RegExp("\"","gi"),"");
          resIT.push({header:t[0].trim(),value:t[1].trim()});
        }
      }
      //console.log(resIT);
      for(var i in resIT) {
        for(var j in rosCfgFormat) {
          if(j == resIT[i].header) {
            if(rosCfgFormat[j].type == "string") {
              rosCfgFormat[j].val = resIT[i].value; 
            } else if(rosCfgFormat[j].type == "int") {
              rosCfgFormat[j].val = parseInt(resIT[i].value); 
            } else if(rosCfgFormat[j].type == "float") {
              rosCfgFormat[j].val = parseFloat(resIT[i].value); 
            } else if(rosCfgFormat[j].type == "double") {
              rosCfgFormat[j].val = parseDouble(resIT[i].value); 
            } else if(rosCfgFormat[j].type == "bool") {
              if(resIT[i].value) {
                rosCfgFormat[j].val = true;
              } else {
                rosCfgFormat[j].val = false;
              }
            }
          }
        }
      }
    }
    console.log("inside detectDiskSpace");
    var exec = require('child_process').exec;
    var srcDirCheck = "df -Ph "+diskMount+" | awk '{print $1\",\"$2\",\"$3\",\"$4\",\"$5\",\"$6}'";
    var finalRes = [];
    exec(srcDirCheck,(err,stdout,stderr) => {
      var std = stdout.split(/\n/);
      var diskVal = [];
      var keys = [];
      for(var i in std) {
        if(i == 0) {
          keys = std[i].split(/,/);
        } else {
          if(std[i] == '') {} else {
            var value = std[i].split(/,/);
            var innerVal = {};
            for(var j in keys) {
              innerVal[keys[j]] = value[j];
            }
            diskVal.push(innerVal);
          }
        }
      }
      if(cb) cb(diskVal,rosCfgFormat,gazeCfgFormat);
    });
  }

  vidteq._nodeServer.prototype.calibrationConfReader = function() {
    var fs = require('fs');
    var calibCfg = process.env['HOME'] + "/gazecfg/calibration.cfg";
    var calibCfgFormat = {
      "frontNearX":{"type":"string","val":"0"}
      ,"frontNearY":{"type":"string","val":"0"}
      ,"frontNearZ":{"type":"string","val":"0"}
      ,"sideRightX":{"type":"string","val":"0"}
      ,"sideRightY":{"type":"string","val":"0"}
      ,"sideRightZ":{"type":"string","val":"0"}
      ,"sideLeftX":{"type":"string","val":"0"}
      ,"sideLeftY":{"type":"string","val":"0"}
      ,"sideLeftZ":{"type":"string","val":"0"}
      ,"rearNearX":{"type":"string","val":"0"}
      ,"rearNearY":{"type":"string","val":"0"}
      ,"rearNearZ":{"type":"string","val":"0"}
      ,"vidteqX":{"type":"string","val":"0"}
      ,"vidteqY":{"type":"string","val":"0"}
      ,"vidteqZ":{"type":"string","val":"0"}  
      ,"intBoardMatrix":{"type":"string","val":"9x7"}
      ,"intSquareSize":{"type":"string","val":"0.025"}
      ,"extNoOfMarkers":{"type":"string","val":"2"}
      ,"extMarkerSize":{"type":"string","val":"0.152"}              
      ,"extXPlus":{"type":"string","val":"2.5"}
      ,"extXMinus":{"type":"string","val":"-2.5"}
      ,"extYPlus":{"type":"string","val":"4.0"}
      ,"extYMinus":{"type":"string","val":"-4.0"}
      ,"extZPlus":{"type":"string","val":"0.0"}
      ,"extZMinus":{"type":"string","val":"10.5"}                
      ,"extroilidarX":{"type":"string","val":"1.5708"}
      ,"extroilidarY":{"type":"string","val":"-1.5708"}
      ,"extroilidarZ":{"type":"string","val":"0.0"}
      ,"extMaxIt":{"type":"string","val":"1"}
      ,"extLidarIntensity":{"type":"string","val":"0.0082000"}
    };   

    if (fs.existsSync(calibCfg)) {
      //console.log("get file exists");
      var res = fs.readFileSync(calibCfg).toString();
      //console.log(res);
      var resIni = res.split(";\n");
      var resIT = [];
      for(var i in resIni) {
        if(resIni[i] == '') continue;
        var t = resIni[i].split("=");
        if(t.length > 1) {
          t[1] = t[1].replace(new RegExp("\"","gi"),"");            
          resIT.push({header:t[0].trim(),value:t[1].trim()});            
        }
      }

      //console.log(resIT);
      for(var i in resIT) {
        for(var j in calibCfgFormat) {
          if(j == resIT[i].header) {
            if(calibCfgFormat[j].type == "string") {
              calibCfgFormat[j].val = resIT[i].value; 
            } else if(calibCfgFormat[j].type == "int") {
              calibCfgFormat[j].val = parseInt(resIT[i].value); 
            } else if(calibCfgFormat[j].type == "float") {
              calibCfgFormat[j].val = parseFloat(resIT[i].value); 
            } else if(calibCfgFormat[j].type == "double") {
              calibCfgFormat[j].val = parseDouble(resIT[i].value); 
            } else if(calibCfgFormat[j].type == "bool") {
              if(resIT[i].value) {
                calibCfgFormat[j].val = true;
              } else {
                calibCfgFormat[j].val = false;
              }
            }
          }
        }
      }
      //console.log(calibCfgFormat);
    //} else {        
    //  var resIni = "";
    //  for(var j in calibCfgFormat) {
    //    if(calibCfgFormat[j].type == "string") {
    //      resIni += j + " = \"" + calibCfgFormat[j].val + "\";\n";
    //    } else if(calibCfgFormat[j].type == "int") {
    //      resIni += j + " = " + parseInt(calibCfgFormat[j].val) + ";\n";
    //    } else if(calibCfgFormat[j].type == "float") {
    //      resIni += j + " = " + parseFloat(calibCfgFormat[j].val) + ";\n";
    //    } else if(calibCfgFormat[j].type == "double") {
    //      resIni += j + " = " + parseDouble(calibCfgFormat[j].val) + ";\n";
    //    } else if(calibCfgFormat[j].type == "bool") {
    //      if(resIT[i].value) {
    //        resIni += j + " = " + true + ";\n";
    //      } else {
    //        resIni += j + " = " + false + ";\n";
    //      }
    //    }
    //  }
    //  //console.log("new config is added");
    //  //console.log(resIni);
    //  fs.writeFileSync(calibCfg,resIni,{mode:'777'});
    }
    return calibCfgFormat;
  }

  vidteq._nodeServer.prototype.waitAndProcess = function(cb) {
    if(this.waitTimer) clearTimeout(this.waitTimer);
    this.waitTimer = setTimeout(function () {
      if(cb) cb();
    },2000);
  }

  vidteq._nodeServer.prototype.killGPS = function(prog,cb) {
    var exec = require('child_process').exec;
    exec(`ps -C ${prog} -o pid --no-headers`,function (error, stdout, stderr) {
      //console.log('stdout: ' + stdout);
      exec(`kill -9 ${stdout}`,function (error, stdout, stderr) {
        if(cb) cb();
      });
    });
  }

  vidteq._nodeServer.prototype.killRos = function(prog,cb) {
    var exec = require('child_process').exec;
    exec(`pkill ${prog}`,function (error, stdout, stderr) {
      //console.log('stdout: ' + stdout);
      if(cb) cb();
    });
  }

  vidteq._nodeServer.prototype.deleteFiles = function(prog,cb) {
    var exec = require('child_process').exec;
    exec(`/bin/rm -rf ${prog}*`,function (error, stdout, stderr) {
      //console.log('stdout: ' + stdout);
      if(cb) cb();
    });
  }

  vidteq._nodeServer.prototype.renderFiles = function(request, response) {
    var fs = this.fs || require('fs');
    var url = this.url || require("url");
    var urlObj = url.parse(request.url, true);
    this.debugMsg(urlObj);    
    var href = urlObj.pathname;
    this.debugMsg("first href "+href);
    if (href.match(/^\/home/)) { } else {
      //href = './' + href;
      var parentDir = __dirname;
      href = parentDir + href;
    }
    this.debugMsg("later href "+href);
    var that = this;
    fs.readFile(href, function (err, data) {
      if (!err) {
        var dotoffset = href.lastIndexOf('.');
        var mimetype = dotoffset == -1
                        ? 'text/plain'
                        : {
                            '.html' : 'text/html'
                            ,'.ico' : 'image/x-icon'
                            ,'.jpg' : 'image/jpeg'
                            ,'.png' : 'image/png'
                            ,'.gif' : 'image/gif'
                            ,'.eot' : 'application/vnd.ms-fontobject'
                            ,'.ttf' : 'application/octet-stream'
                            ,'.svg' : 'image/svg+xml'
                            ,'.woff' : 'application/font-woff'
                            ,'.woff2' : 'application/font-woff2'
                            ,'.css' : 'text/css'
                            ,'.js' : 'text/javascript'
                            ,'.json' : 'text/json'
                            //,'.pbf' : 'application/xml'
                            //,'.php' : 'text/php'
                            }[ href.substr(dotoffset) ];        
        that.debugMsg( request.url, mimetype );
        if(mimetype) {
          response.setHeader('Content-type' , mimetype);
          response.end(data);        
        } else {
          that.debugMsg(href + " mimitype " + mimetype);
          response.writeHead(400, "mimetype undefined");
          response.end();
        }                            
      } else {
        that.debugMsg(err);
        that.debugMsg('file not found: ' + href);
        response.writeHead(404, "Not Found");
        response.end();
      }
    });
  }






  vidteq._nodeServer.prototype.walkFileSync = function (dir, filelist) {
    var fs = this.fs || require('fs');    
    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    var that = this;
    files.forEach(function(file) {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = that.walkFileSync(dir + file + '/', filelist);
      }
      else {
        filelist.push(dir + file);
      }
    });
    return filelist;
  }

  vidteq._nodeServer.prototype.getImageList = function (gazeDataList) {
    for(var i in this.gazeFileList) {
      if(this.gazeFileList[i].match(/\.jpg/)) {
        for(var j in this.serialNList) {
          if(this.gazeFileList[i].match(new RegExp(this.serialNList[j],"gi"))) {
            var sn = "";
            if(this.serialNList[j] == '16363225') {
              if(this.gazeFileList[i].match(new RegExp("_l_","gi"))) {
                sn = this.serialNList[j] + "_l";
              } else if(this.gazeFileList[i].match(new RegExp("_r_","gi"))) {
                sn = this.serialNList[j] + "_r";
              }
            } else {
              sn = this.serialNList[j];
            }
            if(sn != "") {
              if(typeof(gazeDataList[sn]) == 'undefined') {
                gazeDataList[sn] = [];
              }
              gazeDataList[sn].push(this.gazeFileList[i]);
            }
          }
        }
      }
    }
  }
  
  vidteq.nodeServer = new vidteq._nodeServer();
})();


