const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
const knex = require('knex')
const auth = require('./auth.js')
const cookieParser = require('cookie-parser')
const cors = require('cors')

require('dotenv').config()
const db = knex({
    client: "pg",
    connection: {
        host: "localhost",
        user: "postgres",
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    },
})

const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'guest'],
};

app.use(cors());

// app.options('*',cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
    app.disable('x-powered-by')

    console.log(req.headers, req.originalUrl)
    next()
})

app.get('/test', (req, res) => {
    res.json('success')
})
app.post("/sign-up", (req, res) => auth.signUp(db)(req, res));
app.post("/log-in", (req, res) => auth.logIn(db, jwt)(req, res));

app.listen(4000, () => console.log('server is listening in port 4000'))