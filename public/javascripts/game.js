(function() {
  var Game;

  window.Game = Game = (function() {

    function Game() {
      this.up_pressed = false;
      this.down_pressed = false;
      this.y_positions = [10, 10];
      this.side = 0;
      this.enemy_side = 1;
      this.canvas_width = 780;
      this.canvas_height = 440;
      this.racket_height = 55;
      this.racket_width = 10;
      this.dy = 5;
      this.key_left = 37;
      this.key_up = 38;
      this.key_right = 39;
      this.key_down = 40;
      this.key_space = 32;
      this.players_start_pos = [[10, 80], [760, this.canvas_height - 80 - this.racket_height]];
      this.players_colors = ['rgb(255,255,255)', 'rgb(255,255,255)'];
      this.players_states = [0, 0];
    }

    Game.prototype.drawRacket = function(x, y, color) {
      this.ctx.fillStyle = color;
      return this.ctx.fillRect(x, y, this.racket_width, this.racket_height);
    };

    Game.prototype.drawBall = function(x, y) {
      this.ctx.fillStyle = "rgb(200, 200, 200)";
      return this.ctx.fillRect(x, y, 8, 8);
    };

    Game.prototype.drawBoard = function() {
      this.processInputs();
      this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
      this.ctx.fillStyle = "rgb(200, 200, 200)";
      this.ctx.fillRect(389, 5, 1, 430);
      this.drawRacket(this.players_start_pos[this.side][0], this.y_positions[this.side], this.players_colors[this.side]);
      this.drawRacket(this.players_start_pos[this.enemy_side][0], this.y_positions[this.enemy_side], this.players_colors[this.enemy_side]);
      this.drawBall(100, 100);
      return this.sendState();
    };

    Game.prototype.keyboardDown = function(evt) {
      switch (evt.which) {
        case this.key_down:
          this.down_pressed = true;
          return this.up_pressed = false;
        case this.key_up:
          this.up_pressed = true;
          return this.down_pressed = false;
      }
    };

    Game.prototype.keyboardUp = function(evt) {
      switch (evt.which) {
        case Game.key_down:
          return this.down_pressed = false;
        case Game.key_up:
          return this.up_pressed = false;
      }
    };

    Game.prototype.processInputs = function() {
      if (this.up_pressed) {
        this.players_states[this.side] = -1;
      } else if (this.down_pressed) {
        this.players_states[this.side] = 1;
      } else {
        this.players_states[this.side] = 0;
      }
      return console.log(this.players_states[this.side]);
    };

    Game.prototype.sendState = function() {
      return this.socket.emit('state', {
        side: this.side,
        state: this.players_states[this.side]
      });
    };

    Game.prototype.startGame = function() {
      var canvas, self;
      canvas = document.getElementById('game_board_canvas');
      this.ctx = canvas.getContext('2d');
      this.drawBoard();
      self = this;
      return setInterval((function() {
        return self.drawBoard();
      }), 500);
    };

    Game.prototype.start = function(socket) {
      var self;
      self = this;
      this.socket = socket;
      socket.on('connect', function() {
        return console.log("Socket opened, Master!");
      });
      socket.on('joined', function(side) {
        self.side = side;
        self.enemy_side = side === 0 ? 1 : 0;
        self.y_position = self.players_start_pos[self.side][1];
        $(window).on('keydown', function(e) {
          return self.keyboardDown(e);
        });
        return $(window).on('keyup', function(e) {
          return self.keyboardUp(e);
        });
      });
      socket.on('move', function(data) {
        self.y_positions[self.side] = data.positions[self.side];
        self.y_positions[self.enemy_side] = data.positions[self.enemy_side];
        console.log("" + self.y_positions[self.side] + ", " + self.y_positions[self.enemy_side]);
        self.down_pressed = false;
        self.up_pressed = false;
        self.players_states = [0, 0];
        return self.drawBoard();
      });
      socket.on('busy', function(data) {});
      socket.emit('join');
      return this.startGame();
    };

    return Game;

  })();

}).call(this);
