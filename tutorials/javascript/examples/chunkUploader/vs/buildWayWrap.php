<?php
  /**
  * 
  */
  ini_set('error_reporting', E_ALL & ~E_NOTICE & ~E_WARNING & ~E_STRICT & ~E_DEPRECATED);
  ini_set('display_errors','Off');

  if(isset($GLOBALS['cfg']) && !empty($GLOBALS['cfg'])) {
    $cfg = $GLOBALS['cfg'];
  } else {
    $cfg = array(
      "DEBUG"=>0
      ,"LOG_DIR"=>"/tmp"
      ,'RELEASE_STR'=>'blah'
    );
    $prog = basename(__FILE__);
    $debug = $GLOBALS['cfg']["DEBUG"] = 1;
    //$debug = intval($cfg['DEBUG']);
    if (preg_match("/\/local\/([^\/]+)\//",$_SERVER['PHP_SELF'],$m)) {
      $logTDir = "/home/mapdata/".$m[1]."/software/tmp";
      if (is_dir($logTDir)) { $GLOBALS['cfg']['LOG_DIR'] = $logTDir; }
    }
    if ($debug) { 
      $GLOBALS['cfg']['fid']=fopen($GLOBALS['cfg']['LOG_DIR']."/$prog.log","w");   
      fwrite($GLOBALS['cfg']['fid'],"cfg is ".print_r($cfg,true)."\n");
      fwrite($GLOBALS['cfg']['fid'],"request is".print_r($_SERVER,true));
      fwrite($GLOBALS['cfg']['fid'],"request is".print_r($_REQUEST,true));
    }
  }

  if(isset($_REQUEST['action']) && !empty($_REQUEST['action'])) {
    $func = $_REQUEST['action'];
    if (!method_exists('buildWayWrap',$func)) {
      buildWayWrap::printErrorJsonAndExit("Action garbled");
    }
    buildWayWrap::$func($_REQUEST);
  }

  class buildWayWrap {
   
    function __construct() {
    
    }

    public function debugMsg($msg,$obj=null) {
      if ($GLOBALS['cfg']['DEBUG']) { } else { return; }
      if (isset($GLOBALS['cfg']['fid'])) { } else { return; }
      if (isset($obj)) {
        fwrite($GLOBALS['cfg']['fid'],"$msg ".print_r($obj,true)."\n");
      } else {
        fwrite($GLOBALS['cfg']['fid'],"$msg");
      }
    }

    function printErrorJsonAndExit ($str) {
      $params = array('error' => $str);
      self::printTextAndExit('html',json_encode($params));
    }

    function printTextAndExit ($textType,$str) {
      global $cfg;
      self::debugMsg("text is $str, type $textType\n");
      $callback = "";
      if (!empty($_POST["callbackFunction"])) {
        $callback = $_POST["callbackFunction"];
      }
      if (!empty($_GET["callback"])) {
        $callback = $_GET["callback"];
      }
      if ($callback == '') {
        if (!headers_sent()) {
          header('Content-Type: application/json;charset=utf-8;');
        }
        echo $str;
      } else {
        if (!headers_sent()) {
          header('Content-Type: text/javascript;charset=utf-8;');
        }
        echo "$callback($str);";
      }
      //&closeAllDb;
      //close FID if $debug;
      exit;
    }

    function printJsonAndExit ($ptr) {
      self::printTextAndExit('html',json_encode($ptr));
    }

    function uploadFile ($inParams) {
      self::debugMsg("uploadFile inparams ".print_r($inParams,true)."\n");
      $file = $_FILES['file'];
      self::debugMsg("uploadFile ".print_r($file,true)."\n");
      $targetFile = '/tmp/'.$file['name'];// TBD right dir should be choosen
      $filePacket = 0;
      if(isset($_POST['chunkIdx']) && !empty($_POST['chunkIdx'])) {
        $filePacket = $_POST['chunkIdx'];
      }
      $fileName = $file['name'];
      if(file_exists($targetFile)) {
        self::debugMsg("target file exists ".print_r($targetFile,true)."\n");
        $fp1 = fopen($targetFile, 'a+');
        $file2 = file_get_contents($file['tmp_name']);
        fwrite($fp1, $file2);
      } else {
        self::debugMsg("target file not exists  ".print_r($targetFile,true)."\n");
        move_uploaded_file($file['tmp_name'],$targetFile);
      }

      $ret = array('status'=>'Upload successful');
      self::printJsonAndExit($ret);
    }
  }
?>