var config = {
    apiKey: "AIzaSyA8jCEXgEsLljtkEUg-RCgHaF6i2cag_kY",
    authDomain: "remote-13.firebaseapp.com",
    databaseURL: "https://remote-13.firebaseio.com",
    storageBucket: "remote-13.appspot.com",
    messagingSenderId: "113160307201",
    appId: "1:113160307201:web:fc2dda4c33c5d2ce4ff600",
    measurementId: "G-3F5MRDS2LK"
  };
  firebase.initializeApp(config);
  
  // Reference used to read from database.
  dbAccess = firebase.database();
  
  // Google OAuth Client ID, needed to support One-tap sign-up.
  // Set to null if One-tap sign-up is not supported.
  var CLIENT_ID = null;