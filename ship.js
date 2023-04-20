
let canvas;
let context;
let playerImage;
let playerX;
let playerY;
let bulletX;
let bulletY;
let isShooting = false;
let bulletRadius = 5;
let enemies = [];
let enemyDirection = "right";
let bullets = [];
let enemyImage;
let enemySpeedInterval;
let playerhit;
let enemyhit;
let bgsound;
let gameTimer;
let timeLeft;
let gameTimerInterval;
let gameOver;

let gameRecords = [];
let gameId = 1;


// Game parameters
let enemySpeed = 1;
let totalPoints = 0;
let dy = 3;
let lives = 3; 


// Configurations parameters
let spaceShipOption = 2;
let colorInput = "#FF0000"; // red color
let shootingKey = 32; //space key 


// Menu buttons:
let menuLoginBtn;
let menuSignupBtn;
let menuWelcomeBtn;

$(document).ready(function() {
  menuLoginBtn = $("#navbarLoginBtn");
  menuSignupBtn = $("#navbarSignupBtn");
  menuWelcomeBtn = $("#navbarWelcomeBtn");
});

// Users and Passwords managing letiables
const sections_ids = ["#welcome-section", "#game-section", "#login-section", "#signup-section", "#config-section"]
const testUser = {"username":"p","password":"testuser"};
const myUser = {"username":"a","password":"a"};
const users_passwords =[testUser, myUser];
const all_registered_users = [];
let loggedUser = "";

window.onload = setupGame;

function setupGame() {
  switch_displays("#welcome-section");
  canvas = document.getElementById("theCanvas");
  context = canvas.getContext("2d");

  enemyImage = new Image();
  enemyImage.src = "resources/images/enemy.png";

  playerhit = document.getElementById( "playerhit" );
  enemyhit = document.getElementById( "enemyhit" );
  bgsound = document.getElementById( "bgsound" );
}

function newGame() {
    let canvas = document.getElementById("theCanvas"); 
    canvas.style.display = "inline-block";
    $('#resultsDiv').hide();
    playSound();
    clearInterval(enemySpeedInterval)
    newGameResetParams();
    resetElements();
    startAnimation();
    enemySpeedInterval = setInterval(increaseEnemySpeed, 5000); 
    gameTimerInterval = setInterval(updateTimeLeft,1000);
}

function newGameResetParams(){
  enemySpeed = 1;
  totalPoints = 0;
  dy = 3;
  lives = 3;
  timeLeft = gameTimer;
  gameOver=false;
}

function updateTimeLeft(){
  if(timeLeft>0){
    timeLeft--;
  }
  else{
    timeLeft = 0;
    endGame();
  }
}
  
  function increaseEnemySpeed() {
    if (enemySpeed >= 5)
      return
    enemySpeed += 1;
    if(dy<=5){
      dy += 0.5
    } 
  }

// Game background sound Methods:
  function pauseSound() {
    if (typeof bgsound !== 'undefined' && !bgsound.paused) {
      bgsound.pause();
    }
  }

  function playSound() {
    if (typeof bgsound !== 'undefined' && bgsound.paused) {
      bgsound.play();
    }
  }

