/*
  AUDIO NOTES — add your recordings here by hand.

  1. Put each audio file in the folder:  audios/notes/   (create it if it does not exist).
     Short mono MP3 files (about 1 minute) keep the site fast on mobile data.
  2. Add one entry per note to the list below.

  Two kinds of note:
    PLACE note  - plays whenever this place is chosen as the DESTINATION:
      { to: 'library', title: 'About the Library', file: 'audios/notes/library.mp3', text: 'Optional written version.' }
    PATH note   - plays only for one specific route (from -> to):
      { from: 'main-gate', to: 'library', title: 'Main Gate to the Library', file: 'audios/notes/main-gate-to-library.mp3', text: 'Walk straight past ...' }

  "from" and "to" use the place ids from the campusLocations list in js/app.js
  (for example 'main-gate', 'library', 'bursary', 'nacos-office', 'lotus-bank').
  A PATH note is only matched when the start point is a campus place, not "Me".
  A comma is needed after every entry except the last one.
*/
window.audioNotes = [
  // { to: 'library', title: 'About the Library', file: 'audios/notes/library.mp3', text: '' },
];
