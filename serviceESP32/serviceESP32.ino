#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WebSocketsClient.h>

const char* ssid = "privatWiFiNotlyPublic";
const char* password = "faingganteng9";
const char* serverAddress = "192.168.106.222";
const int serverPort = 3000;

const int potPin = 34;

float voltageOutputCircuit;
float voltageCircuit;
float digitalpoint;
float valueMapping;
float maxRotateMotor;
float speedPWM;

float voltage;
float speedMotor;

bool directionClockwise;
bool directionCounterClockwise;

int directionMotor;

WiFiClient wifiClient; 

WebSocketsClient webSocket;

void getDataFromArduinoUNO() {
  voltageOutputCircuit = analogRead(potPin);
  voltageCircuit = (voltageOutputCircuit / 4095.0) * 5.0;
  digitalpoint = (4.34 / 5) *  4095;
  valueMapping = map(voltageOutputCircuit, 0, digitalpoint, 0, 4095.0);
  maxRotateMotor = 9.0 / 12.0 * 2400.0;
  speedPWM = valueMapping / 4095.0 * 255.0;
}

void defineVoltageMotor() {
  voltage = speedPWM / 255.0 * 9.0;
}

void defineSpeedMotor() {
  speedMotor = valueMapping / 4095.0 * maxRotateMotor;
}

void defineDirectionMotor() {
  if (voltageCircuit <= 5.2 && voltageCircuit >= 3.0) {
    directionMotor = 1;
    directionClockwise = true;
    directionCounterClockwise = false;
  } else if (voltageCircuit < 3.0 && voltageCircuit >= 1.0) {
    directionMotor = -1;
    directionClockwise = false;
    directionCounterClockwise = true;
  } else {
    directionMotor = 0;
    directionClockwise = false;
    directionCounterClockwise = false;
  }
}

void onWebSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
 switch (type) {
   case WStype_DISCONNECTED:
     Serial.println("Terputus dari server");
     webSocket.begin(serverAddress, serverPort);
     Serial.println("Terhubung ke server WebSocket");
     Serial.println(WiFi.localIP());
     break;
   case WStype_TEXT:
     Serial.print("Menerima pesan: ");
     Serial.println((char*)payload);

     if (payload[1], "1") {

       getDataFromArduinoUNO();

       defineVoltageMotor();
       defineSpeedMotor();
       defineDirectionMotor();

       StaticJsonDocument<200> doc;

       doc["direction"] = directionMotor;
       doc["speed"] = speedMotor;
       doc["voltage"] = voltage;

       String jsonStr;

       serializeJson(doc, jsonStr);

       webSocket.sendTXT(jsonStr);
     }
     break;
 }
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi Connected");

  webSocket.begin(serverAddress, serverPort);
  webSocket.onEvent(onWebSocketEvent);

  Serial.println("Terhubung ke server WebSocket");

  pinMode(potPin, INPUT);
}

void loop() {
  webSocket.loop();
  webSocket.onEvent(onWebSocketEvent);
}