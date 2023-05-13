const APP_ID = '93c44df7969141908e2870680fdd7dea'
const CHANNEL = 'main'
const TOKEN = '007eJxTYPDLPlUmx/z+4Pmg2x7x9kY3Hb4fPvqo3FuK+56wiBMf+zMFBkvjZBOTlDRzSzNLQxNDSwOLVCMLcwMzC4O0lBTzlNRE2cT4lIZARgbV252MjAwQCOKzMOQmZuYxMAAA1xwdWA=='
let UID;

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `<div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">My Name</span></div>
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

        player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="username-wrapper"><span class="user-name">My Name</span></div>
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


joinAndDisplayLocalStream()
