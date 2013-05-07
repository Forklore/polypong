(function() {
  var Game, PongServer;

  Game = require('./game');

  module.exports = PongServer = (function() {

    function PongServer() {
      this.game = new Game;
    }

    return PongServer;

  })();

}).call(this);
