"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var orbitRadius = 125,
    mainHeight = 500,
    mainWidth = 380,
    shipCount = 4;

var TIME_DEFER = 300,
    PACKET_LOSS = 10;

var shipDOM = document.getElementsByClassName("ship"),
    shipControlList = document.getElementsByClassName("control-list-ele"),
    tip = document.getElementById("tip"),
    shipControl = document.getElementById("control-list"),
    createButton = document.getElementById("create"),
    dcList = document.getElementById("dc-list");

var Adapter = {
  binaryToCommand: function binaryToCommand(data) {
    var commondHash = {
      "0001": "start",
      "0010": "stop",
      "1100": "delete"
    };

    // data为8位或16位
    if (data.length == 8) {
      return {
        id: this.binaryTodecimal(data.slice(0, 4)),
        commond: commondHash[data.slice(4, 8)]
      };
    } else {
      if (data.length === 16) {
        return {
          id: this.binaryTodecimal(data.slice(0, 4)),
          commond: commondHash[data.slice(4, 8)],
          power: this.binaryTodecimal(data.slice(8, 16))
        };
      } else {
        console.log('error data.length');
      }
    }
  },
  binaryTodecimal: function binaryTodecimal(binary) {
    var l = binary.length;
    var res = binary.split('').reduce(function (prev, cur, index) {
      if (parseInt(cur)) {
        return parseInt(prev) + Math.pow(2, l - 1 - index);
      } else {
        return parseInt(prev);
      }
    });
    return res;
  },
  decimalTobinary: function decimalTobinary(number, digit) {
    var res = [];
    for (var i = 0; i < digit; i++) {
      res.push(0);
    }
    while (digit--) {
      if (number % 2) res[digit] = 1;
      number = Math.floor(number / 2);
      if (!number) break;
    }
    return res.join('');
  },
  commondTobinary: function commondTobinary(id, action, power) {
    var commondHash = {
      "start": "0001",
      "stop": "0010",
      "delete": "1100"
    };

    if (power === void 0) {
      return this.decimalTobinary(id, 4) + commondHash[action];
    } else {
      return this.decimalTobinary(id, 4) + commondHash[action] + this.decimalTobinary(power, 8);
    }
  }
};

var DC = {
  receive: function receive(data) {
    var commond = Adapter.binaryToCommand(data);
    this.updateStatus(commond.id, commond.commond, commond.power);
  },
  createStatus: function createStatus(id, powerName, supplyName) {
    var newTr = document.createElement('tr');
    newTr.setAttribute('id', 'dc-list-' + id);
    var newtd_1 = document.createElement('td');
    newtd_1.innerHTML = id + '号';
    newTr.appendChild(newtd_1);
    var newtd_2 = document.createElement('td');
    newtd_2.innerHTML = powerName;
    newTr.appendChild(newtd_2);
    var newtd_3 = document.createElement('td');
    newtd_3.innerHTML = supplyName;
    newTr.appendChild(newtd_3);
    var newtd_4 = document.createElement('td');
    newtd_4.innerHTML = '创建完毕';
    newTr.appendChild(newtd_4);
    var newtd_5 = document.createElement('td');
    newtd_5.innerHTML = '100%';
    newTr.appendChild(newtd_5);
    dcList.appendChild(newTr);
  },
  deleteStatus: function deleteStatus(id) {
    var thisNode = document.getElementById('dc-list-' + id);
    thisNode.parentNode.removeChild(thisNode);
  },
  updateStatus: function updateStatus(id, action, power) {
    var thisNode = document.getElementById('dc-list-' + id);

    var actionHash = {
      "start": "飞行中",
      "stop": "停止中",
      "delete": "即将销毁"
    };
    thisNode.childNodes[3].innerHTML = actionHash[action];
    thisNode.childNodes[4].innerHTML = power + '%';
  }
};

