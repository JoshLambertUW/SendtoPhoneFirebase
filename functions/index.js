'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const promisePool = require('es6-promise-pool');
const PromisePool = promisePool.PromisePool;

admin.initializeApp();

const MAX_SIZE = 1048487;
const MAX_CONCURRENT = 3;

//////////////////////////////////////////////////////////////
// Check data and send message depending on message size
// 
// @param data: {message: Message to send, 
//   selectedDevice: Destination device Firestore document ID}
// @param context Provided by browser by Firebase
//////////////////////////////////////////////////////////////

exports.sendData = functions.https.onCall((data, context) => {

	const message = data.message;
	const deviceInstanceID = data.selectedDevice;
	const uid = context.auth.uid;

	if (!(typeof message === 'string') || message.length === 0) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
			'argument "message" containing the message text to add.');
	}

	if (!(typeof deviceInstanceID === 'string') || deviceInstanceID.length === 0) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
			'argument "deviceInstanceID" containing the destination of the message');
	}

	// Checking that the user is authenticated.
	if (!context.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
			'while authenticated.');
	}

	if (Buffer.byteLength(message) > MAX_SIZE) {
		throw new functions.https.HttpsError('ivalid-argument', 'Exceeds maximum message size');
	}

	var docRef = admin.firestore().collection('users').doc(uid).collection('devices').doc(deviceInstanceID);

	// Begin to process message
	return docRef.get()
		.then(documentSnapshot => {
			if (!documentSnapshot.exists) {
				throw new functions.https.HttpsError('device-error', 'Invalid device instance ID');
			}
			const token = documentSnapshot.get('fcmToken');

			// Attempt to send entire message if it doesn't exceed FCM limit
			if ((Buffer.byteLength(message) + Buffer.byteLength('message')) < 4096) {
				return sendMessage(token, message, docRef, documentSnapshot);
			}
			// Otherwise send preview and save message to db
			else {
				return saveMessage(token, message, docRef, documentSnapshot);
			}
		})
		.catch(error => {
			console.log(error);
		})
});

//////////////////////////////////////////////////////////////
// Save message to db and send a message preview FCM to device
// 
// @param token FCM device token stored in Firestore
// @param docRef Reference to user Firestore document
//////////////////////////////////////////////////////////////

function saveMessage(token, message, docRef, documentSnapshot) {
	if ((documentSnapshot.updateTime.seconds + 3) < Firestore.Timestamp.now().seconds) {
		throw new functions.https.HttpsError('send-error', 'Attempting to send too often. Try again later.');
	}
	const payload = {
		data: {
			messagePreview: message.slice(0, 37) + "...",
			messagePreviewExtended: message.slice(0, 447) + "...",
		}
	};

	return docRef.collection('messages').get()
		.then(querySnapshot => {
			// Arbitrary message limit of 20, maximum size of 20 x 1024 bytes
			if (querySnapshot.size > 20) {
				throw new functions.https.HttpsError('send-error', 'Too many pending messages for this device');
			}

			docRef.collection('messages').add({ message: message });
			return admin.messaging().sendToDevice(token, payload);
		})
}

//////////////////////////////////////////////////////////////
// Attempt to send the entire message through FCM to device
// If message exceeds 4KB limit, try saveMessage()
//
// @param token FCM device token stored in Firestore
// @param docRef Reference to user Firestore document
//////////////////////////////////////////////////////////////

function sendMessage(token, message, docRef, documentSnapshot) {
	const payload = {
		data: {
			message: message,
		}
	};
	return admin.messaging().sendToDevice(token, payload)
		.then((result) => {
			if (result.results[0].error) {
				if (res.result[0].error.code === 'messaging/payload-size-limit-exceeded') {
					return saveMessage(token, message, docRef, documentSnapshot);
				}
			}
			return result;
		})
}

//////////////////////////////////////////////////////////////
// Add a new device to the database
//
// @param data: {deviceToken: FCM token,
//				deviceName: Name of device}
// @param context Provided by browser by Firebase
//////////////////////////////////////////////////////////////

