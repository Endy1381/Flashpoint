document.addEventListener('DOMContentLoaded', function() {
  // Global variables
  let p1 = "", p2 = "", p3 = "", p4 = "", p5 = "", p6 = "";
  let Questionmaker = parseInt(localStorage.getItem("QuestionMaker"), 10) || 1;
  let players = JSON.parse(localStorage.getItem("player")) || [];

  // ===== MAIN PAGE FUNCTIONALITY =====
  const setPlayersBtn = document.getElementById('setPlayersBtn');
  if (setPlayersBtn) {
    setPlayersBtn.addEventListener('click', function() {
      p1 = document.getElementById("player1").value || "Player1";
      p2 = document.getElementById("player2").value || "Player2";
      p3 = document.getElementById("player3").value || "Player3";
      p4 = document.getElementById("player4").value || "Player4";
      
      p5 = document.getElementById("player5").value || "Player5";
      p6 = document.getElementById("player6").value || "Player6";
      
      players = [
        [p1,1,0], [p2,2,0], [p3,3,0],
        [p4,4,0], [p5,5,0], [p6,6,0]
      ];
      
      // Reset game state for new game
      Questionmaker = 1;
      localStorage.setItem("player", JSON.stringify(players));
      localStorage.setItem("QuestionMaker", Questionmaker.toString());
      window.location = 'question.html';
    });
  }

  const goToAppBtn = document.getElementById('goToAppBtn');
  if (goToAppBtn) {
    goToAppBtn.addEventListener('click', function() {
      // If players aren't set, initialize with default names
      if (players.length === 0) {
        players = [
          ["Player1",1,0], ["Player2",2,0], ["Player3",3,0],
          ["Player4",4,0], ["Player5",5,0], ["Player6",6,0]
        ];
        // Reset game state for new game
        Questionmaker = 1;
        localStorage.setItem("player", JSON.stringify(players));
        localStorage.setItem("QuestionMaker", Questionmaker.toString());
      }
      window.location = 'question.html';
    });
  }

  // ===== QUESTION PAGE FUNCTIONALITY =====
  if (document.getElementById("playerturn")) {
    // Find the actual player object
    const creator = players.find(p => p[1] === Questionmaker);
    
    // Use the player's actual name if found
    if (creator) {
      document.getElementById("playerturn").textContent = creator[0];
    } else {
      // Fallback to player number if not found
      document.getElementById("playerturn").textContent = `Player ${Questionmaker}`;
    }

    window.setQuestion = function() {
      const deck = [];
      for (let i = 1; i <= 5; i++) {
        const qEl = document.getElementById(`question${i}`);
        const aEl = document.getElementById(`answer${i}`);
        const q = qEl ? qEl.value.trim() : "";
        const a = aEl ? aEl.value.trim() : "";
        const target = ((Questionmaker + i - 1) % players.length) + 1;
        deck.push({ q, a, target });
      }
      localStorage.setItem("deck", JSON.stringify(deck));
      window.location = 'flashcard.html';
    };
  }

  // ===== FLASHCARD PAGE FUNCTIONALITY =====
  if (document.getElementById("question-area")) {
    // Redirect if no deck exists
    if (!localStorage.getItem("deck")) {
      window.location = 'question.html';
      return;
    }
    
    const deck = JSON.parse(localStorage.getItem("deck"));
    let idx = 0;

    const turnEl   = document.getElementById("turn-player");
    const qaEl     = document.getElementById("question-area");
    const cdEl     = document.getElementById("countdown");
    const doneBtn  = document.getElementById("done-btn");
    const revealEl = document.getElementById("reveal");
    let timerInterval;

    function startTimer(onExpire) {
      let countdown = 30;
      cdEl.textContent = `Time: ${countdown}`;
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        countdown--;
        cdEl.textContent = `Time: ${countdown}`;
        if (countdown <= 0) {
          clearInterval(timerInterval);
          onExpire();
        }
      }, 1000);
    }

    function showCard() {
      if (idx >= deck.length) return endRound();
      
      const card = deck[idx];
      const targetPlayer = players.find(p => p[1] === card.target);
      turnEl.textContent = targetPlayer
        ? `${targetPlayer[0]}, your turn!`
        : `Player ${card.target}, your turn!`;

      qaEl.innerHTML = `<h2>${card.q}</h2>`;
      revealEl.textContent = "";
      doneBtn.style.display = "block";
      
      startTimer(() => {
        revealEl.textContent = `Time's up! Answer: ${card.a}`;
        doneBtn.style.display = "none";
        setTimeout(nextCard, 2000);
      });
    }

    doneBtn.onclick = () => {
      clearInterval(timerInterval);
      const card = deck[idx];
      revealEl.textContent = `Answer: ${card.a}`;
      const pl = players.find(p => p[1] === card.target);
      if (pl) pl[2]++;
      localStorage.setItem("player", JSON.stringify(players));
      doneBtn.style.display = "none";
      setTimeout(nextCard, 2000);
    };

    function nextCard() {
      idx++;
      showCard();
    }

    function endRound() {
      Questionmaker++;
      localStorage.setItem("QuestionMaker", Questionmaker.toString());
      localStorage.removeItem("deck");

      // Check if all rounds are completed
      if (Questionmaker > players.length) {
        window.location.href = 'leaderboard.html';
      } else {
        window.location.href = 'question.html';
      }
    }

    showCard();
  }

  // ===== LEADERBOARD PAGE FUNCTIONALITY =====
  if (document.getElementById("leaderboard")) {
    // Redirect if game isn't finished
    if (Questionmaker <= players.length) {
      window.location = 'question.html';
      return;
    }
    
    const list = document.getElementById("leaderboard");
    players.sort((a, b) => b[2] - a[2]);
    
    players.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p[0]} — ${p[2]} points`;
      if (p[2] === players[0][2]) li.style.fontWeight = 'bold';
      list.appendChild(li);
    });

    const resetBtn = document.getElementById("play-again-btn");
    if (resetBtn) {
      resetBtn.onclick = () => {
        localStorage.clear();
        window.location = 'main.html';
      };
    }
  }
});