(function($) {
  var db = null;
  var dbConfig = {};

  // Get config from webtask
  fetch(
    "https://wt-3bbaa7e0cd2df314ae5dfe478e626c92-0.sandbox.auth0-extend.com/firebaseconnect"
  ).then(function(res) {
    res.json().then(function(data) {
      dbConfig = data.config;
      firebase.initializeApp(dbConfig);
      db = firebase.firestore();
    });
  });

  // Get game words
  var word = {};
  fetch("assets/text/dictionary.json").then(function(res) {
    res.json().then(function(data) {
      word = data;
      dictionarySize = Object.keys(word).length;
    });
  });

  // Get game elements
  var boardgame = $("#gameboard");
  var boardgameStats = $("#gameboard .game-stats");
  var boardgameWord = $("#gameboard .game-word");
  var boardgameEffects = $("#gameboard .game-effects");
  var boardgameWordDesc = $("#gameboard .game-word-description");
  var boardgameType = $("#gameboard .game-typing");
  var boardgameMessages = $("#gameboard .game-messages");
  var boardgameStars = $("#gameboard .game-stars");

  var gameStarted = false;
  var dictionarySize = 0;
  var currentWord = "";
  var currentDesc = "";
  var currentWordLength = 0;
  var currentCharacter = 0;
  var currentBonus = 0;
  var streak = 0;

  var gameOverStatus = false;
  var timerInterval = null;
  var score = 0;
  var wordCount = 0;

  // Difficulty
  var difficulty = "easy";
  var timer = 45;
  var dPenalty = 0;
  var dMultiplier = 0;
  var dBonus = 0;
  var dTimefreeze = 0;
  var dStreak = 0;

  // Superpowers
  var superPowerFreeze = false;
  var superPowerDouble = false;

  // Game dialogs
  var dialogStartGame = $("#dialog-start")[0];
  var dialogGameOver = $("#dialog-game-over")[0];
  var dialogScoreboard = $("#dialog-scoreboard")[0];
  dialogPolyfill.registerDialog(dialogStartGame);
  dialogPolyfill.registerDialog(dialogGameOver);
  dialogPolyfill.registerDialog(dialogScoreboard);

  dialogStartGame.showModal();

  $(".difficulty-btn").on("click", function() {
    $("#dialog-start")[0].close();
    difficulty = $(this).attr("difficulty");
    chooseDifficulty(difficulty);
    startGame();
  });

  function chooseDifficulty(d) {
    switch (d) {
      case "easy":
        timer = 45;
        dPenalty = 15;
        dMultiplier = 2;
        dBonus = 3;
        dTimefreeze = 5000;
        dStreak = 5;
        break;

      case "average":
        timer = 30;
        dPenalty = 20;
        dMultiplier = 4;
        dBonus = 2;
        dTimefreeze = 3000;
        dStreak = 7;
        break;

      case "insane":
        timer = 15;
        dPenalty = 30;
        dMultiplier = 8;
        dBonus = 1.5;
        dTimefreeze = 5;
        dStreak = 1500;
        break;
    }
  }

  function startGame() {
    // Get initial word and description
    startTimer();
    getNextWord();
    initializeStats();
  }

  // On keypress
  $("body").on("keypress", function(eve) {
    character = eve.key;
    charCode = eve.keyCode;

    if (
      (charCode > 64 && charCode < 91) ||
      (charCode > 96 && charCode < 123) ||
      charCode == 8 ||
      charCode == 32 ||
      charCode == 45
    ) {
      gameKeyPress(character);
    }
  });

  function startTimer() {
    timerInterval = setInterval(function() {
      // Freeze time superpower
      if (superPowerFreeze == false) {
        timer--;
      }

      skyStatus();
      if (timer > 0) {
        updateStats();
      } else {
        timer = 0;
        gameOver();
        return;
      }
    }, 1000);
  }

  function initializeStats() {
    boardgameStats.append(
      '<div class="stat"><span class="timer">' + timer + "</span> seconds</div>"
    );
    boardgameStats.append(
      '<div class="stat"><span class="score">' + score + "</span></div>"
    );
    boardgameStats.append(
      '<div class="stat"><span class="words">' + wordCount + "</span></div>"
    );
  }
  function updateStats() {
    boardgameStats.find(".timer").text(timer);
    boardgameStats.find(".score").text(score);
    boardgameStats.find(".words").text(wordCount);
  }

  function getNextWord() {
    var number = Math.floor(Math.random() * dictionarySize);
    boardgameType.html("");
    currentCharacter = 0;

    //currentWord = Object.keys(word)[number];
    currentWord = Object.keys(word)[number];
    words = Object.keys(word).map(function(number) {
      return word[number];
    });
    currentDesc = words[number];

    prepareGameBoard();
  }

  function prepareGameBoard() {
    // Check current word length
    wordLength = currentWord.length;
    currentWordLength = currentWord.length;
    currentBonus = parseInt(wordLength / dMultiplier);

    // Double points superpower
    if (superPowerDouble == true) {
      currentBonus = parseInt(wordLength * dBonus);
    }

    i = 0;

    // Show current word on board
    boardgameWord.html('<div class="current-word">' + currentWord + "</div>");
    boardgameWordDesc.html(
      '<div class="current-word-desc">' + currentDesc + "</div>"
    );

    // Create input boxes for each letter
    while (wordLength > 0) {
      boardgameType.append(
        '<div class="text-input"><input type="text" character="' +
          i +
          '" disabled value="" /></div>'
      );
      wordLength--;
      i++;
    }
  }

  function gameKeyPress(x) {
    if (timer > 0) {
      var compareCharacter = currentWord.charAt(currentCharacter).toLowerCase();
      if (x == compareCharacter) {
        goodPress();
      } else {
        badPress();
      }
    }
  }

  function goodPress() {
    $('.text-input input[character="' + currentCharacter + '"]')
      .val(currentWord.charAt(currentCharacter))
      .addClass("good");
    currentCharacter++;
    if (currentCharacter == currentWordLength) {
      message("good", "Nice! +" + currentBonus + "s</p>");
      finishWord();
    }
  }

  function badPress() {
    $('.text-input input[character="' + currentCharacter + '"]')
      .val(currentWord.charAt(currentCharacter))
      .addClass("bad");
    timer = timer - dPenalty;
    streak = 0;
    boardgameStars.html("");
    updateStats();
    removeSuperPowers();
    skyStatus();
    message("bad", "-" + dPenalty + "s");
    getNextWord();
  }

  function finishWord() {
    // Add bonus time
    timer += currentBonus;
    streak++;
    addStreakStar();

    // Double points superpower
    if (superPowerDouble == true) {
      score += currentBonus * 200;
    } else {
      score += currentBonus * 100;
    }

    currentCharacter = 0;
    wordCount++;
    boardgameWord.fadeIn();
    skyStatus();
    updateStats();
    getNextWord();
  }

  function gameOver() {
    timer = 0;
    updateStats();
    if (gameOverStatus == false) {
      boardgameType.hide();
      boardgameMessages.hide();
      boardgameStars.hide();
      boardgameStats.hide();
      boardgameWord.hide();
      boardgameWordDesc.hide();
      gameOverStatus = true;
      boardgameMessages.html("");
      $(".scoreboard-score").text(score);
      if (score == 0) {
        $(".scoreboard-button").hide();
      } else {
        $(".scoreboard-button").show();
      }
      dialogGameOver.showModal();
    }
  }

  function message(status, message) {
    boardgameMessages.html(
      '<div class="message ' + status + '">' + message + "</div>"
    );
    boardgameMessages.find(".message").fadeIn();
  }

  function skyStatus() {
    if (timer <= 80) {
      $("body").css("background-color", "#46aaff");
    }
    if (timer <= 60) {
      $("body").css("background-color", "#99b7d0");
    }
    if (timer <= 40) {
      $("body").css("background-color", "#ffad16");
    }
    if (timer <= 20) {
      $("body").css("background-color", "#fd5e22");
    }
    if (timer <= 10) {
      $("body").css("background-color", "#ef3434");
    }
  }

  function addStreakStar() {
    if (streak == dStreak) {
      streak = 0;
      boardgameStars.html("");
      explode();
      addSuperPower();
    } else {
      boardgameStars.append('<div class="streak-star"></div>');
    }
  }

  function superPowerFreezePower() {
    console.log('freeze')
    boardgameStats.find(".stat").first().addClass("frozen");
    superPowerFreeze = true;
    setTimeout(function() {
      removeSuperPowers();
    }, dTimefreeze);
  }

  function superPowerDoublePower() {
    superPowerDouble = true;
    setTimeout(function() {
      removeSuperPowers();
    }, dTimefreeze);
  }

  function addSuperPower() {
    if (superPowerFreeze == false && superPowerDouble == false) {
      powerNr = Math.floor(Math.random() * 2) + 1;
      removeSuperPowers();
      switch (powerNr) {
        case 1:
          superPowerFreezePower();
          sprpwr = $('<div class="superpower">Time frozen!</div>');
          boardgameMessages.prepend(sprpwr);
          break;

        case 2:
          sprpwr = $('<div class="superpower">Double points!</div>');
          boardgameMessages.prepend(sprpwr);
          superPowerDoublePower();
          break;
      }
    }
  }

  function removeSuperPowers() {
    $(".superpower").remove();
    boardgameStats.find(".stat").removeClass("frozen");
    superPowerFreeze = false;
    superPowerDouble = false;
  }

  $(".scoreboard-button").on("click", function() {
    dialogGameOver.close();
    dialogScoreboard.showModal();

    // Scoreboard
    db
      .collection("scoreboard")
      .orderBy("score", "desc")
      .onSnapshot(function(querySnapshot) {
        var scores = [];
        var i = 0;
        var n = 0;
        querySnapshot.forEach(function(doc) {
          scores.push(doc.data());
        });
        $("#scoreboard").html("");
        while (i < scores.length) {
          entry = scores[i];
          i++;
          if (difficulty == entry.difficulty) {
            n++;
            $("#scoreboard").append(
              '<div class="score"><span class="score-user">' +
                n +
                ". " +
                entry.user +
                '</span><span class="score-difficulty">' +
                entry.difficulty +
                '</span><span class="score-score">' +
                entry.score +
                "</span></div>"
            );
          }
        }
      });
  });

  function explode() {
    var particles = 25;
    explosion = $('<div class="explosion"></div>');

    // put the explosion container into the body to be able to get it's size
    boardgameEffects.prepend(explosion);

    for (var i = 0; i < particles; i++) {
      // positioning x,y of the particle on the circle (little randomized radius)
      var x =
          explosion.width() / 2 +
          rand(80, 250) *
            Math.cos(2 * Math.PI * i / rand(particles - 10, particles + 10)),
        y =
          explosion.height() / 2 +
          rand(20, 250) *
            Math.sin(2 * Math.PI * i / rand(particles - 10, particles + 10)),
        // particle element creation (could be anything other than div)
        elm = $(
          '<div class="particle" style="' +
            "top: " +
            y +
            "px; " +
            "left: " +
            x +
            'px"></div>'
        );

      if (i == 0) {
        // no need to add the listener on all generated elements
        // css3 animation end detection
        elm.one(
          "webkitAnimationEnd oanimationend msAnimationEnd animationend",
          function(e) {
            explosion.remove(); // remove this explosion container when animation ended
          }
        );
      }
      explosion.append(elm);
    }
  }

  // get random number between min and max value
  function rand(min, max) {
    return Math.floor(Math.random() * (max + 1)) + min;
  }

  $(".save-score").on("click", function() {
    addScore();
  });

  function addScore() {
    user = $('input[name="user"]').val();
    user = user.replace(/(<([^>]+)>)/gi, "");
    score = parseInt($("#dialog-game-over .scoreboard-score").text());

    if (user != "" && score != 0) {
      $("#scoreboard").css("height", "380px");
      $(".add-score-form").remove();
      db.collection("scoreboard").add({
        user: user,
        score: score,
        difficulty: difficulty
      });
    }
  }
})(jQuery);
