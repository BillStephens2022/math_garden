let answer;
let score = 0;

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
    console.log(`Correct!  Score: ${score}`);
  } else {
    if (score != 0) {
      score--;
    }

    console.log(`Wrong!  Score: ${score}`);
  }
}
