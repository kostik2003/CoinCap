import { PrismaClient } from '@prisma/client'
import express, { Router } from 'express'

const prisma = new PrismaClient()

const app = express()

app.use(express.json())

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

app.post(`/user`, async (req, res) => {
    const resoult = await prisma.user.create({
        data: { ...req.body },
    })
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