function generateEnemies() {
    let enemyWidth = 30;
    let enemyHeight = 30;
    let paddingX = 10;
    let paddingY = 10;
    let startX = canvas.width / 2 - (enemyWidth * 4 + paddingX * 3) / 2;
    let startY = 10;
  
    for (let row = 0; row < 4; row++) {
      let points = 0;
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
      for (let col = 0; col < 5; col++) {
        let enemyX = startX + col * (enemyWidth + paddingX);
        let enemyY = startY + row * (enemyHeight + paddingY);
        let enemy = {
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
    if (totalPoints >= 250 || enemies.length ==0){
        endGame();
    }
  }

  let enemyIsShooting = false;

  function generateEnemyBullets() {
    let minBulletY = canvas.height;
    for (let i = 0; i < bullets.length; i++) {
      let bullet = bullets[i];
      if (bullet.y < minBulletY) {
        minBulletY = bullet.y;
      }
    }
    if (minBulletY >= canvas.height * 3 / 4 && !enemyIsShooting) {
      let shootingEnemies = enemies.filter(function(enemy) { return enemy.canShoot; });
      if (shootingEnemies.length > 0) {
        let randomIndex = Math.floor(Math.random() * shootingEnemies.length);
        let enemy = shootingEnemies[randomIndex];
        enemyIsShooting = true;
        let bullet = {
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height,
          dy: dy
        };
        bullets.push(bullet);
        setTimeout(function() { enemyIsShooting = false; }, 1000); 
      }
    }
  }
  
  

function updateBulletPositions() {
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
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
  gameOver=true;
  showScoreResults();
  addRecord();
  gameId ++;
  showRecordsTable();
  resetElements();
  clearInterval(gameTimerInterval);
  clearInterval(enemySpeedInterval);
  pauseSound();
  let canvas = document.getElementById("theCanvas"); 
  canvas.style.display = "none";
}

function showRecordsTable() {
   let tableBody = document.getElementById("recordsTableBody");
   tableBody.innerHTML = '';
   gameRecords.forEach(record => {
    let gameId = record[0];
    let score = record[1];
    let rank = gameRecords.indexOf(record) + 1;
    const row = document.createElement('tr');
    const rankCell = document.createElement('td');
    rankCell.textContent = rank;
    const gameCell = document.createElement('td');
    gameCell.textContent = gameId;
    const scoreCell = document.createElement('td');
    scoreCell.textContent = score;
    row.appendChild(rankCell);
    row.appendChild(gameCell);
    row.appendChild(scoreCell);
    tableBody.appendChild(row);
   });
   $('#resultsDiv').show();
}

function addRecord(){
    record = [gameId, totalPoints];
    gameRecords.push(record);
    gameRecords.sort(compareSecondElementDescending);
}

function showScoreResults(){
  let resultMessage = $('#resultMsg');
  let resultScore = $('#resultScore');
  let resultId = $('#resultId');
  let message = getResultMsg();
  resultMessage.text(message);
  resultScore.text('Your score: '+totalPoints);
  resultId.text('Game ID: '+ gameId);
  // resultMessage.show();
}

function getResultMsg(){

    let message = "";
    if(lives == 0){
      message += "You Lost";
      return message ;
    }
    if(timeLeft==0){
      if(totalPoints<100){
        message += "You can do better";
      }
      else{
        message += "Winner!";
      }
      return message;
    }
    if(enemies.length == 0){
      message += "Champion!";
      return message;
    }
    return message;
}

function resetPlayerPosition() {
  playerX = canvas.width / 2 - playerImage.width / 2;
  playerY = canvas.height - playerImage.height;
  context.drawImage(playerImage, playerX, playerY);
  bullets = []
}
  
  
function resetElements() {
  playerImage = new Image();
  playerImage.src = `resources/images/airplane-${spaceShipOption}.png`;
  playerImage.onload = function () {
    playerX = canvas.width / 2 - playerImage.width / 2;
    playerY = canvas.height - playerImage.height;
    context.drawImage(playerImage, playerX, playerY);
  };
  enemies = [];
  generateEnemies();
  bullets = [];
  totalPoints = 0;
  lives = 3;
}

function startAnimation() {
  window.requestAnimationFrame(updatePosition);
}


function updateEnemyPosition() {
  let maxX = 0;
  let minX = canvas.width;

  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
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

  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    context.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
  }
}

  
function drawHearts(numHearts) {
  context.fillStyle = "red";
  for (let i = 0; i < numHearts; i++) {
    let x = i * 20 + 10;
    let y = 10;
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
  if(gameOver){
    return;
  }
  drawHearts(lives);

  document.onkeydown = function(event) {
    let cur_key = event.keyCode;
    if (cur_key === 37) { // left arrow cur_key
      if (playerX - 20 >= 0) {
        playerX -= 20;
      }
    } else if (cur_key === 38) { // up arrow cur_key
      if (playerY - 20 >= 0 && playerY > canvas.height * 0.6) {
        playerY -= 20;
      }
    } else if (cur_key === 39) { // right arrow cur_key
      if (playerX + playerImage.width + 20 <= canvas.width) {
        playerX += 20;
      }
    } else if (cur_key === 40) { // down arrow cur_key
      if (playerY + playerImage.height + 20 <= canvas.height) {
        playerY += 20;
      }
    } else if (cur_key === shootingKey) { // shooting key
      if (!isShooting) {
        isShooting = true;
        bulletX = playerX + playerImage.width / 2;
        bulletY = playerY;
        shootBullet();
      }
    }
  };

  generateEnemyBullets();
  updateBulletPositions();
  drawPoints();
  drawTimer();

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
  context.fillStyle = colorInput;
  context.arc(bulletX, bulletY, bulletRadius, 0, Math.PI * 2);
  context.fill();
}

function updateBulletPosition() {
  bulletY -= 10; 
  
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
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
  let totalPointsText = "Points: " + totalPoints;
  context.fillStyle = "black";
  context.font = "bold 20px Arial";
  let textWidth = context.measureText(totalPointsText).width;
  context.fillText(totalPointsText, canvas.width - textWidth - 10, 30);
}

function drawTimer(){
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  let timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  let totalPointsText = "Time: " + timeString;
  context.fillStyle = "black";
  context.font = "bold 20px Arial";
  let textWidth = context.measureText(totalPointsText).width;
  context.fillText(totalPointsText, canvas.width - textWidth - 10, 50);
}

function drawBullet() {
  context.beginPath();
  context.fillStyle = colorInput;
  context.arc(bulletX, bulletY, bulletRadius, 0, Math.PI * 2);
  context.fill();
}


function switch_displays(switch_to_id){
    switch_displays_setup();
    sections_ids.forEach(section_id => {  
      if(section_id != switch_to_id)
        $(section_id).hide();
      else
        $(section_id).show()
    });
}

function switch_displays_setup(){
  clearLoginInputs();
  clearSignupInputs();
  clearConfigInputs();
  $('#successfulRegisterMsg').hide();
  pauseSound();
}

// About Modal Dialog
function showAbout(){
  let overlay = document.getElementById("overlay"); // $("#overlay");
  let dialog = document.getElementById("dialog"); //$("#dialog");
  overlay.style.display = "block";
  dialog.style.display = "block";
}

function closeAbout() {
  let overlay = document.getElementById("overlay");
  let dialog = document.getElementById("dialog");
  overlay.style.display = "none";
  dialog.style.display = "none";
}

// Closing About Window with Escape key
$(document).ready(function() {
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    closeAbout();
  }
  // prevent space to trigger buttons 
  if (event.code === 'Space' && event.target.tagName !== 'INPUT') { 
    event.preventDefault();
  }
});});

