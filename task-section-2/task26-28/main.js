var shipDOM = document.getElementsByClassName('ship'),
    orbitRadius = 125,
    mainHeight = 500,
    mainWidth = 380,
    shipCount = 4;

var controlList = document.getElementById("control-list");

function Ship(id) {
  this.id = id;
  this.event = null;
  this.deg = 0;
  this.isStart = 0;
}

Ship.prototype = {
  width: 60,
  height: 35,
  start: function() {
    this.isStart = 1;
    var that = this;
    this.event = setInterval(function(){
      that.transform(0, that.deg);
      that.deg++;
      if(that.deg === 360) that.deg = 0;
    }, 50);

    var element = document.creatElement("li");
    element.setAttribute('id', 'control' + this.id);
    
  },
  stop: function() {
    this.isStart = 0;
    clearInterval(this.event);
    this.event = null;
  },
  transform: function() {
    var target = shipDOM[this.id],
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
    top = mainHeight / 2 - y - (this.height / 2);
    left = mainWidth / 2 - x - (this.width / 2);
    target.style.top = top + "px";
    target.style.left = left + "px";
    target.style.transform = "rotate(-" + deg + "deg)";
    target.style.webkitTransform = "rotate(-" + deg + "deg)";
  }
}

var shipList = {
  nowQueue: [],
  init: function() {
    for(var i = 0; i < shipCount; i++) {
      this.nowQueue.push(new Ship(i));
    }
  },
  findNoStartShip: function() {
    var resId = -1;
    for(var i = 0; i < this.nowQueue.length; i++) {
      if(resId === -1 && this.nowQueue[i].isStart === 0) {
        resId = this.nowQueue[i].id;
        break;
      }
    }
    return resId;
  }
}

shipList.init();

var createButton = document.getElementById("create");
createButton.addEventListener("click", function(e) {
  var id = shipList.findNoStartShip();
  if(id === -1) {
    var tip = document.getElementById("tip");
    tip.textContent = "飞船已全部启动";
  } else {
    var ship = shipList.nowQueue[id];
    ship.start();
  }
}, false);
