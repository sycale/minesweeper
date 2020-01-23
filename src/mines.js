import $ from 'jquery';

$.event.special.rightclick = {
  bindType: 'mousedown',
  delegateType: 'mousedown',
  handle(evt) {
    if (evt.button === 2) {
      const { handleObj } = evt;

      $(document).one('contextmenu', false);

      evt.type = handleObj.origType;
      const ret = handleObj.handler.apply(this, arguments);
      evt.type = handleObj.type;

      return ret;
    }
  },
};

let rows;
let columns;
let amountOfMines;
let checkpoint = true;

function remove(arr, value) {
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkIfHasMines(i1, i2) {
  if (parseInt($(`[data-order = "${i1}_${i2}"]`).attr('data-mined'), 2) === 1) {
    return true;
  }
  return false;
}
function checkIfHasMinesObject() {
  if (parseInt($(this).attr('data-mined'), 2) === 1) {
    return true;
  }
  return false;
}

function revealCell(row, coll) {
  $(`[data-order = '${row}_${coll}']`)
    .addClass('cell-opened')
    .removeClass('cell-not_opened');
  const mineCount = $(`[data-order = '${row}_${coll}']`).data('amount');
  if (mineCount > 0 && $(`[data-order = '${row}_${coll}']`).is(':empty')) {
    $(`[data-order = '${row}_${coll}']`).append(`<span class="counter">${mineCount}</span>`);
  }
}

function createMines() {
  for (let i = 0; i < amountOfMines; i += 1) {
    const randomX = getRandomInt(0, rows - 1);
    const randomY = getRandomInt(0, columns - 1);
    const status = checkIfHasMines(randomX, randomY);
    if (!status) {
      $(`[data-order = "${randomX}_${randomY}"]`)
        .attr('data-mined', 1)
        .append(
          "<img src = 'https://static.thenounproject.com/png/965385-200.png' class = 'bomb-pic'></img>",
        );
    } else {
      i -= 1;
      continue;
    }
  }
  for (let cellRow = 0; cellRow < rows; cellRow += 1) {
    for (let cellColl = 0; cellColl < columns; cellColl += 1) {
      let MineCounts = 0;
      for (let i = cellRow - 1; i < cellRow + 2; i += 1) {
        for (let j = cellColl - 1; j < cellColl + 2; j += 1) {
          if (checkIfHasMines(i, j)) {
            MineCounts += 1;
          }
        }
      }

      $(`[data-order = '${cellRow}_${cellColl}']`).attr('data-amount', MineCounts);
    }
  }
}

function createField(rows_, columns_, mines_) {
  $('.board').empty();
  rows = rows_;
  columns = columns_;
  amountOfMines = mines_;
  for (let i = 0; i < rows; i += 1) {
    $('.board').append(`<div class = 'row row-${i}'></div>`);
    for (let j = 0; j < columns; j += 1) {
      $(`.row-${i}`).append(`<div class = "cell cell-not_opened" data-order = '${i}_${j}'></div>`);
    }
  }
  createMines();
}

function newGame() {
  $('.game-status').empty();
  createField(rows, columns, amountOfMines);
  checkpoint = true;
}

function userWins() {
  let amountOfCellsOpened = 0;
  $('.cell').each(function () {
    if ($(this).hasClass('cell-opened')) {
      amountOfCellsOpened += 1;
    }
  });
  if (amountOfCellsOpened === rows * columns - amountOfMines) {
    return true;
  }
  return false;
}

function revealNeighbourCells(cellRow, cellCol) {
  $(`[data-order = '${cellRow}_${cellCol}]`).addClass('visited');
  if (cellRow === rows || cellCol === columns || cellRow < 0 || cellCol < 0) {
    return;
  }
  if ($(`[data-order = '${cellRow}_${cellCol}']`).data('amount') > 0) {
    revealCell(cellRow, cellCol);
    return;
  }
  if (!$(`[data-order = '${cellRow}_${cellCol}']`).hasClass('cell-opened')) {
    revealCell(cellRow, cellCol);
    revealNeighbourCells(cellRow - 1, cellCol);
    revealNeighbourCells(cellRow, cellCol - 1);
    revealNeighbourCells(cellRow, cellCol + 1);
    revealNeighbourCells(cellRow + 1, cellCol);
  }
}

function gameOver() {
  $('.bomb-pic').addClass('shown');
  $('.lose-alert').css('display', 'block');
  $('body').append(
    "<div class = 'game-status'><span class = 'game-status_text'>Press New Game button to start a new game</span></div>",
  );
}
let win;
let end;
function timer() {
  let seconds = 0;
  let minutes = 0;
  const timerVar = setInterval(() => {
    seconds += 1;
    if (seconds === 60) {
      minutes += 1;
      seconds = 0;
    }
    if (end) {
      clearInterval(timerVar);
    }
    if (win) {
      if (minutes > 10 && seconds > 10) {
        $('.win-time').append(`<span class = "attemptsBox">00:${minutes}:${seconds}</span>`);
      } else if (minutes < 10 && seconds < 10) {
        $('.win-time').append(`<span class = "attemptsBox">00:0${minutes}:0${seconds}</span>`);
      } else if (minutes < 10 && seconds > 10) {
        $('.win-time').append(`<span class = "attemptsBox">00:0${minutes}:${seconds}</span>`);
      } else if (minutes > 10 && seconds < 10) {
        $('.win-time').append(`<span class = "attemptsBox">00:${minutes}:0${seconds}</span>`);
      }
      clearInterval(timerVar);
    }
    
    if (seconds / 10 < 1 && minutes / 10 < 1) {
      $('.timer').replaceWith(
        `<div class = "timer" id = "storage"><span class = "timer_text">00:0${minutes}:0${seconds}</span></div> `,
      );
    } else if (seconds / 10 > 1 && minutes / 10 < 1) {
      $('.timer').replaceWith(
        `<div class = "timer" ><span class = "timer_text">00:0${minutes}:${seconds}</span></div> `,
      );
    } else if (minutes / 10 > 1 && seconds / 10 < 1) {
      $('.timer').replaceWith(
        `<div class = "timer"><span class = "timer_text">00:${minutes}:0${seconds}<span></div> `,
      );
    } else if (minutes / 10 === 1 && seconds / 10 === 1) {
      $('.timer').replaceWith(
        `<div class = "timer"><span class = "timer_text">00:${minutes}:${seconds}</span></div> `,
      );
    } else if (minutes / 10 === 1 && seconds / 10 < 1) {
      $('.timer').replaceWith(
        `<div class = "timer"><span class = "timer_text">00:${minutes}:0${seconds}</span></div> `,
      );
    } else if (minutes / 10 < 1 && seconds / 10 === 1) {
      $('.timer').replaceWith(
        `<div class = "timer"><span class = "timer_text">00:0${minutes}:${seconds}</span></div> `,
      );
    }
    
  }, 1000);
  timerVar;
}

function turn() {
  win = false;
  end = false;
  timer();
  $('.game-status').empty();
  $('.cell').on({
    rightclick() {
      if (!$(this).hasClass('cell-opened') && !$(this).hasClass('flagged')) {
        $(this).addClass('flagged');
        console.log(1);
        $(this).append(
          "<img src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flag_icon_orange_4.svg/250px-Flag_icon_orange_4.svg.png' class = 'flag-pic'></img>",
        );
      } else {
        console.log(2);
        $(this).removeClass('flagged');
        $('.timer').replaceWith(`<div class = "timer">00:${minutes}:0${seconds}</div> `);

        $(this)
          .children('.flag-pic')
          .remove();
      }
    },
  });
  $('.cell').click(function () {
    if (checkpoint) {
      if ($(this).hasClass('cell-opened') || $(this).hasClass('flagged')) {
        console.log('no');
      } else if (checkIfHasMinesObject.call(this)) {
        checkpoint = false;
        end = true;
        $(this).css('background-color', 'red');
        gameOver();
      } else {
        const cellRow = parseInt(
          $(this)
            .data('order')
            .split('_')[0],
        );
        const cellCol = parseInt(
          $(this)
            .data('order')
            .split('_')[1],
        );
        revealNeighbourCells(cellRow, cellCol);
        if (userWins()) {
          win = true;
          
          const cellRow = parseInt(
            $(this)
              .data('order')
              .split('_')[0],
          );
          const cellCol = parseInt(
            $(this)
              .data('order')
              .split('_')[1],
          );
          $('.bomb-pic').addClass('shown');
          $('.cell').bind('click', () => false);
          $('body').append(
            "<div class = 'game-status'><span class = 'game-status_text>Press New Game button to start a new game</span></div>'",
          );
        }
      }
    }
  });
}

$(document).ready(() => {
  $('#easyLvl').click(() => {
    $('#mediumLvl').removeClass('active-field');
    $('#hardLvl').removeClass('active-field');
    $('#easyLvl').addClass('active-field');
    createField(9, 9, 80);
    checkpoint = true;
    turn();
  });
  $('#mediumLvl').click(() => {
    createField(13, 15, 40);
    $('#easyLvl').removeClass('active-field');
    $('#hardLvl').removeClass('active-field');
    $('#mediumLvl').addClass('active-field');
    checkpoint = true;
    turn();
  });
  $('#hardLvl').click(() => {
    createField(16, 30, 99);
    $('#easyLvl').removeClass('active-field');
    $('#mediumLvl').removeClass('active-field');
    $('#hardLvl').addClass('active-field');

    checkpoint = true;
    turn();
  });

  $('#showmines').click(() => {
    $('.bomb-pic').toggleClass('shown');
  });
  $('#newgame').click(() => {
    newGame();
    
    turn();
  });
});
