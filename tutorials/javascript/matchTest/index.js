var idx = "/data/samba5/Bangalore/prod/10/18/20/sdfjdsfj.jpg";
//var matchArr = idx.match(".*/(.*)/(.*)/(.*)/.*$");
var matchArr = idx.match(new RegExp(".*\/\(.*\)\/\(.*\)\/\(.*\)\/.*.jpg$"));
console.log(matchArr);