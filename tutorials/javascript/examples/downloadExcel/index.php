<!DOCTYPE html>
<html>
  <head>
    <META NAME="ROBOTS" CONTENT="NOINDEX,NOFOLLOW">
    <script src="js/jquery-1.11.1.min.js" type="text/javascript"></script>
    <script src="js/Require.js" type="text/javascript"></script>
  </head>
  <body>
    <script>
      if(typeof(vidteq) == 'undefined') { var vidteq = {}; }
      
      vidteq.downloadExcel = (function (w, d, $, vidteq) {
        console.log('inside self invocation function');
        if(typeof(vidteq) == 'undefined') { var vidteq = {}; }
        
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
               
        vidteq.downloadExcel = new vidteq._xlDownloader();         

        return vidteq.downloadExcel;
      }(window, document, jQuery, vidteq));
      
      
      vidteq.downloadShortner = (function (w, d, $, vidteq) {
        console.log('inside self invocation function');       
        if(typeof(vidteq) == 'undefined') { var vidteq = {}; }
        
        vidteq._downloadShortner = function () {
          console.log('inside downloadShortner'); 
          
        }
        
        vidteq._downloadShortner.prototype.returnDate = function() {
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
        
        vidteq._downloadShortner.prototype.processSheet = function(fileName,srf) {
          console.log("inside process Sheet");
          var passVar = {};
          var finalHash = [];          
          if(srf.length > 0) {
            for(var i in srf) {
              finalHash.push(this.getShortnerHash(srf[i]));              
            }
            var passVar = {
              shortnerInfo:{
                content : finalHash
                ,fileName : 'Shortner'
              }            
            };
          } else {
            var passVar = {
              shortnerInfo:{
                content : this.getShortnerHash(srf)
                ,fileName : 'Shortner'
              }            
            };
          }
          console.log(passVar);
          var givenDate = this.returnDate();
          if(typeof(fileName) != 'undefined' && fileName != '') {
            fileName = fileName + givenDate + '.xlsx';
          } else {
            fileName = givenDate + '.xlsx';
          }              
          return vidteq.downloadExcel.downloadExcelSheet(passVar,fileName);
        }
        
        vidteq._downloadShortner.prototype.getShortnerHash = function(val) {
          var schema = [
            {column:'gid',key: 'gid', defaultVal:"",table:"shortner",datatype:'integer'}
            ,{column:'code',key: 'code', defaultVal: "",table:"shortner",datatype:'text'}
            ,{column:'stretch',key: 'stretch', defaultVal: "",table:"shortner",datatype:'text'}
            ,{column:'lease_start',key: 'lease_start', defaultVal: "",table:"shortner",datatype:'text'}
            ,{column:'lease_end',key: 'lease_end', defaultVal: "",table:"shortner",datatype:'text'}
            ,{column:'last_used',key: 'last_used', defaultVal: "",table:"shortner",datatype:'text'}
            ,{column:'votes',key: 'votes', defaultVal: "",table:"shortner",datatype:'integer'}
            ,{column:'phoneno',key: 'phoneno', defaultVal: "",table:"shortner",datatype:'text'}
            ,{column:'email',key: 'email', defaultVal: "",table:"shortner",datatype:'text'}            
          ];
          var keys = [];
          for(var i in schema) {
            //keys.push({header:schema[i].key});
            keys.push({header:schema[i].column});
          }
          console.log(val);
          var data = [];
          for(var i in schema) {    
            //console.log('i');
            if(typeof(val) != 'undefined' && val[schema[i].column] 
                 && val[schema[i].column] != "") {       
              //data.push(val[schema[i].column]);
              if(typeof(val[schema[i].column]) == 'object') { val[schema[i].column] = JSON.stringify(val[schema[i].column]); }
              //if(typeof(val[schema[i].column]) == 'object') { val[schema[i].column] = val[schema[i].column]; }
              data.push(val[schema[i].column]);
            } else {
              if(typeof(schema[i].defaultVal) == 'object') { schema[i].defaultVal = JSON.stringify(schema[i].defaultVal); }
              data.push(schema[i].defaultVal);
            }
          }  
          return {keys:keys,data:data,schema:schema};
        }
        
        vidteq.downloadShortner = new vidteq._downloadShortner(); 
        vidteq.downloadShortner.processSheet("hello",{});

        
        return vidteq.downloadShortner;
      }(window, document, jQuery, vidteq));
    </script>
  </body>
</html>  
