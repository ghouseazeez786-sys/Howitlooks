/* ============================================================
   FIREBASE CONFIGURATION — fill this in with YOUR project's keys
   ============================================================
   1. Go to https://console.firebase.google.com and create a project
      (it's free — the "Spark" plan covers everything this app needs
      at low/medium scale).
   2. In Project settings (gear icon) > General > "Your apps", click the
      Web icon (</>) to register a web app. Firebase will show you a
      firebaseConfig object — copy those real values into the object below,
      replacing the YOUR_... placeholders.
   3. In the left sidebar, go to Build > Authentication > Sign-in method,
      and enable the providers you want to be real:
        - Email/Password  — powers the main Login/Create Account forms.
        - Google          — powers the Google button.
        - Phone           — powers OTP login (also needs step 5 below).
        - Anonymous       — powers "Continue as Guest" as a real session.
      Facebook and Apple can be enabled the same way, but each needs extra
      setup outside Firebase first: Facebook needs a free Facebook Developer
      App (developers.facebook.com) for its App ID/Secret; Apple needs a
      paid Apple Developer Program membership ($99/yr) to create a Services
      ID. Until you've done that provider's extra setup, leave it disabled
      in Firebase — the button will simply show an error toast if tapped,
      it won't crash anything.
   4. In the left sidebar, go to Build > Firestore Database > Create
      database. Start in test mode while you're developing; before you go
      live, lock it down with real security rules (Firebase's docs cover
      this under "Firestore Security Rules").
   5. For Phone/OTP specifically: Firebase needs to run an invisible
      reCAPTCHA check, which only works when the app is served over a real
      http(s):// domain (not opened as a local file://) — this is already
      handled by the app (see the otpRecaptchaContainer div and
      isFirebaseLive() checks in index.html), you just need real hosting.

   Until you fill in real values here, Howitlooks keeps running in its
   original demo mode — simulated login, nothing persisted, exactly as
   before. Nothing else breaks; add this whenever you're ready.
   ============================================================ */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const FIREBASE_ENABLED = !!(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY');

if (FIREBASE_ENABLED && typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
}
