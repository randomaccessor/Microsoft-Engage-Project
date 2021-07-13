//importing socket.io
const socket = io('/')
// creating a video element to play the video stream in
const videoGrid = document.getElementById('video-grid')
//new peer connection
const myPeer = new Peer(undefined, {
    host: '/', 
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

  // answer the call to view the other participants video
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        //adding the other participants video stream
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connecToNewUser(userId, stream)
    })
})    

// to remove the participant (audia,video) once they leave the meeting
socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

function connecToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream (video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}
