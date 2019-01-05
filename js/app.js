$(() => {

  const $gameBoard = $('#gameBoard')
  let shipIndex = 94

  // TEMP just to see gameboard clearly for now
  $gameBoard.css({border: '5px solid #000'})

  // Create a grid of 100 cells on the gameboard
  for (let i=0;i<100;i++){
    const $cell = $('<div />')
    $cell.addClass('cell')
      .appendTo($gameBoard)
  }

  // Get array of each cell on the gameboard
  const $cells = $('div.cell')

  // Place player ship on initial cell (94)
  $cells.eq(shipIndex)
    .addClass('ship')

  // Redraws the ship on the cell the player has moved it to
  function moveShip(){
    $cells.eq(shipIndex).addClass('ship')
  }

  // Randomly places an alien on one of the first 9 cells of the first row...
  function spawnAlien(){
    const alienIndex = Math.floor(Math.random() * 9)
    if (!$cells.eq(alienIndex).hasClass('alien')){
      $cells.eq(alienIndex).addClass('alien')
    }
    // ...and applies movement logic to it
    moveAlien(alienIndex)
  }

  // Draws the alien on the next cell (n) and removes it from the current one (index)
  function drawAlien(index, n){
    $cells.eq(index + n).addClass('alien')
    $cells.eq(index).removeClass('alien')
  }

  // Alien movement logic:
  function moveAlien(alienIndex){
    // Initial direction is right
    let dir = 'right'
    // Alien ship moves every half second
    const alienMoveTimer = setInterval(() => {
      console.log(alienIndex)
      // When the alien reaches the right edge...
      if (alienIndex%10 === 9 && Math.ceil((alienIndex/10)%2) === 1){
        // ...it moves down a row...
        drawAlien(alienIndex, 10)
        alienIndex += 10
        // ...and reverses direction to left
        dir = 'left'
      // When the alien reaches the left edge...
      } else if (alienIndex%10 === 0 && (alienIndex/10)%2 === 1){
        // ...it moves down a row...
        drawAlien(alienIndex, 10)
        alienIndex += 10
        // ...and reverses direction to right
        dir = 'right'
      // While direction is right...
      } else if (dir === 'right'){
        // ...the alien moves one cell right
        drawAlien(alienIndex, 1)
        alienIndex ++
      // While direction is left...
      } else if (dir === 'left'){
        // ...the alien moves one cell left
        drawAlien(alienIndex, -1)
        alienIndex --
      }
    }, 500)
  }

  // Fires a shot from the player ship's current position:
  function fireShot(shooterIndex, dir){
    // The shot is initially placed where the player ship is
    let shotIndex = shooterIndex
    // Interval for the shot's movement
    const shotTimer = setInterval(() => {
      // The shot is placed on the row above its current position...
      $cells.eq(shotIndex + dir).addClass('shot')
      // ...removed from its current position...
      $cells.eq(shotIndex).removeClass('shot')
      // ...and current position is reassigned to new position
      shotIndex += dir
      // When the shot has reached the top of the screen...
      if (shotIndex<0 || shotIndex>100){
        // ...the movement timer stops...
        clearInterval(shotTimer)
        // ...and the shot is removed from the gameboard
        $cells.eq(shotIndex).removeClass('shot')
      }
    }, 100)

    // TEMP spawn an alien when a shot is fired
    spawnAlien()

    console.log('Shots fired!')
  }

  //When a key is pressed down...
  $(document).on('keydown', e => {
    // ...the player ship is removed from its current cell
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
  })

  $(document).on('keyup', e => {
    // If the spacebar is pressed, then a shot is fired
    if(e.keyCode === 32) fireShot(shipIndex, -10)
  })
})
