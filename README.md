# Freewrite

Freewrite is a macOS app for freewriting. You write for a set time, then you burn the text. The app does not save the text.

The app uses Tauri 2 and Svelte 5. For the terms in this file, see [GLOSSARY.md](GLOSSARY.md). For the design decisions, see [docs/adr](docs/adr).

## Use the app

1. Select a duration: 5, 10, 15, or 20 minutes.
2. Type. The first character starts the session.
3. Write until the countdown gets to zero. The app then plays a sound.
4. If you want to continue, write more. The clock shows the overtime, for example `+00:12`.
5. Select **Burn**. The app deletes the text and shows a blank page.

| Key | Action |
| --- | --- |
| `⌘+` | Extend the session by 5 minutes. |
| `⌘↩` | Burn the text. |

## Requirements

- macOS
- Xcode or the Xcode Command Line Tools
- Rust 1.90 or later
- Node.js 22.12 or later (use an LTS version)

## Install the app

Do all the commands in the project folder. The commands use paths that start from this folder.

1. Install the dependencies:

   ```sh
   npm install
   ```

2. Build the app:

   ```sh
   npm run tauri build -- --bundles app
   ```

   The build puts the app in `src-tauri/target/release/bundle/macos/Freewrite.app`.

3. Copy the app to the Applications folder:

   ```sh
   cp -R src-tauri/target/release/bundle/macos/Freewrite.app /Applications/
   ```

4. Open Freewrite from Spotlight or Launchpad.

The app has no signature. macOS does not block it, because you built it on your Mac.

## Update the app

> **CAUTION:** When you quit Freewrite, the app deletes the text of the session. If you want to keep the text, copy it before you quit.

Do all the commands in the project folder.

1. Quit Freewrite.
2. Get the latest source code.
3. Install the dependencies:

   ```sh
   npm install
   ```

4. Build the app:

   ```sh
   npm run tauri build -- --bundles app
   ```

5. Remove the old app:

   ```sh
   rm -rf /Applications/Freewrite.app
   ```

6. Copy the new app to the Applications folder:

   ```sh
   cp -R src-tauri/target/release/bundle/macos/Freewrite.app /Applications/
   ```

## Development

| Command | Result |
| --- | --- |
| `npm test` | Runs the tests of the session model. |
| `npm run check` | Checks the types. |
| `npm run tauri dev` | Starts the app in development mode. |
| `npm run tauri build` | Builds the app. |
| `npx tauri icon app-icon.svg` | Makes the app icons in `src-tauri/icons` from `app-icon.svg`. |

The `src/fonts` folder contains the Inter font with smaller vertical metrics. WebKit uses these metrics to set the height of the caret. For more information, see `scripts/patch-font-metrics.py`.
