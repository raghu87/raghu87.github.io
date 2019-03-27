if (typeof(vidteq) == 'undefined') { vidteq = {}; }

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
      if(typeof console !== 'undefined') console.log("onload", new Date(), that.rABS, that.use_worker);
      var data = e.target.result;
      if(that.use_worker) {
        if (ext && /^(xls)$/.test(ext)){
          that.xlsworker(data, xlReader.process_wb);
        } else if ((ext && /^(xlsx)$/.test(ext))){
          that.xlsxworker(data, xlReader.process_wb);
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
  if(xlReader.use_worker) XLS.SSF.load_table(wb.SSF);
  var output = "";
  switch(xlReader.get_radio_value("format")) {
    case "json":
      output = JSON.stringify(xlReader.to_json(wb), 2, 2);
      break;
    case "form":
      output = xlReader.to_formulae(wb);
      break;
    default:
      output = xlReader.to_csv(wb);
  }
  
  vidteq.downloadJsonTxtFile(output);  
  if(typeof console !== 'undefined') console.log("output", new Date());
}

vidteq._xlReader.prototype.b64it = function () {
  if(typeof console !== 'undefined') console.log("onload", new Date());
  var wb = XLS.read(this.tarea.value, {type: 'base64'});
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
  var worker = new Worker('./js/xlsxworker.js');
  worker.onmessage = function(e) {
    switch(e.data.t) {
      case 'ready': break;
      case 'e': if(typeof console !== 'undefined') console.error(e.data.d); break;
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
      case 'e': if(typeof console !== 'undefined') console.error(e.data.d); break;
      default: xx=vidteq.xlParseReader.ab2str(e.data).replace(/\n/g,"\\n").replace(/\r/g,"\\r"); console.log("done"); cb(JSON.parse(xx)); break;
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
  var transferable = true;//document.getElementsByName("xferable")[0].checked;
  if(transferable) this.xlsxworker_xfer(data, cb);
  else this.xlsxworker_noxfer(data, cb);
}

vidteq._xlReader.prototype.xlsworker = function (data, cb) {
  var worker = new Worker('./js/xlsworker.js');
  worker.onmessage = function(e) {
    switch(e.data.t) {
      case 'ready': break;
      case 'e': console.error(e.data.d); break;
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
  o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(o.length)));
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

var xlReader = new vidteq._xlReader(); 

/**
 * _downloadExcelToJson
 */
 
vidteq.downloadJsonTxtFile = function(content) {  
  content = vidteq.manipulateContent(content);  
  var type = $('#uploadType').val();  
  if(type == 'otherAcActivity') {
    console.log(content);
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

// manipulateContent

vidteq.manipulateContent = function(content) {
  var type = $('#uploadType').val();  
  switch (type) {
    case 'otherAcActivity' :
      var textCon = JSON.parse(content);    
      console.log('inside manipulateContent ',textCon);      
      break;
    default : 
      return content;
      break;
  }
  return content;  
}