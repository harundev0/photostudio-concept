document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  let state = WizardState.setImageSelected(WizardState.createWizardState(), true);
  const viewport = document.querySelector('#viewport');
  const mainImage = document.querySelector('#mainImage');
  const depthLayer = document.querySelector('.depth-frames');
  const cameraPanel = document.querySelector('#cameraPanel');
  const settingsPanel = document.querySelector('#settingsPanel');
  const panelTitle = document.querySelector('#panelTitle');
  const helpButton = document.querySelector('#helpButton');
  const applyButton = document.querySelector('#applyButton');
  const nextButton = document.querySelector('#nextButton');
  const generateButton = document.querySelector('#generateButton');
  const frameReview = document.querySelector('#frameReview');
  const removeImageButton = document.querySelector('#removeImageButton');
  const statusText = document.querySelector('#statusText');
  const cropBox = document.querySelector('#cropBox');
  const depthFrames = [...document.querySelectorAll('.depth-frames i')];
  const moveHandle = cropBox.querySelector('.move');
  let cropStates = { 2: CropState.createCropState(), 3: CropState.createCropState() };
  let drag = null;

  function currentCrop() {
    return cropStates[state.step] || cropStates[2];
  }

  function renderCrop() {
    const crop = currentCrop();
    cropBox.style.left = `${crop.x}%`;
    cropBox.style.top = `${crop.y}%`;
    cropBox.style.width = `${crop.width}%`;
    cropBox.style.height = `${crop.height}%`;
    CropState.createDepthFrames(crop, depthFrames.length).forEach((frame, index) => {
      const element = depthFrames[index];
      element.style.left = `${frame.x}%`;
      element.style.top = `${frame.y}%`;
      element.style.width = `${frame.width}%`;
      element.style.height = `${frame.height}%`;
    });
  }

  function render() {
    document.querySelectorAll('#steps button').forEach((button) => {
      const step = Number(button.dataset.step);
      const available = WizardState.canVisitStep(state, step);
      button.classList.toggle('active', step === state.step);
      button.classList.toggle('done', state.completed.includes(step));
      button.classList.toggle('locked', !available);
      button.disabled = !available;
      button.setAttribute('aria-current', step === state.step ? 'step' : 'false');
      const marker = button.querySelector('.step-marker');
      marker.textContent = state.completed.includes(step) ? '✓' : `${step}`;
    });

    const settings = state.step === 4;
    const select = state.step === 1;
    const view = WizardState.getStepView(state);
    viewport.classList.toggle('select-mode', select && !state.imageSelected);
    viewport.classList.toggle('image-selected-mode', view.showSelectedImage);
    viewport.hidden = !view.showCropPreview && !select;
    cropBox.hidden = !view.showCropPreview;
    depthLayer.hidden = !view.showCropPreview;
    frameReview.hidden = !view.showFrameReview;
    cameraPanel.hidden = settings || select;
    settingsPanel.hidden = !settings;
    panelTitle.textContent = settings ? 'Settings' : select ? 'File Manager' : 'Camera Controls';
    helpButton.hidden = !settings;
    applyButton.hidden = settings || select;
    nextButton.hidden = settings;
    generateButton.hidden = !settings;
    removeImageButton.hidden = !view.showSelectedImage;
    nextButton.disabled = select && !state.imageSelected;
    nextButton.textContent = select ? 'Select & Next Step' : 'Capture & Next Step';
    statusText.textContent = select
      ? state.imageSelected ? 'Image selected' : 'Select an image'
      : settings ? 'Ready to generate' : state.step === 2 ? 'Set start frame' : 'Set end frame';
    if (!settings && !select) renderCrop();
  }

  document.querySelectorAll('#steps button').forEach((button) => {
    button.addEventListener('click', () => {
      const step = Number(button.dataset.step);
      if (!WizardState.canVisitStep(state, step)) return;
      state = step === state.step + 1
        ? WizardState.nextStep(state)
        : { ...state, step };
      render();
    });
  });

  nextButton.addEventListener('click', () => {
    state = WizardState.nextStep(state);
    if (state.step === 3) {
      state = WizardState.setControl(state, 'horizontal', 3);
      state = WizardState.setControl(state, 'zoom', 1.5);
      state = WizardState.setControl(state, 'pan', 0.1);
    }
    syncRanges();
    render();
  });

  document.querySelectorAll('.range-row input').forEach((input) => {
    input.addEventListener('input', () => {
      const row = input.closest('.range-row');
      state = WizardState.setControl(state, row.dataset.name, Number(input.value));
      formatRange(row);
    });
  });

  function formatRange(row) {
    const input = row.querySelector('input');
    const suffix = row.dataset.name === 'zoom' ? 'x' : '';
    row.querySelector('output').textContent = `${Number(input.value).toFixed(1)}${suffix}`;
  }

  function syncRanges() {
    document.querySelectorAll('.range-row').forEach((row) => {
      row.querySelector('input').value = state.controls[row.dataset.name];
      formatRange(row);
    });
  }

  document.querySelectorAll('.asset').forEach((asset) => {
    asset.addEventListener('click', () => {
      if (!asset.dataset.imageSrc) return;
      document.querySelectorAll('.asset').forEach((item) => item.classList.remove('selected'));
      asset.classList.add('selected');
      mainImage.src = asset.dataset.imageSrc;
      state = WizardState.setImageSelected(state, true);
      render();
    });
  });

  removeImageButton.addEventListener('click', () => {
    document.querySelectorAll('.asset').forEach((item) => item.classList.remove('selected'));
    state = WizardState.setImageSelected(state, false);
    render();
  });

  document.querySelectorAll('.engine button').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.engine button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
    });
  });

  document.querySelector('#resetStartFrame').addEventListener('click', () => {
    state = { ...state, step: 2 };
    render();
  });

  document.querySelectorAll('.remove-frame').forEach((button) => {
    button.addEventListener('click', () => {
      state = { ...state, step: button.dataset.frame === 'start' ? 2 : 3 };
      render();
    });
  });

  function startDrag(event, edge) {
    if (![2, 3].includes(state.step) || event.button !== 0) return;
    event.preventDefault();
    cropBox.setPointerCapture(event.pointerId);
    drag = {
      edge,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      crop: { ...currentCrop() },
    };
  }

  moveHandle.addEventListener('pointerdown', (event) => startDrag(event, 'move'));
  cropBox.querySelectorAll('.resize-handle').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => startDrag(event, handle.dataset.edge));
  });

  cropBox.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const bounds = viewport.getBoundingClientRect();
    const dx = ((event.clientX - drag.x) / bounds.width) * 100;
    const dy = ((event.clientY - drag.y) / bounds.height) * 100;
    cropStates[state.step] = drag.edge === 'move'
      ? CropState.moveCrop(drag.crop, dx, dy)
      : CropState.resizeCrop(drag.crop, drag.edge, dx, dy);
    renderCrop();
  });

  function stopDrag(event) {
    if (drag?.pointerId === event.pointerId) drag = null;
  }

  cropBox.addEventListener('pointerup', stopDrag);
  cropBox.addEventListener('pointercancel', stopDrag);

  function nudge(event, edge) {
    const delta = event.shiftKey ? 2 : 0.5;
    const dx = event.key === 'ArrowLeft' ? -delta : event.key === 'ArrowRight' ? delta : 0;
    const dy = event.key === 'ArrowUp' ? -delta : event.key === 'ArrowDown' ? delta : 0;
    if (!dx && !dy) return;
    event.preventDefault();
    cropStates[state.step] = edge === 'move'
      ? CropState.moveCrop(currentCrop(), dx, dy)
      : CropState.resizeCrop(currentCrop(), edge, dx, dy);
    renderCrop();
  }

  moveHandle.addEventListener('keydown', (event) => nudge(event, 'move'));
  cropBox.querySelectorAll('.resize-handle').forEach((handle) => {
    handle.addEventListener('keydown', (event) => nudge(event, handle.dataset.edge));
  });

  generateButton.addEventListener('click', () => {
    generateButton.disabled = true;
    generateButton.textContent = 'Generating Video...';
    setTimeout(() => {
      generateButton.disabled = false;
      generateButton.innerHTML = '<i data-lucide="film"></i>Generate Video';
      lucide.createIcons();
    }, 900);
  });

  render();
});
