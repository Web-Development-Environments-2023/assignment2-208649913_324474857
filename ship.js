
var canvas;
var context;
var playerImage;
var playerX;
var playerY;
var bulletX;
var bulletY;
var isShooting = false;
var bulletRadius = 5;
var enemies = [];
var enemyDirection = "right";
var enemySpeed;
var bullets = [];
var enemyImage;
var totalPoints = 0;
var dy = 3
var enemySpeedInterval;
var playerhit;
var enemyhit;
var bgsound;

function setupGame() {
  canvas = document.getElementById("theCanvas");
  context = canvas.getContext("2d");

  var startButton = document.getElementById("startButton");
  startButton.addEventListener("click", newGame, false);

  enemyImage = new Image();
  enemyImage.src = "resources/images/enemy.png";

  playerhit = document.getElementById( "playerhit" );
  enemyhit = document.getElementById( "enemyhit" );
  bgsound = document.getElementById( "bgsound" );
}

function newGame() {
    bgsound.play()
    clearInterval(enemySpeedInterval)
    enemySpeed = 1
    totalPoints = 0;
    dy = 3
    resetElements();
    startTimer();
    enemySpeedInterval = setInterval(increaseEnemySpeed, 5000); 
    
  }
  
  function increaseEnemySpeed() {
    if (enemySpeed == 7)
      return
    enemySpeed += 1; 
    dy += 0.5
  }


function generateEnemies() {
    var enemyWidth = 30;
    var enemyHeight = 30;
    var paddingX = 10;
    var paddingY = 10;
    var startX = canvas.width / 2 - (enemyWidth * 4 + paddingX * 3) / 2;
    var startY = 10;
  
    for (var row = 0; row < 4; row++) {
      var points = 0;
      switch (row) {
        case 0:
          points = 20;
          break;
        case 1:
          points = 15;
          break;
        case 2:
          points = 10;
          break;
        case 3:
          points = 5;
          break;
      }
      for (var col = 0; col < 5; col++) {
        var enemyX = startX + col * (enemyWidth + paddingX);
        var enemyY = startY + row * (enemyHeight + paddingY);
        var enemy = {
          x: enemyX,
          y: enemyY,
          width: enemyWidth,
          height: enemyHeight,
          canShoot: true,
          points: points
        };
        enemies.push(enemy);
        context.drawImage(enemyImage, enemyX, enemyY, enemyWidth, enemyHeight);
      }
    }
    
  }

  function checkWinning(){
    if (totalPoints == 250){
      alert("YOU WON!!!")
      newGame()
    }
  }

  var enemyIsShooting = false;

  function generateEnemyBullets() {
    var minBulletY = canvas.height;
    for (var i = 0; i < bullets.length; i++) {
      var bullet = bullets[i];
      if (bullet.y < minBulletY) {
        minBulletY = bullet.y;
      }
    }
    if (minBulletY >= canvas.height * 3 / 4 && !enemyIsShooting) {
      var shootingEnemies = enemies.filter(function(enemy) { return enemy.canShoot; });
      if (shootingEnemies.length > 0) {
        var randomIndex = Math.floor(Math.random() * shootingEnemies.length);
        var enemy = shootingEnemies[randomIndex];
        enemyIsShooting = true;
        var bullet = {
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height,
          dy: dy
        };
        bullets.push(bullet);
        setTimeout(function() { enemyIsShooting = false; }, 1000); 
      }
    }
  }
  
  
  
  var lives = 3; 

function updateBulletPositions() {
  for (var i = 0; i < bullets.length; i++) {
    var bullet = bullets[i];
    bullet.y += bullet.dy;
    context.beginPath();
    context.fillStyle = "green";
    context.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
    context.fill();
    if (bullet.y > canvas.height) {
      bullets.splice(i, 1);
      i--;
    } else {
      if (
        bullet.x > playerX &&
        bullet.x < playerX + playerImage.width &&
        bullet.y > playerY &&
        bullet.y < playerY + playerImage.height
      ) {
        playerhit.play();
        lives--; 
        if (lives == 0) {
          endGame();
        } else {
          resetPlayerPosition();
        }
      }
    }
  }
}

function endGame() {
  alert("Game Over, points:  "+ totalPoints);
  resetElements();
  clearInterval(enemySpeedInterval)
  newGame();
  lives = 3;
}

function resetPlayerPosition() {
  playerX = canvas.width / 2 - playerImage.width / 2;
  playerY = canvas.height - playerImage.height;
  context.drawImage(playerImage, playerX, playerY);
  bullets = []
}
  
  
function resetElements() {
  playerImage = new Image();
  playerImage.src = "resources/images/airplane.png";
  playerImage.onload = function () {
    playerX = canvas.width / 2 - playerImage.width / 2;
    playerY = canvas.height - playerImage.height;
    context.drawImage(playerImage, playerX, playerY);
  };
  enemies = [];
  generateEnemies();
  bullets = [];
}

