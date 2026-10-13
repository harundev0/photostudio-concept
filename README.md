# GoThru Image to Video Prototype

Static browser prototype for a four-step image-to-video workflow.

Live site: <https://harundev0.github.io/photostudio-concept/>

## Structure

```text
assets/       Runtime images
src/css/      Application styles
src/js/       Application behavior and state
tests/js/     JavaScript state tests
tests/python/ Layout and structure checks
tests/fixtures/ Test data
index.html    Application entry point
```

## Run

Serve the project root with any static HTTP server, then open `index.html`.

## Verify

```bash
node tests/js/wizard-state.test.js
node tests/js/crop-state.test.js
python3 tests/python/layout_regression.py
python3 tests/python/structure_test.py
```
