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

  $(document).on('keydown', e => {
    console.log(e.keyCode)
    $cells.eq(shipIndex).removeClass('ship')
    switch(e.keyCode){
      case 37: if (shipIndex%10 !== 0) shipIndex--
        break
      case 39: if (shipIndex%10 !== 9) shipIndex++
        break
    }
    moveShip()
    console.log(shipIndex)
  })
})
