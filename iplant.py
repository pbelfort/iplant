import pyrebase
from datetime import date
import Adafruit_DHT
import RPi.GPIO as GPIO
import time
from datetime import datetime

firebaseConfig = {
    "apiKey": "",
    "authDomain": "",
    "databaseURL": "",
    "projectId": "",
    "storageBucket": "",
    "messagingSenderId": "",
    "appId": "",
    "measurementId": ""
  }

#Firebase Variables
firebase = pyrebase.initialize_app(firebaseConfig)
db = firebase.database()
today = date.today()

#TAD Firebase
dbTad = {
    "Irrigacao" : False,
    "Aciona": False,
    "Temperatura" : "null",
    "Umidade" : "null",    
    "VetorIrrigacao" : { "00:00" : "null", "01:00" : "null", "02:00" : "null", "03:00" : "null", "04:00" : "null", "05:00" : "null",
                         "06:00" : "null", "07:00" : "null", "08:00" : "null", "09:00" : "null", "10:00" : "null", "11:00" : "null",
                         "12:00" : "null", "13:00" : "null", "14:00" : "null", "15:00" : "null", "16:00" : "null", "17:00" : "null",
                         "18:00" : "null", "19:00" : "null", "20:00" : "null", "21:00" : "null", "22:00" : "null", "23:00" : "null",                         
                       },
    "VetorTemperatura":{ "00:00" : "null", "01:00" : "null", "02:00" : "null", "03:00" : "null", "04:00" : "null", "05:00" : "null",
                         "06:00" : "null", "07:00" : "null", "08:00" : "null", "09:00" : "null", "10:00" : "null", "11:00" : "null",
                         "12:00" : "null", "13:00" : "null", "14:00" : "null", "15:00" : "null", "16:00" : "null", "17:00" : "null",
                         "18:00" : "null", "19:00" : "null", "20:00" : "null", "21:00" : "null", "22:00" : "null", "23:00" : "null",                         
                       },
    "VetorUmidade" :   { "00:00" : "null", "01:00" : "null", "02:00" : "null", "03:00" : "null", "04:00" : "null", "05:00" : "null",
                         "06:00" : "null", "07:00" : "null", "08:00" : "null", "09:00" : "null", "10:00" : "null", "11:00" : "null",
                         "12:00" : "null", "13:00" : "null", "14:00" : "null", "15:00" : "null", "16:00" : "null", "17:00" : "null",
                         "18:00" : "null", "19:00" : "null", "20:00" : "null", "21:00" : "null", "22:00" : "null", "23:00" : "null",                         
                       }
       }

#Define sensor
sensor = Adafruit_DHT.DHT11

#Insert Firebase Variables
db.child(today).set(dbTad)

# Define a GPIO pin
pino_sensor = 25
channel = 21
pin_rele = 20
GPIO.setmode(GPIO.BCM)
GPIO.setup(channel, GPIO.IN)
GPIO.setup(pin_rele, GPIO.OUT)

umid, temp = Adafruit_DHT.read_retry(sensor, pino_sensor)


def irrigationOff(pin):
    GPIO.output(pin, GPIO.HIGH)

def irrigationOn(pin):
    GPIO.output(pin, GPIO.LOW)
    
def callback(channel):
    if GPIO.input(channel):
        data = {
            "Irrigacao" : True
            }
        db.child(today).update(data)
    else:
        data = {
            "Irrigacao" : False,
            "Aciona": False
            }
        db.child(today).update(data)
    
def readUmidityAndTemperature():
   # Read sensor
   if umid is not None and temp is not None:
     data = {
        "Temperatura" : temp,
        "Umidade" : umid
         }
     db.child(today).update(data)
   else:
     print("Error in DHT11 !!!")
     
def getVectorTemperature(hr,temperature):
    vector = db.child(today).child("VetorTemperatura").get()
    for i in vector.each():
        if(i.key() == hr):
            print(i.key())
            
while(1):
    varIrrigation = db.child(today).child("Irrigacao").get()
    varAciona = db.child(today).child("Aciona").get()
    callback(channel)
    now = datetime.now()
    if((now.hour == 0) and (now.minute == 0) and (now.second == 0)):
        db.child(today).set(dbTad)        

    readUmidityAndTemperature()
    print(varIrrigation.val())
    if ((varIrrigation.val() == False) or (varAciona.val() == False)):
        irrigationOff(pin_rele)
        print("Irrigation Off")
    if (varAciona.val() == True):
        irrigationOn(pin_rele)
        print("Irrigation On")
    
    print(str(now.hour) + "h " + str(now.minute) + "m " + str(now.second) + "s")
    
    if((now.minute == 0)):
        if(now.hour < 10):
            hourdb = "0"+str(now.hour)
        else:
            hourdb = str(now.hour)
        
        tempData = {
            hourdb+":00" : temp
            }
        umidData = {
            hourdb+":00" : umid            
            }
        
        db.child(today).child("VetorTemperatura").update(tempData)
        db.child(today).child("VetorUmidade").update(umidData)
        