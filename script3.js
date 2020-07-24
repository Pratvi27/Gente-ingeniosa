//Helpers (from http://jaketrent.com/post/addremove-classes-raw-javascript/)
/*function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className);
  else 
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}
function addClass(el, className) {
  if (el.classList)
    el.classList.add(className);
  else if (!hasClass(el, className)) el.className += " " + className;
}
function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className);
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    el.className=el.className.replace(reg, ' ');
  }
}

/*
Helper function that takes the object returned from isTerminal() and adds a 
class to the board that will handle drawing the winning line's animation
*/
function drawWinningLine({ direction, row }) {
    let board = document.getElementById("board");
    board.className = `${direction}${row}`;
    setTimeout(() => { board.className += ' full'; }, 50);
}
const winning_msg = document.getElementById('winning-msg')
const restart_button = document.getElementById('restartButton')
restart_button.addEventListener('click',goback)
const winning_msg_text = document.querySelector('[data-winning-msg-text]')

function end_game(temp) {
  if (temp['winner']=='draw') {
    winning_msg_text.innerText = 'Draw!'
  } else {
      winning_msg_text.innerText = `${(document.getElementById("charachters").classList.contains('celebrate_human')) ? "You Won!" : "AI Wins!"} `
  }
  winning_msg.classList.add('show')
}

function goback()
{
  winning_msg.classList.remove('show');
}

//Starts a new game with a certain depth and a starting_player of 1 if human is going to start
function newGame(depth = -1, starting_player = 1) {
  var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
	var starting_player = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    //Instantiating a new player and an empty board
    let p = new Player(parseInt(depth));
    let b = new Board(['','','','','','','','','']);

    //Clearing all #Board classes and populating cells HTML
    let board = document.getElementById("board");
    board.className = '';
    board.innerHTML = '<div class="cell-0"></div><div class="cell-1"></div><div class="cell-2"></div><div class="cell-3"></div><div class="cell-4"></div><div class="cell-5"></div><div class="cell-6"></div><div class="cell-7"></div><div class="cell-8"></div>';
    
    //Clearing all celebrations classes
    document.getElementById("charachters").classList.remove('celebrate_human');
    document.getElementById("charachters").classList.remove('celebrate_robot');

    //Storing HTML cells in an array
    let html_cells = [...board.children];

    //Initializing some variables for internal use
    let starting = parseInt(starting_player),
        maximizing = starting,
        player_turn = starting;

    //If computer is going to start, choose a random cell as long as it is the center or a corner
    if(!starting) {
        let center_and_corners = [0,2,4,6,8];
        let first_choice = center_and_corners[Math.floor(Math.random()*center_and_corners.length)];
        let symbol = !starting ? 'x' : 'o';
        b.insert(symbol, first_choice);
        html_cells[first_choice].classList.add(symbol);
        player_turn = 1;  //Switch turns
    }

    //Adding Click event listener for each cell
    b.state.forEach((cell, index) => {
        html_cells[index].addEventListener('click', () => {
            //If cell is already occupied or the board is in a terminal state or it's not humans turn, return false
            if(html_cells[index].classList.contains('x') || html_cells[index].classList.contains('o') || b.isTerminal() || !player_turn) return false;

            let symbol = !player_turn ? 'x' : 'o'; 

            //Update the Board class instance as well as the Board UI
            b.insert(symbol, index);
            html_cells[index].classList.add(symbol);

            //If it's a terminal move and it's not a draw, then human won
            if(b.isTerminal()) {
                let { winner } = b.isTerminal();
                if(winner !== 'draw') document.getElementById("charachters").classList.add('celebrate_human');
                //drawWinningLine(b.isTerminal());
                end_game(b.isTerminal());
            }
            player_turn =!player_turn;  //Switch turns

            //Get computer's best move and update the UI
            p.getBestMove_negamax(player_turn,b, best => {
                let symbol = !player_turn ? 'x' : 'o';
                b.insert(symbol, best);
                html_cells[best].classList.add(symbol);
                if(b.isTerminal()) {
                    let { winner } = b.isTerminal();
                    if(winner !== 'draw') document.getElementById("charachters").classList.add('celebrate_robot');
                  //  drawWinningLine(b.isTerminal());
                    end_game(b.isTerminal());
                }
                player_turn = !player_turn;  //Switch turns
            });
        }, false);
        if(cell) html_cells[index].classList.add(cell);
    });
}

document.addEventListener("DOMContentLoaded", event => { 

    //Start a new game when page loads with default values
    let depth = -1;
    let starting_player = 1;
    newGame(depth, starting_player);


    //Events handlers for depth, starting player options
    document.getElementById("depth").addEventListener("click", (event) => {
        if(event.target.tagName !== "LI" || event.target.classList.contains('active')) return
        let depth_choices = [...document.getElementById("depth").children[0].children];
        depth_choices.forEach((choice) => {
        choice.classList.remove('active');
        });
        
        event.target.classList.add('active');
        depth = event.target.dataset.value;
        console.log(depth);
    }, false);

    document.getElementById("starting_player").addEventListener("click", (event) => {
        if(event.target.tagName !== "LI" || event.target.classList.contains('active')) return
        let starting_player_choices = [...document.getElementById("starting_player").children[0].children];
        starting_player_choices.forEach((choice) => {
            choice.classList.remove('active');
        });
        event.target.classList.add('active');
        starting_player = event.target.dataset.value;
        console.log(starting_player);
    }, false);

    document.getElementById("newgame").addEventListener('click', () => {
        newGame(depth, starting_player);
    });

});











