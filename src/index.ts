import { PrismaClient } from '@prisma/client'
import express, { Router } from 'express'
import { userInfo } from 'os';
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');

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


app.post('/users/login', async (req, res) => {
    const {email, password} = req.body;
    const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        }
    )
    const validPassword = await bcrypt.compare(password, existingUser?.password)
    if(!existingUser) {
        res.status(403)
        throw new Error('Invalid Login credenteils')
    }
})

app.post(`/users/register`, async (req, res) => {
    const { email, password, name} = req.body
    const jti = uuidv4();
    const userFind = await prisma.user.findUnique({
        where: {
            email
        },
        select: {
            email: true
        }
    }
    )
    if(userFind)   {
        console.log('user is created')
    } 
    if (!userFind) 
    {
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)
        const resoult = await prisma.user.create({
        data: {
            name,
            email,  
            password,
        },
    })
    }
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
