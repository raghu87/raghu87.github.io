<?php

$city = 'bangalore';
$cityText = '';
//$tmpCity = empty($_REQUEST['city'])?'':urldecode($_REQUEST['city']);
$tmpCity = empty($_GET['city'])?'':urldecode($_GET['city']);
$tmpCity = empty($_POST['city'])?'':urldecode($_POST['city']);
if ($tmpCity != '' && $tmpCity != 'bangalore') {
  $city = $tmpCity;
  $cityText = ".".$tmpCity;
}
include_once dirname(__FILE__).'/../../config'.$cityText.'.php';
require_once dirname(__FILE__).'/../../vs/connectDb.php';
include_once dirname(__FILE__).'/../../vs/paranoid.php';
//include_once dirname(__FILE__).'/../../vs/classes/nemoMapping.php';
$GLOBALS['paranoid'] = new paranoid();    

$prog = basename(__FILE__);
$debug = 1;
#$GLOBALS['cfg']['LOG_DIR'] = "/home/mapdata/raghu/software/tmp";
if ($debug) { 
  $GLOBALS['cfg']['fid']=fopen($GLOBALS['cfg']['LOG_DIR']."/$prog.log","w"); 
  fwrite($GLOBALS['cfg']['fid'],"cfg is ".print_r($_REQUEST['city'],true)."\n");
  fwrite($GLOBALS['cfg']['fid'],"cfg is ".print_r($city,true)."\n");
  fwrite($GLOBALS['cfg']['fid'],"cfg is ".print_r($tmpCity,true)."\n");
  fwrite($GLOBALS['cfg']['fid'],"cfg is ".print_r($cfg,true)."\n");
  fwrite($GLOBALS['cfg']['fid'],"request is".print_r($_SERVER,true));
  fwrite($GLOBALS['cfg']['fid'],"request is".print_r($_REQUEST,true));
}

if (!empty($_REQUEST['action'])) {
  $func = $_REQUEST['action']; 
  if (!method_exists('nemoMappingCMA',$func)) {
    nemoMappingCMA::printErrorJsonAndExit("Action garbled");
  }
  nemoMappingCMA::$func($_REQUEST);
}
nemoMappingCMA::debugMsg("No action\n");

class nemoMappingCMA {
  public function __construct() {  }
  
  public function debugMsg($msg,$obj=null) {
    if ($GLOBALS['cfg']['DEBUG']) { } else { return; }
    if (isset($GLOBALS['cfg']['fid'])) { } else { return; }
    if (isset($obj)) {
      fwrite($GLOBALS['cfg']['fid'],"$msg ".print_r($obj,true)."\n");
    } else {
      fwrite($GLOBALS['cfg']['fid'],"$msg");
    }
  }
  
  public function printErrorJsonAndExit ($str) {
    $params = array('error' => $str);
    self::printTextAndExit('html',json_encode($params));
  }
  
  public function printTextAndExit ($textType,$str) {
    global $cfg;
    self::debugMsg("text is $str, type $textType\n");
    $callback = "";
    if (!empty($_GET["callbackFunction"])) { 
      $callback = $_GET["callbackFunction"];
    }
    if (!empty($_GET["callback"])) { 
      $callback = $_GET["callback"];
    }
    if ($callback == '') {
      header('Content-Type: application/json;charset=utf-8;');
      echo $str;
    } else {
      header('Content-Type: text/javascript;charset=utf-8;');
      echo "$callback($str);";
    }
    //&closeAllDb;
    //close FID if $debug;
    exit;
  }
  
  public function printJsonAndExit ($ptr) {
    self::printTextAndExit('html',json_encode($ptr));
  }
  
  public function executeQuery ($dbh,$msg,$qStr,$ret=null,$printQuery=null) {
    global $cfg;
    if ($msg and $msg != '') {
      self::debugMsg("$msg\n");
    }
    self::debugMsg("Query is $qStr \n");
    $refq =  pg_query($dbh->dbh,$qStr);
    if (!$refq) {
      self::debugMsg("Query not ok \n".pg_last_error($dbh->dbh)."\n");
    } else {
      self::debugMsg("Query ok, affected ".pg_affected_rows($refq)."\n");
    }
    if (isset($ret) and $ret and $refq) {
      self::debugMsg("Query ok\n");
      if (pg_num_rows($refq)) {
        $ref = pg_fetch_all($refq);
        return $ref;
      } else {
        return array();
      }
    }
    // TBD some more debug
    return $refq;
    //if (isset($ret) and $ret and $refq AND pg_num_rows($refq)) {
    //  $ref = pg_fetch_all($refq);
    //  return $ref;
    //}
    //// TBD some more debug
    //return $refq;
  }
  
