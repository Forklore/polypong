(function() {
  var requestAnimFrame, requestInterval;

  requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
      return window.setTimeout(callback, 1000 / 60);
    };
  };

  requestInterval = function(fn, delay) {
    var handle, loopy, start;
    if (!window.requestAnimationFrame && !window.webkitRequestAnimationFrame && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && !window.oRequestAnimationFrame && !window.msRequestAnimationFrame) {
      return window.setInterval(fn, delay);
    }
    console.log("requestInterval");
    start = new Date().getTime();
    handle = new Object();
    loopy = function() {
      var current, delta;
      current = new Date().getTime();
      delta = current - start;
      if (delta >= delay) {
        fn.call();
        start = new Date().getTime();
      }
      return handle.value = requestAnimFrame(loopy);
    };
    handle.value = requestAnimFrame(loopy);
    return handle;
  };

  window.requestAnimFrame = requestAnimFrame.call(this);

  window.requestInterval = requestInterval.call(this);

}).call(this);
