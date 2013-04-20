requestAnimFrame = () ->
  return window.requestAnimationFrame       || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    (callback, element) ->
      window.setTimeout(callback, 1000 / 60)


loopy = (fn, start, delay, handle) ->
  current = new Date().getTime()
  delta = current - start
			
  if(delta >= delay)
    fn.call()
    start = new Date().getTime()
  handle.value = requestAnimFrame(loopy(fn, start, delay, handle))
  return


requestInterval = (fn, delay) ->
  if ( !window.requestAnimationFrame       && 
	  !window.webkitRequestAnimationFrame && 
	  !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && 
	  !window.oRequestAnimationFrame      && 
	  !window.msRequestAnimationFrame)
	    return window.setInterval(fn, delay)

  start = new Date().getTime()
  handle = new Object()
  console.log "anim"
  handle.value = requestAnimFrame(loopy(fn, start, delay, handle))
  handle


window.requestAnimFrame = (requestAnimFrame).call(this)
window.requestInterval = (requestInterval).call(this)
