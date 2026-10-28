
// ============================================================
// VK VIDEO PLAYER + СИНХРОНИЗАЦИЯ ЧЕРЕЗ FIREBASE
// ============================================================
let vkPlayer = null;
let vkPlayerReady = false;
let lastVideoCommandAt = 0;

function initVKPlayer(retries) {
    if (typeof retries === 'undefined') retries = 10;
    const iframe = document.getElementById('vkVideo');
    if (!iframe) {
        if (retries > 0) setTimeout(() => initVKPlayer(retries - 1), 500);
        return;
    }
    if (typeof VK === 'undefined' || !VK.VideoPlayer) {
        if (retries > 0) setTimeout(() => initVKPlayer(retries - 1), 500);
        return;
    }
    try {
        vkPlayer = VK.VideoPlayer(iframe);
        vkPlayerReady = true;
        console.log('✅ VK Video Player готов');

        vkPlayer.on('play', function() {
            if (typeof isTeacher === 'undefined' || !isTeacher) return;
            if (typeof syncPaused !== 'undefined' && syncPaused) return;
            sendVideoCommand('play', vkPlayer.getCurrentTime ? vkPlayer.getCurrentTime() : 0);
        });
        vkPlayer.on('pause', function() {
            if (typeof isTeacher === 'undefined' || !isTeacher) return;
            if (typeof syncPaused !== 'undefined' && syncPaused) return;
            sendVideoCommand('pause', vkPlayer.getCurrentTime ? vkPlayer.getCurrentTime() : 0);
        });
        vkPlayer.on('seeked', function() {
            if (typeof isTeacher === 'undefined' || !isTeacher) return;
            if (typeof syncPaused !== 'undefined' && syncPaused) return;
            sendVideoCommand('seek', vkPlayer.getCurrentTime ? vkPlayer.getCurrentTime() : 0);
        });
    } catch(e) {
        console.warn('VK init retry:', e);
        if (retries > 0) setTimeout(() => initVKPlayer(retries - 1), 500);
    }
}

window.addEventListener('load', function() {
    setTimeout(() => initVKPlayer(10), 1000);
});

function sendVideoCommand(action, time) {
    if (typeof fb === 'undefined' || !fb || typeof roomId === 'undefined' || !roomId) return;
    if (typeof syncPaused !== 'undefined' && syncPaused) return;
    const cmdRef = fb.ref(fb.db, `rooms/${roomId}/videoCommand`);
    fb.set(cmdRef, {
        action: action,
        time: time || 0,
        at: fb.serverTimestamp(),
        from: (typeof isTeacher !== 'undefined' && isTeacher) ? 'teacher' : 'student'
    }).catch(function(e) { console.warn('VK cmd error:', e); });
}

function applyVideoCommand(action, time) {
    if (!vkPlayerReady || !vkPlayer) return;
    try {
        if (action === 'play') {
            if (time && vkPlayer.seek) vkPlayer.seek(time);
            vkPlayer.play();
        } else if (action === 'pause') {
            vkPlayer.pause();
            if (time && vkPlayer.seek) vkPlayer.seek(time);
        } else if (action === 'seek') {
            if (vkPlayer.seek) vkPlayer.seek(time);
        }
    } catch(e) {
        console.warn('applyVideoCommand error:', e);
    }
}

function listenVideoCommands() {
    if (typeof fb === 'undefined' || !fb || typeof roomId === 'undefined' || !roomId) return;
    const cmdRef = fb.ref(fb.db, `rooms/${roomId}/videoCommand`);
    fb.onValue(cmdRef, function(snap) {
        const cmd = snap.val();
        if (!cmd || !cmd.at) return;
        if (typeof isTeacher !== 'undefined' && isTeacher) return;
        const cmdTime = new Date(cmd.at).getTime ? new Date(cmd.at).getTime() : cmd.at;
        if (cmdTime <= lastVideoCommandAt) return;
        lastVideoCommandAt = cmdTime;
                applyVideoCommandUniversal(cmd.action, cmd.time);

    });
}