// Login Handling methods:
function handleLoginClick(){
    const username = $('#login-input-username');
    const password = $('#login-input-password');
    const usernameInput = username.val();
    const passwordInput = password.val();
    let loginSuccessful = false;
    users_passwords.forEach(user => {
      if(user.username == usernameInput && user.password == passwordInput){
        loginSuccessful = true;
        successfulLogin(user);
        loggedUser = usernameInput;
        document.getElementById('welcomeUserMsg').textContent = 'Welcome ' + loggedUser;

        return;
      }
    })
    if(!loginSuccessful)
      failedLogin();
}

function clearLoginInputs(){
  const username = $('#login-input-username');
  const password = $('#login-input-password');
  username.val('');
  password.val('');
}

function failedLogin(){
  clearLoginInputs();
  alert("Username/Password are wrong,\nPlease try again");
}

function successfulLogin(user){
  $("#loggedUserOptions").show();
  $("#welcomeUserMsg").val("Welcome "+user.username);
  disableMenuButtons();
  switch_displays("#config-section");
}

// SignUp Handling Methods:
$(document).ready(function() {
const signupForm = document.getElementById("signup-form");
signupForm.addEventListener("submit", (event) => {
  event.preventDefault(); // prevent the form from refreshing the page
  // call your function to handle the form data here
});
});


function handleRegisterClick(){
  const fullName = $('#signup-input-fullName').val();
  const username = $('#signup-input-userName').val();
  const email = $('#signup-input-email').val();
  const date = $('#signup-input-date').val();
  const password = $('#signup-input-password').val();
  const passwordRepeat = $('#signup-input-passwordrepeat').val();
  signupInputs = [fullName, username, email, date, password, passwordRepeat];
  if (!validateNotEmpty(signupInputs))
    return false;
  if(!validateFullname(fullName))
    return false;
  if(!validatePassword(password, passwordRepeat))
    return false;
  if(!validateUsername(username))
    return false;
  const new_user = {"full name":fullName, "username":username, "email": email, "date":date}
  successfulRegister(new_user, password);
}

function validateNotEmpty(inputsArray){
  let isValid = true; 
  inputsArray.forEach(input => {
    if (input == ''){
      isValid = false;
    }
  });
  if(!isValid)
    alert("Fields can't be empty,\nPlease fill all the fields");
  return isValid;
}

function validateFullname(name){
    const regex = /^[^0-9]+$/;
    if (!regex.test(name)) {
      alert("Full name can't have numbers!");
      return false;
    }
    return true;
}

