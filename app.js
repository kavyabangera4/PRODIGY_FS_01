const express = require('express');
const path = require('path');
const db = require('./db');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Session setup
app.use(session({
  secret: 'your_secret_key', // Use a secure key in production
  resave: false,
  saveUninitialized: true
}));

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// -------------------- LOGIN SYSTEM --------------------

// Show login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Dummy login (replace with database check if needed)
  if (email === 'admin@example.com' && password === 'admin123') {
    req.session.user = email;
    res.redirect('/');
  } else {
    res.send('Invalid credentials');
  }
});

// Logout and destroy session
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// -------------------- EMPLOYEE CRUD --------------------

// Home page - list employees (protected)
app.get('/', requireLogin, (req, res) => {
  db.query("SELECT * FROM employees", (err, results) => {
    if (err) throw err;
    res.render("index", { employees: results });
  });
});

// Add employee form
app.get('/add', requireLogin, (req, res) => {
  const error = req.query.error || null;
  res.render("add", { error });
});

// Add employee to database
app.post('/add', requireLogin, (req, res) => {
  const { name, email, position, salary, department } = req.body;

  db.query("INSERT INTO employees (name, email, position, salary, department) VALUES (?, ?, ?, ?, ?)",
    [name, email, position, salary, department], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.redirect('/add?error=duplicate');
        }
        throw err;
      }
      res.redirect('/');
    });
});

// Edit employee form
app.get('/edit/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM employees WHERE id = ?", [id], (err, results) => {
    if (err) throw err;
    res.render("edit", { employee: results[0] });
  });
});

// Update employee details
app.post('/edit/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  const { name, email, position, salary, department } = req.body;
  db.query("UPDATE employees SET name = ?, email = ?, position = ?, salary = ?, department = ? WHERE id = ?", 
    [name, email, position, salary, department, id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Delete employee
app.get('/delete/:id', requireLogin, (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM employees WHERE id = ?", [id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// -------------------- START SERVER --------------------
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
