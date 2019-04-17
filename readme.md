# GA WDI-38 Project 01

#### Timeframe
8 days

## Technologies used
* JavaScript (ES6) | jQuery
* HTML5 | HTML5 audio
* SCSS | CSS animations
* GitHub

![PewPewPew Header](https://user-images.githubusercontent.com/44480965/51079026-b8fe2380-16b7-11e9-953a-bc09a8d57a4e.png)

## [PewPewPew][pewpewpew] - A game inspired by [Space Invaders][spaceInvaders]

The game can be found on this [GitHub repo](https://github.com/Dextorr/project-01) and can be played locally by cloning/downloading the repo and opening its `index.html` file in your browser.

_Alternatively_, you can play the hosted version [**here.**](pewpewpew)

### Game overview
This is a 2D, single-player game inspired by the classic [Space Invaders][spaceInvaders]. The objective of **PewPewPew** is to pilot your spaceship and prevent the invading armada of aliens from reaching you by shooting them down as they approach. They occasionally return fire, so you'll need to avoid getting hit too. As you progress, more alien reinforcements will arrive and they will begin to advance more quickly.

### Controls
* Ship Movement - ← → keys
* Fire Weapon - Hold down Spacebar
* Pause Game - 'P' key

### Instructions

1. On game start you will see the following:
![PewPewPew Start Overlay](https://user-images.githubusercontent.com/44480965/51079504-172f0480-16c0-11e9-919a-22d78c78fba7.png)  
Clicking on the Start button or pressing the Enter key will begin the game.

2. As soon as the game begins, aliens will start appearing at the top of the screen and move towards your ship while occasionally firing at you.
![PewPewPew Game Screenshot](https://user-images.githubusercontent.com/44480965/51079531-98869700-16c0-11e9-868f-7f1bbf27719a.png)
You'll need to avoid enemy fire by moving your ship with the ← → keys.
3. Your ship can fire back by holding down the spacebar. There will be a short charging period where you will hear the ship's lasers power up and see the energy gathering at the front of the ship.  
![Player Ship Charging Laser](https://user-images.githubusercontent.com/44480965/51079575-46924100-16c1-11e9-9d42-26619b73280c.png)  
Following the charging period, the spacebar can continue to be held down and your ship will periodically fire shots at the approaching aliens.

4. As you shoot aliens down, they will explode and then your score will increase. When you reach certain score milestones, a message will pop up on the game screen that will indicate that you have progressed to the next level.
![Level Up Message on Game Screen](https://user-images.githubusercontent.com/44480965/51079704-83f7ce00-16c3-11e9-876c-5cff9f4056d6.png)
Aliens are worth more points as the level increases, but they will also appear more frequently and advance more quickly.

5. If you fail to dodge the enemy's shots your ship will explode and you will lose a life. At this point the game will pause for a moment, and after a 3 second countdown the game resumes.  
![](https://user-images.githubusercontent.com/44480965/51079745-c241bd00-16c4-11e9-9f54-95c322e8c662.png)  
You begin the game with 3 lives, and your remaining lives are displayed on the top right of the game display as ship icons.  

6. When you have run out of lives, or you fail to shoot an alien before it reaches the bottom row of the game area, the game will end and your final score will be displayed.
![screenshot 2019-01-12 at 23 58 57](https://user-images.githubusercontent.com/44480965/51079788-0bded780-16c6-11e9-9cde-585572bd68f5.png)
If you've ended the game with a high score, you'll be given a text input to enter your name and your high score will be saved to local storage in your browser. The top ten scores are displayed on game start and end.

## Development Process

### Overview
This is a grid based game, so the first step in development was building out the grid. I decided that I'd want a square grid so simply began with a 10 by 10 grid, creating 100 divs within the main game div; each with a class of 'cell', so that they could be manipulated over the DOM later. This would later be updated to take a variable 'width' which would create a square grid of any size and all functions and styling would adjust accordingly, which was very useful when it came to testing new features. For example, when it came to testing the game over features, I could simply run the game on a 2x2 grid which would have the aliens immediately reach the bottom row and trigger the game over condition.

The movement of the player ship and the aliens is achieved by simply adding and removing classes of 'ship' and 'alien', respectively, from the cells on the game area. When something in the game moves, its class is simply removed from its current position and applied to its new one. This is the same for the firing functions, on a press of the spacebar, a class of 'shot' is applied above the position of the player ship for a fraction of a second, then removed and reapplied on the cell above, and so on.

The alien movement is based on where they are on the grid. They begin moving to the right, then upon reaching an edge, they move down a cell towards the player before reversing their horizontal direction to the left. Once I had them moving as expected I set up a function that moves each alien object as they are pushed into an array.
```
const alien = {
  'display': true,
  'index': alienIndex,
  'dir': 'right',
  'shotOdds': 0.1,
  'points': 100,
  'move': function(){
    <movement instructions>
  }
}
```
The alien object has these properties for each alien:
* whether it is alive or dead
* current position on the board
* current direction
* its odds for firing a shot
* how many points it is worth
* movement instructions

When an alien has been shot (its current index also has a class of `'shot'`), its `display` boolean property is set to `false` and the main gameplay interval no longer runs its `alien.move()` method. This was achieved by having the main function filter the array of alien objects for those that are still displayed before running each object's `alien.move()` method.
```
function alienMove(){
  let moveTimer
  // The aliens only move while the player ship is active
  if(shipActive){
    // Only live aliens are moved
    const liveAliens = aliens.filter(alien => alien.display)
    liveAliens.forEach(alien => {
      alienShot(alien)
      alien.move()
    })
    moveTimer = setTimeout(alienMove, alienSpeed)
  } else {
    clearInterval(moveTimer)
  }
}
```
The `moveTimer` recursively calls the `alienMove` function at a rate set by the `alienSpeed` variable. This allows the aliens to move more quickly at higher levels by setting `alienSpeed` to a lower value.

When shots are fired by the player, the spacebar is held down for repeated shots. This is achieved by assigning a `setInterval()` on `keydown` for the spacebar, which is cleared on the spacebar's `keyup`. In this way the rate of fire can be controlled and problems caused by having too many shots on the screen at once are minimised.

Another feature that was added at around this point was the 3 second countdown in between player lives. I'd noticed that it was very easy to lose 2 lives in quick succession while the gameplay continued upon a lost life, so I wrapped all the movement functions in an `if` statement which would only have them running while the ship was active: `shipActive = true` while the game is playing, but flips to `false` for 3 seconds when the player has been shot.  
The code for this feature actually stemmed from something I was using during testing where I wanted to stop the game's movement to inspect elements using the browser's dev tools, with the main difference being that I also had to turn off the other key event listeners to prevent the player from unintentionally resuming the game before the 3 seconds were up.  
I would go on to also use this function to create a pause button in the final game, which would do the same thing, but simply display blinking text stating "paused" in place of the 3 second countdown, and the game would remain paused until the P key was pressed again.

In a similar fashion to my pause function, during testing I was constantly giving myself additional lives to test the shooting mechanics of the game, and decided to include this as a feature in the game in the form of a cheat code which grants the player additional lives. On `keyup` the 11 most recent keycodes pressed are stored in an array and compared against the code array. If the values in the two arrays are the same, then the player is given an additional 5 lives.

The final main feature included in the game was the high score table. If there are fewer than ten high scores set or you have beaten one of the top ten, a text input and submit button are generated on the game over screen. On submission, the value of the text input (the player's name) is included in an object with the player's score: `{'name': '<player name>', 'score': '<player score>'}`, and pushed into an array of high scores. The array is sorted from highest to lowest and saved in `localStorage` as a `JSON string`. When the game start or end screen is displayed and there is an array of high scores in `localStorage`, the array of objects is parsed and an HTML table is generated and displayed.

### Challenges
There were numerous challenges encountered in the development of this game. Given the nature of the game's mechanics, there are a lot of elements all moving at the same time. As there are so many movement related functions running at once and they each run on their own intervals, there were quite a lot of bugs related to timing issues. If certain lines of code ran out of sync; for example, a line in the shot function which checks for collision with another shot, then the checks would sometimes not happen at all.  
This timing issue caused many problems such as aliens not being removed from the game after they had been shot, or the explosion for a dying alien happening in a different cell.

One of my original plans for the game was to have the game's events sync up to a musical track, my earlier tests involved a 'master' interval called the 'metronome' which governed the timings of the game's other functions, though I abandoned that idea to focus on other aspects of the game. Quite late into development I realised that this 'metronome' function would have perfectly solved the timing issues had I continued down that path even sans musical theme. Unfortunately it was far too late when I'd noticed this for me to be able to refactor all of the function intervals and have a reasonable amount of time left to complete the game's other features.  
In the end I managed to figure out a reasonable workaround where I consolidated a couple of the intervals I reasonably could and had each alien also checking its previous position for an explosion and removing itself from the game if there was an explosion present in its previous position immediately after it had moved on to the next.

If I could start over I would have been more careful to organise the order of each event in the game so that all of the functions would run correctly every time, without having to do multiple checks for conditions that should only really need to be checked once.
### Wins
Through testing my code I came across many functions that I was able to use as actual features in the final game, such as the pause feature and the resizable grids mentioned above. I was very happy to discover that I could use the same function that I'd been using for the player's shots to allow the aliens to fire back, simply by having the alien ships occasionally running the shot function with different arguments that move the shot down the screen instead of the default upward direction of the player shot.  

A feature that I was very proud of was the animated explosion sprites that displayed when the alien or player ships were hit by a shot. I managed to achieve this by setting the background of the cell where the explosion happens as the explosion sprite-sheet.

![Explosion Sprite Sheet](https://user-images.githubusercontent.com/44480965/52906563-64197400-3246-11e9-8474-c1668593fc8a.png)

```
// EXPLOSION SCSS **************************************************************
.explosion {
  background-image: url(../assets/images/explosion.png);
  background-repeat: no-repeat;
  background-size: 370%;

  &[data-step="0"] {
    background-position-x: 0;
    background-position-y: 0;
  }

  &[data-step="1"] {
    background-position-x: calc(100%/3);
    background-position-y: 0;
  }

  &[data-step="2"] {
    background-position-x: calc(200%/3);
    background-position-y: 0;
  }
  // ...and so on, up to data-step 15
```
```
function explode(index){
  $cells.eq(index).addClass('explosion')
  explosion.currentTime = 0
  explosion.play()
  const explosionTimer = setInterval(() => {
    $cells.eq(index).attr('data-step', currentStep)
    currentStep = currentStep === 15 ? 0 : currentStep += 1
    if(currentStep === 0) {
      $cells.eq(index).removeClass('explosion')
      clearInterval(explosionTimer)
    }
  }, 30)
}
```

The background is scaled to show only one image on the sheet at a time. The `explode` function runs when a shot collides with a ship, applying the class of `explosion` to the cell on the grid where the collision occurred. Every 30 milliseconds a data-step attribute is applied to the explosion cell starting at a value of 0 and continuing to 15, therefore displaying each explosion image as per the SCSS rules. Once each image has been displayed, the `explosion` class is removed from the cell and the interval is cleared, removing the background from the cell.


## Future Features
It would be nice if I could get the game to play on mobile devices. For this to work I'd have to apply the ship movement to touchscreen swipes and have the ship fire on touchscreen taps, or maybe just have the player ship fire continuously. Alternatively, I could provide buttons on the game screen, replacing the functionality of the key event listeners with click event listeners instead.

[pewpewpew]: https://dextorr.github.io/project-01/
[spaceInvaders]: https://en.wikipedia.org/wiki/Space_Invaders
