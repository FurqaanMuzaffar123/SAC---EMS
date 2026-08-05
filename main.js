import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", (req, res)=>{
    res.render("index.ejs")
})

app.get("/login", (req, res)=>{
    res.render("login.ejs")
})

app.listen(port,"0.0.0.0", ()=>{
    console.log(`The server is alhamdulillah running on port ${port}.\nClick here to open: http://localhost:${port}`);
})