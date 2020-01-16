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
const timeArr = [];
let timeStatus = false;
let time = 0;

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
let min = 0;
let hour = 0;
let sec = 0;

// Основная функция tick()
function tick() {
  sec += 1;
  if (sec >= 60) {
    // задаем числовые параметры, меняющиеся по ходу работы программы
    min += 1;
    sec -= 60;
  }
  if (min >= 60) {
    hour += 1;
    min -= 60;
  }
  if (sec < 10) {
    if (min < 10) {
      if (hour < 10) {
        $('.timer_text').replaceWith(`<span class = 'timer_text'>0${hour}:0${min}:0${sec}</span>`);
      } else {
        $('.timer_text').replaceWith(`<span class = 'timer_text'>${hour}:0${min}:0${sec}</span>`);
      }
    } else if (hour < 10) {
      $('.timer_text').replaceWith(`<span class = 'timer_text'>0${hour}:${min}:0${sec}</span>`);
    } else {
      $('.timer_text').replaceWith(`<span class = 'timer_text'>${hour}:${min}:0${sec}</span>`);
    }
  } else if (min < 10) {
    if (hour < 10) {
      $('.timer_text').replaceWith(`<span class = 'timer_text'>0${hour}:0${min}:${sec}</span>`);
    } else {
      $('.timer_text').replaceWith(`<span class = 'timer_text'>${hour}:0${min}:${sec}</span>`);
    }
  } else if (hour < 10) {
    $('.timer_text').replaceWith(`<span class = 'timer_text'>0${hour}:${min}:${sec}</span>`);
  } else {
    $('.timer_text').replaceWith(`<span class = 'timer_text'>${hour}:${min}:${sec}</span>`);
  }
}

function init() {
  sec = 0;
  setInterval(tick, 1000);
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
  alert('boom');
  clearTimeout(timer);
  $('.bomb-pic').addClass('shown');
  $('.cell').bind('click', () => false);

  $('body').append(
    "<div class = 'game-status'><span class = 'game-status_text'>Press New Game button to start a new game</span></div>",
  );
}

function timer() {
  if (timeStatus) {
    time += 1;
    $('.timer_text').replaceWith(`<span class = 'timer_text'>${time}</span>`);
    setTimeout(timer, 1000);
  }
}

function turn() {
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
          timeArr.push(time);
          alert('You win');
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
          revealCell(cellRow, cellCol);
          $('.bomb-pic').addClass('shown');
          $('.cell').bind('click', () => false);
          timeStatus = false;
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
    createField(9, 9, 10);
    checkpoint = true;
    timeStatus = true;
    turn();
  });
  $('#mediumLvl').click(() => {
    createField(13, 15, 40);
    timeStatus = true;
    checkpoint = true;
    turn();
  });
  $('#hardLvl').click(() => {
    createField(16, 30, 99);
    timeStatus = true;
    checkpoint = true;
    turn();
  });

  $('#showmines').click(() => {
    $('.bomb-pic').toggleClass('shown');
  });
  $('#newgame').click(() => {
    newGame();
    timeStatus = true;
    turn();
  });
});
