if (typeof(vidteq) == 'undefined') { vidteq = {}; }
vidteq._cma = function() {
  //this.debug = new vidteq._debug();
  this.init();
}

vidteq._debug = function () {
  if(typeof(console) != 'undefined') {
    console.log("debug mode on");
  }
}

vidteq._debug.prototype.log = function() {  
  if(typeof(console) != 'undefined') {
    for(var i in arguments) {
      console.log(arguments[i]);
    }    
  }
}

vidteq._cma.prototype.init = function () {
  //this.debug.log("cma loaded");
  //var that = this;
  //this.serverPath = "";  
  //$('#serverPathName').change(function(e) {    
  //  if($(this).val() == 'vidteq') {
  //    that.serverPath = "http://www.vidteq.com";
  //  } else if($(this).val() == 'local') {
  //    that.serverPath = "";
  //  }
  //});
  
  this.xlReader = vidteq.xlReader = new vidteq._xlReader();
  this.xlDownloader = vidteq.xlDownloader = new vidteq._xlDownloader();   

  this.attachEvent();

  var type = $('#uploadType').val();
  if(type=='nemomapping') { this.createNewAc(); }
}

vidteq._cma.prototype.attachEvent = function(){
  var that = this;
  $('#uploadType').change(function(e) {    
    if($(this).val() == 'nemomapping') {
      that.createNewAc();    
    }
  });
  
  $('#showMappingList').click(function () {
    if($.trim($('#downloadUrlid').val()) == "") {     
      alert('Enter the urlid to see the Mapping');
      return;
    }
    var urlid = $.trim($('#downloadUrlid').val());
    var city = $.trim($('#cityNames').val());
    var data = {action:'downloadXlMapping',urlid:urlid,city:city,serverPath:$('#serverPathName').val(),modeType:$('#uploadModeType').val()};
    var magicCall = $.ajax({                
      //url:'../../vs/classes/nemoMapping.php'
      url:'nemoMapping.php'
      ,type:"POST"            
      ,data:data
      ,crossDomain: true
      ,dataType: 'json'
      ,success: function (res) {
        console.log(res);
        if(typeof(res) == 'string') res = JSON.parse(res);
        //displayMappingSummary
        var html = "<table style='text-align:center;' width='100%' border='1px'><tr><th>urlid</th><th>mapid</th><th>name</th><th>address</th><th>geom</th><th>lastmile</th><th >ftrule integration</th><th>ftrule testing</th><th>status</th></tr>";
        for(var i in res) {
          html += "<tr><td>"+res[i].urlid+"</td><td>"+res[i].mapid;+"</td>";
          
          var ft = JSON.parse(res[i].ftrule);          
          ft['mapId'] = res[i].mapid;
          var tft = JSON.parse(res[i].ftrule);
          delete tft['center']['address'];
          delete tft['center']['geom'];
          delete tft['center']['icon'];
          delete tft['lastMileRoute'];
          tft['mapId'] = res[i].mapid;  
          var statustest = res[i].tested || '';           
          var url = "../../embed3.php?city="+city+"&urlid="+res[i].urlid+"&firstTimeRule="+JSON.stringify(tft);
          html +="<td><a href="+url+" target='_blank'>"+ft['center']['address']['name']+"</a></td>";
          html +="<td>"+ft['center']['address']['addr1']+"</td>";
          html +="<td>"+ft['center']['geom']+"</td>";
          html +="<td>"+JSON.stringify(ft['lastMileRoute'])+"</td>";
          html +="<td>"+JSON.stringify(tft)+"</td>";
          html +="<td>"+JSON.stringify(ft)+"</td>";
          html +="<td>"+statustest+"</td>";
          html += "</tr>";
         
        }
        html += "</table>";
        $('#displayMappingSummary').html(html);
      }   
      ,error: function() { 
        
      }
    });
  });
  
  $('#downloadMappingList').click(function () {
    if($.trim($('#downloadUrlid').val()) == "") {     
      alert('Enter the urlid to see the Mapping');
      return;
    }
    var urlid = $.trim($('#downloadUrlid').val());
    var city = $.trim($('#cityNames').val());
    var data = {action:'downloadXlMapping',urlid:urlid,city:city,serverPath:$('#serverPathName').val(),modeType:$('#uploadModeType').val()};
    var magicCall = $.ajax({                
      //url:'../../vs/classes/nemoMapping.php'
      url:'nemoMapping.php'
      ,type:"POST"            
      ,data:data
      ,crossDomain: true
      ,dataType: 'json'
      ,success: function (response) {
        //console.log(response);
        if(typeof(response) == 'string') response = JSON.parse(response);
        var mapData = [];
        var schema = that.getFTMappingSchema();
        //console.log(schema);
        for(var k = response.length-1;k>=0;k--) {
          var keysInner = []
          ,dataInner = []
          ,schemaInner = [];
          
          
          //if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'address') {
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
          //    if($.trim(newContent[i]['data'][j]) != "") {
          //      addressInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
          //    }
          //  } else if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'geom') {
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
          //    if($.trim(newContent[i]['data'][j]) != "") {
          //      geomInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
          //    }
          //  } else if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'image') {
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
          //    if($.trim(newContent[i]['data'][j]) != "") {
          //      imageInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
          //    }
          //  } else if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'icon') {
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
          //    if($.trim(newContent[i]['data'][j]) != "") {
          //      iconInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
          //    }
          //  } else if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'last_mile') {
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
          //    newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
          //    if($.trim(newContent[i]['data'][j]) != "") {
          //      lastmileInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
          //    }                          
          //  } else {
          //    dataInner [ newContent[i]['schema'][j].key ] = newContent[i]['data'][j];
          //  }  
          
          //console.log(response[k]);
          if('ftrule' in response[k]) {
            var ftrule = JSON.parse(response[k].ftrule);
            //console.log(ftrule);
            for(var j in schema['schema']) {
              if(schema['keys'][j]['header'] == 'ftrule') {
                continue;
              }
              
              if('merge' in schema['schema'][j] && schema['schema'][j].merge == 'address') {
                keysInner.push(schema['keys'][j]);
                
                
                dataInner.push(ftrule['center'][schema['schema'][j]['merge']][schema['schema'][j]['key']]);
                
                schemaInner.push(schema['schema'][j]);
                
              } else if('merge' in schema['schema'][j] && schema['schema'][j].merge == 'geom') {
                keysInner.push(schema['keys'][j]);
                
                
                dataInner.push(ftrule['center'][schema['schema'][j]['key']]);
                
                schemaInner.push(schema['schema'][j]);
                
              } else if('merge' in schema['schema'][j] && schema['schema'][j].merge == 'image') {
                keysInner.push(schema['keys'][j]);
                
                
                //dataInner.push(ftrule['center']['address'][schema['schema'][j]['merge']][schema['schema'][j]['key']]);
                dataInner.push('');
                
                schemaInner.push(schema['schema'][j]);
                
              } else if('merge' in schema['schema'][j] && schema['schema'][j].merge == 'icon') {
                keysInner.push(schema['keys'][j]);
                
                if(schema['schema'][j]['hashname'] == 'name') {
                 dataInner.push(ftrule['center'][schema['schema'][j]['merge']][schema['schema'][j]['hashname']]);
                 
                } else if(schema['schema'][j]['hashname'] == 'size') {
                 var icon_size = ftrule['center'][schema['schema'][j]['merge']]['w']+" "+ftrule['center'][schema['schema'][j]['merge']]['h'];
                 dataInner.push(icon_size);
                 
                
                }
              //  dataInner.push(ftrule['center'][schema['schema'][j]['merge']][schema['schema'][j]['key']]);
                
                schemaInner.push(schema['schema'][j]);
               
              } else if('merge' in schema['schema'][j] && schema['schema'][j].merge == 'last_mile') {
                keysInner.push(schema['keys'][j]);
                
                if(schema['schema'][j]['hashname'] == 'name') {
                 dataInner.push(ftrule['lastMileRoute']['start']['address'][schema['schema'][j]['hashname']]);
                 
                } else if(schema['schema'][j]['hashname'] == 'geom') {
                 dataInner.push(ftrule['lastMileRoute']['start'][schema['schema'][j]['hashname']]);
                 
                } else if(schema['schema'][j]['hashname'] == 'via') {
                 dataInner.push(ftrule['lastMileRoute']['start'][schema['schema'][j]['hashname']]);
                 
                }  else if(schema['schema'][j]['hashname'] == 'autoPlay') {
                 dataInner.push(ftrule['lastMileRoute'][schema['schema'][j]['hashname']]);
                 
                }
                
                schemaInner.push(schema['schema'][j]);
                
              } else {
                 if(schema['keys'][j]['header'] == 'city') {
                   keysInner.push(schema['keys'][j]);
                dataInner.push($.trim($('#cityNames').val()));
                schemaInner.push(schema['schema'][j]);
                 } else {
                keysInner.push(schema['keys'][j]);
                dataInner.push(response[k][schema['schema'][j]['key']]);
                schemaInner.push(schema['schema'][j]);  
                 }
                
               
              }
              
              
              
              
              
              
             
            }
          }
          
          mapData.push({data:dataInner,keys:keysInner,schema:schemaInner});
        }
        
        console.log('rearrange the schema ',mapData);

        var givenDate = that.returnDate();
        var fileName = "business_"+givenDate+".xlsx";
        var passVar = {
          accountInfo:{
            content : mapData
            ,fileName : 'Sheet1'
          }
        };
        fileName = 'nemoMapping_'+fileName;
        
        return that.xlDownloader.downloadExcelSheet(passVar,fileName);
      }   
      ,error: function() { 
        
      }
    });
  });
}

