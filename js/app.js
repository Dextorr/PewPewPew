
// VARIABLES *******************************************************************

const width = 10,
  $overlayMsg = $('<h3 />').text('Click Start to play.'),
  $startBtn = $('<button />').text('Start'),
  aliens = []
let shipIndex = 94,
  $gameBoard,
  $scoreDiv,
  $score,
  $livesDiv,
  $lives,
  $overlay,
  score = 0,
  lives = 3,
  $cells

function init(){
  $gameBoard = $('#gameBoard')
  $overlay = $('#overlay')
  $scoreDiv = $('div.score')
  $livesDiv = $('div.lives')

  $startBtn.on('click', startGame)

  $overlay.append($overlayMsg)
  $overlay.append($startBtn)
}

function startGame(){
  $overlay.css('display', 'none')
  $score = $('<span />').addClass('scoreDisplay').appendTo($scoreDiv)
  $lives = $('<span />').addClass('livesDisplay').appendTo($livesDiv)

  // TEMP just to see gameboard clearly for now
  $gameBoard.css({border: '1px solid #000'})

  // Display the score and lives
  $score.text(score)
  $lives.text(lives)

  // Create a grid of 100 cells on the gameboard
  for (let i=0;i<Math.pow(width, 2);i++){
    const $cell = $('<div />')
    $cell.addClass('cell').appendTo($gameBoard)
  }

  // Get array of each cell on the gameboard
  $cells = $('div.cell')

  // Place player ship on initial cell (94)
  $cells.eq(shipIndex).addClass('ship')

  const alienSpawner = setInterval(() => {
    spawnAlien()
  }, 1500)

  // EVENT LISTENERS ***********************************************************

  //When a key is pressed down...
  $(document).on('keydown', e => {
    keydownHandler(e)
  })

  $(document).on('keyup', e => {
    keyupHandler(e)
  })
}



// Redraws the ship on the cell the player has moved it to
function moveShip(){
  $cells.eq(shipIndex).addClass('ship')
}

function isAlien(index){
  return $cells.eq(index).hasClass('alien')
}

// Randomly places an alien on one of the first 9 cells of the first row...
function spawnAlien(){
  const alienIndex = Math.floor(Math.random() * 9)
  //Check that the area is clear for an alien to spawn and move into
  if (!(isAlien(alienIndex) || isAlien(alienIndex + 1) || isAlien(alienIndex - 1))){
    const alien = {
      'display': true,
      'index': alienIndex,
      'dir': 'right',
      'shotOdds': .10
    }
    drawAlien(alien, 1)
    aliens.push(alien)
    console.log(aliens)
  }
}

// Draws the alien on the next cell (n) and removes it from the current one (index)
function drawAlien(alien, n){
  if (alien.display){
    $cells.eq(alien.index - n).removeClass('alien')
    $cells.eq(alien.index).addClass('alien')
  }
}

// Alien randomly fires a shot
function alienShot(alien){
  const shotCheck = Math.random()
  if (shotCheck < alien.shotOdds && !$cells.eq(alien.index + 10).hasClass('alien') && alien.display){
    fireShot(alien.index, 10, 'alienShot')
  }
}

// Alien ship moves every half second
setInterval(() => {
  // Initial direction is right
  aliens.forEach(alien => {
    // When the alien reaches the right edge...
    if (alien.index%10 === 9 && Math.ceil((alien.index/10)%2) === 1){
      // ...it moves down a row...
      alien.index += 10
      drawAlien(alien, 10)
      // ...and reverses direction to left
      alien.dir = 'left'
      // When the alien reaches the left edge...
    } else if (alien.index%10 === 0 && (alien.index/10)%2 === 1){
      // ...it moves down a row...
      alien.index += 10
      drawAlien(alien, 10)
      // ...and reverses direction to right
      alien.dir = 'right'
      // While direction is right...
    } else if (alien.dir === 'right'){
      //...check if the alien will fire a shot...
      alienShot(alien)
      // ...and the alien moves one cell right
      alien.index ++
      drawAlien(alien, 1)
      // While direction is left...
    } else if (alien.dir === 'left'){
      //...check if the alien will fire a shot...
      alienShot(alien)
      // ...and the alien moves one cell left
      alien.index --
      drawAlien(alien, -1)
    }
  })
}, 500)

// COLLISION DETECTION *********************************************************

function collision(shotIndex, shotType, dir, shotTimer){
  // If a shot enters a cell with an alien in it...
  if(isAlien(shotIndex) && shotType === 'shot'){
    // The player score is increased and updated...
    score += 100
    $score.text(score)
    // It removes the alien and shot from the cell...
    $cells.eq(shotIndex).removeClass('alien')
    $cells.eq(shotIndex).removeClass('shot')
    console.log(aliens.findIndex(alien => alien.index === shotIndex))
    // ...and changes the alien object's display property to false
    aliens[aliens.findIndex(alien => alien.index === shotIndex)].display = false
    console.log(aliens, shotIndex)
    // The shot's progress towards the top of the screen ends
    clearInterval(shotTimer)
  }

  if ($cells.eq(shotIndex).hasClass('ship') && shotType === 'alienShot'){
    $cells.eq(shipIndex).removeClass('ship')
    $cells.eq(shotIndex).removeClass('alienShot')
    lives -= 1
    $lives.text(lives)
  }

  if($cells.eq(shotIndex + dir).hasClass('shot') && $cells.eq(shotIndex).hasClass('alienShot')){
    $cells.eq(shotIndex).removeClass('shot')
    $cells.eq(shotIndex).removeClass('alienShot')
    clearInterval(shotTimer)
  }

}

// SHOT FUNCTION ***************************************************************

// Fires a shot from the player ship's current position:
function fireShot(shooterIndex, dir, shotType = 'shot'){
  // The shot is initially placed where the player ship is
  let shotIndex = shooterIndex

  // Interval for the shot's movement
  const shotTimer = setInterval(() => {
    // The shot is placed on the row above its current position...
    $cells.eq(shotIndex + dir).addClass(`${shotType}`)
    // ...removed from its current position...
    $cells.eq(shotIndex).removeClass(`${shotType}`)
    // ...and current position is reassigned to new position
    shotIndex += dir


    // When the shot has reached the top of the screen...
    if (shotIndex<0 || shotIndex>100){
      // ...the movement timer stops...
      clearInterval(shotTimer)
      // ...and the shot is removed from the gameboard
      $cells.eq(shotIndex).removeClass(`${shotType}`)
    }

    // Check for collision
    collision(shotIndex, shotType, dir, shotTimer)
  }, 50)
  console.log('Shots fired!')
}

// EVENT HANDLERS **************************************************************

function keydownHandler(e){
  // On keydown the player ship is removed from its current cell
  $cells.eq(shipIndex).removeClass('ship')
  switch(e.keyCode){
    // If the key is the left arrow key, the current index is decreased
    case 37: if (shipIndex%10 !== 0) shipIndex--
      break
    // If the key is the right arrow key, the current index is increased
    case 39: if (shipIndex%10 !== 9) shipIndex++
      break
  }
  // The ship is redrawn on the current index
  moveShip()
}

function keyupHandler(e){
  // If the spacebar is pressed, then a shot is fired
  if(e.keyCode === 32) fireShot(shipIndex, -10)
}

$(() => {
  init()
})
