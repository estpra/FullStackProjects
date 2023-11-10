//title will be flashing if true, if false, title will stop flashing
let flashing = true
let duration = 25000; // 25 seconds in milliseconds
let startTime = Date.now(); // Record the start time
let level = 1
let highScore = 0
let playerSelectedPattern = []
let generatedPattern = []
//this list holds all the colors that a user clicks when REPEATING the pattern generated by the generatePattern function, I did it like this because I tied adding an element to theplayerSelectedPattern to a click and when a player is repeating the pattern, you dont always want to add the colors to the list as most of the time you are repeating the generated pattern an re-clicking the same colors, so I created this list that is refreshed 
let tempList = []
//this variable will be used to check whether or not a game has already started, just in case user accidentally presses a key again once they have already started a game.
let startGame = true

//Note that this is a recursive function
//Might need a function that resets the start time and changes flashing variable back to true once user messes up
function flashingTitle() {
    //code to execute on each iteration
    console.log("Iteration at " + new Date());
    $("#level-title").animate({ fontSize: "2.7rem" }).animate({ fontSize: "3rem" })
    setTimeout(() => {
        // Check the current time
        if (Date.now() < startTime + duration && flashing) {
            // Schedule the next iteration
            setTimeout(flashingTitle(), 100); // Execute every 100ms (adjust as needed)
        } else {
            console.log("Loop completed after 25 seconds.");
        }
    }, 790)
}

//list1 will be the generatedList and list2 will be either tempList or playerSelectedPattern since tempList will be keeping track of  the current selected pattern as the user tries to rememeber the pattern that was generated since we dont want to 
function patternsMatch(list1, list2) {
//checking if list1(generatedList) size is greater than zero becuase if it isnt, that means user is spam clicking the buttons after loosing, so return false to execute gameOver functionality
    if(list1.length > 0)
{
    for (var i = 0; i < list2.length; i++) {
        if (list1[i] != list2[i]) {
            return false
        }
    }
    return true
}
else{
    return false
}
}

function gameOver() {
    let gameoverSound = new Audio("./sounds/wrong.mp3")
    gameoverSound.play()
    $("body").addClass("gameover")
    setTimeout(() => {
        $("body").removeClass("gameover")
    }, 200)
    $("#level-title").text("Game Over, Press Any Key to Restart")
    flashing = true
    startGame = true
    generatedPattern = []
    playerSelectedPattern = []
    tempList = []
    //I ended up compromisng and setting the flashingTitle animation runtime really short to handle edge case where a user presses the buttons many times after losing and caused the flashing animation to take forever to end and interfere with the next new round
    startTime = Date.now()
    duration = 500
}

function generateSequence() {
    let colors = ["green", "red", "yellow", "blue"]
    let randomNum = Math.floor(Math.random() * 4)
    let randomColor = colors[randomNum]
    generatedPattern.push(randomColor)
    console.log("generatedPattern: " + generatedPattern)
    let sound = new Audio("./sounds/" + randomColor + ".mp3")
    //adding this setTimeout to enclose the code that creates the animation to make up for the little bit of lag when the flashing title animation ends
    setTimeout(() => {
        sound.play()
        $("#" + randomColor).addClass("pattern-animation")
        setTimeout(() => {
            $("#" + randomColor).removeClass("pattern-animation")
        }, 200)
    }, 600)
}

function pressedAnimation(color) {
    let colorSound = new Audio("./sounds/" + color + ".mp3")
    colorSound.play()
    $("#" + color).addClass("pressed")
    setTimeout(() => {
        $("#" + color).removeClass("pressed")
    }, 200)
}

function addHighscoreTitle() {
    $("h1").after("<h2 id=\"highscore\">Highscore: " + highScore + "</h2>")
}

$(document).keydown(() => {
    if (startGame) {
        flashing = false
        startGame = false
        $("#level-title").text("Level " + level)
        generateSequence()
    }
})

$(".btn").click((event) => {
    pressedAnimation(event.target.id)
    // console.log("tempList: " + tempList.length)
    //If tempList.length and level(equal to generatedPattern.length) - 1 are equal, that means that we have selected all the previously shown sequences and can now add it to the actual playerSelectedPattern list that checks if you selected the right color for the current new iteration, which is why if the user selected the correct new color, the level is incremented
    if (tempList.length === level - 1) {
        tempList = []
        //adding color player clicked to playerSelectedPattern list
        playerSelectedPattern.push(event.target.id)
        // console.log("playerSelectedPattern: " + playerSelectedPattern)
        if (patternsMatch(generatedPattern, playerSelectedPattern)) {
            level++
            // console.log(level)
            $("#level-title").text("Level " + level)
            generateSequence()
        }
        else { //Player messes up
            //running the gameOver function first to add the red background animation 
            gameOver()
            if (level - 1 > highScore) {
                highScore = level
                //added this setTimout here to give the gameOver animation a chance to finish before executing the code inside this setTimeout
                setTimeout(() => {
                    let recordHolder = prompt("New Record! Enter name:")
                    $("#highscore").text("Highscore: " + highScore + " " + recordHolder)
                    //put this setTimeout here to give user a chance to enter their name when the prompt pops up
                    setTimeout(() => {
                        flashingTitle()
                    }, 500)
                }, 400)
            }
            level = 1
            flashingTitle()
        }
    }
    else{//if you get here, means that player still has not clicked through all the previous patterns up to the one that had just played during this new iteration OR user is spam clicking buttons after loosing
        tempList.push(event.target.id)
        // console.log("tempList: " + tempList)
        //if patternsMatch is false here, it means that either player messed up and clicked the wrong pattern or player is spam clicking the buttons after loosing(edge case that is handled within patternsMatch function by returning flase)
        if(!patternsMatch(generatedPattern, tempList))
        {
            gameOver()
            if (level - 1 > highScore) {
                highScore = level
                //added this setTimout here to give the gameOver animation a chance to finish before executing the code inside this setTimeout
                setTimeout(() => {
                    let recordHolder = prompt("New Record! Enter name:")
                    $("#highscore").text("Highscore: " + highScore + " " + recordHolder)
                    //put this setTimeout here to give user a chance to enter their name when the prompt pops up
                    setTimeout(() => {
                        flashingTitle()
                    }, 500)
                }, 400)
            }
            level = 1
            flashingTitle()
        }
    }
})
addHighscoreTitle()
//called flashingTitle() here to allow the event handlers to be appplied to the selected element(s)
flashingTitle()
