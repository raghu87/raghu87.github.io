(function () {
  if(typeof(vidteq) == 'undefined') { vidteq = {}; }
  
  vidteq._nodeServer = function() {
    this.addLibs();        
    this.debugInit();      
    this.debug = true;
    this.homePath = "";
    this.rosStarted = false;
    this.port = 4000;    
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



    //if(this.cacheRosTopicsTimer) clearInterval(this.cacheRosTopicsTimer);
    //this.cacheRosTopicsTimer = setInterval(function () {
    //  that.cacheRosTopics(); 
    //},1000);

  }

  vidteq._nodeServer.prototype.addLibs = function () {
    this.http = require('http');
    this.fs = require('fs');
    this.url = require("url");
    this.path = require("path");
    //this.rosnodejs = require('rosnodejs');
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

  vidteq._nodeServer.prototype.requestHandler = function (request, response) {
    var that = this;    
    switch(request.url) {
      case '/' : 
        request.url = "index.html";
        this.renderFiles (request, response);
        break;
      default:
        this.renderFiles (request, response);
    }
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

  vidteq.nodeServer = new vidteq._nodeServer();
})();