vidteq._cma.prototype.returnDate = function() {
  var m_names = new Array("January", "February", "March", 
    "April", "May", "June", "July", "August", "September", 
    "October", "November", "December");
  var d = new Date();
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  var curr_year = d.getFullYear();
  var givenDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;
  return givenDate;
}


vidteq._cma.prototype.getFileName = function() {
  var type = $('#uploadType').val();
  var fileName = 'xlJsonTextFile.txt';
  switch(type) {
    case 'nemomapping' : 
      fileName = 'xlCmaJSONTxt.txt';
      break;    
    default : 
      fileName = 'xlJsonTextFile.txt';
      break;
  }
  return fileName;
}

vidteq._cma.prototype.manipulateContent = function(content) {
  //this.debug.log('inside manipulateContent ',content);
  var type = $('#uploadType').val();  
  var missing360 = "";
  switch (type) {
    case 'nemomapping' : 
      var tCon = JSON.parse(content);
      console.log('inside manipulateContent ',tCon);
      var newContent = [];
      for(var l in tCon) {        
        for(var k in tCon[l]) {        
          newContent.push(this.getFTMappingSchema(tCon[l][k]));
        }
      }

      //console.log('console.log(tCon.Sheet1);');
      console.log(newContent);
      var excelBackup = JSON.stringify(newContent);
      var mapData = [];
      for(var i in newContent) {
        var keyVal = {
          keys:[]
          ,data:[]
          ,schema:[]        
        };
        if('schema' in newContent[i]) {
          var keysInner = []
          ,dataInner = {}
          ,addressInner = {}
          ,geomInner = {}
          ,imageInner = {}
          ,iconInner = {}
          ,lastmileInner = {};
          var tVal = {};
//"firstTimeRule={"manner":"videoMap","center":{"address":{"name":"Vasudeva Residency","addr1":"4th C Main Road, Bhuvanagiri, Lakshmamma Layout, Banaswadi, Kasturi Nagar, Bangalore - 560043, Karnataka"},"image":[{"name":"cqzy-wg4Qq68AMFmjhF00w","url":"https://s3-ap-southeast-1.amazonaws.com/zenifyphotos/"}],"geom":"POINT(77.656108 13.010067)","icon":{"name":"property-marker-2.png","w":32,"h":37,"url":"images"}},"lastMileRoute":{"start":{"address":{"name":"Ramamurthy Nagar Jn"},"geom":"POINT(77.6623764 13.0132329)","via":[]},"autoPlay":1},"initVolume":false}"
          for(var j in newContent[i]['schema']) {                  
            if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'address') {
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
              if($.trim(newContent[i]['data'][j]) != "") {
                addressInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
              }
            } else if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'geom') {
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
              if($.trim(newContent[i]['data'][j]) != "") {
                geomInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
              }
            } else if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'image') {
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
              if($.trim(newContent[i]['data'][j]) != "") {
                imageInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
              }
            } else if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'icon') {
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
              if($.trim(newContent[i]['data'][j]) != "") {
                iconInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
              }
            } else if('merge' in newContent[i]['schema'][j] && newContent[i]['schema'][j].merge == 'last_mile') {
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/'+/g, "");
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/[\t\n]+/g,' ');
              newContent[i]['data'][j] = newContent[i]['data'][j].replace(/"+/g, "");
              if($.trim(newContent[i]['data'][j]) != "") {
                lastmileInner [ newContent[i]['schema'][j].key ] = $.trim(newContent[i]['data'][j]);
              }                          
            } else {
              //if(newContent[i]['schema'][j].key == 'tested') {
              //  dataInner [ newContent[i]['schema'][j].key ] = encodeURIComponent(newContent[i]['data'][j]);
              //} else {
                dataInner [ newContent[i]['schema'][j].key ] = newContent[i]['data'][j]; 
              //}
              
            }            
          }
          //if('config' in dataInner) {
          //  dataInner['config'] = JSON.stringify(schemaInner);
          //}
          //mapData.push(dataInner);
          
          //console.log('rearrange other data ');
          //console.log(addressInner);
          //console.log(geomInner);
          //console.log(imageInner);
          //console.log(iconInner);
          //console.log(lastmileInner);
          
          var ftRule = {
            "manner":"videoMap"
            ,"center": {
              "address":{                
              }
              ,"image":""
              ,"geom":""
              ,"icon":{
                "name":"property-marker-2.png"
                ,"w":32
                ,"h":37
                ,"url":"images"
              }
            }
            ,"lastMileRoute":{
              "start":{
                "address":{
                  "name":""
                }
                ,"geom":""
                ,"via":[]
              }
              ,"autoPlay":1
            }
            ,"initVolume":false
          };
          if(addressInner['name']) {
            ftRule['center']['address']['name'] = addressInner['name'];
          }
          if(addressInner['addr1']) {
            ftRule['center']['address']['addr1'] = addressInner['addr1'];
          }
          if(addressInner['addr2']) {
            ftRule['center']['address']['addr2'] = addressInner['addr2'];
          }
          if(addressInner['addr3']) {
            ftRule['center']['address']['addr3'] = addressInner['addr3'];
          }
          if(addressInner['addr4']) {
            ftRule['center']['address']['addr4'] = addressInner['addr4'];
          }
          if(addressInner['pin']) {
            ftRule['center']['address']['pin'] = addressInner['pin'];
          }
          if(addressInner['email']) {
            ftRule['center']['address']['email'] = addressInner['email'];
          }
          if(addressInner['website']) {
            ftRule['center']['address']['website'] = addressInner['website'];
          }
          if(addressInner['phone']) {
            ftRule['center']['address']['phone'] = addressInner['phone'];
          }
          
          if(geomInner['geom']) {
            ftRule['center']['geom'] = geomInner['geom'];
          }
          
          if(lastmileInner['last_mile_name']) {
            ftRule['lastMileRoute']['start']['address']['name'] = lastmileInner['last_mile_name'];
          }
          
          if(lastmileInner['last_mile_geom']) {
            ftRule['lastMileRoute']['start']['geom'] = lastmileInner['last_mile_geom'];
          }
          
          if(lastmileInner['last_mile_via']) {
            var newID = [];
            lastmileInner['last_mile_via']= lastmileInner['last_mile_via'].split(/\[|\]|,|\"/); 
            for(var newI in lastmileInner['last_mile_via']) {
              if(lastmileInner['last_mile_via'][newI] != "") {
                newID.push(lastmileInner['last_mile_via'][newI]);
              }
            }
            lastmileInner['last_mile_via'] = newID; 
            ftRule['lastMileRoute']['start']['via'] = lastmileInner['last_mile_via'];
          }
          
          if(lastmileInner['last_mile_autoplay']) {
            ftRule['lastMileRoute']['autoPlay'] = lastmileInner['last_mile_autoplay'];
          }
          
          if(iconInner['icon']) {
            ftRule['center']['icon']['name'] = iconInner['icon'];
          }
          
          if(iconInner['icon_size']) {
            iconInner['icon_size'] = iconInner['icon_size'].split(/\s/g);             
            ftRule['center']['icon']['w'] = iconInner['icon_size'][0];
            ftRule['center']['icon']['h'] = iconInner['icon_size'][1];
          }
          //console.log(ftRule); 
          if('ftrule' in dataInner) {
            dataInner['ftrule'] = JSON.stringify(ftRule);
          }
          mapData.push(dataInner);
          
        }
        
        //console.log('rearrange ');
        //console.log(dataInner);
        //console.log(schemaInner);
        
      }
      console.log('rearrange the schema ',mapData);
      
      
      var city = $.trim($('#cityNames').val());
      var data = {action:'decodeMapping',city:city,mapData:JSON.stringify(mapData),serverPath:$('#serverPathName').val(),"pathPre":"cma/nemoMapping",modeType:$('#uploadModeType').val(),excelBackup:excelBackup};
      var magicCall = $.ajax({                
        //url:'../../vs/classes/nemoMapping.php'
        url:'nemoMapping.php'
        ,type:"POST"            
        ,data:data
        ,crossDomain: true
        ,dataType: 'json'
        ,success: function (res) {
          console.log(res);
          if(typeof(res) == 'string') response = JSON.parse(res);
          $('#drop').val('');
          if(res.error) {
            alert(res.error);
            return;
          }
          alert('done updating');
        }   
        ,error: function() { 
          
        }
      });


