#include <SoftwareSerial.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <Adafruit_BME280.h>

#define BMP_SCK 13
#define BMP_MISO 12
#define BMP_MOSI 11 
#define BMP_CS 10

#define BME_SCK 13
#define BME_MISO 12
#define BME_MOSI 11
#define BME_CS 10


SoftwareSerial mySerial(7, 8); // RX, TX

//Adafruit_BMP280 bme; // I2C

//Select whichjever sensor you use
//Adafruit_BMP280 bme(BMP_CS); // hardware SPI
Adafruit_BME280 bme(BME_CS); // hardware SPI


//Adafruit_BMP280 bme(BMP_CS, BMP_MOSI, BMP_MISO,  BMP_SCK);
  
void setup() {
  Serial.begin(9600);
  //Serial.println(F("BMP280 test"));
  
  if (!bme.begin()) {  
    Serial.println("Could not find a valid BMP280 sensor, check wiring!");
    //while (1);
  }
  mySerial.begin(9600);
  
}
float old = 0.0;
float now = 0.0;
bool flag = false;
float delta = 0.0;
float alpha = 0.0;
float value = 0.0;

int counter = 0;
float sum = 0.0; 

void loop() {
    //Serial.print("Temperature = ");

    
    //Serial.print(bme.readTemperature());
    now = bme.readTemperature();

    alpha = 0.7; // factor to tune
    value = alpha * now + (1-alpha) * value;

    delta = value-old;


    

    if (flag){

      sum += delta;
      counter +=1;

      if (counter==10){
        //mySerial.println(sum);
        //Serial.println(sum);
        //Serial.println("{\"temp_change\":"+String(sum)+"}");
        mySerial.println("{\"temp_change\":"+String(sum)+"}");
        counter = 0;
        sum = 0.0;
      }

      old = value;
    }

    else{
      flag = true;
      delta = 0.0;
      old = now;
    }

    delay(100);
}