class Board {
    //Initializing the board
    constructor(state = ['','','','','','','','','']) {
        this.state = state;
    }
    //Logs a visualised board with the current state to the console
    printFormattedBoard() {
        let formattedString = '';
        this.state.forEach((cell, index) => {
            formattedString += cell ? ` ${cell} |` : '   |';
            if((index + 1) % 3 == 0)  {
                formattedString = formattedString.slice(0,-1);
                if(index < 8) formattedString += '\n\u2015\u2015\u2015 \u2015\u2015\u2015 \u2015\u2015\u2015\n';
            }
        });
        console.log('%c' + formattedString, 'color: #6d4e42;font-size:16px');
    }
    //Checks if board has no symbols yet
    isEmpty() {
        return this.state.every(cell => !cell);
    }
    //Check if board has no spaces available
    isFull() {
        return this.state.every(cell => cell);
    }
    /**
     * Inserts a new symbol(x,o) into
     * @param {String} symbol 
     * @param {Number} position
     * @return {Boolean} boolean represent success of the operation
     */
    insert(symbol, position) {
        if(position > 8 || this.state[position]) return false; //Cell is either occupied or does not exist
        this.state[position] = symbol;
        return true;
    }
    //Returns an array containing available moves for the current state
    getAvailableMoves() {
        const moves = [];
        this.state.forEach((cell, index) => {
            if(!cell) moves.push(index); 
        });
        return moves;
    }
    /**
     * Checks if the board has a terminal state ie. a player wins or the board is full with no winner
     * @return {Object} an object containing the winner, direction of winning and row number
     */
    isTerminal() {
        //Return False if board in empty
        if(this.isEmpty()) return false;

        //Checking Horizontal Wins
        if(this.state[0] == this.state[1] && this.state[0] == this.state[2] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'H', 'row': 1};
        }
        if(this.state[3] == this.state[4] && this.state[3] == this.state[5] && this.state[3]) {
            return {'winner': this.state[3], 'direction': 'H', 'row': 2};
        }
        if(this.state[6] == this.state[7] && this.state[6] == this.state[8] && this.state[6]) {
            return {'winner': this.state[6], 'direction': 'H', 'row': 3};
        }

        //Checking Vertical Wins
        if(this.state[0] == this.state[3] && this.state[0] == this.state[6] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'V', 'row': 1};
        }
        if(this.state[1] == this.state[4] && this.state[1] == this.state[7] && this.state[1]) {
            return {'winner': this.state[1], 'direction': 'V', 'row': 2};
        }
        if(this.state[2] == this.state[5] && this.state[2] == this.state[8] && this.state[2]) {
            return {'winner': this.state[2], 'direction': 'V', 'row': 3};
        }

        //Checking Diagonal Wins
        if(this.state[0] == this.state[4] && this.state[0] == this.state[8] && this.state[0]) {
            return {'winner': this.state[0], 'direction': 'D', 'row': 1};
        }
        if(this.state[2] == this.state[4] && this.state[2] == this.state[6] && this.state[2]) {
            return {'winner': this.state[2], 'direction': 'D', 'row': 2};
        }

        //If no winner but the board is full, then it's a draw
        if(this.isFull()) {
            return {'winner': 'draw'};
        }
        
        //return false otherwise
        return false;
    }
}


class Player {
    constructor(max_depth = -1) {
      this.max_depth = max_depth;
      this.nodes_map = new Map();
    }

    getBestMove_negamax(pov, board, callback = () => {}, depth = 0,alpha=-Infinity,beta=Infinity) {
      if (board.constructor.name !== "Board") throw ('The second argument to the getBestMove method should be an instance of Board class.');
      if (depth == 0) this.nodes_map.clear();
      
      if (board.isTerminal() || depth == this.max_depth) {
        let curr_player=(pov>0)?'x':'o';
        let opponent=(pov>0)?'o':'x';
        if (board.isTerminal().winner == curr_player) {
          return 100 - depth;
        } else if (board.isTerminal().winner == opponent) {
          return -100 + depth;
        }
        return 0;
      }
      
        let best = -1000;
        //Loop through all empty cells
        board.getAvailableMoves().forEach(index => {
          //Initialize a new board with the current state (slice() is used to create a new array and not modify the original)
          let child = new Board(board.state.slice());
          if(pov>0)
            child.insert('x', index);
        else
            child.insert('o',index);

  
          //Recursively calling getBestMove this time with the new board and maximizing turn and incrementing the depth
          let node_value =-this.getBestMove_negamax(!pov,child, callback, depth + 1,-beta,-alpha);
          //Updating best value
          best = Math.max(best,node_value);
          alpha = Math.max(alpha, best);
          if (alpha >= beta) {
            return best;
          }
          
          //If it's the main function call, not a recursive one, map each heuristic value with it's moves indicies
          if (depth == 0) {
            //Comma seperated indicies if multiple moves have the same heuristic value
            var moves = this.nodes_map.has(node_value) ? this.nodes_map.get(node_value) + ',' + index : index;
            this.nodes_map.set(node_value, moves);
          }
          child.printFormattedBoard();
        });
        //If it's the main call, return the index of the best move or a random index if multiple indicies have the same value
        if (depth == 0) {
          let ret;
          if (typeof this.nodes_map.get(best) == 'string') {
            var arr = this.nodes_map.get(best).split(',');
            var rand = Math.floor(Math.random() * arr.length);
            ret = arr[rand];
          } else {
            ret = this.nodes_map.get(best);
          }
          //run a callback after calculation and return the index
          callback(ret);
          return ret;
        }
       
        //If not main call (recursive) return the heuristic value for next calculation
        return best;
      }
    
  }
  
