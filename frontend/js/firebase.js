/* =========================================================
   MITTI MANOR
   FIREBASE AUTHENTICATION
========================================================= */

"use strict";


/* =========================================================
   FIREBASE SDK
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

const firebaseConfig = {

    apiKey:
        "AIzaSyDBuaqeGPJRcKNjND69-E3W_g3gta3LpW4",

    authDomain:
        "mitti-manor.firebaseapp.com",

    projectId:
        "mitti-manor",

    storageBucket:
        "mitti-manor.firebasestorage.app",

    messagingSenderId:
        "321272334348",

    appId:
        "1:321272334348:web:4ee71f475f0b586f2e4629",

    measurementId:
        "G-K9H53GTB1Q"

};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const firebaseApp =
    initializeApp(firebaseConfig);


/* =========================================================
   FIREBASE AUTH
========================================================= */

const auth =
    getAuth(firebaseApp);


/* =========================================================
   CURRENT USER
========================================================= */

let currentUser = null;


onAuthStateChanged(
    auth,
    (user) => {

        currentUser = user || null;


        if (user) {

            console.log(
                "MITTI MANOR: User logged in",
                user.uid
            );

        } else {

            console.log(
                "MITTI MANOR: User logged out"
            );

        }


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

    }
);


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
                    displayName:
                        displayName
                }
            );

        }


        return {

            success: true,

            user:
                result.user

        };


    } catch (error) {

        console.error(
            "MITTI MANOR signup error:",
            error
        );


        return {

            success: false,

            error:
                getFirebaseErrorMessage(error)

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

            user:
                result.user

        };


    } catch (error) {

        console.error(
            "MITTI MANOR email login error:",
            error
        );


        return {

            success: false,

            error:
                getFirebaseErrorMessage(error)

        };

    }

}


/* =========================================================
   PHONE OTP
========================================================= */

let phoneRecaptcha = null;


/* =========================================================
   CREATE RECAPTCHA
========================================================= */

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

                    size:
                        "invisible",


                    callback:
                        () => {

                            console.log(
                                "MITTI MANOR: reCAPTCHA verified"
                            );

                        },


                    "expired-callback":
                        () => {

                            console.log(
                                "MITTI MANOR: reCAPTCHA expired"
                            );

                        }

                }
            );


        return phoneRecaptcha;


    } catch (error) {

        console.error(
            "MITTI MANOR reCAPTCHA error:",
            error
        );


        phoneRecaptcha =
            null;


        return null;

    }

}


/* =========================================================
   SEND PHONE OTP
========================================================= */

async function sendPhoneOTP(
    phoneNumber,
    recaptchaContainerId =
        "recaptcha-container"
) {

    try {

        if (!phoneNumber) {

            return {

                success: false,

                error:
                    "Please enter your phone number."

            };

        }


        /*
         IMPORTANT:

         Number must contain country code.

         Example:
         +919876543210
        */


        const verifier =
            setupPhoneRecaptcha(
                recaptchaContainerId
            );


        if (!verifier) {

            return {

                success: false,

                error:
                    "reCAPTCHA could not be initialized."

            };

        }


        const confirmationResult =
            await signInWithPhoneNumber(
                auth,
                phoneNumber,
                verifier
            );


        window.MittiManorPhoneConfirmation =
            confirmationResult;


        return {

            success: true

        };


    } catch (error) {

        console.error(
            "MITTI MANOR OTP error:",
            error
        );


        /*
         Reset reCAPTCHA
        */

        if (phoneRecaptcha) {

            try {

                await phoneRecaptcha.clear();

            } catch (_) {}

            phoneRecaptcha =
                null;

        }


        return {

            success: false,

            error:
                getFirebaseErrorMessage(error)

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


        if (!otp || otp.length !== 6) {

            return {

                success: false,

                error:
                    "Please enter the 6-digit OTP."

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

            user:
                result.user

        };


    } catch (error) {

        console.error(
            "MITTI MANOR OTP verification error:",
            error
        );


        return {

            success: false,

            error:
                getFirebaseErrorMessage(error)

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
            "MITTI MANOR logout error:",
            error
        );


        return {

            success: false,

            error:
                getFirebaseErrorMessage(error)

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
   FIREBASE ERROR MESSAGES
========================================================= */

function getFirebaseErrorMessage(
    error
) {

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
            "Network error. Please check your internet connection.",


        "auth/operation-not-allowed":
            "This login method is not enabled in Firebase."


    };


    return (
        messages[code] ||
        error.message ||
        "Authentication failed."
    );

}


/* =========================================================
   GLOBAL MITTI MANOR FIREBASE API
========================================================= */

window.MittiManorFirebase = {

    app:
        firebaseApp,

    auth:
        auth,

    getCurrentUser:
        getCurrentUser,

    signUpWithEmail:
        signUpWithEmail,

    loginWithEmail:
        loginWithEmail,

    sendPhoneOTP:
        sendPhoneOTP,

    verifyPhoneOTP:
        verifyPhoneOTP,

    logoutUser:
        logoutUser,

    setupPhoneRecaptcha:
        setupPhoneRecaptcha

};


/* =========================================================
   READY
========================================================= */

console.log(
    "🔥 MITTI MANOR Firebase initialized successfully."
);
