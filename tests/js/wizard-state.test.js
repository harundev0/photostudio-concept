const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('src/js/wizard-state.js', 'utf8');
const context = { module: { exports: {} }, exports: {} };
vm.runInNewContext(source, context);

const {
  createWizardState,
  nextStep,
  previousStep,
  setControl,
  setImageSelected,
  canVisitStep,
  getStepView,
  getPrimaryAction,
} = context.module.exports;

const state = createWizardState();
assert.equal(state.step, 1, 'wizard starts at Select Image');
assert.equal(state.completed.join(','), '', 'no steps start complete');
assert.equal(state.imageSelected, false, 'wizard starts without an image');
assert.equal(nextStep(state).step, 1, 'Next remains locked until an image is selected');
assert.equal(canVisitStep(state, 2), false, 'future steps start locked');

const selected = setImageSelected(state, true);
assert.equal(selected.imageSelected, true, 'selecting an image unlocks progress');
assert.equal(getStepView(selected).showSelectedImage, true, 'step 1 shows selected image');
assert.equal(getStepView(selected).showCropPreview, false, 'step 1 hides crop controls');

const startFrame = nextStep(selected);
assert.equal(startFrame.step, 2, 'Next opens Set Start Frame');
assert.equal(startFrame.completed.join(','), '1', 'Select Image becomes complete');
assert.equal(canVisitStep(startFrame, 3), false, 'end frame remains locked before start frame capture');
assert.equal(getStepView(startFrame).showTopCapture, true, 'start frame shows top capture action');
assert.equal(getStepView(startFrame).showBottomNext, false, 'start frame hides bottom next action');

const adjusted = setControl(startFrame, 'horizontal', 3);
assert.equal(adjusted.controls.horizontal, 3, 'control stores selected value');
assert.equal(startFrame.controls.horizontal, 2, 'state updates remain immutable');

const endFrame = nextStep(adjusted);
assert.equal(endFrame.step, 3, 'capture opens Set End Frame');
assert.equal(endFrame.completed.join(','), '1,2', 'start frame becomes complete');
assert.equal(getStepView(endFrame).showTopCapture, true, 'end frame shows top capture action');
assert.equal(getStepView(endFrame).showBottomNext, false, 'end frame hides bottom next action');

const settings = nextStep(endFrame);
assert.equal(settings.step, 4, 'second capture opens Video Settings');
assert.equal(settings.completed.join(','), '1,2,3', 'frame steps become complete');
assert.equal(getStepView(settings).showFrameReview, true, 'video settings shows captured frame review');
assert.equal(getStepView(settings).showCropPreview, false, 'video settings hides crop editor');
assert.equal(getStepView(settings).showTopCapture, false, 'settings hides top capture action');

const returnedToEndFrame = previousStep(settings);
assert.equal(returnedToEndFrame.step, 3, 'Back from settings returns to End Frame');
assert.equal(returnedToEndFrame.completed.join(','), '1,2,3', 'Back preserves captured frame progress');
assert.equal(returnedToEndFrame.controls.horizontal, 3, 'Back preserves camera settings');
assert.equal(previousStep(selected).step, 1, 'Back cannot move before Select Image');

assert.equal(getPrimaryAction(selected).label, 'Continue to Start Frame', 'step 1 explains the next destination');
assert.equal(getPrimaryAction(startFrame).label, 'Capture Start Frame', 'step 2 names the captured frame');
assert.equal(getPrimaryAction(endFrame).label, 'Capture End Frame', 'step 3 names the captured frame');
assert.equal(getPrimaryAction(settings).label, 'Generate Video', 'step 4 names the final action');

const removed = setImageSelected(settings, false);
assert.equal(removed.step, 1, 'removing image returns to Select Image');
assert.equal(removed.completed.join(','), '', 'removing image clears completed steps');

console.log('wizard state tests passed');
