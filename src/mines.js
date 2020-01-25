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
let win;
let timerVar;
let amountOfFlags;
let amountOfMines;
let seconds = 0;
let minutes = 0;
let end;
let rows;
let columns;
let checkpoint = true;
let bombed = false;

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
  return parseInt($(this).attr('data-mined'), 2) === 1;
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
  amountOfFlags = mines_;
  rows = rows_;
  columns = columns_;
  amountOfMines = mines_;
  $('.flags').replaceWith(`<div class = "flags">Left flags: ${amountOfFlags}</div>`);
  for (let i = 0; i < rows; i += 1) {
    $('.board').append(`<div class = 'row row-${i}'></div>`);
    for (let j = 0; j < columns; j += 1) {
      $(`.row-${i}`).append(`<div class = "cell cell-not_opened" data-order = '${i}_${j}'></div>`);
    }
  }
  checkpoint = true;
  createMines();
}

function newGame() {
  $('.game-status').empty();
  createField(rows, columns, amountOfMines);
  checkpoint = true;
  $('#newgame').addClass('hidden');
  turn();
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
  bombed = true;
  $('.footer_btn').removeClass('hidden');
}

function turn() {
  seconds = 0;
  minutes = 0;
  bombed = false;
  clearInterval(timerVar);
  timerVar = setInterval(() => {
    seconds += 1;
    if (seconds >= 60) {
      minutes += 1;
      seconds = 0;
    }
    if (bombed) {
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
      win = false;

      seconds = 0;
      minutes = 0;
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
  $('.game-status').empty();
  $('.cell').on({
    rightclick() {
      console.log(amountOfFlags);
      if (checkpoint) {
        if (!$(this).hasClass('cell-opened')) {
          if ($(this).hasClass('flagged')) {
            $(this).removeClass('flagged');
            amountOfFlags += 1;
            $(this)
              .children('.flag-pic')
              .remove();
          } else if (amountOfFlags !== 0) {
            $(this).addClass('flagged');
            amountOfFlags -= 1;
            $(this).append(
              "<img src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flag_icon_orange_4.svg/250px-Flag_icon_orange_4.svg.png' class = 'flag-pic'></img>",
            );
          }
          $('.flags').replaceWith(`<div class = "flags">Left flags: ${amountOfFlags}</div>`);
        }
      }
    },
  });
  $('.cell').click(function () {
    end = false;
    if (checkpoint) {
      if ($(this).hasClass('cell-opened') || $(this).hasClass('flagged')) {
        console.log('no');
      } else if (checkIfHasMinesObject.call(this)) {
        checkpoint = false;
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
          $('.footer_btn').removeClass('hidden');
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
    createField(9, 9, 10);
    $('#newgame').addClass('hidden');
    turn();
  });
  $('#mediumLvl').click(() => {
    createField(13, 15, 40);
    $('#easyLvl').removeClass('active-field');
    $('#newgame').addClass('hidden');
    $('#hardLvl').removeClass('active-field');
    $('#mediumLvl').addClass('active-field');
    turn();
  });
  $('#hardLvl').click(() => {
    createField(16, 30, 99);

    $('#newgame').addClass('hidden');
    $('#easyLvl').removeClass('active-field');
    $('#mediumLvl').removeClass('active-field');
    $('#hardLvl').addClass('active-field');
    turn();
  });

  $('#showmines').click(() => {
    $('.bomb-pic').toggleClass('shown');
  });
  $('#newgame').click(() => {
    end = true;
    newGame();
  });
});
