let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let userAnswers = [];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const restartBtn = document.getElementById('restart-btn');
const reviewBtn = document.getElementById('review-btn');
const questionImage = document.getElementById('question-image');
const optionsContainer = document.getElementById('options-container');
const questionCounter = document.getElementById('question-counter');
const scoreCounter = document.getElementById('score-counter');
const progressBar = document.getElementById('progress-bar');
const finalScore = document.getElementById('final-score');
const finalTotal = document.getElementById('final-total');
const resultMessage = document.getElementById('result-message');
const reviewContainer = document.getElementById('review-container');
const reviewList = document.getElementById('review-list');

// Initialize
function init() {
    questions = typeof quizData !== 'undefined' ? quizData : [];
    
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', handleNextQuestion);
    prevBtn.addEventListener('click', handlePrevQuestion);
    restartBtn.addEventListener('click', resetQuiz);
    reviewBtn.addEventListener('click', showReview);
    
    // Update total questions on start screen if loaded
    if(questions.length > 0) {
        document.querySelector('#start-screen p').textContent = `يحتوي الاختبار على جميع أسئلة المذكرة (${questions.length} سؤال). اختر الإجابة الصحيحة لكل سؤال.`;
    } else {
        document.querySelector('#start-screen p').textContent = `حدث خطأ في تحميل الأسئلة.`;
    }
}

function startQuiz() {
    startScreen.classList.remove('active');
    questionScreen.classList.add('active');
    currentQuestionIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    updateScore();
    loadQuestion();
}

function updateScore() {
    score = userAnswers.reduce((acc, curr, idx) => {
        if (curr !== null && curr === questions[idx].correct) return acc + 1;
        return acc;
    }, 0);
    scoreCounter.textContent = `النقاط: ${score}`;
}

function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update counters & progress
    questionCounter.textContent = `السؤال ${currentQuestionIndex + 1} / ${questions.length}`;
    progressBar.style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;
    
    // Set question image
    questionImage.src = currentQuestion.image;
    
    // Create options images
    optionsContainer.innerHTML = '';
    
    currentQuestion.options.forEach((optImage, index) => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        
        const img = document.createElement('img');
        img.src = optImage;
        img.alt = `Option ${index}`;
        
        button.appendChild(img);
        button.addEventListener('click', () => selectOption(button, index));
        optionsContainer.appendChild(button);
    });
    
    // Restore state if previously answered
    const prevAnswer = userAnswers[currentQuestionIndex];
    if (prevAnswer !== null) {
        const allOptions = optionsContainer.children;
        for (let btn of allOptions) btn.disabled = true;
        
        if (prevAnswer === currentQuestion.correct) {
            allOptions[prevAnswer].classList.add('correct');
        } else {
            allOptions[prevAnswer].classList.add('wrong');
            allOptions[currentQuestion.correct].classList.add('correct');
        }
        nextBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.add('hidden');
    }
    
    // Show/Hide Previous button
    if (currentQuestionIndex > 0) {
        prevBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.add('hidden');
    }
}

function selectOption(selectedBtn, selectedIndex) {
    const currentQuestion = questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = selectedIndex;
    
    const isCorrect = selectedIndex === currentQuestion.correct;
    
    const allOptions = optionsContainer.children;
    for (let btn of allOptions) {
        btn.disabled = true;
    }
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('wrong');
        allOptions[currentQuestion.correct].classList.add('correct');
    }
    
    updateScore();
    nextBtn.classList.remove('hidden');
}

function handleNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function handlePrevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function showResults() {
    questionScreen.classList.remove('active');
    resultScreen.classList.add('active');
    reviewContainer.classList.add('hidden'); // Hide review initially
    reviewList.innerHTML = ''; // Clear review
    
    finalScore.textContent = score;
    finalTotal.textContent = `/ ${questions.length}`;
    
    let message = "";
    const percentage = score / questions.length;
    
    if (percentage === 1) {
        message = "ممتاز! لقد أجبت على جميع الأسئلة بشكل صحيح.";
    } else if (percentage >= 0.7) {
        message = "جيد جداً! مستوى رائع.";
    } else if (percentage >= 0.5) {
        message = "جيد، ولكن يمكنك التحسن.";
    } else {
        message = "حاول مرة أخرى لتحسين نتيجتك.";
    }
    
    resultMessage.textContent = message;
}

function showReview() {
    reviewContainer.classList.remove('hidden');
    reviewList.innerHTML = '';
    
    questions.forEach((q, idx) => {
        const uAns = userAnswers[idx];
        const isCorrect = uAns === q.correct;
        
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('review-item');
        if(isCorrect) itemDiv.classList.add('correct-item');
        
        const header = document.createElement('h4');
        header.textContent = `السؤال ${idx + 1}`;
        header.style.marginBottom = '10px';
        
        const qImg = document.createElement('img');
        qImg.src = q.image;
        qImg.classList.add('q-img');
        
        const optsDiv = document.createElement('div');
        optsDiv.classList.add('review-options');
        
        q.options.forEach((optSrc, optIdx) => {
            const optCont = document.createElement('div');
            optCont.classList.add('rev-opt');
            
            if (optIdx === q.correct) optCont.classList.add('correct-ans');
            else if (optIdx === uAns && uAns !== q.correct) optCont.classList.add('user-ans');
            
            const oImg = document.createElement('img');
            oImg.src = optSrc;
            optCont.appendChild(oImg);
            optsDiv.appendChild(optCont);
        });
        
        itemDiv.appendChild(header);
        itemDiv.appendChild(qImg);
        itemDiv.appendChild(optsDiv);
        reviewList.appendChild(itemDiv);
    });
}

function resetQuiz() {
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
}

init();
