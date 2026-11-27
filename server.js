'use strict';
// Local / Render entry point. Loads .env when present (no extra dependency needed).
const fs = require('fs');
const path = require('path');
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') process.loadEnvFile(envFile);

const app = require('./src/app');
const { ready } = require('./src/init');

const port = Number(process.env.PORT || 3000);
ready()
  .then(() => {
    app.listen(port, () => console.log(`Solo Travel Japan running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });
