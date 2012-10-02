(function() {
  var Gamer;

  Gamer = (function() {

    function Gamer(socket) {
      this.socket = socket;
    }

    Gamer.prototype.yourSide = function(side) {
      this.side = side != null ? side : 0;
      return this.socket.emit('joined', this.side);
    };

    Gamer.prototype.heMoved = function(who, where) {
      return this.socket.emit('state', where);
    };

    Gamer.prototype.heQuitted = function(who) {
      console.log('who=' + who);
      return this.socket.emit('quit', who);
    };

    return Gamer;

  })();

  module.exports = Gamer;

}).call(this);
