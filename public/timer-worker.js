// HydroFlow Background Timer Worker
// Dedicated Web Workers run in a separate thread and are NOT throttled by browsers
// like DOM window setInterval when the tab is backgrounded or minimized.

let timerId = null;

self.onmessage = function(e) {
  if (!e.data) return;

  if (e.data.type === 'START') {
    if (timerId) clearInterval(timerId);
    const intervalMs = e.data.intervalMs || 2000;
    timerId = setInterval(function() {
      self.postMessage({ type: 'TICK', timestamp: Date.now() });
    }, intervalMs);
  } else if (e.data.type === 'STOP') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
};
