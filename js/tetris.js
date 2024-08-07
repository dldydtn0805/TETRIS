import BLOCKS from "./blocks.js";

//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const comboDisplay = document.querySelector(".combo");
const restartButton = document.querySelector(".game-text > button");
//SETTING

const GAME_ROWS = 20;
const GAME_COLS = 10;

// VARIABLES

let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;
let comboCount = 0;

const movingItem = {
  type: "",
  direction: 0,
  top: 0,
  left: 3,
};

init();

//FUNCTIONS
function init() {
  tempMovingItem = { ...movingItem };
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
  generateNewBlock();
}

function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}

function renderBlocks(moveType = "") {
  const { type, direction, top, left } = tempMovingItem;
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove(type, "moving");
  });
  BLOCKS[type][direction].some((block) => {
    const x = block[0] + left;
    const y = block[1] + top;
    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null;
    const isAvailable = checkEmpty(target);
    if (isAvailable) {
      target.classList.add(type, "moving");
    } else {
      tempMovingItem = { ...movingItem };
      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameoverText();
      }
      // 무한 루프 방지를 위해 setTimeout()을 사용해 잠시 콜스택 영역으로 내보낸다
      setTimeout(() => {
        renderBlocks("retry");
        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}

function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}

function checkEmpty(target) {
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}

function seizeBlock() {
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moving) => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
  });
  if (checkMatch()) {
    comboCount++;
  } else {
    comboCount = 0;
  }
  comboDisplay.innerText = comboCount;
  generateNewBlock();
}

function checkMatch() {
  const childNodes = playground.childNodes;
  let flag = false;
  childNodes.forEach((child) => {
    let matched = true;
    child.children[0].childNodes.forEach((li) => {
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    });
    if (matched) {
      flag = true;
      child.remove();
      prependNewLine();
      let addToScore = comboCount === 0 ? 100 : 100 * comboCount ** 2;
      score += addToScore;
      scoreDisplay.innerText = score;
    }
  });
  if (flag) {
    return true;
  } else {
    return false;
  }
}

function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);
  movingItem.type = blockArray[randomIndex][0];
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };
  renderBlocks();
}

function changeDirection() {
  tempMovingItem.direction = (tempMovingItem.direction + 1) % 4;
  renderBlocks();
}

function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 10);
}

function showGameoverText() {
  gameText.style.display = "flex";
}
// EVENT HANDLING

document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      changeDirection();
      break;
    case 32:
      dropBlock();
      break;
    default:
      break;
  }
});

restartButton.addEventListener("click", () => {
  comboDisplay.innerText = 0;
  scoreDisplay.innerText = 0;
  playground.innerHTML = "";
  gameText.style.display = "none";
  init();
});
