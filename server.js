const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

// to get new room url
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

//Server-side construct: 
//assigning a socket to a room
//so, when user visits the website, it's like they join a room
// once the user joins the room, a message is broadcasted saying: 'user-connected'
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId)
        socket.join(roomId)
        //socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.to(roomId).emit("user-connected", userId)
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(3030)
