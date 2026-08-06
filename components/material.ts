"use client";

// Material Web component registrations. Imported dynamically (client-side
// only) because custom-element registration needs the browser's
// customElements registry, which doesn't exist during SSR.
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";
import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/button/text-button.js";
import "@material/web/icon/icon.js";
import "@material/web/divider/divider.js";
import "@material/web/progress/linear-progress.js";
import "@material/web/elevation/elevation.js";
