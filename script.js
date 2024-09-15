let currentNumber = 1;
        let currentQuestion;
        let score = 0;
        const emojis = ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍉', '🍇', '🍍', '🥝'];
        let screenTimeReward = 0;
        let consecutiveCorrectAnswers = 0;
        let currentDifficulty = 'easy';
        let difficultyRanges = {
            'easy': [1, 5],
            'medium': [6, 12],
            'hard': [13, 20]
        };

        let difficultyMultiplier = {
            'easy': 1/3,
            'medium': 2/3,
            'hard': 1
        };

        let totalQuestions = 10;
        let questionsAnswered = 0;
        let questionResults = [];
        let usedQuestions = new Set();

        function initializeLearnMode() {
            const numberSelection = document.getElementById('number-selection');
            numberSelection.innerHTML = '';
            for (let i = 1; i <= 20; i++) {
                const cell = document.createElement('div');
                cell.className = 'table-cell';
                cell.textContent = i;
                cell.onclick = () => showTable(i);
                numberSelection.appendChild(cell);
            }
            showTable(1);
        }

        function showTable(number) {
            currentNumber = number;
            const tableDisplay = document.getElementById('table-display');
            tableDisplay.innerHTML = '';
            for (let i = 1; i <= 10; i++) {
                const row = document.createElement('div');
                row.textContent = `${number} × ${i} = ${number * i}`;
                row.className = 'table-row';
                row.onclick = () => highlightRow(row);
                tableDisplay.appendChild(row);
            }
        }

        function highlightRow(row) {
            row.classList.toggle('highlighted');
        }

        const prizeLevels = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
        let currentLevel = 0;

        function initializePracticeMode() {
            questionResults = []; // Clear old results
            resultsShown = false;
            summaryAttempts = 0;
            questionsAnswered = 0; // Reset questions answered
            currentLevel = 0; // Reset current level if you're using it
            
            document.getElementById('difficulty-selection').style.display = 'flex';
            document.getElementById('question-area').style.display = 'none';
            document.getElementById('results-container').style.display = 'none';
            document.getElementById('performance-summary').innerHTML = ''; // Clear the summary
            updateProgress(); // Reset progress bar if you have one
        }

        function setDifficulty(difficulty) {
            currentDifficulty = difficulty;
            document.querySelectorAll('.difficulty-button').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.difficulty-button[onclick="setDifficulty('${difficulty}')"]`).classList.add('active');
            document.getElementById('difficulty-selection').style.display = 'none';
            document.getElementById('question-area').style.display = 'block';
            document.getElementById('prize').textContent = '0';
            document.getElementById('feedback').textContent = '';
            generateQuestion();
        }

        function generateQuestion() {
            if (questionsAnswered >= totalQuestions) {
                showResults();
                return;
            }

            const range = difficultyRanges[currentDifficulty];
            let num1, num2, question;

            do {
                num1 = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
                num2 = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];

                // For medium and hard, avoid multiples of 1, 2, 3, or 10
                if (currentDifficulty !== 'easy') {
                    while ([1, 2, 3, 10].includes(num1) || [1, 2, 3, 10].includes(num2)) {
                        num1 = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
                        num2 = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
                    }
                }

                question = `${num1} × ${num2}`;
            } while (usedQuestions.has(question));

            usedQuestions.add(question);
            const correctAnswer = num1 * num2;
            
            const answers = [correctAnswer];
            while (answers.length < 4) {
                let wrongAnswer;
                do {
                    const wrongNum1 = num1 + Math.floor(Math.random() * 5) - 2;
                    const wrongNum2 = num2 + Math.floor(Math.random() * 3) - 1;
                    wrongAnswer = wrongNum1 * wrongNum2;
                } while (answers.includes(wrongAnswer) || wrongAnswer === correctAnswer || wrongAnswer < 0);
                answers.push(wrongAnswer);
            }
            
            answers.sort(() => Math.random() - 0.5);

            document.getElementById('question').textContent = `${question} = ?`;
            const answersContainer = document.getElementById('answers');
            answersContainer.innerHTML = '';
            
            answers.forEach((answer, index) => {
                const button = document.createElement('button');
                button.className = 'answer-button';
                button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
                button.onclick = () => checkAnswer(answer, correctAnswer);
                answersContainer.appendChild(button);
            });

            document.getElementById('feedback').textContent = '';
            questionStartTime = Date.now();
        }

        function checkAnswer(userAnswer, correctAnswer) {
            const timeTaken = (Date.now() - questionStartTime) / 1000;
            const isCorrect = userAnswer === correctAnswer;
            
            questionResults.push({
                question: document.getElementById('question').textContent,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                timeTaken: timeTaken
            });

            const feedbackElement = document.getElementById('feedback');
            const buttons = document.querySelectorAll('.answer-button');
            
            buttons.forEach(button => {
                button.disabled = true;
                const answerValue = parseInt(button.textContent.split('. ')[1]);
                if (answerValue === correctAnswer) {
                    button.classList.add('correct');
                } else if (answerValue === userAnswer) {
                    button.classList.add('incorrect');
                }
            });

            if (isCorrect) {
                feedbackElement.textContent = 'Correct! Well done!';
                feedbackElement.style.color = '#4CAF50';
            } else {
                feedbackElement.textContent = `Sorry, that's incorrect. The correct answer is ${correctAnswer}.`;
                feedbackElement.style.color = '#F44336';
            }

            questionsAnswered++;
            updateProgress();
            updateScreenTimeReward(isCorrect);

            if (questionsAnswered >= totalQuestions) {
                feedbackElement.textContent = 'Congratulations! You\'ve completed all questions!';
                if (questionResults.every(result => result.userAnswer === result.correctAnswer)) {
                    setTimeout(celebrateAllCorrect, 500); // Delay celebration slightly
                }
                setTimeout(showResults, 2000);
            } else {
                setTimeout(generateQuestion, 2000);
            }
        }

        function updateProgress() {
            const progressBar = document.getElementById('progress-bar');
            const progressLabel = document.getElementById('progress-label');
            const progress = (questionsAnswered / totalQuestions) * 100;
            
            progressBar.style.width = `${progress}%`;
            progressLabel.textContent = `${questionsAnswered} / ${totalQuestions} Questions`;
        }

        function updateScreenTimeReward(isCorrect) {
            let baseReward;
            if (questionsAnswered === 1) {
                baseReward = 10;
            } else if (questionsAnswered === totalQuestions) {
                baseReward = 590;
            } else {
                baseReward = Math.floor(590 / (totalQuestions - 1));
            }
            
            const adjustedReward = Math.round(baseReward * difficultyMultiplier[currentDifficulty]);
            
            // Apply reward or penalty based on correctness
            if (isCorrect) {
                screenTimeReward += adjustedReward;
            } else {
                screenTimeReward = Math.max(0, screenTimeReward - adjustedReward); // Ensure it doesn't go below 0
            }
            
            const screenTimeElement = document.getElementById('screen-time');
            
            // Round to the nearest minute
            const roundedMinutes = Math.round(screenTimeReward / 60);
            
            if (roundedMinutes === 0) {
                screenTimeElement.textContent = "Less than 1 minute";
            } else if (roundedMinutes === 1) {
                screenTimeElement.textContent = "1 minute";
            } else {
                screenTimeElement.textContent = `${roundedMinutes} minutes`;
            }
            
            screenTimeElement.classList.remove('celebrate', 'penalize');
            void screenTimeElement.offsetWidth; // Trigger reflow
            screenTimeElement.classList.add(isCorrect ? 'celebrate' : 'penalize');
            setTimeout(() => screenTimeElement.classList.remove('celebrate', 'penalize'), 500);
        }

        function celebrateAllCorrect() {
            createConfetti();
            document.body.classList.add('shake');
            setTimeout(() => {
                document.body.classList.remove('shake');
            }, 1000); // Shake for 1 second
        }

        function createConfetti() {
            const confettiCount = 100;
            const colors = ['#f2d74e', '#95c3de', '#ff9a91', '#f2b2f2', '#cefc86'];

            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s linear forwards`;
                document.body.appendChild(confetti);

                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }
        }

        function setMode(mode) {
            document.querySelectorAll('.mode').forEach(el => el.style.display = 'none');
            document.getElementById(`${mode}-mode`).style.display = 'block';
            
            document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.mode-button[onclick="setMode('${mode}')"]`).classList.add('active');

            if (mode === 'learn') initializeLearnMode();
            if (mode === 'practice') initializePracticeMode();
            if (mode === 'visualize') initializeVisualizeMode();
        }

        function initializeVisualizeMode() {
            document.getElementById('visualization').innerHTML = '';
            document.getElementById('result').textContent = '';
            document.getElementById('text-example').textContent = '';
        }

        function setThemeBasedOnTime() {
            const hour = new Date().getHours();
            if (hour >= 18 || hour < 6) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            updateChartTheme();
        }

        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            updateChartTheme();
        }

        function updateChartTheme() {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const textColor = isDarkMode ? '#ffffff' : '#000000';
            
            if (window.timeChart) {
                window.timeChart.options.scales.x.ticks.color = textColor;
                window.timeChart.options.scales.y.ticks.color = textColor;
                window.timeChart.options.scales.x.title.color = textColor;
                window.timeChart.options.scales.y.title.color = textColor;
                window.timeChart.update();
            }
        }

        const examples = [
            { type: 'fruit', items: ['🍎', '🍌', '🍇', '🍊', '🍓'] },
            { type: 'candy', items: ['🍭', '🍬', '🍫', '🧁', '🍪'] },
            { type: 'toy', items: ['🚗', '🧸', '🎈', '🪀', '🏀'] },
            { type: 'animal', items: ['🐶', '🐱', '🐰', '🐼', '🐵'] },
            { type: 'school', items: ['📚', '✏️', '🖍️', '📏', '🎒'] }
        ];

        function visualizeMultiplication() {
            const num1 = parseInt(document.getElementById('num1').value);
            const num2 = parseInt(document.getElementById('num2').value);
            const visualization = document.getElementById('visualization');
            const result = document.getElementById('result');
            const textExample = document.getElementById('text-example');

            visualization.innerHTML = '';
            result.textContent = '';
            textExample.textContent = '';

            const example = examples[Math.floor(Math.random() * examples.length)];
            const item = example.items[Math.floor(Math.random() * example.items.length)];

            const container = document.createElement('div');
            container.className = 'emoji-container';

            for (let i = 0; i < num1 * num2; i++) {
                const emoji = document.createElement('span');
                emoji.className = 'emoji';
                emoji.textContent = item;
                emoji.style.animationDelay = `${i * 0.1}s`;
                container.appendChild(emoji);
            }

            visualization.appendChild(container);

            setTimeout(() => {
                result.textContent = `${num1} × ${num2} = ${num1 * num2}`;
                result.style.animation = 'pop-in 0.5s';

                const exampleText = generateTextExample(num1, num2, example.type, item);
                textExample.textContent = exampleText;
                textExample.style.animation = 'pop-in 0.5s';
            }, Math.max(num1 * num2 * 100, 1000));
        }

        function generateTextExample(num1, num2, type, item) {
            const total = num1 * num2;
            const examples = [
                `If you have ${num1} basket${num1 !== 1 ? 's' : ''} of ${type}, and each basket has ${num2} ${item}, you'll have ${total} ${item} in total!`,
                `Imagine you're sharing ${total} ${item} equally among ${num2} friends. Each friend would get ${num1} ${item}!`,
                `If you arrange ${total} ${item} in ${num1} row${num1 !== 1 ? 's' : ''}, you'll have ${num2} ${item} in each row.`,
                `A ${type} store has ${num1} shelf${num1 !== 1 ? 'ves' : 'f'} with ${num2} ${item} on each. That's ${total} ${item} altogether!`,
                `If you save ${num1} ${item} every day for ${num2} days, you'll have collected ${total} ${item}!`
            ];

            return examples[Math.floor(Math.random() * examples.length)];
        }

        let resultsShown = false;
        let summaryAttempts = 0;
        const maxSummaryAttempts = 3;

        function showResults() {
            if (resultsShown) return;
            resultsShown = true;

            document.getElementById('question-area').style.display = 'none';
            document.getElementById('results-container').style.display = 'block';
            
            attemptShowSummary();
        }

        function attemptShowSummary() {
            console.log("Attempting to show summary, attempt:", summaryAttempts);
            if (summaryAttempts >= maxSummaryAttempts) {
                console.error("Failed to show summary after multiple attempts");
                document.getElementById('performance-summary').innerHTML = '<p>Unable to display summary. Please try again later.</p>';
                return;
            }

            summaryAttempts++;

            try {
                showPerformanceSummary();
                console.log("Performance summary displayed successfully");
            } catch (error) {
                console.error("Error showing performance summary:", error);
                setTimeout(attemptShowSummary, 500 * summaryAttempts);
            }
        }

        function showPerformanceSummary() {
            const summaryDiv = document.getElementById('performance-summary');
            if (!summaryDiv) {
                throw new Error("Performance summary div not found");
            }

            const correctAnswers = questionResults.filter(result => result.userAnswer === result.correctAnswer);
            const totalTime = questionResults.reduce((sum, result) => sum + result.timeTaken, 0);
            const averageTime = totalTime / questionResults.length;

            let summaryHTML = `
                <h3>Performance Summary</h3>
                <div class="summary-stats">
                    <div class="stat-item">
                        <div class="stat-value">${correctAnswers.length}/${questionResults.length}</div>
                        <div class="stat-label">Correct Answers</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${averageTime.toFixed(2)}s</div>
                        <div class="stat-label">Average Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${totalTime.toFixed(2)}s</div>
                        <div class="stat-label">Total Time</div>
                    </div>
                </div>
            `;

            if (correctAnswers.length === questionResults.length) {
                summaryHTML += '<p>Congratulations! You got all answers correct. Great job!</p>';
            } else {
                const tablesNeedingPractice = getTablesNeedingPractice();
                if (tablesNeedingPractice.length > 0) {
                    summaryHTML += '<p>Based on your performance, we recommend focusing on the following multiplication tables:</p>';
                    summaryHTML += '<ul>';
                    tablesNeedingPractice.forEach(table => {
                        if (!isNaN(table)) {
                            summaryHTML += `<li><span class="table-link" onclick="goToLearnTable(${table})">Table of ${table}</span></li>`;
                        }
                    });
                    summaryHTML += '</ul>';
                }
            }

            summaryHTML += generateResultsTable();

            summaryDiv.innerHTML = summaryHTML;
        }

        function getTablesNeedingPractice() {
            const wrongAnswers = questionResults.filter(result => result.userAnswer !== result.correctAnswer);
            const slowAnswers = questionResults.filter(result => result.timeTaken > 5); // Define "slow" as over 5 seconds

            const tablesNeedingPractice = new Set();

            wrongAnswers.concat(slowAnswers).forEach(result => {
                const [num1, num2] = result.question.split(' × ').map(Number);
                if (!isNaN(num1)) tablesNeedingPractice.add(num1);
                if (!isNaN(num2)) tablesNeedingPractice.add(num2);
            });

            return Array.from(tablesNeedingPractice).sort((a, b) => a - b);
        }

        function generateResultsTable() {
            let tableHTML = `
                <table id="results-table">
                    <tr>
                        <th>Question</th>
                        <th>Your Answer</th>
                        <th>Correct Answer</th>
                        <th>Time (seconds)</th>
                    </tr>
            `;

            questionResults.forEach(result => {
                const isCorrect = result.userAnswer === result.correctAnswer;
                tableHTML += `
                    <tr>
                        <td>${result.question}</td>
                        <td class="${isCorrect ? 'correct' : 'incorrect'}">${result.userAnswer}</td>
                        <td>${result.correctAnswer}</td>
                        <td>${result.timeTaken.toFixed(2)}</td>
                    </tr>
                `;
            });

            tableHTML += '</table>';
            return tableHTML;
        }

        function goToLearnTable(number) {
            setMode('learn');
            showTable(number);
            const tableDisplay = document.getElementById('table-display');
            tableDisplay.scrollIntoView({ behavior: 'smooth' });
        }

        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // Initialize the game
        setThemeBasedOnTime();
        setMode('learn');