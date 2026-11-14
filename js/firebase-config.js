/*
  Firebase settings for the LIVE MEETING CODES feature.

  Leave the placeholders as they are to keep the feature switched off (the rest of the site is not affected).

  To switch it on: Firebase console -> Project settings (gear icon) -> General -> Your apps -> your Web app,
  then copy the values below. Unlike the Google Maps key, these web settings are meant to be public: they only
  say which project to talk to. What protects the data is the database rules (see the setup guide).
*/
window.YCT_FIREBASE = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};
