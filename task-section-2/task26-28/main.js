var ship = document.getElementsByClassName('ship'),
    orbitRadius = 125,
    mainHeight = 500,
    mainWidth = 380
    shipWidth = 60,
    shipHeight = 35;

var degCount = {
  0: 0
}

function transform(number, deg) {
  var target = ship[number],
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
  top = mainHeight / 2 - y - (shipHeight / 2);
  left = mainWidth / 2 - x - (shipWidth / 2);
  target.style.top = top + "px";
  target.style.left = left + "px";
  target.style.transform = "rotate(-" + deg + "deg)";
  target.style.webkitTransform = "rotate(-" + deg + "deg)";
}

setInterval(function(){
  transform(0, degCount[0]);
  degCount[0]++;
  if(degCount[0] === 360) degCount[0] = 0;
}, 50);