function startTimer() {
  window.requestAnimationFrame(updatePosition);
}


function updateEnemyPosition() {
  var maxX = 0;
  var minX = canvas.width;

  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    if (enemyDirection == "right") {
      enemy.x += enemySpeed;
      if (enemy.x + enemy.width >= maxX) {
        maxX = enemy.x + enemy.width;
      }
    } else {
      enemy.x -= enemySpeed;
      if (enemy.x <= minX) {
        minX = enemy.x;
      }
    }
  }

  if (enemyDirection == "right" && maxX >= canvas.width) {
    enemyDirection = "left";
  } else if (enemyDirection == "left" && minX <= 0) {
    enemyDirection = "right";
  }

  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    context.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
  }
}

  
function drawHearts(numHearts) {
  context.fillStyle = "red";
  for (var i = 0; i < numHearts; i++) {
    var x = i * 20 + 10;
    var y = 10;
    context.beginPath();
    context.moveTo(x, y + 5);
    context.bezierCurveTo(x, y, x + 5, y, x + 5, y + 5);
    context.bezierCurveTo(x + 5, y, x + 10, y, x + 10, y + 5);
    context.bezierCurveTo(x + 10, y, x + 10, y + 7, x + 10, y + 7);
    context.bezierCurveTo(x + 10, y + 12, x + 5, y + 15, x, y + 20);
    context.bezierCurveTo(x - 5, y + 15, x - 10, y + 12, x - 10, y + 7);
    context.bezierCurveTo(x - 10, y + 7, x - 10, y, x - 5, y);
    context.bezierCurveTo(x - 5, y, x, y, x, y + 5);
    context.closePath();
    context.fill();
  }
}



  function updatePosition() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawHearts(lives)
    
    document.onkeydown = function (event) {
      switch (event.keyCode) {
        case 37:
          if (playerX - 20 >= 0) {
            playerX -= 20;
          }
          break;
        case 38:
          if (playerY - 20 >= 0 && playerY > canvas.height * 0.6) {
            playerY -= 20;
          }
          break;
        case 39:
          if (playerX + playerImage.width + 20 <= canvas.width) {
            playerX += 20;
          }
          break;
        case 40:
          if (playerY + playerImage.height + 20 <= canvas.height) {
            playerY += 20;
          }
          break;
        case 37 && 38: 
          if (playerX - 20 >= 0 && playerY - 20 >= 0 && playerY > canvas.height * 0.6) {
            playerX -= 20;
            playerY -= 20;
          }
          break;
        case 37 && 40:
          if (playerX - 20 >= 0 && playerY + playerImage.height + 20 <= canvas.height) {
            playerX -= 20;
            playerY += 20;
          }
          break;
        case 39 && 38:
          if (playerX + playerImage.width + 20 <= canvas.width && playerY - 20 >= 0 && playerY > canvas.height * 0.6) {
            playerX += 20;
            playerY -= 20;
          }
          break;
        case 39 && 40:
          if (playerX + playerImage.width + 20 <= canvas.width && playerY + playerImage.height + 20 <= canvas.height * 0.4) {
            playerX += 20;
            playerY += 20;
          }
          break;
        case 32: // when the player will choose the button to shoot change 32 to the proper key - now its hard coded
          if (!isShooting) {
            isShooting = true;
            bulletX = playerX + playerImage.width / 2;
            bulletY = playerY;
            shootBullet();
          }
          break;
      }
    };

    generateEnemyBullets();

    updateBulletPositions();

    drawPoints();

    
    context.drawImage(playerImage, playerX, playerY);
    
    if (isShooting) {
      drawBullet();
      updateBulletPosition();
    }
    checkWinning();
    updateEnemyPosition()
    window.requestAnimationFrame(updatePosition);
  }
  
function shootBullet() {
  context.beginPath();
  context.fillStyle = "#000000";
  context.arc(bulletX, bulletY, bulletRadius, 0, Math.PI * 2);
  context.fill();
}

function updateBulletPosition() {
  bulletY -= 10; 
  
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    if (bulletX >= enemy.x && bulletX <= enemy.x + enemy.width &&
        bulletY >= enemy.y && bulletY <= enemy.y + enemy.height) {
      enemyhit.play();
      enemies.splice(i, 1);
      isShooting = false;
      totalPoints += enemy.points
      break;
    }
  }
  
  if (bulletY < 0) {
    isShooting = false;
  }
}

function drawPoints(){
  var totalPointsText = "Points: " + totalPoints;
  context.fillStyle = "black";
  context.font = "bold 20px Arial";
  var textWidth = context.measureText(totalPointsText).width;
  context.fillText(totalPointsText, canvas.width - textWidth - 10, 30);
}

function drawBullet() {
  context.beginPath();
  context.fillStyle = "#000000";
  context.arc(bulletX, bulletY, bulletRadius, 0, Math.PI * 2);
  context.fill();
}
window.onload = setupGame;