function validateUsername(username){
  let isValid = true;
  users_passwords.forEach(user => {
    if(user.username == username){
      isValid = false;
    }
  });
  if(!isValid)
    alert("User name already exists please try different one");
  return isValid;
}

function validatePassword(password, passwordRepeat){
  if(password.length<8){
    alert("Password must be at least 8 characters");
    return false;
  }
  // regex for password to have both numbers and characters and only them
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
  if (!regex.test(password)) {
    alert("Password must have at least one letter and at least one number");
    return false;
  }
  if(password != passwordRepeat){
    alert("Passwords must match !");
    return false;
  }
  return true;
}

function clearSignupInputs(){
  const fullName = $('#signup-input-fullName');
  const username = $('#signup-input-userName');
  const email = $('#signup-input-email');
  const date = $('#signup-input-date');
  const password = $('#signup-input-password');
  const passwordRepeat = $('#signup-input-passwordrepeat');
  fullName.val('');
  username.val('');
  email.val('');
  date.val('');
  password.val('');
  passwordRepeat.val('');
}

function successfulRegister(newUser, password){
  all_registered_users.push(newUser);
  userPassword = {"username": newUser.username, "password":password};
  users_passwords.push(userPassword);
  switch_displays("#login-section");
  $('#successfulRegisterMsg').show();
}

// Log out handling
function logOut(){
  endGame();
  loggedUser = "";
  $("#loggedUserOptions").hide();
  $("#resultsDiv").hide();
  gameRecords = [];
  enableMenuButtons();
  restoreConfigDefaults();
  switch_displays("#welcome-section");
}

//Methods for Menu button of : Home, log in, Sign up 
function disableMenuButtons(){
  buttons = [menuLoginBtn, menuSignupBtn, menuWelcomeBtn];
  buttons.forEach(button => {
    button.prop("disabled", true);
    button.addClass("disabled");
  }) 
  // menuLoginBtn.prop("disabled", true);
  // menuSignupBtn.prop("disabled", true);
  // menuWelcomeBtn.prop("disabled", true);
}

function enableMenuButtons(){
  buttons = [menuLoginBtn, menuSignupBtn, menuWelcomeBtn];
  buttons.forEach(button => {
    button.prop("disabled", false);
    button.removeClass("disabled");
  }) 
  // menuLoginBtn.prop("disabled", false);
  // menuSignupBtn.prop("disabled", false);
  // menuWelcomeBtn.prop("disabled", false);
}

// Configurations Section 
function selectSpaceShip(option){
  if (option == 1){
    $("#sp2").hide()
    $("#sp3").hide()
    spaceShipOption = 1
    return
  }
  if (option == 2){
    $("#sp1").hide()
    $("#sp3").hide()
    spaceShipOption = 2
    return
  }
  if (option == 3){
    $("#sp2").hide()
    $("#sp1").hide()
    spaceShipOption = 3
    return
  }
}

function clearConfigInputs(){
  $("#sp1").show();
  $("#sp2").show();
  $("#sp3").show();
  document.querySelector('input[type="color"]').value = colorInput;

} 

function restoreConfigDefaults(){
  spaceShipOption = 2;
  shootingKey = 32;
  colorInput = "#FF0000";
}


function handleStartGame(){
  colorInput = document.querySelector('input[type="color"]').value;
  // Value in minutes 
  gameTimer = Number(document.querySelector('input[name="option"]:checked').value)*60;
  updateAboutShootingKey();
  switch_displays("#game-section");
  newGame();
}

function handleShootingKeyEnter(event) {
  let keycode = event.keyCode;
  keyInput = $('#shootingKey-input');
  if((keycode<65 || keycode>90) && keycode != 32 && keycode!=8){ //a-z or space are allowed
    alert('Shooting key can be only alphabetic letter or space key');
    keyInput.val('');
    return;
  }
  if(keycode == 32){ // space key
    keyInput.val('space');
  }else if(keycode == 8) {//backspace key
    keyInput.val('');
    return;
  }
  else{
    keyInput.val(event.key);
  }
  shootingKey = keycode;
}

function updateAboutShootingKey(){
  let key = String.fromCharCode(shootingKey);
  $('#aboutShootKey').text(key+' = Shoot');
}

function compareSecondElementDescending(a, b) {
  if (a[1] < b[1]) {
    return 1;
  } else if (a[1] > b[1]) {
    return -1;
  } else {
    return 0;
  }
}