var Ship = function () {
  function Ship(id) {
    _classCallCheck(this, Ship);

    // 飞船编号
    this.id = id;
    // 移动事件句柄
    this.event = null;
    this.isStart = 0;
    this.isCreate = 0;
    // 当前飞行角度
    this.deg = 0;
    // 当前能量百分比
    this.power = 100;
    // 飞行角度速率
    this.degSpeed = 0;
    // 能量消耗速率
    this.powerSpeed = 0;
    // 补给速率
    this.supplySpeed = 0;
    // 广播句柄
    this.sendState = null;
  }

  _createClass(Ship, [{
    key: "create",
    value: function create(degSpeed, powerSpeed, supplySpeed, powerName, supplyName) {
      this.isCreate = 1;
      this.degSpeed = 3 * degSpeed / (Math.PI * orbitRadius);
      this.supplySpeed = supplySpeed;
      this.powerSpeed = powerSpeed;
      shipDOM[this.id].style.display = 'block';
      shipDOM[this.id].textContent = this.id + '号 - ' + this.power + '%';
      shipControlList[this.id].style.display = 'block';
      this.sendDC(powerName, supplyName);
    }
  }, {
    key: "start",
    value: function start() {
      // 启动飞船，更改飞船状态
      if (this.isStart) {
        return;
      } else {
        this.isStart = 1;
      }
      var self = this;
      var count = 0;

      var step = function step() {
        self.deg = self.deg + self.degSpeed;
        // requestAnimationFrame是每秒60帧，每当count为6时，触发能量计算操作
        if (count === 6) {
          self.power = self.power - (self.powerSpeed - self.supplySpeed) / 10;
          if (self.power < 0) self.power = 0;
          if (self.power > 100) self.power = 100;
          shipDOM[self.id].textContent = self.id + '号 - ' + Math.ceil(self.power) + '%';
          if (self.power === 0) {
            self.stop();return;
          }
          count = 0;
        } else {
          count++;
        }
        self.transform();
        if (self.deg >= 359.9) self.deg = 0;
        self.event = window.requestAnimationFrame(step);
      };
      this.event = window.requestAnimationFrame(step);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.isStart = 0;
      window.cancelAnimationFrame(this.event);
      this.event = null;
    }
  }, {
    key: "delete",
    value: function _delete() {
      this.isCreate = 0;
      var target = shipDOM[this.id];
      target.style.display = "none";
      target.style.top = "";
      target.style.left = "";
      target.style.webkitTransform = "rotate(0deg)";
      this.deg = 0;
      this.power = 100;
      shipDOM[this.id].textContent = this.id + '号 - ' + this.power + '%';
      shipControlList[this.id].style.display = "none";
      tip.textContent = "";

      clearInterval(this.sendState);
      this.sendState = null;
      DC.deleteStatus(this.id);
    }
  }, {
    key: "transform",
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
  }, {
    key: "receive",
    value: function receive(data) {
      var sendPackage = Adapter.binaryToCommand(data);

      var id = parseInt(sendPackage.id);

      if (id === this.id) {
        switch (sendPackage.commond) {
          case "start":
            this.start();
            tip.textContent = this.id + "号飞船已启动";
            break;
          case "stop":
            this.stop();
            tip.textContent = this.id + "号飞船已停止";
            break;
          case "delete":
            this.delete();
            tip.textContent = this.id + "号飞船已销毁";
            break;
          default:
            tip.textContent = "无效命令";
        }
      }
    }
  }, {
    key: "sendDC",
    value: function sendDC(powerName, supplyName) {
      DC.createStatus(this.id, powerName, supplyName);
      var self = this;
      this.sendState = setInterval(function () {
        var action = void 0;
        if (self.isStart) {
          action = 'start';
        } else {
          if (self.isCreate) {
            action = 'stop';
          } else {
            action = 'delete';
          }
        }
        var binary = Adapter.commondTobinary(self.id, action, self.power);
        DC.receive(binary);
      }, 1000);
    }
  }]);

  return Ship;
}();

Ship.width = 90;
Ship.height = 40;

var ShipList = function () {
  function ShipList() {
    _classCallCheck(this, ShipList);

    this.nowQueue = [];

    for (var i = 0; i < shipCount; i++) {
      this.nowQueue.push(new Ship(i));
    }
  }

  _createClass(ShipList, [{
    key: "findNoCreateShip",
    value: function findNoCreateShip() {
      var resId = -1;
      for (var i = 0; i < this.nowQueue.length; i++) {
        if (resId === -1 && this.nowQueue[i].isCreate === 0) {
          resId = this.nowQueue[i].id;
          break;
        }
      }
      return resId;
    }
  }, {
    key: "broadcast",
    value: function broadcast(sendPackage) {
      this.nowQueue.forEach(function (item, index) {
        if (item.isCreate) {
          item.receive(sendPackage);
        }
      });
    }
  }]);

  return ShipList;
}();

var shipList = new ShipList();

createButton.addEventListener("click", function (e) {
  var id = shipList.findNoCreateShip();
  if (id === -1) {
    tip.textContent = "飞船已全部被创建";
  } else {
    var select = document.querySelectorAll("input:checked");
    var degSpeed = select[0].getAttribute("data-speed"),
        powerSpeed = select[0].getAttribute("data-power"),
        powerName = select[0].getAttribute("data-name"),
        supplySpeed = select[1].getAttribute("data-supply"),
        supplyName = select[1].getAttribute("data-name");

    shipList.nowQueue[id].create(degSpeed, powerSpeed, supplySpeed, powerName, supplyName);
  }
}, false);

shipControl.addEventListener("click", function (e) {
  var id = e.target.getAttribute("data-id");
  var action = e.target.getAttribute("data-action");

  var sendPackage = Adapter.commondTobinary(id, action);

  var probability = parseInt(Math.random() * 100);
  if (probability > PACKET_LOSS) {
    setTimeout(function () {
      shipList.broadcast(sendPackage);
    }, TIME_DEFER);
    tip.textContent = "命令已下达";
  } else {
    var _tip = document.getElementById("tip");
    _tip.textContent = "命令未到达";
  }
}, false);
