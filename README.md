# Send to Phone | Firebase Functions

Firebase cloud functions for the back end implementation of Send to Phone, a system to quickly send data between devices.

* Cloud functions are written in Node.js and use the Firebase Admin SDK
* User provides a message and back end handles sending logic
* Authentication is enforced by Google auth status checks and Firestore rules
* Total data limits are enforced by cloud functions
* Maximum 1 MiB message sizes by Firestore limits but could be lowered to ensure free tier (1 GiB total) isn't exceeded
* Scheduled functions delete inactive accounts once a month

## Getting Started

## Prerequisites

* Firebase project
* Firebase Firestore configured

## Deployment

This repo can be cloned and deployed to Firebase

To deploy:
* Create a Firebase project in the Firebase console
* Install the required dependencies by navigating to the functions folder and running:
```
npm install
```
* Deploy with:
```
firebase deploy
```
You will need Firebase initialized and an OAuth token from the Chrome Identity API. Then import the function in a project with:
```
var functions = firebase.functions();
var sendDataToFirebase = firebase.functions().httpsCallable('sendData');
```
Call with:
```
sendDataToFirebase(
    {message: messageToSend, 
    selectedDevice: selectedDeviceID
    }
)
```