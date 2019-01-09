
// VARIABLES *******************************************************************

const width = 16,
  $overlayMsg = $('<h3 />').text('Click Start to play.'),
  $startBtn = $('<button />').text('Start'),
  shipStart = Math.pow(width, 2) - Math.round(width/2),
  startingLives = 3
let shipIndex = shipStart,
  $gameBoard,
  $scoreDiv,
  $score,
  $livesDiv,
  $lives,
  $overlay,
  score = 0,
  lives = startingLives,
  $cells,
  shotDelay = false,
  alienSpawner,
  shipActive = false,
  alienSpeed = 300,
  alienSpawnRate = 1500,
  aliens = [],
  currentStep = 0

function init(){
  $gameBoard = $('#gameBoard')
  $overlay = $('#overlay')
  $scoreDiv = $('div.score').text('Score: ')
  $livesDiv = $('div.lives').text('Lives: ')

  $startBtn.on('click', startGame)

  $overlay.append($overlayMsg)
  $overlay.append($startBtn)

  // Create a grid of cells on the gameboard
  for (let i=0;i<Math.pow(width, 2);i++){
    const $cell = $('<div />').css({
      'width': `calc(100%/${width})`,
      'height': `calc(100%/${width})`
    })
    $cell.addClass('cell').appendTo($gameBoard)
  }


  // Get array of each cell on the gameboard
  $cells = $('div.cell')

  $score = $('<span />').addClass('scoreDisplay').appendTo($scoreDiv)
  $lives = $('<span />').addClass('livesDisplay').appendTo($livesDiv)
}

// EXPLOSION SPRITE FUNCTION ***************************************************

function explode(index){
  $cells.eq(index).addClass('explosion')
  const explosionTimer = setInterval(() => {
    $cells.eq(index).attr('data-step', currentStep)
    currentStep = currentStep === 15 ? 0 : currentStep += 1
    if(currentStep === 0) {
      $cells.eq(index).removeClass('explosion')
      clearInterval(explosionTimer)
    }
  }, 50)
}

// GAME START ******************************************************************

function startGame(){
  $overlay.css('display', 'none')
  shipActive = true
  if(score !== 0) Array.from($cells).forEach(cell => cell.classList.remove('alien'))
  score = 0
  lives = startingLives
  aliens = []


  // Display the score and lives
  $score.text(score)
  $lives.text(lives)


  // Place player ship on initial cell
  moveShip()

  // Spawn an alien on the top row every 1.5 seconds
  alienSpawner = setInterval(() => {
    if(shipActive){
      spawnAlien()
    }
  }, alienSpawnRate)

  addEvents()
}

// EVENT LISTENERS *************************************************************

function addEvents(){
  //First clear previous events
  $(document).off()

  //When a key is pressed down...
  $(document).on('keydown', e => {
    keydownHandler(e)
  })

  $(document).on('keyup', e => {
    keyupHandler(e)
  })
}

// SHIP MOVEMENT ***************************************************************

// Redraws the ship on the cell the player has moved it to
function moveShip(){
  $cells.eq(shipIndex).addClass('ship')
}

function cellCheck(index, className){
  return $cells.eq(index).hasClass(className)
}

// ALIENS **********************************************************************

// Randomly places an alien on one of the cells of the first row excluding the furthest cell on the right...
function spawnAlien(){
  const alienIndex = Math.floor(Math.random() * (width - 1))
  //Check that the area is clear for an alien to spawn and move into
  if (!(cellCheck(alienIndex, 'alien') || cellCheck((alienIndex, 'alien') + 1) || cellCheck((alienIndex, 'alien') - 1))){
    // Alien object
    const alien = {
      'display': true,
      'index': alienIndex,
      'dir': 'right',
      'shotOdds': 0.1
    }
    drawAlien(alien, 1)
    aliens.push(alien)
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
    fireShot(alien.index, width, 60, 'alienShot')
  }
}

// MAIN GAMEPLAY INTERVAL ******************************************************