exports.addDevice = functions.https.onCall((data, context) => {
	const deviceToken = data.deviceToken;
	const deviceName = data.deviceName;
	const uid = context.auth.uid;

	if (!(typeof deviceToken === 'string') || deviceToken.length === 0) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
			'argument "deviceToken" containing the new device token');
	}

	if (!(typeof deviceName === 'string') || deviceName.length === 0) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
			'argument "deviceName" containing the new device name');
	}

	// Checking that the user is authenticated.
	if (!context.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
			'while authenticated.');
	}

	return admin.firestore().collection('users').doc(uid).collection('devices').add({
		fcmToken: deviceToken,
		deviceName: deviceName
	})
	.then(function (docRef) {
		return docRef.id;
	})
	.catch(function (error) {
		return error;
	});
});

//////////////////////////////////////////////////////////////
// Delete metadata and pending messages for given device
// Won't show up on other clients
//
// @param data: {selectedDevice: Device Firestore Document ID to delete}
// @param context Provided by browser by Firebase
//////////////////////////////////////////////////////////////

exports.deleteDevice = functions.https.onCall((data, context) => {
	const deviceInstanceID = data.selectedDevice;
	const uid = context.auth.uid;

	if (!(typeof deviceInstanceID === 'string') || deviceInstanceID.length === 0) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
			'argument "deviceInstanceID" containing the destination of the message');
	}

	// Checking that the user is authenticated.
	if (!context.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
			'while authenticated.');
	}

	var docRef = admin.firestore().collection('users').doc(uid).collection('devices').doc(deviceInstanceID);

	return docRef.collection('messages').get()
		.then(querySnapshot => {
			let batch = db.batch();
			querySnapshot.docs.forEach((doc) => {
				batch.delete(doc.ref);
			});
			return batch.commit();
		}).then(() => {
			return docRef.delete();
		});
});


//////////////////////////////////////////////////////////////
// Deletes users who haven't signed in last 30 days every 1st Monday
// Arbitrary frequency that can be adjusted depending on usage
// Firebase has free limit of 3 operations per month, per account
//////////////////////////////////////////////////////////////

exports.accountcleanup = functions.pubsub.schedule('1st monday').onRun(async context => {
	// Fetch all user details.
	const inactiveUsers = await getInactiveUsers();
	// Use a pool so that we delete maximum `MAX_CONCURRENT` users in parallel.
	const promisePool = new PromisePool(() => deleteInactiveUser(inactiveUsers), MAX_CONCURRENT);
	await promisePool.start();
});

//////////////////////////////////////////////////////////////
// Delete users
//////////////////////////////////////////////////////////////
function deleteInactiveUser(inactiveUsers) {
	if (inactiveUsers.length > 0) {
		const userToDelete = inactiveUsers.pop();

		// Delete the inactive user.
		return admin.auth().deleteUser(userToDelete.uid).then(() => {
			return console.log('Deleted user account', userToDelete.uid, 'because of inactivity');
		}).catch((error) => {
			return console.error('Deletion of inactive user account', userToDelete.uid, 'failed:', error);
		});
	} else {
		return null;
	}
}

//////////////////////////////////////////////////////////////
// Grab array of users last active more than 30 days ago
//////////////////////////////////////////////////////////////
async function getInactiveUsers(users = [], nextPageToken) {
	const result = await admin.auth().listUsers(1000, nextPageToken);
	// Find users that have not signed in in the last 30 days.
	const inactiveUsers = result.users.filter(
		user => Date.parse(user.metadata.lastSignInTime) < (Date.now() - 30 * 24 * 60 * 60 * 1000));

	// Concat with list of previously found inactive users if there was more than 1000 users.
	users = users.concat(inactiveUsers);

	// If there are more users to fetch we fetch them.
	if (result.pageToken) {
		return getInactiveUsers(users, result.pageToken);
	}

	return users;
}

