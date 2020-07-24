const x_class='x'
const o_class='o'
const cell_elements=document.querySelectorAll('[data-cell]')
const index = document.getElementById('index')
const winning_combinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
const winning_msg = document.getElementById('winning-msg')
const restart_button = document.getElementById('restartButton')
const winning_msg_text = document.querySelector('[data-winning-msg-text]')
let o_turn

game()
restart_button.addEventListener('click',game)

function game(){
    o_turn=false
    cell_elements.forEach(cell=>{
        cell.classList.remove(x_class)
        cell.classList.remove(o_class)
        cell.removeEventListener('click', handleClick)
        cell.addEventListener('click',handleClick,{once:true})
    })
    set_hover()
    winning_msg.classList.remove('show')
}

function handleClick(e){
    const cell=e.target
    const current_class = o_turn ? o_class: x_class
    //place_mark
    place_mark(cell,current_class)
    //check_for_win
    if(check_win(current_class)){
        end_game(false)
    }
    //check_for_draw
    else if(is_draw()){
        end_game(true)
    }else{
        //switch_player
        swap_turn()
        //show hover of current player's mark
        set_hover()
    } 
}

function place_mark(cell,current_class){
    cell.classList.add(current_class)
}

function swap_turn(){
    o_turn=!o_turn
}

function set_hover(){
    //'index' and not 'cell' : To hover the current_class over entire board
    index.classList.remove(x_class)
    index.classList.remove(o_class)
    if(o_turn){
        index.classList.add(o_class)
    }else{
        index.classList.add(x_class)
    }
}

function check_win(current_class){
    //returns true if any of the winning combination situation matches
    return winning_combinations.some(combination=>{
        //checking if each cell has same class
        return combination.every(ind=>{
            return cell_elements[ind].classList.contains(current_class)
        })
    })
}

function end_game(draw) {
    if (draw) {
      winning_msg_text.innerText = 'Draw!'
    } else {
        winning_msg_text.innerText = `${o_turn ? "O's" : "X's"} Win!`
    }
    winning_msg.classList.add('show')
  }
  
function is_draw() {
    return [...cell_elements].every(cell => {
      return cell.classList.contains(x_class) || cell.classList.contains(o_class)
    })
  }