const searchBtn = document.getElementById("searchQuizBtn");
const searchModal = document.getElementById("searchModal");
const searchInput = document.getElementById("quizSearchInput");
const searchResults = document.getElementById("searchResults");
const recentQuizzesDiv = document.getElementById("recentQuizzes");

// ================= OPEN / CLOSE =================

searchBtn.addEventListener("click", () => {
  searchModal.classList.remove("hidden");
  searchInput.focus();
});

searchModal.addEventListener("click", e => {
  if (e.target === searchModal) {
    closeSearch();
  }
});

document.addEventListener("keydown", e => {

  // ESC closes
  if (e.key === "Escape") {
    closeSearch();
  }

  // CTRL + K opens
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();

    searchModal.classList.remove("hidden");

    searchInput.focus();
  }
});

function closeSearch() {
  searchModal.classList.add("hidden");
  searchInput.value = "";
  searchResults.innerHTML = "";
}

// ================= SEARCH =================

searchInput.addEventListener("input", e => {
  searchQuizzes(e.target.value);
});

function searchQuizzes(query) {

  query = query.toLowerCase().trim();

  // EMPTY SEARCH = NOTHING
  if (!query) {
    searchResults.innerHTML = "";
    return;
  }

  let results = window.quizzes.filter(quiz => {

    // SEARCH TITLE
    const titleMatch =
      quiz.title.toLowerCase().includes(query);

    // SEARCH CATEGORY
    const categoryMatch =
      quiz.category.toLowerCase().includes(query);

    // SEARCH DIFFICULTY
    const difficultyMatch =
      quiz.difficulty.toLowerCase().includes(query);

    // SEARCH QUESTIONS
    const questionMatch =
      quiz.questions.some(q =>
        q.question.toLowerCase().includes(query)
      );

    // SEARCH ANSWERS
    const answerMatch =
      quiz.questions.some(q =>
        q.answers.some(answer =>
          answer.toLowerCase().includes(query)
        )
      );

    // OPTIONAL KEYWORDS
    const keywordMatch =
      quiz.keywords &&
      quiz.keywords.some(keyword =>
        keyword.toLowerCase().includes(query)
      );

    return (
      titleMatch ||
      categoryMatch ||
      difficultyMatch ||
      questionMatch ||
      answerMatch ||
      keywordMatch
    );
  });

  // SMART SORTING
  results.sort((a, b) => {
    return scoreQuiz(b, query) - scoreQuiz(a, query);
  });

  renderResults(results, query);
}

// ================= SCORING =================

function scoreQuiz(quiz, query) {

  let score = 0;

  const title = quiz.title.toLowerCase();

  // TITLE MATCHES
  if (title.includes(query)) score += 20;

  if (title.startsWith(query)) score += 30;

  // QUESTION MATCHES
  quiz.questions.forEach(q => {

    if (q.question.toLowerCase().includes(query)) {
      score += 10;
    }

    q.answers.forEach(answer => {
      if (answer.toLowerCase().includes(query)) {
        score += 4;
      }
    });
  });

  // KEYWORDS
  if (quiz.keywords) {

    quiz.keywords.forEach(keyword => {

      if (keyword.toLowerCase().includes(query)) {
        score += 15;
      }
    });
  }

  return score;
}

// ================= RENDER =================

function renderResults(results, query) {

  searchResults.innerHTML = "";

  if (results.length === 0) {

    searchResults.innerHTML =
      `<p style="color:#9ca3af;">No quizzes found.</p>`;

    return;
  }

  const progress =
    JSON.parse(localStorage.getItem("completedQuizzes")) || {};

  results.forEach(quiz => {

    const div = document.createElement("div");

    div.className = "search-result";

    const highlightedTitle =
      highlightMatch(quiz.title, query);

    // RECENTLY PLAYED / SCORE
    let progressHTML = "";

    if (progress[quiz.id]) {

      const score = progress[quiz.id].score;
      const total = progress[quiz.id].total;

      const percent =
        Math.round((score / total) * 100);

      progressHTML = `
        <div class="search-progress">
          Recently Played • ${percent}%
        </div>
      `;
    }

    div.innerHTML = `
      <h3>${highlightedTitle}</h3>

      <p>
        ${quiz.category} • ${quiz.difficulty}
      </p>

      ${progressHTML}
    `;

    div.addEventListener("click", () => {

      localStorage.setItem("quizId", quiz.id);

      window.location.href = "quiz.html";
    });

    searchResults.appendChild(div);
  });
}

// ================= HIGHLIGHT =================

function highlightMatch(text, query) {

  const regex = new RegExp(`(${query})`, "gi");

  return text.replace(regex, `<mark>$1</mark>`);
}
