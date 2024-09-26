const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the project directory

// Load client secrets from a local file.
const CLIENT_SECRET = JSON.parse(fs.readFileSync('credentials.json'));

const auth = new google.auth.GoogleAuth({
    credentials: CLIENT_SECRET,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Endpoint to check selection
app.post('/check-selection', async (req, res) => {
    const studentId = req.body.studentId;
    const spreadsheetId = '1QL94OOKAcLgZJKYu_2H0DIKVrZtXDyQf56Im4MIHJ14';
    const range = 'ชีต6'; // Replace with your actual sheet name

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        const rows = response.data.values.slice(1); // Remove header row
        const found = rows.find(row => row[0] === studentId);

        if (found) {
            res.json({ success: true, data: found });
        } else {
            res.json({ success: false, message: 'ไม่พบข้อมูล' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
});

// Serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
