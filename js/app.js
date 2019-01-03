$(() => {
  const $gameBoard = $('#gameBoard')
  let shipIndex = 94


  $gameBoard.css({border: '5px solid #000'})

  for (let i=0;i<100;i++){
    const $cell = $('<div />')
    $cell.addClass('cell')
      .appendTo($gameBoard)
  }

  const $cells = $('div.cell')

  $cells.eq(shipIndex)
    .addClass('ship')

  function moveShip(){
    $cells.eq(shipIndex).addClass('ship')
  }

  function fireShot(){
    let shotIndex = shipIndex
    const shotTimer = setInterval(() => {
      $cells.eq(shotIndex - 10).addClass('shot')
      $cells.eq(shotIndex).removeClass('shot')
      shotIndex -= 10
      if (shotIndex<0){
        clearInterval(shotTimer)
        $cells.eq(shotIndex).removeClass('shot')
      }
      console.log('shot', shotIndex)
    }, 200)
    console.log('Shots fired!')
  }

  $(document).on('keydown', e => {
    console.log(e.keyCode)
    $cells.eq(shipIndex).removeClass('ship')
    switch(e.keyCode){
      case 37: if (shipIndex%10 !== 0) shipIndex--
        break
      case 39: if (shipIndex%10 !== 9) shipIndex++
        break
      case 32: fireShot()
        break
    }
    moveShip()
    console.log(shipIndex)
  })
})
