"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lanceGg = require("lance-gg");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var PADDING = 20;
var WIDTH = 400;
var HEIGHT = 400;
var PADDLE_WIDTH = 15;
var PADDLE_HEIGHT = 75;
var ACCELERATION = 1.2; // A paddle has a health attribute

var Paddle =
/*#__PURE__*/
function (_DynamicObject) {
  _inherits(Paddle, _DynamicObject);

  function Paddle(gameEngine, options, props) {
    var _this;

    _classCallCheck(this, Paddle);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Paddle).call(this, gameEngine, options, props));
    _this.health = 15;
    return _this;
  }

  _createClass(Paddle, [{
    key: "syncTo",
    value: function syncTo(other) {
      _get(_getPrototypeOf(Paddle.prototype), "syncTo", this).call(this, other);

      this.health = other.health;
    }
  }], [{
    key: "netScheme",
    get: function get() {
      return Object.assign({
        health: {
          type: _lanceGg.BaseTypes.TYPES.INT16
        }
      }, _get(_getPrototypeOf(Paddle), "netScheme", this));
    }
  }]);

  return Paddle;
}(_lanceGg.DynamicObject); // a game object to represent the ball


var Ball =
/*#__PURE__*/
function (_DynamicObject2) {
  _inherits(Ball, _DynamicObject2);

  function Ball(gameEngine, options, props) {
    _classCallCheck(this, Ball);

    return _possibleConstructorReturn(this, _getPrototypeOf(Ball).call(this, gameEngine, options, props));
  } // avoid gradual synchronization of velocity


  _createClass(Ball, [{
    key: "syncTo",
    value: function syncTo(other) {
      _get(_getPrototypeOf(Ball.prototype), "syncTo", this).call(this, other);
    }
  }, {
    key: "bending",
    get: function get() {
      return {
        velocity: {
          percent: 0.0
        }
      };
    }
  }]);

  return Ball;
}(_lanceGg.DynamicObject);

