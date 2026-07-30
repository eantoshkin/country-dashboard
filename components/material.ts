"use client";

// Material Web component registrations. Imported dynamically (client-side
// only) because custom-element registration needs the browser's
// customElements registry, which doesn't exist during SSR.
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";
