(function() {
  var loopy, requestAnimFrame, requestInterval;

  (requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();

  loopy = function(fn, start, delay, handle) {
    var current, delta;
    current = new Date().getTime();
    delta = current - start;
    if (delta >= delay) {
      fn.call();
      start = new Date().getTime();
    }
    handle.value = requestAnimFrame(loopy(fn, start, delay, handle));
  };

  requestInterval = function(fn, delay) {
    var handle, start;
    if (!window.requestAnimationFrame && !window.webkitRequestAnimationFrame && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && !window.oRequestAnimationFrame && !window.msRequestAnimationFrame) {
      return window.setInterval(fn, delay);
    }
    start = new Date().getTime();
    handle = new Object();
    console.log("anim");
    handle.value = requestAnimFrame(loopy(fn, start, delay, handle));
    return handle;
  };

  window.requestAnimFrame = requestAnimFrame.call(this);

  window.requestInterval = requestInterval.call(this);

}).call(this);
