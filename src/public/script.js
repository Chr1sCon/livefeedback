// Establish WebSocket connection
//const socket = new WebSocket('ws://localhost:3000'); 
const socket = new WebSocket('ws://feedback.conradi.cloud'); 

// DOM references
const feedbackInput = document.getElementById('feedbackInput');
const feedbackList = document.getElementById('feedbackList');
const qrCode = document.getElementById('qrCode');
let userId = localStorage.getItem('userId');
if (!userId) {
    userId = uuidv4();
    localStorage.setItem('userId', userId);
}


// Load QR code
fetch('/generate-qr')
  .then(response => response.text())
  .then(src => {
    qrCode.src = src;
  });

// Event listener for the feedback input
feedbackInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    const feedbackText = feedbackInput.value.trim();
    if (feedbackText) {
      socket.send(JSON.stringify({ type: 'newFeedback', text: feedbackText, userId: userId }));
      feedbackInput.value = ''; // clear the input field
    }
  }
});

// Handle incoming WebSocket messages
socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.type === 'updateFeedbacks') {
    renderFeedbacks(data.feedbacks);
  }
});

// Render feedbacks
function renderFeedbacks(feedbacks) {
  feedbackList.innerHTML = ''; // Clear existing feedbacks
  feedbacks.forEach(feedback => {
    const row = document.createElement('tr');
    
    const votesCell = document.createElement('td');
    votesCell.textContent = feedback.votes;

    const textCell = document.createElement('td');
    textCell.textContent = feedback.text;

    const voteCell = document.createElement('td');
    const upvoteButton = document.createElement('button');
    upvoteButton.textContent = '👍';
    upvoteButton.onclick = () => voteFeedback(feedback.id, 'upvote');
    const downvoteButton = document.createElement('button');
    downvoteButton.textContent = '👎';
    downvoteButton.onclick = () => voteFeedback(feedback.id, 'downvote');

	// Check if current user has voted on this feedback, and disable the voting buttons if they have
	if (feedback.votedUsers.includes(userId)) {
		upvoteButton.disabled = true;
		downvoteButton.disabled = true;
		upvoteButton.style.opacity = 0.2; // to visually indicate it's disabled
		downvoteButton.style.opacity = 0.2;
	}

    voteCell.append(upvoteButton, downvoteButton);
    
    row.append(votesCell, textCell, voteCell);
    feedbackList.append(row);
  });
}

// Send a vote for a feedback
function voteFeedback(id, voteType) {
  socket.send(JSON.stringify({ type: 'vote', id, voteType, userId: userId }));
}

// Ensure feedback input is always in focus
feedbackInput.focus();
document.addEventListener('click', () => {
  feedbackInput.focus();
});
