const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('src/js/crop-state.js', 'utf8');
const context = { module: { exports: {} }, exports: {} };
vm.runInNewContext(source, context);

const { createCropState, moveCrop, resizeCrop, createDepthFrames } = context.module.exports;

const crop = createCropState();
assert.deepEqual(
  JSON.parse(JSON.stringify(crop)),
  { x: 26, y: 20, width: 48, height: 65 },
  'crop starts at reference frame bounds',
);

assert.deepEqual(
  JSON.parse(JSON.stringify(moveCrop(crop, 40, 30))),
  { x: 52, y: 35, width: 48, height: 65 },
  'moving clamps crop inside preview',
);

assert.deepEqual(
  JSON.parse(JSON.stringify(moveCrop(crop, -40, -30))),
  { x: 0, y: 0, width: 48, height: 65 },
  'moving clamps negative coordinates',
);

assert.deepEqual(
  JSON.parse(JSON.stringify(resizeCrop(crop, 'right', 40, 0))),
  { x: 26, y: 20, width: 74, height: 65 },
  'right handle expands to preview edge',
);

assert.deepEqual(
  JSON.parse(JSON.stringify(resizeCrop(crop, 'left', 30, 0))),
  { x: 56, y: 20, width: 18, height: 65 },
  'left handle enforces minimum width',
);

assert.deepEqual(
  JSON.parse(JSON.stringify(createDepthFrames(crop, 5))),
  [
    { x: 6.42, y: 5.83, width: 87.17, height: 89.17 },
    { x: 10.33, y: 8.67, width: 79.33, height: 84.33 },
    { x: 14.25, y: 11.5, width: 71.5, height: 79.5 },
    { x: 18.17, y: 14.33, width: 63.67, height: 74.67 },
    { x: 22.08, y: 17.17, width: 55.83, height: 69.83 },
  ],
  'depth lines converge from preview edge toward crop instead of expanding around it',
);

console.log('crop state tests passed');