var Game =
/*#__PURE__*/
function (_GameEngine) {
  _inherits(Game, _GameEngine);

  function Game(options) {
    var _this2;

    _classCallCheck(this, Game);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Game).call(this, options));
    _this2.physicsEngine = new _lanceGg.SimplePhysicsEngine({
      gameEngine: _assertThisInitialized(_this2)
    }); // common code

    _this2.on('postStep', _this2.gameLogic.bind(_assertThisInitialized(_this2)));

    _this2.timeout = null; // server-only code

    _this2.on('server__init', _this2.serverSideInit.bind(_assertThisInitialized(_this2)));

    _this2.on('server__playerJoined', _this2.serverSidePlayerJoined.bind(_assertThisInitialized(_this2)));

    _this2.on('server__playerDisconnected', _this2.serverSidePlayerDisconnected.bind(_assertThisInitialized(_this2))); // client-only code


    _this2.on('client__rendererReady', _this2.clientSideInit.bind(_assertThisInitialized(_this2)));

    _this2.on('client__draw', _this2.clientSideDraw.bind(_assertThisInitialized(_this2)));

    return _this2;
  }

  _createClass(Game, [{
    key: "registerClasses",
    value: function registerClasses(serializer) {
      serializer.registerClass(Paddle);
      serializer.registerClass(Ball);
    }
  }, {
    key: "resetTimeout",
    value: function resetTimeout(ball) {
      var _this3 = this;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(function () {
        _this3.resetBall(ball);
      }, 10000);
    }
  }, {
    key: "resetBall",
    value: function resetBall(ball) {
      console.log('resetting ball');
      this.resetTimeout(ball);
      ball.velocity.x = 0;
      ball.velocity.y = 0;
      ball.position.x = WIDTH / 2;
      ball.position.y = Math.random() * HEIGHT;
      setTimeout(function () {
        var r = ball.position.y % 4;

        if (r === 0) {
          ball.velocity.x = 3;
          ball.velocity.y = 3;
        } else if (r === 1) {
          ball.velocity.x = 3;
          ball.velocity.y = -3;
        } else if (r === 2) {
          ball.velocity.x = -3;
          ball.velocity.y = 3;
        } else {
          ball.velocity.x = -3;
          ball.velocity.y = -3;
        }
      }, 5000);
    }
  }, {
    key: "gameLogic",
    value: function gameLogic() {
      var paddles = this.world.queryObjects({
        instanceType: Paddle
      });
      var ball = this.world.queryObject({
        instanceType: Ball
      });
      if (!ball || paddles.length !== 2) return; // CHECK LEFT EDGE:

      if (ball.position.x <= PADDING + PADDLE_WIDTH && ball.position.y >= paddles[0].y && ball.position.y <= paddles[0].position.y + PADDLE_HEIGHT && ball.velocity.x < 0) {
        // ball moving left hit player 1 paddle
        ball.velocity.x *= -1 * ACCELERATION;
        ball.position.x = PADDING + PADDLE_WIDTH + 1;
        this.resetTimeout(ball);
      } else if (ball.position.x <= 0) {
        // ball hit left wall
        ball.velocity.x *= -1 * ACCELERATION;
        ball.position.x = 0;
        paddles[0].health--;
        this.resetBall(ball);
      } // CHECK RIGHT EDGE:


      if (ball.position.x >= WIDTH - PADDING - PADDLE_WIDTH && ball.position.y >= paddles[1].position.y && ball.position.y <= paddles[1].position.y + PADDLE_HEIGHT && ball.velocity.x > 0) {
        // ball moving right hits player 2 paddle
        ball.velocity.x *= -1;
        ball.position.x = WIDTH - PADDING - PADDLE_WIDTH - 1;
        this.resetTimeout(ball);
      } else if (ball.position.x >= WIDTH) {
        // ball hit right wall
        ball.velocity.x *= -1;
        ball.position.x = WIDTH - 1;
        paddles[1].health--;
        this.resetBall(ball);
      } // ball hits top or bottom edge


      if (ball.position.y <= 0) {
        ball.position.y = 1;
        ball.velocity.y *= -1;
      } else if (ball.position.y >= HEIGHT) {
        ball.position.y = HEIGHT - 1;
        ball.velocity.y *= -1;
      }
    }
  }, {
    key: "processInput",
    value: function processInput(inputData, playerId) {
      _get(_getPrototypeOf(Game.prototype), "processInput", this).call(this, inputData, playerId); // get the player paddle tied to the player socket


      var playerPaddle = this.world.queryObject({
        playerId: playerId
      });

      if (playerPaddle) {
        if (inputData.input === 'up' && playerPaddle.position.y > 0) {
          playerPaddle.position.y -= 10;
        } else if (inputData.input === 'down' && playerPaddle.position.y < HEIGHT - 75) {
          playerPaddle.position.y += 10;
        }
      }
    } //
    // SERVER ONLY CODE
    //

  }, {
    key: "serverSideInit",
    value: function serverSideInit() {
      // create the paddles and the ball
      this.addObjectToWorld(new Paddle(this, null, {
        playerID: 0,
        position: new _lanceGg.TwoVector(PADDING, 0)
      }));
      this.addObjectToWorld(new Paddle(this, null, {
        playerID: 0,
        position: new _lanceGg.TwoVector(WIDTH - PADDING, 0)
      }));
      this.addObjectToWorld(new Ball(this, null, {
        position: new _lanceGg.TwoVector(WIDTH / 2, HEIGHT / 2),
        velocity: new _lanceGg.TwoVector(3, 3)
      }));
    } // attach newly connected player to next available paddle

  }, {
    key: "serverSidePlayerJoined",
    value: function serverSidePlayerJoined(ev) {
      var paddles = this.world.queryObjects({
        instanceType: Paddle
      });

      if (paddles[0].playerId === 0) {
        paddles[0].playerId = ev.playerId;
      } else if (paddles[1].playerId === 0) {
        paddles[1].playerId = ev.playerId;
      }
    }
  }, {
    key: "serverSidePlayerDisconnected",
    value: function serverSidePlayerDisconnected(ev) {
      var paddles = this.world.queryObjects({
        instanceType: Paddle
      });

      if (paddles[0].playerId === ev.playerId) {
        paddles[0].playerId = 0;
      } else if (paddles[1].playerId === ev.playerId) {
        paddles[1].playerId = 0;
      }
    } //
    // CLIENT ONLY CODE
    //

  }, {
    key: "clientSideInit",
    value: function clientSideInit() {
      this.controls = new _lanceGg.KeyboardControls(this.renderer.clientEngine);
      this.controls.bindKey('up', 'up', {
        repeat: true
      });
      this.controls.bindKey('down', 'down', {
        repeat: true
      });
    }
  }, {
    key: "clientSideDraw",
    value: function clientSideDraw() {
      function updateEl(el, obj) {
        var health = obj.health > 0 ? obj.health : 15;
        el.style.top = obj.position.y + 10 + 'px';
        el.style.left = obj.position.x + 'px';
      }

      var paddles = this.world.queryObjects({
        instanceType: Paddle
      });
      var ball = this.world.queryObject({
        instanceType: Ball
      });
      if (!ball || paddles.length !== 2) return;
      updateEl(document.querySelector('.ball'), ball);
      updateEl(document.querySelector('.paddle1'), paddles[0]);
      updateEl(document.querySelector('.paddle2'), paddles[1]);
    }
  }]);

  return Game;
}(_lanceGg.GameEngine);

exports.default = Game;
//# sourceMappingURL=Game.js.map