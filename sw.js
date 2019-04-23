'use strict';
importScripts('sw-toolbox.js'); 
toolbox.precache([
    '.',
    'sw.js',
    'sw-toolbox.js',

    'index.html',
    'vue.js',
    'highlight/styles/github-gist.css',
    'highlight/highlight.pack.js',
    'icons/android-chrome-192x192.png',
    'icons/android-chrome-512x512.png',
    'icons/apple-touch-icon.png',
    'icons/apple-touch-icon-precomposed.png',
    'icons/favicon.ico',
    'icons/favicon-16x16.png',
    'icons/favicon-32x32.png',
    'icons/mstile-144x144.png',
    'icons/mstile-150x150.png',
    'icons/mstile-310x150.png',
    'icons/mstile-310x310.png',
    'icons/safari-pinned-tab.svg',
    'site.webmanifest',

    'back.svg',
    'check.svg',
    'cross.svg',
    'minus.svg',
    'plus.svg',
    'save.svg',

    'default_l10n.js',
    'ru_l10n.js',

    'canvas_bitmap.js',
    'bar.js',
    'button.js',
    'text_input.js',
    'input2d.js',
    'num_input.js',
    'select_one.js',
    'ei_component.js',
    'ei_c.js',

]); 
toolbox.router.get('/highlight/*', toolbox.cacheFirst); 
toolbox.router.get('/icons/*', toolbox.cacheFirst); 
toolbox.router.get('/*', toolbox.networkFirst, { networkTimeoutSeconds: 5});
