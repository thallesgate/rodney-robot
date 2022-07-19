// Robot Information
var ip_address = '192.168.1.100'; //Robot IP
var camera_topic = '/camera/rgb/image_rect_color'; //This is to allow us to change between /camera/rgb/image_rect_color and /camera/ir/image_rect_ir
var occupancygrid_topic = '/map'; // '/rtabmap/grid_map'; ///rtabmap/octomap_grid grid_map odom_local_map
/*
var videoFeedWidthPercentage = 35
var videoFeedHeightPercentage = 40;

var mapWidthPercentage = 35;
var mapHeightPercentage = 40;


var videoFeedWidth = (window.innerWidth * videoFeedWidthPercentage)/100;
var videoFeedHeight = (window.innerHeight * videoFeedHeightPercentage)/100;
var videoFeedInterval = 200;

var mapWidth = (window.innerWidth * mapWidthPercentage)/100 ;
var mapHeight = (window.innerHeight * mapHeightPercentage)/100;
*/
var videoFeedWidth = 540;
var videoFeedHeight = 380;
var videoFeedInterval = 200;
var mapWidth = 540;
var mapHeight = 380;

//ROS Connectivity
//ROS: Initializing ROS Library
  var ros = new ROSLIB.Ros({
    url : 'ws://'+ip_address+":9090"  //websocket address with previously declared variable
  });

//ROS: Logging Websocket Connection
  ros.on('connection', function() {
    console.log('Connected to websocket server.');
  });

  ros.on('error', function(error) {
    console.log('Error connecting to websocket server: ', error);
  });

  ros.on('close', function() {
    console.log('Connection to websocket server closed.');
  });

//Main method to initialize viewers.
function initViewers(){

  //MJPEG library function
  var streamViewer = new MJPEGCANVAS.Viewer({
    divID : 'videoFeed', //div for viewer generation
    host : ip_address,
    width : videoFeedWidth,
    height : videoFeedHeight,
    topic : camera_topic,
    interval : videoFeedInterval
  });

  //ROS2D Map Viewer
  var mapViewer = new ROS2D.Viewer({
    divID : 'map', //same happens here
    width : mapWidth,
    height : mapHeight  
  });

  var gridClient = new ROS2D.OccupancyGridClient({
    ros : ros,
    rootObject : mapViewer.scene,
    topic : occupancygrid_topic,
    continuous : true,
  });

  gridClient.on('change', function(){
    mapViewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
    mapViewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
  });

}