//http://10.4.71.200/local/raghu/which.php?city=bangalore&urlid=zenify&firstTimeRule=%7B%22manner%22%3A%22videoMap%22%2C%22center%22%3A%7B%22address%22%3A%7B%22name%22%3A%22Vasudeva%20Residency%22%2C%22addr1%22%3A%224th%20C%20Main%20Road%2C%20Bhuvanagiri%2C%20Lakshmamma%20Layout%2C%20Banaswadi%2C%20Kasturi%20Nagar%2C%20Bangalore%20-%20560043%2C%20Karnataka%22%7D%2C%22image%22%3A%5B%7B%22name%22%3A%22cqzy-wg4Qq68AMFmjhF00w%22%2C%22url%22%3A%22https%3A%2F%2Fs3-ap-southeast-1.amazonaws.com%2Fzenifyphotos%2F%22%7D%5D%2C%22geom%22%3A%22POINT(77.656108%2013.010067)%22%2C%22icon%22%3A%7B%22name%22%3A%22property-marker-2.png%22%2C%22w%22%3A32%2C%22h%22%3A37%2C%22url%22%3A%22images%22%7D%7D%2C%22lastMileRoute%22%3A%7B%22start%22%3A%7B%22address%22%3A%7B%22name%22%3A%22Ramamurthy%20Nagar%20Jn%22%7D%2C%22geom%22%3A%22POINT(77.6623764%2013.0132329)%22%2C%22via%22%3A%5B%5D%7D%2C%22autoPlay%22%3A1%7D%2C%22initVolume%22%3Afalse%7D&ver=116325135512


      break;  
    default : 
      return content;
      break;
  }
  return content;
}

