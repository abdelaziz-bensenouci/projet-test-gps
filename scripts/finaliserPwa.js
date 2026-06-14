const fs = require('node:fs');
const path = require('node:path');

const racine = path.resolve(__dirname, '..');
const appJson = require(path.join(racine, 'app.json'));
const dossierDist = path.join(racine, 'dist');
const cheminHtml = path.join(dossierDist, 'index.html');
const cheminManifest = path.join(dossierDist, 'manifest.json');
const configurationWeb = appJson.expo.web;

const manifest = {
  name: configurationWeb.name,
  short_name: configurationWeb.shortName,
  lang: configurationWeb.lang,
  start_url: configurationWeb.startUrl,
  scope: configurationWeb.scope,
  display: configurationWeb.display,
  orientation: configurationWeb.orientation,
  background_color: configurationWeb.backgroundColor,
  theme_color: configurationWeb.themeColor,
  icons: [
    {
      src: '/favicon.ico',
      sizes: '48x48',
      type: 'image/x-icon',
    },
  ],
};

fs.writeFileSync(cheminManifest, `${JSON.stringify(manifest, null, 2)}\n`);

const html = fs.readFileSync(cheminHtml, 'utf8');

if (!html.includes('rel="manifest"')) {
  fs.writeFileSync(
    cheminHtml,
    html.replace('</head>', '<link rel="manifest" href="/manifest.json" /></head>'),
  );
}
