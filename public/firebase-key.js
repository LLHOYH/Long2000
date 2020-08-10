// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBUBZDUcBH_3RNHEQWA1ZyqPBnuk_p13YU",
    authDomain: "lilhouse-41906.firebaseapp.com",
    databaseURL: "https://lilhouse-41906.firebaseio.com",
    projectId: "lilhouse-41906",
    storageBucket: "lilhouse-41906.appspot.com",
    messagingSenderId: "344348485905",
    appId: "1:344348485905:web:9701a6be4ed6ac960e04b0",
    measurementId: "G-LDNDY9B6KV"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var firestore = firebase.firestore();

var storage = firebase.storage();