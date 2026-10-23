# Y.C.T Smart Navigation and Events System

A front-end prototype combining the original campus navigation idea with the student guide contribution. It uses a single long page with responsive sections, smooth scrolling, a campus navigation area, events/countdowns, student guidance, a document checklist, directory search, and FAQs.

## Folder structure

- `index.html` — page structure
- `css/style.css` — responsive styling
- `js/app.js` — page interactions and prototype content
- `js/map.js` — Google Maps loading, markers and walking directions
- `js/config.js` — local Google Maps API key configuration
- `images/logoyct.png` — College logo
- `audios/` — welcome audio (`welcome_mp3.mp3`, `welcome_wav.wav`)

## Run locally

For best results, serve the folder using VS Code Live Server or another local web server rather than opening `index.html` directly. The rest of the site works without the map API key; interactive Google Maps and directions require a valid key.

## Configure Google Maps

1. In Google Cloud Console, create or select a project and enable billing if Google requires it for the APIs you use.
2. Enable **Maps JavaScript API** and confirm the current requirements for directions in the Maps JavaScript API.
3. Restrict the API key by website referrer (for local testing, allow the exact local development origin, then add only your deployed domain later) and restrict the key to the APIs required by this project.
4. Put the key in `js/config.js` by replacing `YOUR_GOOGLE_MAPS_API_KEY` on your local copy. Do not publish the key in a public repository or send it in chat.
5. Reload the page.

A Google Maps key was included in the code previously shared in chat. Treat that key as exposed: rotate/delete it in Google Cloud Console and use a new restricted key locally.

## Important prototype notes

- Campus coordinates are sample coordinates from the draft and must be verified on site. Some labels and positions may be inaccurate.
- Events are demonstration records only. Replace the titles, dates, venues and descriptions with confirmed College events before presenting or deploying the site.
- The registration steps and document list are general prompts, not official instructions. Confirm every requirement against current College information.
- The directory deliberately avoids publishing unverified phone numbers, email addresses or exact office-room claims.
- Routes and distances are only shown when the Google Maps API is configured and returns a route. The app does not invent a fixed distance/time.
- No backend, administrator dashboard, QR code flow, or database has been implemented yet; those remain future enhancements.

## Map loading and Back to top

- The map is **not** requested when the page opens. The Campus map panel shows a placeholder with a round retry (↻) button; the Google Maps script is loaded only after the button is clicked. If loading fails (network error or rejected key), the button comes back so the visitor can retry.
- **Back to top** (footer link and the floating ↑ button that appears after scrolling) now scrolls the window to the top directly. The old link pointed at the sticky header (`#top`), which is why it did not work reliably.
