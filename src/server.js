const express = require('express');
const { Server } = require('ws');
const http = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });
const FEEDBACKS_FILE = './data/feedbacks.json';

// Serve static files
app.use(express.static('public'));

// Generate and return QR code
app.get('/generate-qr', async (req, res) => {
    const url = `http://${req.headers.host}`; // Assuming http for simplicity
    try {
        const qr = await QRCode.toDataURL(url);
        res.send(qr);
    } catch (err) {
        res.status(500).send('Failed to generate QR code.');
    }
});

// WebSocket setup
wss.on('connection', ws => {
    sendFeedbacks(ws);
    
    /* ws.on('message', message => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'newFeedback':
                addFeedback(data.text);
                break;
            case 'vote':
                voteFeedback(data.id, data.voteType);
                break;
        }
    }); */
	ws.on('message', message => {
		const data = JSON.parse(message);
		switch (data.type) {
			case 'newFeedback':
				addFeedback(data.text, data.userId);
				break;
			case 'vote':
				voteFeedback(data.id, data.voteType, data.userId);
				break;
		}
	});
});

// Load feedbacks from file
function loadFeedbacks() {
    let feedbacks = [];
    if (fs.existsSync(FEEDBACKS_FILE)) {
        const rawFeedbacks = fs.readFileSync(FEEDBACKS_FILE);
        feedbacks = JSON.parse(rawFeedbacks);
    }
    return feedbacks;
}

// Save feedbacks to file
function saveFeedbacks(feedbacks) {
    fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(feedbacks));
}

// Send the current feedbacks to a WebSocket client
function sendFeedbacks(ws) {
    const feedbacks = loadFeedbacks();
    const visibleFeedbacks = feedbacks.filter(feedback => (Date.now() - feedback.timestamp) <= 120000); // 2 minutes
    visibleFeedbacks.sort((a, b) => b.votes - a.votes || b.timestamp - a.timestamp);
    ws.send(JSON.stringify({ type: 'updateFeedbacks', feedbacks: visibleFeedbacks }));
}

// Add a new feedback
function addFeedback(text) {
    const feedbacks = loadFeedbacks();
    feedbacks.push({
        id: uuidv4(),
        text,
        votes: 0,
        timestamp: Date.now()
    });
    saveFeedbacks(feedbacks);
    wss.clients.forEach(client => sendFeedbacks(client));
}

// Vote on a feedback
/* function voteFeedback(id, voteType) {
    const feedbacks = loadFeedbacks();
    const feedback = feedbacks.find(f => f.id === id);
    if (feedback) {
        if (voteType === 'upvote') {
            feedback.votes++;
        } else if (voteType === 'downvote') {
            feedback.votes--;
        }
        saveFeedbacks(feedbacks);
        wss.clients.forEach(client => sendFeedbacks(client));
    }
} */
function voteFeedback(id, voteType, userId) {
	console.log(`Vote received for feedback ${id} by user ${userId} with voteType ${voteType}`);
    const feedbacks = loadFeedbacks();
    const feedback = feedbacks.find(f => f.id === id);
	if(feedback) {
		console.log(feedback);
		console.log(feedback.votedUsers);
		console.log(feedback.votedUsers.includes(userId));
	}
    if (feedback && !feedback.votedUsers.includes(userId)) {
        if (voteType === 'upvote') {
            feedback.votes++;
			console.log("+")
			console.log(feedback.votes)
        } else if (voteType === 'downvote') {
            feedback.votes--;
			console.log("-")
			console.log(feedback.votes)
        }
        feedback.votedUsers.push(userId);
		console.log(feedback.votes);
        saveFeedbacks(feedbacks);
        wss.clients.forEach(client => sendFeedbacks(client));
    }
}

function addFeedback(text, userId) {
    const feedbacks = loadFeedbacks();
    feedbacks.push({
        id: uuidv4(),
        text,
        votes: 1,
        timestamp: Date.now(),
        votedUsers: [userId]
    });
    saveFeedbacks(feedbacks);
    wss.clients.forEach(client => sendFeedbacks(client));
}

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000/');
});

// Check and remove old feedbacks every minute
setInterval(() => {
    const feedbacks = loadFeedbacks();
    const updatedFeedbacks = feedbacks.filter(feedback => (Date.now() - feedback.timestamp) <= 120000); // 2 minutes
    if (feedbacks.length !== updatedFeedbacks.length) {
        saveFeedbacks(updatedFeedbacks);
        wss.clients.forEach(client => sendFeedbacks(client));
    }
}, 60000);  // 1 minute
