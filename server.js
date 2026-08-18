const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const db = new sqlite3.Database("profiles.db");

// Create profiles table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT NOT NULL,
        skills TEXT NOT NULL,
        github TEXT,
        linkedin TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Render the Form Page
app.get("/", (req, res) => {
    res.render("index");
});

// Handle Form Submission and Redirect
app.post("/create-profile", (req, res) => {
    const { name, bio, skills, github, linkedin } = req.body;

    db.run(
        "INSERT INTO profiles (name, bio, skills, github, linkedin) VALUES (?, ?, ?, ?, ?)",
        [name, bio, skills, github || "", linkedin || ""],
        function(err) {
            if (err) {
                console.error("Error saving profile:", err);
                return res.status(500).send("Error creating profile");
            }
            // Successfully saved! Redirect to the new profiles page
            res.redirect("/profiles");
        }
    );
});

// NEW ROUTE: View the page with ALL expanded cards
app.get("/profiles", (req, res) => {
    db.all("SELECT * FROM profiles ORDER BY created_at DESC", (err, profiles) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error loading profiles");
        }
        res.render("profiles", { profiles: profiles || [] });
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});