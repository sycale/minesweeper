import $ from 'jquery';

let rows;
let columns;
let amountOfMines;

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

function createMines() {
  for (let i = 0; i < amountOfMines; i += 1) {
    const randomX = getRandomInt(0, rows - 1);
    const randomY = getRandomInt(0, columns - 1);
    const status = checkIfHasMines(randomX, randomY);
    if (!status) {
      $(`[data-order = "${randomX}_${randomY}"]`).attr('data-mined', 1);
    } else {
      i -= 1;
      continue;
    }
  }
}

function createField() {
  const difficulty = prompt('Choose difficulty(easy, medium, hard): ');
  if (difficulty === 'easy') {
    rows = 9;
    columns = 9;
    amountOfMines = 10;
  } else if (difficulty === 'medium') {
    rows = 16;
    columns = 16;
    amountOfMines = 40;
  } else if (difficulty === 'hard') {
    rows = 16;
    columns = 30;
    amountOfMines = 99;
  }
  for (let i = 0; i < rows; i += 1) {
    $('.board').append(`<div class = 'row row-${i}'></div>`);
    for (let j = 0; j < columns; j += 1) {
      $(`.row-${i}`).append(`<div class = "cell cell-not_opened" data-order = '${i}_${j}'></div>`);
    }
  }
  createMines();
}

function checkZero(cellRow, cellCol) {
  if ($(`[data-order = '${cellRow}_${cellCol}']`).data('amount') > 0) {
    $(`[data-order = '${cellRow}_${cellCol}']`).addClass('cell-opened');
    $(`[data-order = '${cellRow}_${cellCol}']`).removeClass('cell-not_opened');
    return;
  }
  const arr = [
    [cellRow + '_'+ cellCol],
    [(cellRow - 1) + '_' +cellCol],
    [cellRow+ '_' (cellCol - 1)],
    [cellRow + '_' +(cellCol + 1)],
    [(cellRow + 1) + '_' +cellCol],
  ];
  arr.each(() => {
    if($(`[]`))
  });
}

function gameOver() {
  alert('boom');

  $('[data-mined = "1"]').addClass('shown');
}

function newGame() {
  $('.cell').each(function () {
    $(this)
      .attr('data-mined', 0)
      .empty()
      .removeClass('cell-opened')
      .addClass('cell-not_opened')
      .attr('data-mined', 0)
      .removeClass('shown');
  });
  createMines();
}

function turn() {
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
  let MineCounts = 0;
  for (let i = cellRow - 1; i < cellRow + 2; i += 1) {
    for (let j = cellCol - 1; j < cellCol + 2; j += 1) {
      if (checkIfHasMines(i, j)) {
        MineCounts += 1;
      }
    }
  }
  $(this).attr('data-amount', MineCounts);
  if (MineCounts === 0) {
    $(this).addClass('cell-opened');
    $(this).removeClass('cell-not_opened');
  } else {
    $(this)
      .append(`<span class="counter">${MineCounts}</span>`)
      .addClass('cell-opened')
      .removeClass('cell-not_opened');
  }
}

$(document).ready(() => {
  createField();
  $('.cell').click(function () {
    if ($(this).hasClass('cell-opened')) {
      alert("You've already placed there");
    } else if (checkIfHasMinesObject.call(this)) {
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
      turn.call(this);
      checkZero(cellRow, cellCol);
    }
  });
  $('#showmines').click(() => {
    $('[data-mined = "1"]').toggleClass('shown');
  });
  $('#newgame').click(() => {
    newGame();
  });
});
