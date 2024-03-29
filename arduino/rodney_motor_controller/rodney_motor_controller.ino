#include <Adafruit_NeoPixel.h>
#include <ros.h>
#include <std_msgs/String.h>
#include <geometry_msgs/Vector3Stamped.h>
#include <geometry_msgs/Twist.h>
#include <ros/time.h>

#define LOOPTIME                      100     
const byte noCommLoopMax = 20;
unsigned int noCommLoops = 0;

#define GPIO_MOT_ENABLE 2//PA8
#define GPIO_L_MOT_DIR  3//PB15
#define GPIO_L_MOT_STEP 5 //PB14
#define GPIO_R_MOT_DIR  4//PB13
#define GPIO_R_MOT_STEP 6//PB12
#define GPIO_LED        9 //PA9

unsigned long lastMilli = 0;

#define radius  0.04                   //Wheel radius, in M
#define wheelbase  0.212               //Wheelbase, in M
#define wheel_reduction  4
#define motor_microstepping  4
#define motor_steps  200

const double steps_per_rotation = motor_steps * motor_microstepping * wheel_reduction;  //Steps per rotation
const double wheel_circumference = radius * PI * 2; 

double linear_speed_req = 0;//Desired linear speed for the robot, in m/s
double angular_speed_req = 0;//Desired angular speed for the robot, in rad/s

//double l_speed_act = 0;
double l_speed_req = 0;//Desired speed for left wheel in m/s
double l_delay = 0;//Stepper motor delay between steps

//double r_speed_act = 0;
double r_speed_req = 0;//Desired speed for right wheel in m/s
double r_delay = 0;//Stepper motor delay between steps

#define max_speed  0.1//Max speed in m/s

//volatile float pos_left = 0;//Left motor step count
//volatile float pos_right = 0;//Right motor step count

#define mot_breaks 0
bool l_mot_run = 1;
bool r_mot_run = 1;
bool l_mot_dir = 1;
bool r_mot_dir = 1;

#define enabled 0
#define disabled 1

#define NUM_LEDS 24
Adafruit_NeoPixel led(NUM_LEDS, GPIO_LED, NEO_GRB + NEO_KHZ800);

uint32_t orange = led.Color(250,138,0);
uint32_t red = led.Color(250,0,20);
uint32_t green = led.Color(66,237,95);
uint32_t white = led.Color(255,255,255);
uint32_t black = led.Color(0,0,0);

int led_iterator = 0;
bool led_flipflop = 0;
ros::NodeHandle nh;

//function that will be called when receiving command from host
void handle_cmd (const geometry_msgs::Twist& cmd_vel) {
  noCommLoops = 0;                                                  //Reset the counter for number of main loops without communication
  
  linear_speed_req = cmd_vel.linear.x;                                     //Extract the commanded linear speed from the message

  angular_speed_req = cmd_vel.angular.z;                            //Extract the commanded angular speed from the message
  
  l_speed_req = linear_speed_req - angular_speed_req*(wheelbase/2);     //Calculate the required speed for the left motor to comply with commanded linear and angular speeds
  r_speed_req = linear_speed_req + angular_speed_req*(wheelbase/2);    //Calculate the required speed for the right motor to comply with commanded linear and angular speeds
}

ros::Subscriber<geometry_msgs::Twist> cmd_vel("cmd_vel", handle_cmd);   //create a subscriber to ROS topic for velocity commands (will execute "handle_cmd" function when receiving data)
geometry_msgs::Vector3Stamped speed_msg;                                //create a "speed_msg" ROS message
ros::Publisher speed_pub("speed", &speed_msg);                          //create a publisher to ROS topic "speed" using the "speed_msg" type

void setup() {

  pinMode(GPIO_MOT_ENABLE, OUTPUT);
  pinMode(GPIO_L_MOT_DIR, OUTPUT);      
  pinMode(GPIO_L_MOT_STEP, OUTPUT);
  pinMode(GPIO_R_MOT_DIR, OUTPUT);
  pinMode(GPIO_R_MOT_STEP, OUTPUT);
  pinMode(GPIO_LED, OUTPUT);
  
  led.begin();
  led.setBrightness(50); //80
  led.fill(orange);
  led.show();

  nh.initNode();                            
  nh.getHardware()->setBaud(57600);         
  nh.subscribe(cmd_vel);                    
  nh.advertise(speed_pub);                  
  
  digitalWrite(GPIO_MOT_ENABLE, enabled);
}


void loop() {
  nh.spinOnce();
  if((millis()-lastMilli) >= LOOPTIME)
  {
    lastMilli = millis();

    checkRosConnection();

    controllerLoop();
  }
  
  motorControl(l_delay,r_delay,l_mot_dir,r_mot_dir,l_mot_run,r_mot_run);
 }

