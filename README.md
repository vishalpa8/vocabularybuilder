# Vocabuild: Your Personal Vocabulary Builder

Vocabuild is a modern, responsive Progressive Web App (PWA) designed to help you build, manage, and master your personal vocabulary. It uses a flexible quiz system to create an effective and engaging learning experience.

![Vocabuild Screenshot](https://i.imgur.com/your-screenshot.png) 

## ✨ Features in Detail

- **📚 Comprehensive Word Management**: 
  - **Add Words**: Easily add new words with definitions, parts of speech, sample sentences, and helpful mnemonics.
  - **Edit and Delete**: Quickly edit or delete words from your vocabulary.
  - **Search and Filter**: Instantly find any word in your collection with a powerful search feature. Filter words by tags or view only your favorites.

- **🧠 Intelligent Quiz System**:
  - **Customizable Quizzes**: Test your knowledge with multiple-choice or typing quizzes. You can select the number of questions and the quiz type (word to meaning, meaning to word) to fit your study session.
  - **Spaced Repetition (Anki-style)**: The app incorporates a SuperMemo 2 (SM2) algorithm to power its spaced repetition system. Words you answer correctly will reappear less often, while forgotten words will show up more frequently, optimizing your learning efficiency.
  - **Daily/Weekly Revision Challenge**: Engage in a focused challenge of 10-20 words, prioritizing those due for review. At the end, receive a "Retention Score" to gauge your mastery.
  - **Flashcard Mode**: Practice words at your own pace with interactive flashcards.
  - **Quiz History**: Track your progress with a detailed quiz history, including your score and the answers you got right and wrong.

- **📊 Insightful Dashboard**:
  - **Learning Statistics**: Visualize your learning journey with stats on your total words, mastered words, and words due for review.
  - **Data Portability**: Export your entire vocabulary to a JSON file for backup or import it to another device.

- **🎨 User-Friendly Interface**:
  - **Modern & Clean Design**: Enjoy a refreshed UI across the application, including improved layouts, consistent spacing, and enhanced visual feedback for interactions.
  - **Light & Dark Modes**: Switch between light and dark themes for a comfortable viewing experience in any lighting condition.
  - **Fully Responsive**: Enjoy a seamless experience on any device, from desktops to mobile phones.
  - **PWA Ready**: Install Vocabuild on your device for an app-like experience and offline access.

## 🛠️ Technologies Used

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Library**: [Material-UI (MUI)](https://mui.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Client-Side Database**: [Dexie.js](https://dexie.org/) (a wrapper for IndexedDB)
- **Linting**: [ESLint](https://eslint.org/)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (which includes npm)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/vocabulary-builder.git
    cd vocabulary-builder
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## 📖 How to Use

- **Adding a Word**: Navigate to the **Add Word** page from the navbar. Fill in the details and save the word to your collection.
- **Taking a Quiz**: Go to the **Quiz** page. Select the number of questions you'd like to answer and click "Start Test" to begin a random quiz from your vocabulary.
- **Viewing Your Words**: The **Home** page displays your entire vocabulary. You can use the search bar to filter for specific words.
- **Managing Your Data**: On the **Dashboard**, you can see your learning statistics and use the **Export** and **Import** buttons to manage your vocabulary data.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/vocabulary-builder/issues).

## 📄 License

This project is licensed under the MIT License.