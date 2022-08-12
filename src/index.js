require("dotenv").config();
const { pt } = require("yup-locales");
const { setLocale } = require("yup");
setLocale(pt);

const express = require("express");
const rotas = require("./rotas");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(rotas);

app.listen(3001);
