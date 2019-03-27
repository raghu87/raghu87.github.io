<?php
  /**
   *
   */
  class MyDB extends SQLite3 {
    function __construct() {
      # code...
      $this->open('test.db');      
    }
    
    function printErrorJsonAndExit ($str) {
      $params = array('error' => $str);
      self::printTextAndExit('html',json_encode($params));
    }
    
    function printTextAndExit ($textType,$str) {
      global $cfg;
      //self::debugMsg("text is $str, type $textType\n");
      $callback = "";
      if (!empty($_GET["callbackFunction"])) { 
        $callback = $_GET["callbackFunction"];
      }
      if (!empty($_GET["callback"])) { 
        $callback = $_GET["callback"];
      }
      if ($callback == '') {
        //header("Content-type: text/$textType");
        echo $str;
      } else { 
        echo "$callback($str);";
      }
      //&closeAllDb;
      //close FID if $debug;
      exit;
    }
    
    function printJsonAndExit ($ptr) {
      self::printTextAndExit('html',json_encode($ptr));
    }
    
    //function executeQuery ($dbh,$msg,$qStr,$ret=null,$printQuery=null) {
    //  global $cfg;
    //  if ($msg and $msg != '') {
    //    self::debugMsg("$msg\n");
    //  }
    //  self::debugMsg("Query is $qStr \n");
    //  $refq =  pg_query($dbh->dbh,$qStr);
    //  if (!$refq) {
    //    self::debugMsg("Query not ok \n".pg_last_error($dbh->dbh)."\n");
    //  } else {
    //    self::debugMsg("Query ok, affected ".pg_affected_rows($refq)."\n");
    //  }
    //  if (isset($ret) and $ret and $refq) {
    //    self::debugMsg("Query ok\n");
    //    if (pg_num_rows($refq)) {
    //      $ref = pg_fetch_all($refq);
    //      return $ref;
    //    } else {
    //      return array();
    //    }
    //  }
    //  // TBD some more debug
    //  return $refq;
    //  //if (isset($ret) and $ret and $refq AND pg_num_rows($refq)) {
    //  //  $ref = pg_fetch_all($refq);
    //  //  return $ref;
    //  //}
    //  //// TBD some more debug
    //  //return $refq;
    //}
    
    function dbConnect () {
      
      if(!$this->db){
         echo $this->db->lastErrorMsg();
      } else {
         echo "Opened database successfully\n";
      }
    }
  }

  $db = new MyDB();
  
   
//   $tableName = "COMPANY";
//   $sql = "select * from sqlite_master where tbl";
//   //$ret = $db->exec($sql);
//   $ret = $db->query($sql);
//   var_dump(print_r($ret,true));
//   
//   while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
//     echo print_r($row,true). "\n";
//     //echo "ID = ". $ row['ID'] . "\n";
//     //echo "NAME = ". $ row['NAME'] ."\n";
//     //echo "ADDRESS = ". $ row['ADDRESS'] ."\n";
//     //echo "SALARY = ".$ row['SALARY'] ."\n\n";
//   }
//   echo "Operation done successfully\n";
   
//   $sql =<<<EOF
//      CREATE TABLE COMPANY
//      (ID INT PRIMARY KEY     NOT NULL,
//      NAME           TEXT    NOT NULL,
//      AGE            INT     NOT NULL,
//      ADDRESS        CHAR(50),
//      SALARY         REAL);
//EOF;
//
//   $ret = $db->exec($sql);
//   if(!$ret){
//      echo $db->lastErrorMsg();
//   } else {
//      echo "Table created successfully\n";
//   }
   //$db->close();
?>
