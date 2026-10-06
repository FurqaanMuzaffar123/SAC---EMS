//=======MODULES=======//
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import session from "express-session";
import LocalStrategy from "passport-local";
import passport from "passport";

//=======CONFIGURATION=======//
configDotenv();
const app = express();
const port = process.env.PORT || 3000;
const { Strategy } = LocalStrategy;
const { Pool } = pg;
const db = new Pool({
  connectionString: process.env.DB_URL,
});
const saltRounds = 10;

//=======MIDDLEWARE=======//

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
passport.use(
  new Strategy(
    {
      usernameField : "register", 
      passwordField : "password"
    },
    async (register, password, cb) => {
    try {
      const student = (
        await db.query("SELECT * FROM students WHERE register_no=$1", [
          register,
        ])
      ).rows[0];

      if (!student) {
        return cb(null, false, {
          message: "No such student exists",
        });
      }

      if (!student.activated) {
        return cb(null, false, {
          message: "Account has not been activated",
        });
      }

      const valid = await bcrypt.compare(password, student.password_hash);

      if (!valid) {
        return cb(null, false, {
          message: "Invalid password",
        });
      }

      if (student.logged_in){
        return cb(null, false, {
          message: "Acccount already logged in"
        })
      }

      await db.query(
        `
          UPDATE students 
          SET 
          logged_in=true,
          last_login=CURRENT_TIMESTAMP
          WHERE register_no=$1
        `,
        [register],
      );

      if (register === "88888888" && student.is_admin) {
        console.log("WELCOME, ARCHITECT");
        return cb(null, student)
      }

      return cb(null, student)

    } catch (err) {
      return cb(err);
    }
  }),
);
passport.serializeUser((student, cb)=>{
  cb(null, student.register_no)
})
passport.deserializeUser(async (register, cb)=>{
  const result = await db.query(`
    SELECT * FROM students
    WHERE register_no = $1
  `, [register])

  cb(null, result.rows[0])
})
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30 * 2,
      httpOnly: true,
      secure: false,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

//=======ROUTES=======//

// Get Routes:
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/diversion", (req, res)=>{
  if (req.isAuthenticated() && req.user.is_admin) {
    res.redirect("/architect-ems-panel")
  } else if (req.isAuthenticated()) {
    res.redirect("/student-dashboard")
  } else {
    res.redirect("/choose")
  }
  console.log(req.user)
})

app.get("/activate", (req, res) => {
  res.render("activate.ejs");
});

app.get("/login", (req, res) => {
  if(req.isAuthenticated()){
    return res.redirect("/student-dashboard")
  } 
  res.render("login.ejs");
});

app.get("/choose", (req, res) => {
  res.render("choose.ejs");
});

app.get("/architect-ems-panel", (req, res)=>{
  if (!req.isAuthenticated() || !req.user.is_admin){
    return res.redirect("/html/access_denied.html")
  }

  res.render("admin.ejs")
})

// Post Routes:
app.post("/activate", async (req, res, next) => {
  const register = req.body.register;
  const DOB = req.body.DOB;
  const password = req.body.password;

  console.log("checking admin");
  console.log("confirming passwords");

  if (req.body.confirm_password !== password) {

    console.log("passwords dont match");

    return res.render("activate.ejs", {
      error_msg: "Make sure both the passwords are same",
    });

  }

  console.log("passwords match");
  console.log(password, req.body.confirm_password);

  const studentdob = (
    await db.query("SELECT dob::text FROM students WHERE register_no=$1", [
      register,
    ])
  ).rows;

  console.log("Checking for student");

  if (studentdob.length === 0) {

    console.log("student doesnt exist");

    return res.render("activate.ejs", {
      error_msg: "No such student exists",
    });

  }

  console.log("student exists");
  console.log(studentdob);
  console.log("checking if already logged in");

  const student = await db.query(
    "SELECT * FROM students WHERE register_no=$1",
    [register],
  );

  if (student.rows[0].activated) {

    console.log("already activated. waiting for approval");

    return res.render("activate.ejs", {
      error_msg: "Account has already been activated",
    });

  }

  console.log("account not activated");
  console.log(`account activated: ${student.rows[0].activated}`);
  console.log("confirming date of birth");

  if (studentdob[0].dob !== DOB && !student.rows[0].is_admin) {
    console.log("invalid date of birth");
    console.log(`db dob:${studentdob[0].dob}\nuser dob:${DOB}`);

    return res.render("activate.ejs", {
      error_msg: "Invalid Date of Birth",
    });

  }

  const password_hash = await bcrypt.hash(password, saltRounds);

  await db.query(
    "UPDATE students SET password_hash = $1 WHERE register_no = $2",
    [password_hash, register],
  );

  console.log("password hash stored");

  await db.query("UPDATE students SET activated = true WHERE register_no=$1", [
    register,
  ]);

  console.log("updated activation");

  
});

app.post("/login",(req, res, next)=>{

  passport.authenticate("local", (err, student, info)=>{
    
    if (err) return next(err)

    if(!student) {

      return res.render("login.ejs", {
        error_msg : info?.message || "Login Failed"
      })

    }

    req.login(student, (err)=>{

      if (err) return next(err)

      if (student.register_no = "88888888" && student.is_admin){
        return res.redirect("architect-ems")
      }

      res.redirect("/dashboard")

    })

  })(req, res, next)
})

// Server Listner:
app.listen(port, "0.0.0.0", () => {
  console.log(
    `The server is alhamdulillah running on port ${port}.\nClick here to open: http://localhost:${port}`,
  );
});
