# Live Feedback App

The Live Feedback App is a web application designed to collect feedback from the audience during a presentation. It allows users to post their feedback, vote on other feedback, and see real-time updates. This repository contains the code for building and running the app.

## Features

- Users can post feedback to the app.
- The app is accessible to anyone in the audience using their mobile devices.
- Feedback is submitted by hitting ENTER when the feedback textfield is in focus.
- Focus returns to the text box upon page load or when feedback is posted.
- Users can vote feedback up or down.
- Each user can cast only one vote per feedback.
- Feedback is displayed in a sorted list based on most votes and newest.
- A QR code is provided for easy access to the app.
- Feedback becomes invisible 2 minutes after posting.
- Local server-side JSON file is used for storing feedback and votes.
- JSON file is updated in real-time with websockets for instant updates.
- The app uses Bootstrap for a modern, touch-friendly, dark-themed design.
- The H1 heading uses the Google Font "Moirai One".
- UUID is utilized for unique feedback identification.
- The footer contains a prompt explaining the app's origin.

## Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/live-feedback-app.git
cd live-feedback-app
Install the required dependencies:
bash
Copy code
npm install
Start the server:
bash
Copy code
node server.js
```
Access the app in your web browser at http://localhost:3000.

## Technologies Used

Node.js
Express.js
WebSocket (ws)
Bootstrap
UUID

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

This app was built as a live demo with the assistance of ChatGPT.
