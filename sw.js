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
    'icons/apple-icon-57x57.png',
    'icons/apple-icon-60x60.png',
    'icons/apple-icon-72x72.png',
    'icons/apple-icon-76x76.png',
    'icons/apple-icon-114x114.png',
    'icons/apple-icon-120x120.png',
    'icons/apple-icon-144x144.png',
    'icons/apple-icon-152x152.png',
    'icons/apple-icon-180x180.png',
    'icons/android-icon-192x192.png',
    'icons/favicon-32x32.png',
    'icons/favicon-96x96.png',
    'icons/favicon-16x16.png',
    'icons/ms-icon-144x144.png',
    'manifest.json',

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
//toolbox.router.get('/images/*', toolbox.cacheFirst); 
//toolbox.router.get('/*', toolbox.networkFirst, { networkTimeoutSeconds: 5});
