$(() => {

  const $gameBoard = $('#gameBoard'),
    aliens = []
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
  $cells.eq(shipIndex).addClass('ship')

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
        'shotOdds': 0
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
    if (shotCheck < alien.shotOdds && !$cells.eq(alien.index + 10).hasClass('alien')){
      fireShot(alien.index, 10)
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

      // Collision detection
      if($cells.eq(shotIndex).hasClass('alien')){
        $cells.eq(shotIndex).removeClass('alien')
        $cells.eq(shotIndex).removeClass('shot')
        console.log(aliens.findIndex(alien => alien.index === shotIndex))
        aliens[aliens.findIndex(alien => alien.index === shotIndex)].display = false
        console.log(aliens, shotIndex)
        clearInterval(shotTimer)
      }

      // When the shot has reached the top of the screen...
      if (shotIndex<0 || shotIndex>100){
        // ...the movement timer stops...
        clearInterval(shotTimer)
        // ...and the shot is removed from the gameboard
        $cells.eq(shotIndex).removeClass('shot')
      }
    }, 100)

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
      case 65: spawnAlien()
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
