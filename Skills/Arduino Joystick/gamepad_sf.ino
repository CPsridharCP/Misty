#include <SoftwareSerial.h>
SoftwareSerial mistySerial(7, 8);

//Create variables for each button on the Joystick Shield to assign the pin numbers
char button0=3, button1=4, button2=5, button3=6;
char sel=2;

void setup(void)
{
  pinMode(sel, INPUT);      //Set the Joystick 'Select'button as an input
  digitalWrite(sel, HIGH);  //Enable the pull-up resistor on the select button
  
  pinMode(button0, INPUT);      //Set the Joystick button 0 as an input
  digitalWrite(button0, HIGH);  //Enable the pull-up resistor on button 0

  pinMode(button1, INPUT);      //Set the Joystick button 1 as an input
  digitalWrite(button1, HIGH);  //Enable the pull-up resistor on button 1
  
  pinMode(button2, INPUT);      //Set the Joystick button 2 as an input
  digitalWrite(button2, HIGH);  //Enable the pull-up resistor on button 2

  pinMode(button3, INPUT);      //Set the Joystick button 3 as an input
  digitalWrite(button3, HIGH);  //Enable the pull-up resistor on button 3
  
  Serial.begin(9600);           
  mistySerial.begin(9600);
}

void loop(void)
{
//  Serial.print(analogRead(0));          //Read the position of the joysticks X axis and print it on the serial port.
//  Serial.print(",");
//  Serial.print(analogRead(1));          //Read the position of the joysticks Y axis and print it on the serial port.
//  Serial.print(",");
//  Serial.print(digitalRead(sel));       //Read the value of the select button and print it on the serial port.
//  Serial.print(digitalRead(button0));   //Read the value of the button 0 and print it on the serial port.
//  Serial.print(digitalRead(button1));   //Read the value of the button 1 and print it on the serial port.
//  Serial.print(digitalRead(button2));   //Read the value of the button 2 and print it on the serial port.
//  Serial.println(digitalRead(button3)); //Read the value of the button 3 and print it on the serial port.
  //Serial.println("{\"v_analog\":"+String(analogRead(0))+",\"h_analog\":"+String(analogRead(1))+",\"b_analog\":"+String(digitalRead(sel))+",\"up\":"+String(digitalRead(button0))+",\"left\":"+String(digitalRead(button1))+",\"right\":"+String(digitalRead(button2))+",\"down\":"+String(digitalRead(button3))+"}");
  mistySerial.println("{\"v_analog\":"+String(analogRead(0))+",\"h_analog\":"+String(analogRead(1))+",\"b_analog\":"+String(digitalRead(sel))+",\"up\":"+String(digitalRead(button0))+",\"left\":"+String(digitalRead(button1))+",\"right\":"+String(digitalRead(button2))+",\"down\":"+String(digitalRead(button3))+"}");
  //Wait for 100 ms, then go back to the beginning of 'loop' and repeat.
  delay(100);
}
