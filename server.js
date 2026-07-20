
// server.js
/*import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import { db } from "./database/db.js";

const app = express();
app.use(express.json()); // parse JSON bodies
app.use(cors()); // allow cross-origin requests

const PORT = 5000;

// --- SIGNUP ---
app.post("/api/signup", async (req, res) => {
  const { username, email, birth_year, gender, designation, company_name, password } = req.body;

  if (!username || !email || !birth_year || !gender || !designation || !company_name || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO final (
        username, email, birth_year, gender, designation, company_name, password
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [username, email, birth_year, gender, designation, company_name, hashedPassword], (err) => {
      if (err) {
        // handle duplicate username/email
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Username or email already exists" });
        }
        return res.status(500).json({ message: "Database error" });
      }
      res.status(201).json({ message: "Signup successful" });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- LOGIN ---
app.post("/api/login", (req, res) => {
  console.log("API Called")
  const { username, password } = req.body;
  console.log("Data recieved")
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const sql = "SELECT id, username, password FROM final WHERE username = ?";
  console.log("Query Generated")
  db.query(sql, [username], async (err, results) => {
    console.log("Query Executed")
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid username or password" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: "Invalid username or password" });

    res.status(200).json({ message: "Login successful" });
  });
});

// --- GET USERS ---
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT id, username, email, birth_year, gender, designation, company_name,created_at
    FROM final
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.status(200).json(results);
  });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/











import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import { db } from "./database/db.js";
//
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
//
const JWT_SECRET="super_secret_key";
//




const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


// --- SIGNUP ---
app.post("/api/signup", async (req, res) => {
  const { username, email, birth_year, gender, designation, company_name, password } = req.body;

  if (!username || !email || !birth_year || !gender || !designation || !company_name || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO final (username, email, birth_year, gender, designation, company_name, password)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [username, email, birth_year, gender, designation, company_name, hashedPassword]);

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    res.status(500).json({ message: "Database error" });
  }
});

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const sql = "SELECT id, username, password FROM final WHERE username = ?";
    const [results] = await db.query(sql, [username]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    //
 const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "17h" }
    );

    

    res.status(200).json({ message: "Login successful",token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// --- GET USERS ---
app.get("/api/users", authenticateToken,async (req, res) => {
  try {
    const sql = `
      SELECT id, username, email, birth_year, gender, designation, company_name, created_at
      FROM final
    `;
    const [results] = await db.query(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