  public function getAbsolutePaths ( $docroot=null, $msdocroot='' ) {
    $relPath = "/";
    $protocol = "http";
    if( isset($_SERVER['HTTPS']) && $_SERVER["HTTPS"] == "on" ) { $protocol = 'https'; }

    if( !empty($docroot) ) {
      if (isset($_SERVER['SCRIPT_NAME'])) { $relPath = $_SERVER['SCRIPT_NAME']; }
      if (isset($_SERVER['SCRIPT_URL'])) { $relPath = $_SERVER['SCRIPT_URL']; }
      //TBD: throws warning unknown modifier 'h'
      $relPath = preg_replace('/\/'.preg_quote($docroot,'/').'.*/','/',$relPath);
      preg_match('/'.preg_quote($relPath,'/').'/', $msdocroot, $matches);
      if( !empty($matches) ) {
        $relPath = '/';
      }
    }
    $server = $_SERVER['SERVER_NAME'];
    $hostUrl = $protocol."://".$server.$relPath;
    return $hostUrl;
  }
  
  public function refererCheck () {    
    if (empty($_SERVER['HTTP_REFERER'])) { return false; }
    if (trim($_SERVER['HTTP_REFERER']) == '') { return false; }
    $refMatch = array('10.4.71.*','124.153.106.196','www.vidteq.com','vidteq.com','www.click2viewmap.com');
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
  
  public function mappingCurlCall($url=null,$inParams,$type=null) {
    if(empty($url)) {
      self::printErrorJsonAndExit("code call 1");
    }    
    self::debugMsg("inside cur call curl cmd ".print_r($url,true)."\n");
    self::debugMsg("inside cur call curl cmd ".print_r($inParams,true)."\n");
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_POST,1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $inParams);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch, CURLOPT_REFERER, 'http://www.vidteq.com/');
    #curl_setopt($ch, CURLOPT_HEADER , false);  // we want headers
    curl_setopt($ch,CURLOPT_HTTPHEADER,array('Expect:')); 
    #curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $result = curl_exec ($ch);
    $stat = curl_getinfo($ch,CURLINFO_HTTP_CODE);
    curl_close ($ch);
    self::debugMsg("cur call stat ".print_r($stat,true)."\n");
    
