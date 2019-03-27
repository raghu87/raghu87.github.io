<!DOCTYPE html>
<html>
  <head>
    <META NAME="ROBOTS" CONTENT="NOINDEX,NOFOLLOW">
    <?php
      $cfg = array(
        "DEBUG"=>1
        //,"LOG_DIR"=>"/var/www/tmp/"
        ,'RELEASE_STR'=>'blah'
        ,"LOG_DIR"=>"/home/mapdata/raghu/software/tmp/"
        ,"fidpa"=>""
      );
      $prog = basename(__FILE__);
      if (isset($_REQUEST['logFix'])) {
        $prog = $prog."_".$_REQUEST['logFix'];
      }
      $debug = 0;
      //$debug = intval($GLOBALS['cfg']['DEBUG']);
      if (preg_match("/\/local\/([^\/]+)\//",$_SERVER['PHP_SELF'],$m)) {
        $logTDir = "/home/mapdata/".$m[1]."/software/tmp";
        if (is_dir($logTDir)) { $GLOBALS['cfg']['LOG_DIR'] = $logTDir; }
      }
      if ($debug) {
        //$cfg['DEBUG'] = 1; // local override
        $cfg['fidpa']=fopen($cfg['LOG_DIR']."/$prog.log","w"); 
        fwrite($cfg['fidpa'],print_r($cfg,true));      
        fwrite($cfg['fidpa'],"request ".print_r($_REQUEST,true));
        fwrite($cfg['fidpa'],"get  ".print_r($_GET,true));
        fwrite($cfg['fidpa'],"server ".print_r($_SERVER,true));
      }
      
      function refererCheck () {
        global $cfg;
        if (empty($_SERVER['HTTP_REFERER'])) { return false; }
        if (trim($_SERVER['HTTP_REFERER']) == '') { return false; }
        $refMatch = array('10.4.71.*','www.vidteq.com','vidteq.com','www.click2viewmap.com');
        $refMatchFound = false;
        foreach($refMatch as $key=>$val) {
          if (preg_match("/\b$val\b/", $_SERVER['HTTP_REFERER'])) {
            $refMatchFound = true;
            break;
          }
        }
        if(!$refMatchFound) { return false; }
        return true;
      } 
      
      //if(!refererCheck()) {
      //  echo "contact Admin";
      //  exit;
      //}

      $pathPre = "";
      //$emailPathPre = "http://www.vidteq.com/";      
      $emailPathPre = "http://10.4.71.200/local/raghu/";      
      //$emailPathPre = "../";      
      $emailMessage = "";
    ?>
    <title></title>
    <style>
      input[type="text"] {
        width:40%;        
      }
      .spaceClass {
        margin-top:10px;
        margin-bottom:10px;
      }      
    </style>     
  </head>
  <body>      
    <div> 
      <div><h1>Send EMAIL</h1></div>    
      <form action="<?php echo $emailPathPre; ?>vs/classes/emailPost.php" method="post" enctype="multipart/form-data" id="emailform" name="emailform">
        <input type="hidden" name="action" value="sendEmail" />
        <div class='spaceClass'>
          <label>*Enter To-Email Id (comma separated)</label>:&nbsp;
          <input type="text" name="to" id="toMail" />        
        </div>
        <div class='spaceClass'>
          <label>Enter CC-Email Id (comma separated)</label>:&nbsp;
          <input type="text" name="cc" id="ccMail" />        
        </div>
        <div class='spaceClass'>
          <label>Enter BCC-Email Id (comma separated)</label>:&nbsp;
          <input type="text" name="bcc" id="bccMail" />        
        </div>
        <div class='spaceClass'>
          <label>Enter Subject</label>:&nbsp;
          <input type="text" name="subject" />
        </div>
        <div class='spaceClass'>
          <label>upload Attachment</label>:&nbsp;
          <input type="file" name="uploaded_file[]" multiple />
        </div>
        <div class='spaceClass'>
          <label>Enter the Email Body</label>:&nbsp;
          <textarea name="body" id="messagebody" style="width:40%;height:150px;resize:none;"><?php echo $emailMessage; ?></textarea>
        </div>
        <div class='spaceClass'>
          <label>Enter Replay Name</label>:&nbsp;
          <input type="text" name="fromName" />        
        </div>
        <div class='spaceClass' style="display:none;">
          <label>Enter From Email Id</label>:&nbsp;
          <input type="text" name="fromEmail" /> 
        </div>          
        <!--div class='spaceClass'>
          <label>Enter regards User Name</label>:&nbsp;
          <input type="text" name="userName" />        
        </div-->         
        <div class='spaceClass'>
          <input type="submit" value="Submit" id="emailBtn" />
        </div>
      </form>
    </div> 

    <script src="js/jquery-1.11.1.min.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/jquery-migrate-1.2.1.min.js"></script>
    <script type="text/javascript" src="js/jquery.validate.min.js"></script>
    <script type="text/javascript" src="js/tinymce/tinymce.min.js"></script>
    <script>tinymce.init({ selector:'textarea' });</script>
    <script type="text/javascript">      
      $(document).ready(function() {        
        $("#emailform").validate({
          submitHandler: function(form) {
            //var myTextareaVal = $('#messagebody').val();
            //var myLineBreak = myTextareaVal.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '<br />');            
            //var myLineBreak = myTextareaVal;
            //$('#messagebody').val(myLineBreak);
            form.submit();
          }
        });
        $( "#toMail" ).rules( "add", {
          required: true,          
          messages: "Please enter your to email"
        });                         
      });
      </script>
  </body>
</html>
