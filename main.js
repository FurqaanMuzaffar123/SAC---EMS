import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt"

configDotenv()
const app = express();
const port = 3000;
const {Pool} = pg
const db = new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT,
    password:process.env.DB_PASSWORD
})
const saltRounds = 10

db.connect()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", (req, res)=>{
    res.render("index.ejs")
})

app.get("/login", (req, res)=>{
    res.render("activate.ejs")
})

app.post("/login", async (req, res)=>{
    const register = req.body.register
    const DOB = req.body.DOB
    const password = req.body.password
    console.log("confirming passwords")
    if (req.body.confirm_password !== password){
        console.log("passwords dont match")
        return res.render("activate.ejs", {
            error_msg : "Make sure both the passwords are same"
        })
    }
    console.log("passwords match")
    console.log(password, req.body.confirm_password)
    const studentdob = (await db.query("SELECT dob::text FROM students WHERE register_no=$1", [register])).rows
    console.log("Checking for student")
    if (studentdob.length === 0){
        console.log("student doesnt exist")
        return res.render("activate.ejs", {
            error_msg : "No such student exists"
        })
    } 
    console.log("student exists")
    console.log(studentdob)
    console.log("confirming date of birth")   
    if (studentdob[0].dob !== DOB){
        console.log("invalid date of birth")
        console.log(`db dob:${studentdob[0].dob}\nuser dob:${DOB}`)
        return res.render("activate.ejs", {
            error_msg : "Invalid Date of Birth"
        })
    }

    const password_hash = await bcrypt.hash(password, saltRounds)
    await db.query("UPDATE students SET password_hash = $1 WHERE register_no = $2", [password_hash, register])
    console.log("password hash stored") 
    await db.query("UPDATE students SET activated = true WHERE register_no=$1", [register])
    console.log("updated activation") 
    res.send("BOOM....well, it was successful👍")
})

app.listen(port,"0.0.0.0", ()=>{
    console.log(`The server is alhamdulillah running on port ${port}.\nClick here to open: http://localhost:${port}`);
})