vidteq._cma.prototype.createNewAc = function(){
  this.xlReader.init();
}

vidteq._cma.prototype.getFTMappingSchema = function(val) {
  var schema = [ 
    {column:'mapid',key: 'mapid', defaultVal:"",datatype:'integer',hashname:'mapid'}
    ,{column:'urlid',key: 'urlid', defaultVal: "",datatype:'integer',hashname:'urlid'}
    ,{column:'city',key: 'city', defaultVal: "bangalore",datatype:'text'}
    ,{column:'ftrule',key: 'ftrule', defaultVal: "",datatype:'text',hashname:'ftrule'}        
    //,{column:'creation_date',key: 'creation_date', defaultVal: "",datatype:'text',hashname:'creation_date'}
           
    ,{column:'name',key: 'name', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'name'}
    ,{column:'poiid',key: 'poiid', defaultVal: "",datatype:'integer',hashname:'poiid'}    
    
    ,{column:'addr1',key: 'addr1', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'addr1'}
    ,{column:'addr2',key: 'addr2', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'addr2'}        
    ,{column:'addr3',key: 'addr3', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'addr3'}
    ,{column:'addr4',key: 'addr4', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'addr4'}    
    ,{column:'pin',key: 'pin', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'pin'}
    ,{column:'phone',key: 'phone', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'phone'} 
    ,{column:'email',key: 'email', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'email'}
    ,{column:'website',key: 'website', defaultVal: "", top:'ftrule',datatype:'text',merge:'address',hashname:'website'}
    
    ,{column:'geom',key: 'geom', defaultVal: "", top:'ftrule',datatype:'text',merge:'geom',hashname:'geom'}
    
    ,{column:'image_name',key: 'image_name', defaultVal: "", top:'ftrule',datatype:'text',merge:'image',hashname:'name'}
    
    ,{column:'icon',key: 'icon', defaultVal: "", top:'ftrule',datatype:'text',merge:'icon',hashname:'name'}
    ,{column:'icon_size',key: 'icon_size', defaultVal: "", top:'ftrule',datatype:'text',merge:'icon',hashname:'size'}
       
    ,{column:'last_mile_poiid',key: 'last_mile_poiid', defaultVal: "",datatype:'integer',hashname:'last_mile_poiid'}
    ,{column:'last_mile_name',key: 'last_mile_name', defaultVal: "", top:'ftrule',datatype:'text',merge:'last_mile',hashname:'name'}
    ,{column:'last_mile_geom',key: 'last_mile_geom', defaultVal: "", top:'ftrule',datatype:'text',merge:'last_mile',hashname:'geom'}
    ,{column:'last_mile_via',key: 'last_mile_via', defaultVal: [], top:'ftrule',merge:'last_mile',hashname:'via'}    
    ,{column:'last_mile_autoplay',key: 'last_mile_autoplay', defaultVal: 0, top:'ftrule',merge:'last_mile',hashname:'autoPlay'}
    
    ,{column:'tested',key: 'tested', defaultVal: "",datatype:'text',hashname:'tested'}
    
    
    

  ];
  //"firstTimeRule={"manner":"videoMap","center":{"address":{"name":"Vasudeva Residency","addr1":"4th C Main Road, Bhuvanagiri, Lakshmamma Layout, Banaswadi, Kasturi Nagar, Bangalore - 560043, Karnataka"},"image":[{"name":"cqzy-wg4Qq68AMFmjhF00w","url":"https://s3-ap-southeast-1.amazonaws.com/zenifyphotos/"}],"geom":"POINT(77.656108 13.010067)","icon":{"name":"property-marker-2.png","w":32,"h":37,"url":"images"}},"lastMileRoute":{"start":{"address":{"name":"Ramamurthy Nagar Jn"},"geom":"POINT(77.6623764 13.0132329)","via":[]},"autoPlay":1},"initVolume":false}"

  var keys = [];
  for(var i in schema) {
    //keys.push({header:schema[i].key});
    keys.push({header:schema[i].column});
  }
  //console.log(val);
  var data = [];
  for(var i in schema) {    
    //console.log('i');
    if(typeof(val) != 'undefined' && val[schema[i].column] 
         && val[schema[i].column] != "") {       
      //data.push(val[schema[i].column]);
      if(typeof(val[schema[i].column]) == 'object') { val[schema[i].column] = JSON.stringify(val[schema[i].column]); }
      //if(typeof(val[schema[i].column]) == 'object') { val[schema[i].column] = val[schema[i].column]; }
      if(schema[i].column == 'geom') {
        var lonLat = this.lonLatObjFrmPoint(val[schema[i].column]);
        if(lonLat.lon && lonLat.lat) {
          var lonLatPoint = "POINT("+lonLat.lon+" "+lonLat.lat+")";
          val[schema[i].column] = lonLatPoint;
        }
      }
      data.push(val[schema[i].column]);
    } else {
      if(typeof(schema[i].defaultVal) == 'object') { schema[i].defaultVal = JSON.stringify(schema[i].defaultVal); }
      data.push(schema[i].defaultVal);
    }
  }  
  return {keys:keys,data:data,schema:schema};
}

