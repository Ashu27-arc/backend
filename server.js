const express = require("express");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 5000;
const SECRET_KEY = "your_secret_key"; //Change this in production

app.use(express.json());
app.use(cors());

const userFile = "users.json";
const dataFile = "data.json";

// Utility function to read JSON file
const readJSONFile = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, "utf8") || "[]");
};

// Utility function to write JSON file
const writeJSONFile = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Register user
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required." });
  
    const users = readJSONFile(usersFile);
    if (users.find((user) => user.username === username)) return res.status(400).json({ error: "User already exists." });
  
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    writeJSONFile(usersFile, users);
  
    res.json({ message: "User registered successfully." });
  });

  // Login user
  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const users = readJSONFile(usersFile);
    const user = users.find((user) => user.username === username);
  
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid credentials" });
  
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  });

  // Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  };

  // Save data (Protected)
app.post("/save", authenticateJWT, (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: "Data is required" });
  
    writeJSONFile(dataFile, { data });
    res.json({ message: "Data saved successfully" });
  });

  // Read data (Protected)
app.get("/read", authenticateJWT, (req, res) => {
    const data = readJSONFile(dataFile);
    res.json(data);
  });
  
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));