// Alien moves according to alienSpeed variable
const alienMove = setInterval(() => {
  // The aliens only move while the player ship is active
  if(shipActive){
    // Initial direction is right
    const liveAliens = aliens.filter(alien => alien.display)
    liveAliens.forEach(alien => {

      // Check if the alien has reached the bottom of the screen...
      if (alien.index > Math.pow(width, 2) - width){
        // ...and run the game over function if it is
        gameOver()
      }

      // When the alien reaches the right edge...
      if (alien.index%width === width-1 && Math.ceil((alien.index/width)%2) === 1){
        // ...it moves down a row...
        alien.index += width
        drawAlien(alien, width)
        // ...and reverses direction to left
        alien.dir = 'left'
        // When the alien reaches the left edge...
      } else if (alien.index%width === 0 && (alien.index/width)%2 === 1){
        // ...it moves down a row...
        alien.index += width
        drawAlien(alien, width)
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
  }
}, alienSpeed)

// COLLISION DETECTION *********************************************************

function collision(shotIndex, shotType, dir, shotTimer){

  //ALIEN HIT
  // If a shot enters a cell with an alien in it...
  if(cellCheck(shotIndex, 'alien') && shotType === 'shot'){
    // The player score is increased and updated...
    score += 100
    $score.text(score)
    // It removes the alien and shot from the cell...
    $cells.eq(shotIndex).removeClass('alien')
    $cells.eq(shotIndex).removeClass('shot')
    // ...replaces it with the explosion sprite...
    explode(shotIndex)
    // ...and changes the alien object's display property to false
    aliens[aliens.findIndex(alien => alien.index === shotIndex)].display = false
    // The shot's progress towards the top of the screen ends
    clearInterval(shotTimer)
  }
  if(cellCheck(shotIndex, 'alien') && shotType === 'alienShot'){
    $cells.eq(shotIndex).removeClass('alienShot')
    clearInterval(shotTimer)
  }

  // PLAYER HIT
  if (cellCheck(shotIndex, 'ship') && shotType === 'alienShot'){
    if(lives === 0) gameOver()
    else {
      $cells.eq(shipIndex).removeClass('ship')
      $cells.eq(shotIndex).removeClass('alienShot')
      lives -= 1
      $lives.text(lives)
      pauseGame()
      $(document).on('keyup', e => {
        if(e.keyCode === 13){
          shipActive = true
          shipIndex = shipStart
          moveShip()
          addEvents()
        }
      })
    }
  }

  // SHOT COLLISION
  // NOT WORKING AS EXPECTED...
  if( cellCheck(shotIndex + dir, 'shot') && shotType === 'alienShot' ) {
    console.log('HIT', shotIndex)
    $cells.eq(shotIndex).removeClass('alienShot')
    clearInterval(shotTimer)
  }

}

// SHOT FUNCTION ***************************************************************

// Fires a shot from the indicated current position in the indicated direction:
function fireShot(shooterIndex, dir, shotSpeed, shotType = 'shot'){
  // The shot is initially placed where the shooter is
  let shotIndex = shooterIndex

  // Interval for the shot's movement
  const shotTimer = setInterval(() => {
    // The shot is placed on the row above or below its current position as directed...
    $cells.eq(shotIndex + dir).addClass(`${shotType}`)
    // ...removed from its current position...
    $cells.eq(shotIndex).removeClass(`${shotType}`)
    // ...and current position is reassigned to new position
    shotIndex += dir


    // When the shot has reached the end of the screen, or when a life has been lost...
    if (shotIndex<0 || shotIndex>Math.pow(width, 2) || !shipActive){
      // ...the movement timer stops...
      clearInterval(shotTimer)
      // ...and the shot is removed from the gameboard
      $cells.eq(shotIndex).removeClass(`${shotType}`)
    }

    // Check for collision
    collision(shotIndex, shotType, dir, shotTimer)
  }, shotSpeed)
}

// EVENT HANDLERS **************************************************************

function keydownHandler(e){
  // On keydown the player ship is removed from its current cell
  $cells.eq(shipIndex).removeClass('ship')
  switch(e.keyCode){
    // If the key is the left arrow key, the current index is decreased
    case 37: if (shipIndex%width !== 0) shipIndex--
      break
    // If the key is the right arrow key, the current index is increased
    case 39: if (shipIndex%width !== width-1) shipIndex++
      break
    // If the spacebar is held down, then a shot is fired on an interval to prevent rapid presses
    case 32: if (shotDelay === false){
      shotDelay = setInterval(() => {
        fireShot(shipIndex, -width, 40)
      }, 500)
    }
      break
  }
  // The ship is redrawn on the current index
  moveShip()
}

function keyupHandler(e){
  // When the spacebar is let go...
  if (e.keyCode === 32){
    // ...the interval is cleared...
    clearInterval(shotDelay)
    // ...and shotDelay is reassigned as false to allow another shot
    shotDelay = false
  }
}

// STOPPING THE GAME ***********************************************************

function pauseGame(){
  shipActive = false
  // setTimeout(shipsActive=true, 2000)
  $(document).off('keydown')
}

function gameOver(){
  $(document).off('keyup')
  $overlayMsg.text('Game Over')
  $startBtn.off().text('Play again')
  $startBtn.on('click', startGame)
  $overlay.css('display', 'block')
  pauseGame()
}

// DOM CONTENT EVENT LISTENER | INIT FUNCTION **********************************

$(() => {
  init()
})
