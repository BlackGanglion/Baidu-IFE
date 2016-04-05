'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var orbitRadius = 125,
    mainHeight = 500,
    mainWidth = 380,
    shipCount = 4;

var shipDOM = document.getElementsByClassName('ship'),
    controlList = document.getElementById('control-list');

var Ship = function () {
  function Ship(id) {
    _classCallCheck(this, Ship);

    this.id = id;
    this.event = null;
    this.deg = 0;
    this.isStart = 0;
  }

  _createClass(Ship, [{
    key: 'start',
    value: function start() {
      this.isStart = 1;
      var self = this;
      this.event = setInterval(function () {
        self.transform();
        self.deg++;
        if (self.deg === 360) self.deg = 0;
      }, 50);

      //let element = document.creatElement('li');
      //element.setAttribute('id', 'control' + this.id);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.isStart = 0;
      clearInterval(this.event);
      this.event = null;
    }
  }, {
    key: 'transform',
    value: function transform() {
      var target = shipDOM[this.id],
          deg = this.deg,
          x = 0,
          y = 0,
          rad = 0,
          top = 0,
          left = 0;
      if (0 <= deg && deg < 90) {
        rad = 2 * Math.PI / 360 * deg;
        x = orbitRadius * Math.sin(rad);
        y = Math.sqrt(orbitRadius * orbitRadius - x * x);
      } else if (90 <= deg && deg < 180) {
        rad = 2 * Math.PI / 360 * (deg - 90);
        y = -(orbitRadius * Math.sin(rad));
        x = Math.sqrt(orbitRadius * orbitRadius - y * y);
      } else if (180 <= deg && deg < 270) {
        rad = 2 * Math.PI / 360 * (deg - 180);
        x = -(orbitRadius * Math.sin(rad));
        y = -Math.sqrt(orbitRadius * orbitRadius - x * x);
      } else {
        rad = 2 * Math.PI / 360 * (deg - 270);
        y = orbitRadius * Math.sin(rad);
        x = -Math.sqrt(orbitRadius * orbitRadius - y * y);
      }
      top = mainHeight / 2 - y - Ship.height / 2;
      left = mainWidth / 2 - x - Ship.width / 2;
      target.style.top = top + "px";
      target.style.left = left + "px";
      target.style.transform = "rotate(-" + deg + "deg)";
      target.style.webkitTransform = "rotate(-" + deg + "deg)";
    }
  }]);

  return Ship;
}();

Ship.width = 60;
Ship.height = 35;

var ShipList = function () {
  function ShipList() {
    _classCallCheck(this, ShipList);

    this.nowQueue = [];

    for (var i = 0; i < shipCount; i++) {
      this.nowQueue.push(new Ship(i));
    }
  }

  _createClass(ShipList, [{
    key: 'findNoStartShip',
    value: function findNoStartShip() {
      var resId = -1;
      for (var i = 0; i < this.nowQueue.length; i++) {
        if (resId === -1 && this.nowQueue[i].isStart === 0) {
          resId = this.nowQueue[i].id;
          break;
        }
      }
      return resId;
    }
  }]);

  return ShipList;
}();

var shipList = new ShipList();

var createButton = document.getElementById("create");
createButton.addEventListener("click", function (e) {
  var id = shipList.findNoStartShip();
  if (id === -1) {
    var tip = document.getElementById("tip");
    tip.textContent = "飞船已全部启动";
  } else {
    var ship = shipList.nowQueue[id];
    ship.start();
  }
}, false);
