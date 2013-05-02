requestAnimFrame = (() ->
  return window.requestAnimationFrame  or
    window.webkitRequestAnimationFrame or
    window.mozRequestAnimationFrame    or
    window.oRequestAnimationFrame      or
    window.msRequestAnimationFrame     or
    (callback, element) ->
      window.setTimeout(callback, 1000 / 60))()

requestInterval = (fn, delay) ->
  if!window.requestAnimationFrame and 
    !window.webkitRequestAnimationFrame and 
    !(window.mozRequestAnimationFrame and window.mozCancelRequestAnimationFrame) and
    !window.oRequestAnimationFrame and
    !window.msRequestAnimationFrame
      return window.setInterval(fn, delay)

  start = new Date().getTime()
  handle = new Object()

  loopy = () ->
    current = new Date().getTime()
    delta = current - start

    if delta >= delay
      start = new Date().getTime()
      fn.call()

    handle.value = requestAnimFrame loopy

  handle.value = requestAnimFrame loopy
  handle

clearRequestInterval = (handle) ->
  if window.cancelAnimationFrame
    window.cancelAnimationFrame handle.value
  else if window.webkitCancelAnimationFrame
    window.webkitCancelAnimationFrame handle.value
  else if window.webkitCancelRequestAnimationFrame
    window.webkitCancelRequestAnimationFrame handle.value # Support for legacy API
  else if window.mozCancelRequestAnimationFrame
    window.mozCancelRequestAnimationFrame handle.value
  else if window.oCancelRequestAnimationFrame
    window.oCancelRequestAnimationFrame handle.value
  else if window.msCancelRequestAnimationFrame
    window.msCancelRequestAnimationFrame handle.value
  else clearInterval handle


window.requestAnimFrame = requestAnimFrame
window.requestInterval = requestInterval
window.clearRequestInterval = clearRequestInterval