vidteq._cma.prototype.lonLatObjFrmPoint = function(point) {
  if(typeof(point) == 'undefined' || point == null) return null;
  var temp=point.replace(/POINT\(/,"");
  temp=temp.replace(/\)/,"");
  temp=temp.replace(/\,/," ");
  var pt=temp.split(" ");
  var p={};
  p.lon=parseFloat(pt[0]).toFixed(6);
  p.lat=parseFloat(pt[1]).toFixed(6);
  return p;
}

/**
 * _xlUploader
 */
 
vidteq._xlReader = function () {
  //this.init();
}

vidteq._xlReader.prototype.init = function () {
  this.drop = document.getElementById('drop');
  this.tarea = document.getElementById('b64data');
  
  this.rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";
  if(!this.rABS) {
    document.getElementsByName("userabs")[0].disabled = true;
    document.getElementsByName("userabs")[0].checked = false;
  }
  this.use_worker = typeof Worker !== 'undefined';
  if(!this.use_worker) {
    document.getElementsByName("useworker")[0].disabled = true;
    document.getElementsByName("useworker")[0].checked = false;
  }

  this.transferable = this.use_worker;
  if(!this.transferable) {
    document.getElementsByName("xferable")[0].disabled = true;
    document.getElementsByName("xferable")[0].checked = false;
  }
  this.wtf_mode = false;

  this.attachEvents();
}

