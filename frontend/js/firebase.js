
/* =========================================================
   MITTI MANOR — FIREBASE.JS
   Firebase Authentication Setup
========================================================= */

"use strict";


/* =========================================================
   FIREBASE IMPORTS
   Firebase v12 Modular SDK
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,

    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,

    signOut,

    RecaptchaVerifier,
    signInWithPhoneNumber,

    updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

/*
   Firebase Console se ye values copy karke
   neeche paste karna hai.
*/

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_PROJECT.firebaseapp.com",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

    appId: "YOUR_APP_ID"

};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const firebaseApp =
    initializeApp(firebaseConfig);


/* =========================================================
   AUTH
========================================================= */

const auth =
    getAuth(firebaseApp);


/* =========================================================
   CURRENT USER
========================================================= */

let currentUser = null;


onAuthStateChanged(auth, user => {

    currentUser = user || null;


    if (user) {

        console.log(
            "MITTI MANOR User Logged In:",
            user.uid
        );

        document.dispatchEvent(
            new CustomEvent(
                "mittiManorAuthChanged",
                {
                    detail: {
                        user: user
                    }
                }
            )
        );

    } else {

        console.log(
            "MITTI MANOR User Logged Out"
        );

        document.dispatchEvent(
            new CustomEvent(
                "mittiManorAuthChanged",
                {
                    detail: {
                        user: null
                    }
                }
            )
        );

    }

});


/* =========================================================
   EMAIL + PASSWORD SIGN UP
========================================================= */

async function signUpWithEmail(
    email,
    password,
    displayName = ""
) {

    try {

        const result =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        if (displayName) {

            await updateProfile(
                result.user,
                {
                    displayName: displayName
                }
            );

        }


        return {
            success: true,
            user: result.user
        };


    } catch (error) {

        console.error(
            "Email signup error:",
            error
        );


        return {
            success: false,
            error: getFirebaseErrorMessage(error)
        };

    }

}


/* =========================================================
   EMAIL + PASSWORD LOGIN
========================================================= */

async function loginWithEmail(
    email,
    password
) {

    try {

        const result =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        return {
            success: true,
            user: result.user
        };


    } catch (error) {

        console.error(
            "Email login error:",
            error
        );


        return {
            success: false,
            error: getFirebaseErrorMessage(error)
        };

    }

}


/* =========================================================
   PHONE OTP
========================================================= */

let phoneRecaptcha = null;


function setupPhoneRecaptcha(
    containerId = "recaptcha-container"
) {

    try {

        if (phoneRecaptcha) {
            return phoneRecaptcha;
        }


        phoneRecaptcha =
            new RecaptchaVerifier(
                auth,
                containerId,
                {
                    size: "invisible",

                    callback: () => {

                        console.log(
                            "reCAPTCHA verified."
                        );

                    },

                    "expired-callback": () => {

                        console.log(
                            "reCAPTCHA expired."
                        );

                    }
                }
            );


        return phoneRecaptcha;


    } catch (error) {

        console.error(
            "reCAPTCHA setup error:",
            error
        );

        return null;

    }

}


/* =========================================================
   SEND PHONE OTP
========================================================= */

async function sendPhoneOTP(
    phoneNumber,
    recaptchaContainerId = "recaptcha-container"
) {

    try {

        /*
           Phone number format:

           +919876543210

           Country code is required.
        */

        const verifier =
            setupPhoneRecaptcha(
                recaptchaContainerId
            );


        if (!verifier) {

            return {
                success: false,
                error: "reCAPTCHA could not be initialized."
            };

        }


        const confirmationResult =
            await signInWithPhoneNumber(
                auth,
                phoneNumber,
                verifier
            );


        /*
           Save confirmation result temporarily.
           It will be used when user enters OTP.
        */

        window.MittiManorPhoneConfirmation =
            confirmationResult;


        return {
            success: true
        };


    } catch (error) {

        console.error(
            "Phone OTP error:",
            error
        );


        /*
           If reCAPTCHA becomes invalid,
           recreate it next time.
        */

        if (phoneRecaptcha) {

            try {
                await phoneRecaptcha.clear();
            } catch (_) {}

            phoneRecaptcha = null;

        }


        return {
            success: false,
            error: getFirebaseErrorMessage(error)
        };

    }

}


/* =========================================================
   VERIFY PHONE OTP
========================================================= */

async function verifyPhoneOTP(
    otp
) {

    try {

        const confirmationResult =
            window.MittiManorPhoneConfirmation;


        if (!confirmationResult) {

            return {
                success: false,
                error:
                    "Please request a new OTP first."
            };

        }


        const result =
            await confirmationResult.confirm(
                otp
            );


        window.MittiManorPhoneConfirmation =
            null;


        return {
            success: true,
            user: result.user
        };


    } catch (error) {

        console.error(
            "OTP verification error:",
            error
        );


        return {
            success: false,
            error: getFirebaseErrorMessage(error)
        };

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

    try {

        await signOut(auth);

        return {
            success: true
        };


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        return {
            success: false,
            error: getFirebaseErrorMessage(error)
        };

    }

}


/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser() {

    return auth.currentUser;

}


/* =========================================================
   FIREBASE ERROR TRANSLATOR
========================================================= */

function getFirebaseErrorMessage(error) {

    if (!error) {
        return "Something went wrong.";
    }


    const code =
        error.code || "";


    const messages = {

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/user-not-found":
            "No account found with this email.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/invalid-credential":
            "Email or password is incorrect.",

        "auth/email-already-in-use":
            "This email is already registered.",

        "auth/weak-password":
            "Password should be at least 6 characters.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/invalid-phone-number":
            "Please enter a valid phone number.",

        "auth/missing-phone-number":
            "Please enter your phone number.",

        "auth/quota-exceeded":
            "OTP limit reached. Please try again later.",

        "auth/invalid-verification-code":
            "Incorrect OTP.",

        "auth/code-expired":
            "OTP has expired. Please request a new OTP.",

        "auth/session-expired":
            "Session expired. Please request a new OTP.",

        "auth/captcha-check-failed":
            "reCAPTCHA verification failed.",

        "auth/network-request-failed":
            "Network error. Please check your internet connection."

    };


    return (
        messages[code] ||
        error.message ||
        "Authentication failed."
    );

}


/* =========================================================
   GLOBAL MITTI MANOR FIREBASE OBJECT
========================================================= */

window.MittiManorFirebase = {

    app: firebaseApp,

    auth: auth,

    getCurrentUser,

    signUpWithEmail,

    loginWithEmail,

    sendPhoneOTP,

    verifyPhoneOTP,

    logoutUser,

    setupPhoneRecaptcha

};


console.log(
    "MITTI MANOR Firebase initialized."
);
