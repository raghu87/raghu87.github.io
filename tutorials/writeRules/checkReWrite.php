<?php
  $newcfg = array(
    "DEBUG"=>1
    ,'RELEASE_STR'=>'blah'
    ,"LOG_DIR"=>"/var/www/tmp/"
    ,"fidpa"=>""
  );
  $prog = basename(__FILE__);//ereg_replace('^.*\/','',$_SERVER['PHP_SELF']);
  $debug = intval($newcfg["DEBUG"]);
  if ($debug) {
    //$cfg['DEBUG'] = 1; // local override
    $newcfg['fidpa']=fopen($newcfg['LOG_DIR']."/$prog.log","w"); 
    fwrite($newcfg['fidpa'],print_r($newcfg,true));      
    fwrite($newcfg['fidpa'],"request ".print_r($_REQUEST,true));
    fwrite($newcfg['fidpa'],"get  ".print_r($_GET,true));
    fwrite($newcfg['fidpa'],"server ".print_r($_SERVER,true));
  }
  //exit;
  //header("Content-Type:application/json");
  //process client request (VIA Url)
  if (!empty($_GET['name'])) {
    //
    $name = $_GET['name'];
    $folder = get_folder($name);
    
    if (empty($folder)) {
      //folder not found
      deliver_response(200,"folder not found",NULL);
    } else {
      //respond folder found
      deliver_response(200,"folder found",$folder);
    }
  } else {
    // throw invalid request
    //deliver_response(400,"Invalid Request",NULL);
    deliver_response(200,"main page",null);
  }
  
  function deliver_response($status=null,$status_message=null,$data=null) {
    var_dump($status_message);
    var_dump($data);
    if(!empty($status) && $status === 400) {
      include_once(dirname(__FILE__).'/index.html');
    }
    header("HTTP/1.1 $status $status_message");
    
    
    
    //header("Location:../index.php?city=mangalore");
    //header("Location: index.html");
    //header("Status: 301 Moved Permanently");
    //$response['status'] = $status;
    //$response['status_message'] = $status_message;
    //$response['data'] = $data;
    //
    //$json_response = json_encode($response);
    //echo $json_response;
  }
  
  function get_folder($find) {
    $names=array(
      "bangalore"=>array("alias"=>array("bangalore","bengaluru"),"code"=>"")
      ,"chennai"=>array("alias"=>array("chennai"),"code"=>"")
      ,"hyderabad"=>array("alias"=>array("hyderabad"),"code"=>"")
      ,"mumbai"=>array("alias"=>array("mumbai","bombay"),"code"=>"")
      
      ,"century-ethos"=>array("alias"=>array("century-ethos-bangalore","century-ethos"),"code"=>"")
    );
    foreach($names as $name=>$folder) {      
      if(!empty($folder['alias']) && count($folder['alias']) > 0) {
        foreach($folder['alias'] as $foldername=>$folderVal) {
          if(preg_match('/^'.$folderVal.'$/i',preg_replace('/_|\s/','-',$find))) {
            return $name;
            break;
          }
        }     
      }     
    }
    return null;
  }
 
?>