void checkRosConnection(){
    if (!nh.connected()){
      led_iterator++;
      if(led_iterator >= 15){
        led_iterator = 0;
        led_flipflop = !led_flipflop;
      }
      if(led_flipflop){
        led.fill(red);
      }else{
        led.fill(black);
      }
      led.show();
    }
    else{
      if(isSpeedCmdZero()){
        led.fill(orange);
      }else{
        led.fill(white);
      }
      led.show();
    }
}
bool isSpeedCmdZero(){
  if((abs(l_speed_req) + abs(r_speed_req)) == 0){
    return true;
  }
  return false;
}
void controllerLoop(){
  
    //l_speed_act=((pos_left/steps_per_rotation)*2*PI)*(1000/LOOPTIME)*radius;           // calculate speed of left wheel
    //r_speed_act=((pos_right/steps_per_rotation)*2*PI)*(1000/LOOPTIME)*radius;          // calculate speed of right wheel
    
    //pos_left = 0;
    //pos_right = 0;

    l_speed_req = constrain(l_speed_req, -max_speed, max_speed);
    l_delay = 1 / ((abs(l_speed_req) / wheel_circumference) * steps_per_rotation);

    r_speed_req = constrain(r_speed_req, -max_speed, max_speed);
    r_delay = 1 / ((abs(r_speed_req) / wheel_circumference) * steps_per_rotation);
    
    if (noCommLoops >= noCommLoopMax) {
      l_mot_run = 0;
      if (mot_breaks == 0){
        digitalWrite(GPIO_MOT_ENABLE, disabled);
      }else{
        digitalWrite(GPIO_MOT_ENABLE, enabled);
      }//BRAKE
    } else if (l_speed_req == 0){
      l_mot_run = 0;
    }
    else if (l_speed_req > 0){
      l_mot_run = 1;
      l_mot_dir = 1;
      
    }
    else {
      l_mot_run = 1;
      l_mot_dir = 0;
    }
    
    
    if (noCommLoops >= noCommLoopMax) {
      r_mot_run = 0;
      if (mot_breaks == 0){
        digitalWrite(GPIO_MOT_ENABLE, disabled);
      }else{
        digitalWrite(GPIO_MOT_ENABLE, enabled);
      }//BRAKE
    }
    else if (r_speed_req == 0){
      r_mot_run = 0;
    }
    else if (r_speed_req > 0){
      r_mot_run = 1;
      r_mot_dir = 1;
    }
    else {
      r_mot_run = 1;
      r_mot_dir = 0;
    }

    if((millis()-lastMilli) >= LOOPTIME){
      Serial.println("Looptime is taking too long!");
    }

    noCommLoops++;
    if (noCommLoops == 65535){
      noCommLoops = noCommLoopMax;
    }
    //publishSpeed(LOOPTIME);   //Publish odometry on ROS topic
}
void publishSpeed(double time) {
  speed_msg.header.stamp = nh.now();
  speed_msg.vector.x = l_speed_req;
  speed_msg.vector.y = r_speed_req;
  speed_msg.vector.z = time/1000;
  speed_pub.publish(&speed_msg);
  nh.spinOnce();
  //nh.loginfo("Publishing odometry");
}

void motorControl(double l_delayx, double r_delayx, bool l_dir, bool r_dir, bool l_enable, bool r_enable){
  if(l_mot_dir){
    //pos_left++;
    digitalWrite(GPIO_L_MOT_DIR, 1);
  }else{
    //pos_left--;
    digitalWrite(GPIO_L_MOT_DIR, 0);
  }
  if(r_mot_dir){
    //pos_right++;
    digitalWrite(GPIO_R_MOT_DIR, 1);
  }else{
    //pos_right--;
    digitalWrite(GPIO_R_MOT_DIR, 0);
  }
  if (l_enable){
    digitalWrite(GPIO_MOT_ENABLE, enabled);
    digitalWrite(GPIO_L_MOT_STEP, 0);
    digitalWrite(GPIO_L_MOT_STEP, 1);
    //delay(l_delayx / 1000);
    delayMicroseconds(l_delayx*1000000);
  }
  if (r_enable){
    digitalWrite(GPIO_MOT_ENABLE, enabled);
    digitalWrite(GPIO_R_MOT_STEP, 0);
    digitalWrite(GPIO_R_MOT_STEP, 1);
    //delay(r_delayx / 1000);
    delayMicroseconds(r_delayx*1000000);
  }
}
template <typename T> int sgn(T val) {
    return (T(0) < val) - (val < T(0));
}