    self::debugMsg("inside cur call result ".substr($result,0,200)."\n");
    if(!empty($type) && $type == 'download') return $result;
    
  }
  
  public function mappingSchema () {
    $schema = array(
      'gid'=>array('dataColumn'=>'gid','type'=>'serial primary key')      
      ,'mapid'=>array('dataColumn'=>'mapid','type'=>'integer')
      ,'urlid'=>array('dataColumn'=>'urlid','type'=>'text')
      ,'ftrule'=>array('dataColumn'=>'ftrule','type'=>'text')
      ,'creation_date'=>array('dataColumn'=>'creation_date','type'=>'timestamp')
      ,'lastmoddate'=>array('dataColumn'=>'lastmoddate','type'=>'timestamp')
      ,'accessdate'=>array('dataColumn'=>'accessdate','type'=>'timestamp')
      ,'vote'=>array('dataColumn'=>'vote','type'=>'integer')
      ,'tested'=>array('dataColumn'=>'tested','type'=>'text')
      ,'poiid'=>array('dataColumn'=>'poiid','type'=>'integer')
      ,'last_mile_poiid'=>array('dataColumn'=>'last_mile_poiid','type'=>'integer')
    );
    return $schema;
  }
  
  public function decodeMapping($inParams) {
    global $cfg;
    self::debugMsg("inside uploadMapping ".print_r($inParams,true)."\n");
    
    if(!isset($inParams['mapData']) || (isset($inParams['mapData']) && empty($inParams['mapData']))) {
      self::printErrorJsonAndExit("code mapping 1");
    }
    if(isset($inParams['excelBackup']) && !empty($inParams['excelBackup'])) {
      self::writeCurlExcel($inParams['city'],$inParams['excelBackup']);    
    }
    
    self::printErrorJsonAndExit("contact raghu to comment this message to enable this feature");
    $mapData = json_decode($inParams['mapData'],true);
    $errorxl = array();
    foreach($mapData as $key=>$val) {      
      if(!isset($val['urlid']) || (isset($val['urlid']) && empty($val['urlid']))) {
        //self::printErrorJsonAndExit("code mapping 2");       
        array_push($errorxl,$key);
        continue;
      }
      if(!isset($val['ftrule']) || (isset($val['ftrule']) && empty($val['ftrule']))) {
        //self::printErrorJsonAndExit("code mapping 3");       
        array_push($errorxl,$key);
        continue;
      }      
      if(!isset($val['city']) || (isset($val['city']) && empty($val['city']))) {
        //self::printErrorJsonAndExit("code mapping 3");       
        array_push($errorxl,$key);
        continue;
      }
      $urlId = $val['urlid'];
      $mapCity = $val['city'];
      $ftRule = $val['ftrule'];
      $pathPre = "vs/classes";
      if(isset($inParams['pathPre']) && !empty($inParams['pathPre'])) {
        $pathPre = $inParams['pathPre'];       
      }
      //$pathPre = "";
      $fUrlPath = self::getAbsolutePaths($pathPre);      
      if(isset($inParams['serverPath']) && !empty($inParams['serverPath']) 
           && $inParams['serverPath'] == 'vidteq') {
        $protocol = "http";
        if( isset($_SERVER['HTTPS']) && $_SERVER["HTTPS"] == "on" ) { $protocol = 'https'; }
        $server = "www.vidteq.com/";
        $fUrlPath = $protocol."://".$server;          
      }
      $fEmbedUrl = $fUrlPath."embed3.php?city=".$mapCity."&urlid=".$urlId."&firstTimeRule=".$ftRule."&mappingEditMode=1";
      
      $mapid = null;
      if(isset($val['mapid']) && !empty($val['mapid'])) {
        $mapid = $val['mapid'];        
      }
      $poiid = null;
      if(isset($val['poiid']) && !empty($val['poiid'])) {
        $poiid = $val['poiid'];        
      }
      $last_mile_poiid = null;
      if(isset($val['last_mile_poiid']) && !empty($val['last_mile_poiid'])) {
        $last_mile_poiid = $val['last_mile_poiid'];        
      }
      $tested = "";
      if(isset($val['tested']) && !empty($val['tested'])) {
        $tested = $val['tested'];        
      }
      
      self::debugMsg("urlId uploadMapping ".print_r($urlId,true)."\n");
      self::debugMsg("mapCity uploadMapping ".print_r($mapCity,true)."\n");
      self::debugMsg("ftRule uploadMapping ".print_r($ftRule,true)."\n");
      self::debugMsg("fUrlPath uploadMapping ".print_r($fUrlPath,true)."\n");
      self::debugMsg("fEmbedUrl uploadMapping ".print_r($fEmbedUrl,true)."\n");
      self::debugMsg("mapid uploadMapping ".print_r($mapid,true)."\n");
      
      //break;
      self::mappingCurlCall($fUrlPath."embed3.php",array("city"=>$mapCity,"urlid"=>$urlId,"firstTimeRule"=>$ftRule,"mappingEditMode"=>1,"mapId"=>$mapid,"poiid"=>$poiid,"last_mile_poiid"=>$last_mile_poiid,"tested"=>$tested));
    }    

    $response = array("done"=>"success");
    self::printJsonAndExit($response);
  }
  
  public function downloadXlMapping($inParams) {
    global $cfg;
    self::debugMsg("inside downloadXlMapping ".print_r($inParams,true)."\n");
    
    if(!isset($inParams['urlid']) || (isset($inParams['urlid']) && empty($inParams['urlid']))) {
      self::printErrorJsonAndExit("code down mapping data 1");
    }
    
    $protocol = "http";
    if( isset($_SERVER['HTTPS']) && $_SERVER["HTTPS"] == "on" ) { $protocol = 'https'; }
    if(isset($inParams['serverPath']) && !empty($inParams['serverPath']) 
         && $inParams['serverPath'] == 'vidteq') {
      $server = "www.vidteq.com/";
      //$server = "10.4.71.200/local/raghu/";
      $fUrlPath = $protocol."://".$server;  
    } else {
      $server = self::getAbsolutePaths("cma/nemoMapping"); 
      $fUrlPath = $server; 
    }
    
    $result = self::mappingCurlCall($fUrlPath."vs/classes/nemoMapping.php",array("city"=>$inParams['city'],"urlid"=>$inParams['urlid'],"action"=>"downloadXlMapping","type"=>"curl"),"download"); 
    self::printJsonAndExit($result);
  }
  
  public function writeCurlExcel($city,$excelBackup) {
    $fUrlPath = "http://10.4.71.121/local/raghu/";
    self::mappingCurlCall($fUrlPath."cma/nemoMapping/nemoMapping.php",array("city"=>$city,"action"=>"writeToExcel","excelBackup"=>$excelBackup)); 
  }
  
  public function writeToExcel($inParams) {
    include_once(dirname(__FILE__)."/excelWriter/xlsxwriter.class.php");
    
    if(!isset($inParams['excelBackup']) || (isset($inParams['excelBackup']) && empty($inParams['excelBackup']))) {
      return null;
    }
    
    
    $excelBackup = json_decode($inParams['excelBackup'],true);
    self::debugMsg("inside excelBackup ".print_r($excelBackup,true)."\n");
    
    $header = array();
    foreach($excelBackup as $key => $value) {
      foreach($value['schema'] as $nKey => $nValue) {
        $header[$nValue['column']] = $nValue['datatype'];
      }
    }
    self::debugMsg("header excelBackup ".print_r($header,true)."\n");
    
    $data = array();
    foreach($excelBackup as $key => $value) {
      $innerData = array();
      foreach($value['data'] as $nKey => $nValue) {
        array_push($innerData,$nValue);
      }
      array_push($data,$innerData);
    }
    self::debugMsg("data excelBackup ".print_r($data,true)."\n");

    $writer = new XLSXWriter();
    $writer->setAuthor('Vidteq India Private Limited');
    $writer->writeSheet($data,'sheet1',$header);
    //$writer->writeSheet($data2,'sheet2',$header2);
    
    $pathToWrite = "/data/samba/Raghu_data/excelBackup/";
    $writer->writeToFile($pathToWrite.'example.xlsx');
  }
}




?>
