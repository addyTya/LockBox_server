const express = require("express");
const app = express();
const cors = require("cors");
const { encrypt, decrypt } = require('./Encryption.js');
require('dotenv').config();
const { createClient } = require("@libsql/client");

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Enable CORS for all origins (adjust origin for production if needed)
app.use(cors({
  origin: "*", // Restrict this to your frontend URL when deploying if necessary
  methods: "GET,POST",
  allowedHeaders: "Content-Type"
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Backend is running!');
  });
  
// POST route to add a password
app.post('/addpassword', async (req, res) => {
  const { password, title } = req.body;
  const { encrypted: hashedPassword, key: iv } = encrypt(password);

  try {
    const result = await turso.execute(`INSERT INTO passwords (passwordscol, title, iv) VALUES (?, ?, ?)`, [hashedPassword, title, iv]);
    res.send("Successfully added!");
  } catch (err) {
    console.error("Error adding password:", err);
    res.status(500).send("Error adding password!");
  }
});

// POST route to reveal a password
app.post('/revealpassword', async (req, res) => {
  const { title } = req.body;
    // console.log(title);
    // res.send("message recieved");
  try {
    const result = await turso.execute(`SELECT * FROM passwords WHERE title = ?`, [title]);

    if (result.rows.length === 0) {
      res.status(404).send("Error: 404; Data entry not found!!");
      return;
    }

    const password = decrypt({
      message: result.rows[0].passwordscol,
      newiv: result.rows[0].iv
    });

    res.send(password);
  } catch (err) {
    console.error("Error revealing password:", err);
    res.status(500).send("Error revealing password!");
  }
});

// Use dynamic port for production (Vercel) and fallback to 3001 for local development

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
