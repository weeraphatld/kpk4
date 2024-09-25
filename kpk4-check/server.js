const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Load client secrets from a local file.
const CLIENT_SECRET = JSON.parse(fs.readFileSync('credentials.json'));

const auth = new google.auth.GoogleAuth({
    credentials: CLIENT_SECRET,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
