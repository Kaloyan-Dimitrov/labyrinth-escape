const firebase = require('firebase');
const $ = require("jquery");

//
// ─── CHECK IF THE USER IS ALREADY LOGGED IN ─────────────────────────────────────
//

const uid = localStorage.getItem('uid');
if (uid) {
    window.location.href = "./main.html";
}


//
// ─── INITIALIZING FIREBASE ──────────────────────────────────────────────────────
//

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
const app = firebase.initializeApp(firebaseConfig);

//
// ─── LOGIN CALLBACKS ────────────────────────────────────────────────────────────
//


const successfullyLoggedIn = (res) => {
    console.log('success', res)
    turnSpinnerOff();
    localStorage.setItem('uid', res);
    localStorage.setItem('loggedin', (new Date()).toString());
    window.location.href = "./main.html";
};
const unsuccessfullyLoggedIn = (error) => {
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

//
// ─── SPINNER HELPERS ────────────────────────────────────────────────────────────
//


const turnSpinnerOn = () => {
    $('.signin-spinner').removeClass('d-none');
    $('.signin-text').addClass('d-none');
};
const turnSpinnerOff = () => {
    $('.signin-spinner').addClass('d-none');
    $('.signin-text').removeClass('d-none');
};

$('form').submit(async function (event) {
    event.preventDefault();
    const email = $('#inputEmail').val();
    const password = $('#inputPassword').val();
    turnSpinnerOn();    
    try {
        await firebase.auth(app).signInWithEmailAndPassword(email, password);
        successfullyLoggedIn(firebase.auth().currentUser.uid);
    } catch (err) {
        unsuccessfullyLoggedIn(err);
    }
});

$('input').change(function (event) {
    $(event.target).siblings('div').html('');
    $(event.target).removeClass('is-invalid');
    $('.alert-danger').addClass('d-none');
});