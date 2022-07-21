/* Menu Navbar: Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// Robot Information
var ip_address = '192.168.1.100'; //Robot IP
var camera_topic = '/camera/rgb/image_rect_color'; //This is to allow us to change between /camera/rgb/image_rect_color and /camera/ir/image_rect_ir
var occupancygrid_topic = '/map'; //RTABMAP MAP: '/rtabmap/grid_map'; OR /rtabmap/octomap_grid OR grid_map OR odom_local_map

var videoFeedWidth = 540;
var videoFeedHeight = 380;
var videoFeedInterval = 200;
var mapWidth = 540;
var mapHeight = 380;

//ROS Connectivity
//ROS: Initializing ROS Library
function connect(ip_address){

}
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

//create a topic for publishing twist messages.
var cmdVel = new ROSLIB.Topic({
  ros : ros,
  name : '/cmd_vel',
  messageType : 'geometry_msgs/Twist'
});

var twistMsg = new ROSLIB.Message({
  linear : {
    x : 0.0,
    y : 0.0,
    z : 0.0
  },
  angular : {
    x : 0.0,
    y : 0.0,
    z : 0.0
  }
});
//create topic for publishing string messages.
var webControls = new ROSLIB.Topic({
  ros : ros,
  name : '/web_controls',
  messageType : 'std_msgs/String'
});

var controlMsg = new ROSLIB.Message({
  data : 'none'
})
// create a topic subscriber
var webControlsListener = new ROSLIB.Topic({
  ros : ros,
  name : '/web_controls',
  messageType : 'std_msgs/String'
});
var cmdVelListener = new ROSLIB.Topic({
  ros : ros,
  name : '/cmd_vel',
  messageType : 'geometry_msgs/Twist'
})

function updateControls(pressedButton){
  switch (pressedButton){
    case 'up':
      controlMsg.data = 'up';
      twistMsg.linear.x = 0.1;
      twistMsg.angular.z = 0.0;
      break;
    case 'down':
      controlMsg.data = 'down';
      twistMsg.linear.x = -0.1;
      twistMsg.angular.z = 0.0;
      break;
    case 'left':
      controlMsg.data = 'left';
      twistMsg.linear.x = 0.0;
      twistMsg.angular.z = -0.1;
      break;
    case 'right':
      controlMsg.data = 'right';
      twistMsg.linear.x = 0.0;
      twistMsg.angular.z = 0.1;
      break;
  }
  publishControls();
}

function publishControls(){
  webControls.publish(controlMsg);
  cmdVel.publish(twistMsg);
}

//Main method to initialize viewers and subscribers
function initialize(){

  webControlsListener.subscribe(function(message) {
    console.log('Received message on ' + webControlsListener.name + ': ' + message.data);
    document.getElementById("jsButtonData").innerHTML = 'Mensagem dos controles: ' + message.data;
    //listener.unsubscribe();
  });

  cmdVelListener.subscribe(function(message) {
    console.log('Received message on ' + cmdVelListener.name);
    document.getElementById("jsVelocityDataX").innerHTML = 'X: ' + message.linear.x + ' m/s'
    document.getElementById("jsVelocityDataZ").innerHTML = 'Z: ' + message.angular.z + ' πrad/s'
  })
  
  //MJPEG library function
  var streamViewer = new MJPEGCANVAS.Viewer({
    divID : 'jsVideoFeed', //div for viewer generation
    host : ip_address,
    width : videoFeedWidth,
    height : videoFeedHeight,
    topic : camera_topic,
    interval : videoFeedInterval
  });

  //ROS2D Map Viewer
  var mapViewer = new ROS2D.Viewer({
    divID : 'jsMap', //same happens here
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