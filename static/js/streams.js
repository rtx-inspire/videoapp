const APP_ID = '93c44df7969141908e2870680fdd7dea'
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
let UID = sessionStorage.getItem('UID')

let NAME = sessionStorage.getItem('name')

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    document.getElementById('room-name').innerText = CHANNEL

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID)        
    } catch (err) {
        console.error(err);
        window.open('/', '_self')
    }


    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let user = await createUser()

    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">${user.name}</span></div>
                    <div class="video-player" id="user-${UID}"></div>
                </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserJoined = async (user, medaiType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, medaiType)

    if (medaiType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)

        if (player != null) {
            player.remove()
        }


        let member = await getmMember(user)

        player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                    <div class="video-player" id="user-${user.uid}"></div>
                </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (medaiType === 'audio') {
        user.audioTrack.play(`user-${user.uid}`)
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    deleteUser()

    window.open('/', '_self')
}

let toggleVideo = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'red'
    }
}

let toggleMic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'red'
    }
}

let createUser = async () => {
    let response = await fetch('/create_user/', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            'name':NAME,
            'room_name': CHANNEL,
            'UID': UID
        })
    })
    
    let user = await response.json()
    
    return user
}

let getmMember = async (user) => {
    let response = await fetch(`/get_user/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()

    return member
}

let deleteUser = async () => {
    let response = await fetch('/delete_user/', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            'name':NAME,
            'room_name': CHANNEL,
            'UID': UID
        })
    })
}

joinAndDisplayLocalStream()

window.addEventListener('beforeunload', deleteUser)

document.getElementById('callend-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('video-btn').addEventListener('click', toggleVideo)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
