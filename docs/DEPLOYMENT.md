# Deployment Guide

Follow these steps to build and deploy the application in a production
environment.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create the production bundle**

   ```bash
   npm run build
   ```

   This generates the optimized assets inside `dist/`.

3. **Host the bundle** Serve the `dist/` directory with any static web server
   (for example Nginx or GitHub Pages). Update the `sdkUri` in your app manifest
   to point to the hosted `app.html`.

4. **Update the manifest** Ensure your `app-manifest.yml` uses `SDK_V2` and the
   correct URL for the deployed bundle.

5. **Install on a Miro board** After deploying, install or reinstall the app
   from your Miro developer team so it loads the new bundle.
