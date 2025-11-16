from flask import Flask, render_template, request, redirect, url_for, session, flash
from config import get_db

app = Flask(__name__)
app.secret_key = "secret123"


# -----------------------
#       HOME → LOGIN
# -----------------------
@app.route("/")
def login():
    return render_template("login.html")


# -----------------------
#       LOGIN ACTION
# -----------------------
@app.route("/login", methods=["POST"])
def login_user():
    email = request.form["email"]
    password = request.form["password"]

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, password))
    user = cursor.fetchone()

    if user:
        session["user"] = user
        return redirect(url_for("welcome"))
    else:
        flash("Invalid email or password!")
        return redirect(url_for("login"))


# -----------------------
#       REGISTER PAGE
# -----------------------
@app.route("/register")
def register():
    return render_template("register.html")


# -----------------------
#    REGISTER ACTION
# -----------------------
@app.route("/register_user", methods=["POST"])
def register_user():
    name = request.form["name"]
    email = request.form["email"]
    password = request.form["password"]

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # ❗ CHECK IF EMAIL ALREADY EXISTS
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    exist = cursor.fetchone()

    if exist:
        flash("Email already exists!")
        return redirect(url_for("register"))

    # INSERT NEW USER
    cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                   (name, email, password))
    db.commit()

    flash("Account created successfully! Login now.")
    return redirect(url_for("login"))


# -----------------------
#   WELCOME PAGE
# -----------------------
@app.route("/welcome")
def welcome():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("welcome.html", user=session["user"])


# -----------------------
#        LOGOUT
# -----------------------
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(debug=True)
