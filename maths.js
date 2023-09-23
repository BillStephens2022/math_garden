let answer;
let score = 0;
let backgroundImages = [];
let message = "";
let rightWrong = "";
const messagePEl = document.getElementById("message-p");
const messageEl = document.getElementById("message");
const rightWrongEl = document.getElementById("right-wrong");

if (message.length === 0 && rightWrong === 0) {
  rightWrongEl.classList.add("hidden");
  messageEl.classList.add("hidden");
  messagePEl.classList.add("hidden");
}

function nextQuestion() {
  let n1 = Math.floor(Math.random() * 5);
  let n2 = Math.floor(Math.random() * 6);
  document.getElementById("n1").innerHTML = n1;
  document.getElementById("n2").innerHTML = n2;
  answer = n1 + n2;
}

function checkAnswer() {
  const prediction = predictImage();
  console.log(`answer: ${answer}, prediction: ${prediction}`);
  if (prediction === answer) {
    score++;
    if (score <= 6) {
      backgroundImages.push(`url('images/background${score}.svg')`);
      document.body.style.backgroundImage = backgroundImages;
      message = `Your score is: ${score}`;
      rightWrong = "Correct!  ";
      writeMessage(message, rightWrong);
    } else {
      rightWrong = "Well done!  ";
      message = "Your math garden is in full bloom! Want to start again?";
      writeMessage(message, rightWrong);
      score = 0;
      backgroundImages = [];
      document.body.style.backgroundImage = backgroundImages;
    }
  } else {
    if (score != 0) {
      score--;
    }
    rightWrong = "Oops!  ";
    message = `Check your calcs or write your answer more clearly! Score: ${score}`;
    writeMessage(message, rightWrong);
    setTimeout(function () {
      backgroundImages.pop();
      document.body.style.backgroundImage = backgroundImages;
    }, 1000);
  }
}

function writeMessage(message, rightWrong) {
  messagePEl.classList.remove("hidden");
  messageEl.classList.remove("hidden");
  rightWrongEl.classList.remove("hidden");
  rightWrongEl.innerHTML = rightWrong;
  messageEl.innerHTML = message;

  switch (rightWrong) {
    case "Oops!  ":
      rightWrongEl.classList.remove("blue");
      rightWrongEl.classList.remove("green");
      rightWrongEl.classList.add("red");
      break;
    case "Correct!  ":
      rightWrongEl.classList.remove("blue");
      rightWrongEl.classList.remove("red");
      rightWrongEl.classList.add("green");
      break;
    case "Well done!  ":
      rightWrongEl.classList.remove("green");
      rightWrongEl.classList.remove("red");
      rightWrongEl.classList.add("blue");
      break;
    default:
      break;
  }
}