vidteq._xlReader.prototype.attachEvents = function () {
  var that = this;
  if(this.drop.addEventListener) {
    this.drop.addEventListener('dragenter', function(e) {
      that.handleDragover(e);
    }, false);
    this.drop.addEventListener('dragover', function(e) {
      that.handleDragover(e);
    }, false);
    this.drop.addEventListener('drop', function(e) {
      that.handleDrop(e);
    }, false);
    this.drop.addEventListener('change', function(e) {
      console.log('change');
      that.handleDrop(e);
    }, false);    
  }
}
  
vidteq._xlReader.prototype.getExt = function (file){
  return (/[.]/.exec(file)) ? /[^.]+$/.exec(file.toLowerCase()) : '';
}

vidteq._xlReader.prototype.handleDrop = function (e) {      
  var ext = this.getExt(e.target.files[0].name);  
  if (! (ext && /^(xls|xlsx)$/.test(ext))){
    alert('Error: invalid file extension (accepts only xls or xlsx format)');        
    return false;
  } 
  var type = $('#uploadType').val();
  if(type == '') {
    alert("Select any one upload type ");
    return false;
  }

  e.stopPropagation();
  e.preventDefault();
  this.rABS = document.getElementsByName("userabs")[0].checked;
  this.use_worker = document.getElementsByName("useworker")[0].checked;
  var files = e.target.files;
  var i,f;
  var that = this;
  for (i = 0, f = files[i]; i != files.length; ++i) {
    var reader = new FileReader();
    var name = f.name;
    reader.onload = function(e) {
      //if(typeof console !== 'undefined') console.log("onload", new Date(), that.rABS, that.use_worker);
      var data = e.target.result;
      if(that.use_worker) {
        if (ext && /^(xls)$/.test(ext)){
          that.xlsworker(data, vidteq.cmaObj.xlReader.process_wb);
        } else if ((ext && /^(xlsx)$/.test(ext))){
          that.xlsxworker(data, vidteq.cmaObj.xlReader.process_wb);
        }
      } else {
        var wb;
        if(that.rABS) {
          wb = XLS.read(data, {type: 'binary'});
        } else {
          var arr = that.fixdata(data);
          wb = XLS.read(btoa(arr), {type: 'base64'});
        }
        that.process_wb(wb);
      }
    };
    if(that.rABS) reader.readAsBinaryString(f);
    else reader.readAsArrayBuffer(f);
  }
}

