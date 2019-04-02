<?php
//$_GET['file'] = "../GazeMaze/Jan18Videos/VidTeq_MMI_29_01_2018.mp4";
$file = $_GET['file'];
header ("Content-type: octet/stream");
header ("Content-disposition: attachment; filename=".$file.";");
header("Content-Length: ".filesize($file));
readfile($file);
exit;
?>
