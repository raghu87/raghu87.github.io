<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>  
  <script src = "js/jquery-1.7.2.min.js" type="text/javascript"></script>
  <script src = "js/jquery.tmpl.js" type="text/javascript"></script>
  <script src = "js/xls.js" type="text/javascript"></script>
  <script src = "js/other.js" type="text/javascript"></script>
  <script src = "js/xlReader.js" type="text/javascript"></script>
  <script>    
    if (typeof(vidteq) == 'undefined') { vidteq = {}; } 
    window.onload = function() {
      vidteq.cmaObj = new vidteq._cma();  
    };
  </script>
</head>
<body>
  <div style='background-color:#376092;width:100%;height:40px;position:fixed;left: 0px;top: 0px;'>
    <div id="message" style="float:right;padding-right:20px;color:yellow;font-size: 16px;margin-top: 10px;margin-bottom: 10px;">Welcome to CMA</div>
  </div>
  <div style="font:12pt bold,'Vollkorn';color:#000000;position:relative;top:50px;">Select one to choose type :  
  <select id="bulkInfo" name="bulkInfo">
    <option value="">select any format type</option>    
    <option value="others">Other Activity</option>    
  </select>
  <br />
  
  
<script id="createAccountTmpl" type="text/x-jquery-tmpl">
  <fieldset id="${id}" style="position: relative;top: 60px;">
    <legend>${legendName}</legend>
    <center>
      <table width="100%" cellspacing="6">
        
      </table>
    </center>
  </fieldset>
</script>
<script id="callBackContTmpl" type="text/x-jquery-tmpl">
  <div id="uploadTypeDiv" style="font:12pt bold,'Vollkorn';color:#000000;display:none;">
    Select one of the upload type :  
    <select id="uploadType" name="type" style="display:none;">
      <option value="">select any format type</option>      
      {{if selectWhat == 'otherActivity'}}
        <option value="otherAcActivity" selected>Other Account Activity</option>
      {{else}}
      {{/if}}
    </select>      
  </div><br />
  <div id="citySelectDiv">
    Select a city : 
    <select id="cityNames" name="cityName" >
      <option value="bangalore">bangalore</option>
      <option value="chennai">chennai</option>
      <option value="hyderabad">hyderabad</option>
      <option value="mysore">mysore</option>
      <option value="kochi">kochi</option>
      <option value="mangalore">mangalore</option>
      <option value="mumbai">mumbai</option>
      <option value="goa">goa</option>
      <option value="pune">pune</option>
    </select>
  </div><br />
</script>
<script id="excelReaderTmpl" type="text/x-jquery-tmpl">
  <tr>
    <td>
      <select name="format" style="display:none;">
        <option value="csv" > CSV</option>
        <option value="json" selected> JSON</option>
        <option value="form"> FORMULAE</option>
      </select><br />
      <div id="callBackContainerDiv">      
        
      </div>
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
        Use readAsBinaryString: (when available) <input type="checkbox" name="userabs" checked><br />
      </span>
      <pre id="out"></pre>
      <br />
      <div id='downloadContainer'></div> 
    </td>
  </tr>  
</script>
</body>
</html>
