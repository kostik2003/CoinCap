import { PrismaClient } from '@prisma/client'
import express, { Router } from 'express'
const bcrypt = require("bcrypt");

const prisma = new PrismaClient()

const app = express()

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: false}))

app.use(express.json())

app.get (`/`, async(req, res) => {
    res.render("index")
})

app.get (`/users/register`, (req, res) => {
    res.render("register")
}) 
app.get (`/users/login`, (req, res) => {
    res.render("login")
}) 
app.get (`/users/dashboard`, (req, res) => {
    res.render("dashboard")
}) 

app.get(`/users`, async (req, res) => {
    const users = await prisma.user.findMany()
    res.json(users)
})
app.get(`/feed`, async(req, res) => {
    const coins = await prisma.coin.findMany({
        where: {published:true},
        include: {author: true}
    })
    res.json(coins)
})

app.get(`/coin/:id`, async (req, res) => {
    const { id } = req.params
    const coin = await prisma.coin.findFirst({
        where: { id: Number(id) },
    })
    res.json(coin)
})


// app.post(`/users/register`, async (req, res) => {
//     const { email, password, name, password2, id, } = req.body
//     console.log({
//         name,
//         email,
//         password,
//         password2,

//     })
// })
app.post(`/users/register`, async (req, res) => {
    const { email, password, name, password2, id, } = req.body
    const resoult = await prisma.user.create({
        data: {
            name,
            email,  
            password,
             // TODO не работает сравнение двух паролей.
        },
        
    })
    let errors = [];
    
    if(password != password2) {
        errors.push({message: "Passwords do not match"})
    };
    if(!name || !email || !password || !password2){
        errors.push ({message: "Please enter all fields"})
    };
    if(password.length > 5) {
        errors.push({message: "Plassword should be at least 6 characters "})
    }
    if(errors.length > 0) {
        res.render("register", { errors })
    }
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)
    

    res.json(resoult)
})

app.post(`/coin`, async (req, res) => {
    const { title, content, authorEmail } = req.body
    const result = await prisma.coin.create({
        data: {
            title,
            price: 0,
            published: false,
            author: { connect: { email: authorEmail }}
        },
    })
    res.json(result)
})
app.put(`/coin/publish/:id`, async (req, res) => {
    const { id } = req.params
    const coin = await prisma.coin.update({
        where: { id: Number(id)},
        data: {published: true},
    })
    res.json(coin)
})

app.delete(`/coin/:id`, async (req, res) => {
    const { id } = req.params
    const coin = await prisma.coin.delete({
        where: {id: Number(id) },
    })
    res.json(coin)
})

app.delete(`/users/:id`, async (req, res) => {
    const { id } = req.params
    const users = await prisma.user.delete({
        where: { id: Number(id) },
    })
    res.json(users)
})

app.listen(5433, () => 
    console.log(`REST API server ready at: http://localhost:5433`),
)
