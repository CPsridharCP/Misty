import dweepy
import time
import numpy as np
import cv2
from skimage import io
import os
import subprocess
from gpiozero import Button, LED


def prepare_image():

    robot_ip = "192.168.0.102"
    #url_path = "http://"+robot_ip+"/api/alpha/camera?Base64=false"    
    url_path = "http://"+robot_ip+"/api/alpha/image?FileName=Intruder.jpg&Base64=false"  
    image = io.imread(url_path)
    b,g,r = cv2.split(image)       
    image = cv2.merge([r,g,b])
    image = cv2.resize(image, (0,0), fx=0.5, fy=0.5) 
    (h, w) = image.shape[:2]
    logo = cv2.imread("white.png",cv2.IMREAD_UNCHANGED)
    logo = cv2.resize(logo, (0,0), fx=0.1, fy=0.1)
    (lH, lW) = logo.shape[:2]
    (B, G, R, A) = cv2.split(logo)
    logo = cv2.merge([B, G, R])
    overlay = np.zeros((h, w, 3), dtype="uint8")
    overlay[h - lH - 15:h - 15, w - lW - 40:w - 40] = logo
    output = image.copy()
    output = cv2.addWeighted(overlay, 1.0, output, 1.0, 0)
    #cv2.imshow('test_overlay',output)
    cv2.imwrite('Intruder.jpeg',output)

def switch_to_printer_network():
    start = time.time()
    out = subprocess.check_output("wpa_cli -i wlan0 select_network $(wpa_cli -i wlan0 list_networks | grep INSTAX-01558927 | cut -f 1)",shell=True)
    if out == b'OK\n':
        os.system("echo Connecting to Printer")
        #Add Timeout Reattempt
        while out != b'INSTAX-01558927\n':
            os.system("echo Waiting for printer to get connected")
            out= subprocess.check_output("iwgetid wlan0 --raw", shell = True)
            if time.time()-start > 10:
                switch_to_printer_network()
                break
            time.sleep(0.5)
        os.system("echo Connected to Printer Network")
    else:
        # Reattempt connection
        switch_to_printer_network()
        os.system("echo Reattempting connecting to printer")

def switch_to_robot_network():
    #os.system("wpa_cli -i wlan0 select_network $(wpa_cli -i wlan0 list_networks | grep Misty-Staff | cut -f 1)")
    start = time.time()
    out = subprocess.check_output("wpa_cli -i wlan0 select_network $(wpa_cli -i wlan0 list_networks | grep TP-Link_5958_5G | cut -f 1)",shell = True)
    if out == b'OK\n':
        os.system("echo Connecting to Robot Network")
        #Add Timeout Reattempt
        while out != b'TP-Link_5958_5G\n':
            out= subprocess.check_output("iwgetid wlan0 --raw", shell = True)
            if time.time()-start > 10:
                switch_to_robot_network()
                break
            time.sleep(0.5)
        os.system("echo Connected to Robot Network")
    else:
        # Reattempt connection
        switch_to_robot_network()
        os.system("echo Reattempting connecting to Robot Network")

def print_image():
    led.blink(0.1)
    os.system("echo Attempting to print")
    x = os.system("instax-print Intruder.jpeg -i 1111")
    if x != 0:
        out= subprocess.check_output("iwgetid wlan0 --raw", shell = True)
        if out != b'INSTAX-01558927\n':
            switch_to_printer_network()
        print_image()
    led.on()

# Check if on the robot network before we start network
out= subprocess.check_output("iwgetid wlan0 --raw", shell = True)
if out != b'TP-Link_5958_5G\n':
    switch_to_robot_network()

led = LED(17)
led.on()

# Start with a status or make one
try:
    response = dweepy.get_latest_dweet_for('misty')
    old_status = str(response[0]["created"])
    print("START:",old_status)
except:
    dweepy.dweet_for('misty', {'status': 'script_start'})
    time.sleep(2)

while True:
    try:
        time.sleep(1.5)
        response = dweepy.get_latest_dweet_for('misty')
        new_status = str(response[0]["created"]) 
        print("NOW:  ",new_status)
        if new_status != old_status:
            old_status = new_status
            print("Trigger Alarm")
            os.system("echo Alarm Triggered")
            prepare_image()
            switch_to_printer_network()
            print_image()
            switch_to_robot_network()

    except KeyboardInterrupt:
        print ("Program Stopped")
        break

    except:
        pass



