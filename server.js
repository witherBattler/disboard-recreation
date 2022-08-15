const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');


app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.set("view engine", "ejs");
app.listen(3000, () => console.log('http://localhost:3000'));


app.get("/", (req, res) => {
    res.render("index");
})