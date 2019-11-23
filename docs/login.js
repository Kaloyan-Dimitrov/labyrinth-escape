const firebase = require('firebase');
const $ = require('jquery');
const firebaseConfig = {
    apiKey: "AIzaSyALmxph1nPf5oamgJSLRl6-3AsK0QiX318",
    authDomain: "labirynth-solver.firebaseapp.com",
    databaseURL: "https://labirynth-solver.firebaseio.com",
    projectId: "labirynth-solver",
    storageBucket: "labirynth-solver.appspot.com",
    messagingSenderId: "222488162206",
    appId: "1:222488162206:web:2fba50f01d3b6ff295b08f",
    measurementId: "G-QKH037DXDT"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
$('form').submit(function (event) {
    event.preventDefault();
    const email = $('#inputEmail').val();
    const password = $('#inputPassword').val();
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error({errorCode, errorMessage});
        if(errorCode == 'auth/invalid-email') {
            $('#inputEmail').addClass('is-invalid');
            $('#tooltipEmail').html('Invalid email.');
        }
    });
});