<!DOCTYPE html>
<!-- xls.js (C) 2013-2014 SheetJS http://sheetjs.com -->
<!-- vim: set ts=2: -->
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>JS-XLS Live Demo</title>
  <style>
    #drop{
      border:2px dashed #bbb;
      -moz-border-radius:5px;
      -webkit-border-radius:5px;
      border-radius:5px;
      padding:3px;
      text-align:center;
      font:12pt bold,"Vollkorn";color:#bbb;
    }
    #b64data{
      width:100%;
    }
  </style>
</head>
<body>  
  <select name="format" style="display:none;">
    <option value="csv" > CSV</option>
    <option value="json" selected> JSON</option>
    <option value="form"> FORMULAE</option>
  </select><br />
  <div style="font:12pt bold,'Vollkorn';color:#000000;display:none;">Select one of the upload type : </div> 
  <select id="uploadType" name="type" style="display:none;">
    <option value="">select any format type</option>
    <option value="nemomapping" selected>Nemo Mapping</option>    
  </select>
  <div id="citySelect">Select a mode to upload or download(Curl or direct) : 
  <select id="uploadModeType" name="uploadModeType" >
    <option value="curl">curl</option>
    <option value="direct">direct</option>    
  </select>
  </div>
  <br />
  <div id="citySelect">Select a city : 
  <select id="cityNames" name="cityName" >
    <option value="bangalore">bangalore</option>
    <option value="chennai">chennai</option>
    <option value="hyderabad">hyderabad</option>
    <option value="mysore">mysore</option>
    <option value="kochi">kochi</option>
    <option value="mangalore">mangalore</option>
  </select>
  </div>
  <br />
  <div id="citySelect">Select a Server Path : 
  <select id="serverPathName" name="serverPathName" >
    <option value="local">local</option>
    <option value="vidteq">vidteq</option>    
  </select>
  </div>
  <br />
  <form action="" method="post" enctype="multipart/form-data">
    <div style="font:12pt bold,'Vollkorn';color:#000000;">Browse XLS or XLSX or XML : 
      <input type="file" id="drop" name="excel_file" accept="xlsx,xls" required="true">
    </div>
  </form>  
  <!--div id="drop">Drop an XLS or XML (2003) file here to see sheet data.</div>-->
  <span  style="display:none;">
    <textarea id="b64data">... or paste a base64-encoding here</textarea>
    <input type="button" id="dotext" value="Click here to process the base64 text" onclick="b64it();"/><br />
    Advanced Demo Options: <br />
    Use Web Workers: (when available) <input type="checkbox" name="useworker" checked><br />
    Use Transferrables: (when available) <input type="checkbox" name="xferable" checked><br />
    Use readAsBinaryString: (when available) <input type="checkbox" name="userabs" checked><br />
  </span>
  <pre id="out"></pre>
  <br />
  
  <div id="downloadAndDisplay" style="">
    Enter Urlid And find Mapping Details:
    <div>
      <input type="text" id="downloadUrlid" size="64" />
      <button id="showMappingList">Show Mapping</button>
      
      
      <button id="downloadMappingList">Download Mapping</button>      
    </div>
    
    <div id="displayMappingSummary" style="padding-top: 10px;">
    
    </div>
    
  
  </div>
  
  
  <!-- uncomment the next line here and in xlsxworker.js for encoding support -->
  <!--<script src="dist/cpexcel.js"></script>-->
  <script src="js/jquery-1.11.3.min.js" type="text/javascript"></script>
  <script src="js/jquery-migrate-1.2.1.min.js" type="text/javascript"></script>
  <script src="js/xls.js"></script>
  <script src="js/cma.js" type="text/javascript"></script>
  <script src="js/Require.js" type="text/javascript"></script>
  <script src="js/jquery.tmpl.js" type="text/javascript"></script>
  <script>
    if (typeof(vidteq) == 'undefined') { vidteq = {}; }
    vidteq.cmaObj = new vidteq._cma();
  </script>
  <div id='downloadContainer'></div>  
</body>
</html>
