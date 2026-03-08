# QuizForge - Online Quiz Maker

A responsive web app where users can register/login, create multiple-choice quizzes, browse available quizzes, attempt them one-by-one, and get instant score feedback.

## Features

- Home page with project overview
- User Authentication (Register, Login, Logout)
- Quiz Creation (title, questions, 4 options, correct answer)
- Quiz Listing with quiz metadata
- Quiz Taking flow (one question at a time)
- Quiz Results with score percentage and correct answers
- Mobile responsive UI
- Data persistence using browser `localStorage`

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- Browser `localStorage` (no backend required)

## Project Structure

```text
Online Quiz Maker/
|- index.html
|- styles.css
|- script.js
|- README.md
```

## How to Run Locally

1. Clone or download this project.
2. Open the project folder.
3. Run `index.html` in any modern browser.

Optional (recommended): use VS Code Live Server for smoother development.

## Usage

1. Open the app.
2. Go to **User Authentication** tab and create an account.
3. Login with your credentials.
4. Go to **Quiz Creation** and add quiz title/questions.
5. Save the quiz.
6. Go to **Quiz Listing** and click **Take Quiz**.
7. Complete all questions and view result summary instantly.

## Default Demo Quiz

On first load, the app seeds one demo quiz (`Web Development Basics`) so the quiz-taking flow can be tested immediately.

## Data Storage Keys

The app stores data in `localStorage` using these keys:

- `quizforge_users`
- `quizforge_current_user`
- `quizforge_quizzes`

## Future Improvements

- Timer per quiz
- Difficulty levels and categories
- Edit/Delete quizzes
- User-wise score history
- Backend + database integration

## License

This project is for learning and internship task/demo purposes.