vidteq._xlReader.prototype.handleDragover = function (e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

vidteq._xlReader.prototype.process_wb = function (wb) {  
  if(vidteq.cmaObj.xlReader.use_worker) XLS.SSF.load_table(wb.SSF);
  var output = "";
  switch(vidteq.cmaObj.xlReader.get_radio_value("format")) {
    case "json":
      output = JSON.stringify(vidteq.cmaObj.xlReader.to_json(wb), 2, 2);
      break;
    case "form":
      output = vidteq.cmaObj.xlReader.to_formulae(wb);
      break;
    default:
      output = vidteq.cmaObj.xlReader.to_csv(wb);
  }
  
  vidteq.downloadJsonTxtFile(output);  
  //if(typeof console !== 'undefined') console.log("output", new Date());
}

vidteq._xlReader.prototype.b64it = function () {
  //if(typeof console !== 'undefined') console.log("onload", new Date());
  var wb = XLS.read(this.tarea.value, {type: 'base64',WTF:this.wtf_mode});
  this.process_wb(wb);
}

vidteq._xlReader.prototype.to_formulae = function (workbook) {
  var result = [];
  workbook.SheetNames.forEach(function(sheetName) {
    var formulae = XLS.utils.get_formulae(workbook.Sheets[sheetName]);
    if(formulae.length > 0){
      result.push("SHEET: " + sheetName);
      result.push("");
      result.push(formulae.join("\n"));
    }
  });
  return result.join("\n");
}

vidteq._xlReader.prototype.xlsxworker_noxfer = function (data, cb) {
  console.log('xlsx');
  var worker = new Worker('./js/xlsxworker.js');
  worker.onmessage = function(e) {
    switch(e.data.t) {
      case 'ready': break;
      case 'e': 
        //if(typeof console !== 'undefined') console.error(e.data.d); 
        break;
      case 'xlsx': cb(JSON.parse(e.data.d)); break;
    }
  };
  var arr = this.rABS ? data : btoa(fixdata(data));
  worker.postMessage({d:arr,b:this.rABS});
}

vidteq._xlReader.prototype.xlsxworker_xfer = function (data, cb) {
  var worker = new Worker(this.rABS ? './js/xlsxworker2.js' : './js/xlsxworker1.js');
  worker.onmessage = function(e) {
    switch(e.data.t) {
      case 'ready': break;
      case 'e': 
        if(typeof console !== 'undefined') console.error(e.data.d); 
        break;
      default: 
        console.log(e);
        xx=vidteq.xlReader.ab2str(e.data).replace(/\n/g,"\\n").replace(/\r/g,"\\r"); console.log("done"); cb(JSON.parse(xx)); break;
    }
  };
  if(this.rABS) {
    var val = this.s2ab(data);
    worker.postMessage(val[1], [val[1]]);
  } else {
    worker.postMessage(data, [data]);
  }
}

vidteq._xlReader.prototype.xlsxworker = function (data, cb) {
  var transferable = document.getElementsByName("xferable")[0].checked;
  //var transferable = true;//document.getElementsByName("xferable")[0].checked;
  if(transferable) this.xlsxworker_xfer(data, cb);
  else this.xlsxworker_noxfer(data, cb);
}

vidteq._xlReader.prototype.xlsworker = function (data, cb) {
  var worker = new Worker('./js/xlsworker.js');
  worker.onmessage = function(e) {
    switch(e.data.t) {
      case 'ready': break;
      case 'e': 
        //console.error(e.data.d); 
        break;
      case 'xls': cb(JSON.parse(e.data.d)); break;
    }
  };
  var arr = this.rABS ? data : btoa(this.fixdata(data));
  worker.postMessage({d:arr,b:this.rABS});
}

vidteq._xlReader.prototype.get_radio_value = function ( radioName ) {
  var radios = document.getElementsByName( radioName );
  for( var i = 0; i < radios.length; i++ ) {
    if( radios[i].checked || radios.length === 1 ) {
      return radios[i].value;
    }
  }
}

vidteq._xlReader.prototype.to_json = function (workbook) {
  var result = {};
  workbook.SheetNames.forEach(function(sheetName) {
    var roa = XLS.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    if(roa.length > 0){
      result[sheetName] = roa;
    }
  });
  return result;
}

vidteq._xlReader.prototype.to_csv = function (workbook) {
  var result = [];
  workbook.SheetNames.forEach(function(sheetName) {
    var csv = XLS.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    if(csv.length > 0){
      result.push("SHEET: " + sheetName);
      result.push("");
      result.push(csv);
    }
  });
  return result.join("\n");
}

vidteq._xlReader.prototype.fixdata = function (data) {
  var o = "", l = 0, w = 10240;
  for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
  //o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(o.length)));
  o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
  return o;
}

vidteq._xlReader.prototype.s2ab = function (s) {
  var b = new ArrayBuffer(s.length*2), v = new Uint16Array(b);
  for (var i=0; i != s.length; ++i) v[i] = s.charCodeAt(i);
  return [v, b];
}

vidteq._xlReader.prototype.ab2str = function (data) {
  var o = "", l = 0, w = 10240;
  for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint16Array(data.slice(l*w,l*w+w)));
  o+=String.fromCharCode.apply(null, new Uint16Array(data.slice(l*w)));
  return o;
}

/**
 * _downloadExcelToJson
 */
 
vidteq.downloadJsonTxtFile = function(content) {  
  content = vidteq.cmaObj.manipulateContent(content);  
  var type = $('#uploadType').val();  
  if(type == 'nemomapping') {
    //console.log(content);
    return;
  } 
  var fileName = vidteq.cmaObj.getFileName();  
  var MIME_TYPE = 'application/mixare-json';
  window.URL = window.webkitURL || window.URL;
  //const MIME_TYPE = 'text/plain';  
  var output = $('#downloadContainer');  
  var bb = new Blob([content], {type: MIME_TYPE});
  
  var a = document.createElement('a');   
  a.download = fileName;//container.querySelector('input[type="text"]').value;
  a.href = window.URL.createObjectURL(bb);
  //a.textContent = 'Download ready';
  a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
  a.draggable = true; // Don't really need, but good practice.
  a.classList.add('dragout');
  $('#downloadContainer').append(a);

  var that = this;
  a.onclick = function(e) {
    if ('disabled' in this.dataset) {
      return false;
    }    
    setTimeout(function() {
      window.URL.revokeObjectURL(this.href);
    }, 1500);
  };
  a.click();
}


