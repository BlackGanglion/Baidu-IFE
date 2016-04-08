const orbitRadius = 125,
      mainHeight = 500,
      mainWidth = 380,
      shipCount = 4;

const TIME_DEFER = 300,
      PACKET_LOSS = 10;

let shipDOM = document.getElementsByClassName("ship"),
    shipControlList = document.getElementsByClassName("control-list-ele"),
    tip = document.getElementById("tip"),
    shipControl = document.getElementById("control-list"),
    createButton = document.getElementById("create");

const Adapter = {
  binaryToCommand: function(data) {
    const commondHash = {
      "0001": "start",
      "0010": "stop",
      "1100": "delete"
    };

    let id = data.slice(0, 4).split('').reduce(function(prev, cur, index){
      if(parseInt(cur)) {
        return parseInt(prev) + Math.pow(2, 3 - index);
      } else {
        return parseInt(prev);
      }
    });
    let commond = data.slice(4);

    return {
      id: id,
      commond: commondHash[commond]
    }
  },
  commondTobinary: function(id, action) {
    const commondHash = {
      "start": "0001",
      "stop": "0010",
      "delete": "1100"
    };

    let res = new Array('0', '0', '0', '0');
    let count = 4;

    while(count--) {
      if(id % 2) res[count] = 1;
      id = Math.floor(id / 2);
      if(!id) break;
    }

    return res.join('') + commondHash[action];
  }
};

const DC = {

};

class Ship {
  static width = 90;
  static height = 40;

  constructor(id) {
    // 飞船编号
    this.id = id;
    // 移动事件句柄
    this.event = null;
    this.isStart = 0;
    this.isCreate = 0;
    // 当前飞行角度
    this.deg = 0;
    // 当前能量值
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

  create(degSpeed, powerSpeed, supplySpeed) {
    this.isCreate = 1;
    this.degSpeed = (3 * degSpeed) / (Math.PI * orbitRadius);
    this.supplySpeed = supplySpeed;
    this.powerSpeed = powerSpeed
    shipDOM[this.id].style.display = 'block';
    shipDOM[this.id].textContent = this.id + '号 - ' + this.power + '%';
    shipControlList[this.id].style.display = 'block';
    this.sendDC();
  }

  start() {
    // 启动飞船，更改飞船状态
    if(this.isStart){
      return;
    } else {
      this.isStart = 1;
    }
    let self = this;
    let count = 0;

    let step = function(){
      self.deg = self.deg + self.degSpeed;
      // requestAnimationFrame是每秒60帧，每当count为6时，触发能量计算操作
      if(count === 6) {
        self.power = self.power - (self.powerSpeed - self.supplySpeed) / 10;
        if(self.power < 0) self.power = 0;
        if(self.power > 100) self.power = 100;
        shipDOM[self.id].textContent = self.id + '号 - ' + Math.ceil(self.power) + '%';
        if(self.power === 0) { self.stop(); return; }
        count = 0;
      } else {
        count++;
      }
      self.transform();
      if(self.deg >= 359.9) self.deg = 0;
      self.event = window.requestAnimationFrame(step);
    }
    this.event = window.requestAnimationFrame(step);
  }

  stop() {
    this.isStart = 0;
    window.cancelAnimationFrame(this.event);
    this.event = null;
  }

  delete() {
    this.isCreate = 0;
    let target = shipDOM[this.id];
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
  }

  transform() {
    let target = shipDOM[this.id],
        deg = this.deg,
        x = 0, y = 0,
        rad = 0,
        top = 0, left = 0;
    if(0 <= deg && deg < 90) {
      rad = 2 * Math.PI / 360 * deg;
      x = orbitRadius * Math.sin(rad);
      y = Math.sqrt(orbitRadius * orbitRadius - x * x);
    } else if(90 <= deg && deg < 180) {
      rad = 2 * Math.PI / 360 * (deg - 90);
      y = -(orbitRadius * Math.sin(rad));
      x = Math.sqrt(orbitRadius * orbitRadius - y * y);
    } else if(180 <= deg && deg < 270) {
      rad = 2 * Math.PI / 360 * (deg - 180);
      x = -(orbitRadius * Math.sin(rad));
      y = -(Math.sqrt(orbitRadius * orbitRadius - x * x));
    } else {
      rad = 2 * Math.PI / 360 * (deg - 270);
      y = orbitRadius * Math.sin(rad);
      x = -(Math.sqrt(orbitRadius * orbitRadius - y * y));
    }
    top = mainHeight / 2 - y - (Ship.height / 2);
    left = mainWidth / 2 - x - (Ship.width / 2);
    target.style.top = top + "px";
    target.style.left = left + "px";
    target.style.transform = "rotate(-" + deg + "deg)";
    target.style.webkitTransform = "rotate(-" + deg + "deg)";
  }

  receive(data) {
    const sendPackage = Adapter.binaryToCommand(data);

    let id = parseInt(sendPackage.id);

    if(id === this.id) {
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

  sendDC() {
    this.sendState = setInterval(function(){}, 1000);
  }
}

class ShipList {
  nowQueue = []

  constructor() {
    for(let i = 0; i < shipCount; i++) {
      this.nowQueue.push(new Ship(i));
    }
  }

  findNoCreateShip() {
    let resId = -1;
    for(let i = 0; i < this.nowQueue.length; i++) {
      if(resId === -1 && this.nowQueue[i].isCreate === 0) {
        resId = this.nowQueue[i].id;
        break;
      }
    }
    return resId;
  }

  broadcast(sendPackage) {
    this.nowQueue.forEach(function(item, index) {
      if(item.isCreate) {
        item.receive(sendPackage);
      }
    });
  }
}

let shipList = new ShipList();

createButton.addEventListener("click", function(e) {
  let id = shipList.findNoCreateShip();
  if(id === -1) {
    tip.textContent = "飞船已全部被创建";
  } else {
    let select = document.querySelectorAll("input:checked");
    let degSpeed = select[0].getAttribute("data-speed"),
        powerSpeed = select[0].getAttribute("data-power"),
        supplySpeed = select[1].getAttribute("data-supply");

    shipList.nowQueue[id].create(degSpeed, powerSpeed, supplySpeed);
  }
}, false);

shipControl.addEventListener("click", function(e) {
  let id = e.target.getAttribute("data-id");
  let action = e.target.getAttribute("data-action");

  const sendPackage = Adapter.commondTobinary(id, action);

  let probability = parseInt(Math.random() * 100);
  if(probability > PACKET_LOSS) {
    setTimeout(function(){
      shipList.broadcast(sendPackage);
    }, TIME_DEFER);
    tip.textContent = "命令已下达";
  } else {
    let tip = document.getElementById("tip");
    tip.textContent = "命令未到达";
  }

}, false);
