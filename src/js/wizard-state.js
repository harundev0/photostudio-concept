(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WizardState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const defaults = {
    horizontal: 2,
    vertical: 0,
    zoom: 1,
    pan: 0,
    tilt: 0,
    rotate: 0,
  };

  function createWizardState() {
    return { step: 1, completed: [], imageSelected: false, controls: { ...defaults } };
  }

  function nextStep(state) {
    if (state.step === 1 && !state.imageSelected) return state;
    const step = Math.min(4, state.step + 1);
    const completed = state.completed.includes(state.step)
      ? state.completed
      : [...state.completed, state.step];
    return { ...state, step, completed };
  }

  function setControl(state, name, value) {
    return { ...state, controls: { ...state.controls, [name]: value } };
  }

  function setImageSelected(state, imageSelected) {
    if (imageSelected) return { ...state, imageSelected: true };
    return { ...state, step: 1, completed: [], imageSelected: false };
  }

  function canVisitStep(state, step) {
    if (step === 1) return true;
    if (!state.imageSelected) return false;
    return step <= Math.max(2, ...state.completed.map((completed) => completed + 1));
  }

  function getStepView(state) {
    const framing = state.step === 2 || state.step === 3;
    return {
      showFrameReview: state.step === 4,
      showCropPreview: framing,
      showSelectedImage: state.step === 1 && state.imageSelected,
      showTopCapture: framing,
      showBottomNext: state.step === 1,
    };
  }

  return {
    createWizardState,
    nextStep,
    setControl,
    setImageSelected,
    canVisitStep,
    getStepView,
  };
});