/**
 * _xlDownloader
 */
vidteq._xlDownloader = function () {
  this.initExcelDownloader ();
}

vidteq._xlDownloader.prototype.initExcelDownloader = function() {
  require.config({
    baseUrl: '',
    paths: {
      underscore: 'js/Underscore',
      JSZip: 'js/jszip',
      EB: 'excel-builder.js',
      //spin: '//cdnjs.cloudflare.com/ajax/libs/spin.js/1.2.7/spin.min',
      //image: '/3rdparty/requirejs/image',
      // text: '/3rdparty/requirejs/text'
    },
    shim: {
      'underscore': {
        exports: '_'
      },
      'JSZip': {
        exports: 'JSZip'
      },
      'swfobject': {
        exports: 'swfObject'
      }
    }
  });
}

vidteq._xlDownloader.prototype.processWorksheet = function(artistWorkbook,sheetName,data,keys) {
  //var albumList = artistWorkbook.createWorksheet({name: 'Sheet 1'}); // TBD can name the sheet
  var albumList = artistWorkbook.createWorksheet({name: sheetName}); // TBD can name the sheet
  var stylesheet = artistWorkbook.getStyleSheet();    
  var importantFormatter = stylesheet.createFormat({
    font: {
      bold: true           
    }
    ,fill: {
      type: 'pattern', 
      patternType: 'gray125', 
      fgColor: '7E7E80', 
      bgColor: '7E7E80'
    }
  });
  var themeColor = stylesheet.createFormat({
    font: {
      bold: true,
      color: {theme: 3}
    }
  });
  var ret=[];
  for(var j in keys){
    if(typeof(keys[j].header)=='undefined' || keys[j].header=='') continue;
    ret.push({value: keys[j].header, metadata: {style: importantFormatter.id}});    
  }
  data.unshift(ret);
  albumList.setData(data); //<-- Here's the important part
  return albumList;
}

vidteq._xlDownloader.prototype.downloadExcelSheet = function(passVar,fileName) {
  this.data = [];
  this.keys = [];
  this.fileName=[];
  for(var i in passVar) {
    this.data[i] = [];
    if('data' in passVar[i].content) {
      this.data[i].unshift(passVar[i].content.data);
      this.keys[i]=passVar[i].content.keys;
    } else {
      for(var j in passVar[i].content) {
        this.data[i].unshift(passVar[i].content[j].data);
        this.keys[i]=passVar[i].content[j].keys;    
      }
    }
    this.fileName[i] = passVar[i].fileName;    
  }
  //this.data.unshift(content.data);
  //this.keys=content.keys;
  //this.fileName=fileName;
  var that=this;
  require(['js/excel-builder'], function (EB) {
    var artistWorkbook = EB.createWorkbook();
    ////var albumList = artistWorkbook.createWorksheet({name: 'Sheet 1'}); // TBD can name the sheet
    //var albumList = artistWorkbook.createWorksheet({name: 'AccountDeatils'}); // TBD can name the sheet
    //var stylesheet = artistWorkbook.getStyleSheet();    
    //var importantFormatter = stylesheet.createFormat({
    //    font: {
    //        bold: true           
    //    }
    //    ,fill: {
    //        type: 'pattern', 
    //        patternType: 'gray125', 
    //        fgColor: '7E7E80', 
    //        bgColor: '7E7E80'
    //    }
    //});
    //var themeColor = stylesheet.createFormat({
    //    font: {
    //        bold: true,
    //        color: {theme: 3}
    //    }
    //});
    //var ret=[];
    //for(var j in that.keys){
    //  if(typeof(that.keys[j].header)=='undefined' || that.keys[j].header=='') continue;
    //  ret.push({value: that.keys[j].header, metadata: {style: importantFormatter.id}});    
    //}
    //that.data.unshift(ret);
    //albumList.setData(that.data); //<-- Here's the important part
    for(var fName in that.fileName) {
      artistWorkbook.addWorksheet(that.processWorksheet(artistWorkbook,that.fileName[fName],that.data[fName],that.keys[fName]));
    }
    //artistWorkbook.addWorksheet(albumList);
    var data = EB.createFile(artistWorkbook);
    var a = document.createElement('a');
    $(a).attr({
      id:"fileDownload"
      ,download:fileName
      //,download:that.fileName
      ,href:'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + data
    });
    $(a).appendTo('body');
    a.click();
    window.setTimeout(function () {
	  a.remove();
	  delete this.data;
      delete this.keys;
      delete this.fileName;}, 10000);
  });  
}
