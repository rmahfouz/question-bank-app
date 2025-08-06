# Question Bank App

This project is a React + Vite web application designed for a question bank platform. The application allows users to load questions and answers from a CSV file, display them, select answers, and view explanations for the selected answers.

## Features

- Load questions and answers from a CSV file.
- Display a list of questions with selectable answers.
- Show explanations for the selected answers.
- Future support for encrypted online question banks.

## Project Structure

```
question-bank-app
├── src
│   ├── components
│   │   ├── QuestionList.tsx
│   │   ├── QuestionItem.tsx
│   │   └── Explanation.tsx
│   ├── utils
│   │   └── csvParser.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── types
│       └── index.ts
├── public
│   └── questions.csv
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd question-bank-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and go to `http://localhost:3000` to view the application.

## Usage

- The application will load questions from the `public/questions.csv` file.
- Users can select answers for each question.
- After selecting an answer, the explanation will be displayed.

## Future Enhancements

- Implement encrypted online question banks for enhanced security.
- Add user authentication and progress tracking features.