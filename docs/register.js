const firebase = require('firebase');
const $ = require("jquery");
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

const successfullyRegistered = () => {
    console.log('success')
    turnSpinnerOff();
    $('.alert-success').removeClass('d-none');
};
const unsuccessfullyRegistered = (error) => {
    console.error(error);
    turnSpinnerOff();
    if (error.code == 'auth/invalid-email') {
        $('#inputEmail').addClass('is-invalid');
        $('#tooltipEmail').html('Invalid email.');
    } else {
        $('.alert-danger').removeClass('d-none');
        $('.alert-danger').html(error.message);
    }
};
const turnSpinnerOn = () => {
    $('.signup-spinner').removeClass('d-none');
    $('.signup-text').addClass('d-none');
};
const turnSpinnerOff = () => {
    $('.signup-spinner').addClass('d-none');
    $('.signup-text').removeClass('d-none');
};
const passwordsDontMatch = () => {
    $('#inputRepeatPassword').addClass('is-invalid');
    $('#tooltipRepeatPassword').html('Passwords don\'t match.');
};
$('form').submit(async function (event) {
    event.preventDefault();
    const email = $('#inputEmail').val();
    const password = $('#inputPassword').val();
    const repeatedPassword = $('#inputRepeatPassword').val();
    if(password != repeatedPassword) {
        passwordsDontMatch();
        return;
    }
    turnSpinnerOn();    
    try {
        let reponse = await firebase.auth(app).createUserWithEmailAndPassword(email, password);
        successfullyRegistered();
    } catch (err) {
        unsuccessfullyRegistered(err);
    }
});

$('input').change(function (event) {
    $(event.target).siblings('div').html('');
    $(event.target).removeClass('is-invalid');
    $('.alert-danger').addClass('d-none');
});