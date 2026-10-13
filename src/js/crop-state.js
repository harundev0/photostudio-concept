(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CropState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const MIN_WIDTH = 18;
  const MIN_HEIGHT = 24;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function createCropState() {
    return { x: 26, y: 20, width: 48, height: 65 };
  }

  function moveCrop(crop, dx, dy) {
    return {
      ...crop,
      x: clamp(crop.x + dx, 0, 100 - crop.width),
      y: clamp(crop.y + dy, 0, 100 - crop.height),
    };
  }

  function resizeCrop(crop, edge, dx, dy) {
    const next = { ...crop };

    if (edge === 'left') {
      const right = crop.x + crop.width;
      next.x = clamp(crop.x + dx, 0, right - MIN_WIDTH);
      next.width = right - next.x;
    }
    if (edge === 'right') {
      next.width = clamp(crop.width + dx, MIN_WIDTH, 100 - crop.x);
    }
    if (edge === 'top') {
      const bottom = crop.y + crop.height;
      next.y = clamp(crop.y + dy, 0, bottom - MIN_HEIGHT);
      next.height = bottom - next.y;
    }
    if (edge === 'bottom') {
      next.height = clamp(crop.height + dy, MIN_HEIGHT, 100 - crop.y);
    }

    return next;
  }

  function createDepthFrames(crop, count) {
    const outer = { x: 2.5, y: 3, width: 95, height: 94 };
    return Array.from({ length: count }, (_, index) => {
      const progress = (index + 1) / (count + 1);
      const interpolate = (from, to) => Math.round((from + (to - from) * progress) * 100) / 100;
      return {
        x: interpolate(outer.x, crop.x),
        y: interpolate(outer.y, crop.y),
        width: interpolate(outer.width, crop.width),
        height: interpolate(outer.height, crop.height),
      };
    });
  }

  return { createCropState, moveCrop, resizeCrop, createDepthFrames };
});
