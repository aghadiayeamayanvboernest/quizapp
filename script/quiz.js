
let questions = [];
let currentQuestionIndex = 0;
let timer;
let timeLeft = 10;
let quizSettings = {};
let userAnswers = [];

async function startQuiz() {
  quizSettings = {
    subject: document.getElementById('subject').value,
    level: document.getElementById('level').value
  };

  try {
    const res = await fetch('https://b2d86y5ku5.execute-api.eu-north-1.amazonaws.com/quizapp', {
      method: 'POST',
      body: JSON.stringify(quizSettings),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Fetch response status:', res.status);

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    questions = await res.json();
    console.log('Questions:', questions);
  

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions returned from the API.');
    }

    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';

    document.getElementById('subjectInfo').textContent = 
      `${quizSettings.subject} (${quizSettings.level})`;

    currentQuestionIndex = 0;
    userAnswers = [];
    showQuestion();
    
  } catch (error) {
    alert('Error starting quiz: ' + error.message);
    console.error('Quiz start error:', error);
  }
}



function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }

  const progress = (currentQuestionIndex / questions.length) * 100;
  document.getElementById('progress').style.width = `${progress}%`;

  const currentQuestion = questions[currentQuestionIndex];
  document.getElementById('questionBox').textContent = 
    `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

  const optionsBox = document.getElementById('optionsBox');
  optionsBox.innerHTML = '';

  currentQuestion.options.forEach((option, index) => {
    const optionBtn = document.createElement('button');
    optionBtn.className = 'option-btn';
    optionBtn.textContent = option;
    optionBtn.onclick = () => selectOption(index);
    optionsBox.appendChild(optionBtn);
  });

  resetTimer();
}

function selectOption(selectedIndex) {
  userAnswers.push(selectedIndex);
  nextQuestion();
}

function nextQuestion() {
  currentQuestionIndex++;
  showQuestion();
}

function resetTimer() {
  timeLeft = 15;
  document.getElementById('time').textContent = timeLeft;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('time').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      userAnswers.push(null); // User skipped the question
      nextQuestion();
    }
  }, 1000);
}

function endQuiz() {
  clearInterval(timer);
  document.getElementById('quizScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display = 'block';

  const resultBox = document.getElementById('resultBox');
  resultBox.innerHTML = '';

  let score = 0;

  questions.forEach((q, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === q.answer;
    if (isCorrect) score++;

    const questionResult = document.createElement('div');
    questionResult.style.marginBottom = '2rem';
    questionResult.style.marginTop = '2rem';
    questionResult.innerHTML = `
      <h3>Q${index + 1}: ${q.question}</h3>
      <p><strong>Your answer:</strong> ${userAnswer !== null ? q.options[userAnswer] : '<em>Skipped</em>'}</p>
      <p><strong>Correct answer:</strong> ${q.options[q.answer]}</p>
      <p style="color: ${isCorrect ? 'green' : 'red'};"><strong>${isCorrect ? 'Correct ✅' : 'Incorrect ❌'}</strong></p>
      <p><strong>Explanation:</strong> ${q.explanation}</p>
      <hr />
    `;
    resultBox.appendChild(questionResult);
  });

  const scoreSummary = document.createElement('div');
  scoreSummary.innerHTML = `<h2>Your Score: ${score} / ${questions.length}</h2>`;
  resultBox.prepend(scoreSummary);
}

function restartQuiz() {
  document.getElementById('resultScreen').style.display = 'none';
  document.getElementById('startScreen').style.display = 'block';
}

// Simple navigation between screens
function showStartScreen() {
  document.getElementById('welcomeScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
}

