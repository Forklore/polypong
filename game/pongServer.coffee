# classes
Game = require './game'

module.exports = class PongServer
  
  constructor: -> 
    @game = new Game