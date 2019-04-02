<?php
$df = exec('df -Ph /media/intel/SSD10 | awk \'/^\// { print "{\"filesystem\":\""$1"\", \"size\":\""$2"\", \"used\":\""$3"\", \"avail\":\""$4"\", \"use\":\""$5"\", \"mounted\":\""$6"\"}" }\'');
echo $df;
?>

