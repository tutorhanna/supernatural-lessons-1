
// ============================================================
// YOUTUBE PLAYER + СИНХРОНИЗАЦИЯ
// ============================================================
let ytPlayer = null;
let ytReady = false;

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('ytPlayer', {
        height: '360',
        width: '100%',
        videoId: 'WZU516GI3Ac',
        playerVars: { 'rel': 0, 'modestbranding': 1 },
        events: {
            'onReady': function() {
                ytReady = true;
                console.log('✅ YouTube Player готов');
            },
            'onStateChange': function(e) {
                if (typeof isTeacher === 'undefined' || !isTeacher) return;
                if (typeof syncPaused !== 'undefined' && syncPaused) return;
                if (e.data === YT.PlayerState.PLAYING) {
                    sendVideoCommand('play', ytPlayer.getCurrentTime());
                } else if (e.data === YT.PlayerState.PAUSED) {
                    sendVideoCommand('pause', ytPlayer.getCurrentTime());
                }
            }
        }
    });
}

// Универсальная команда: применяется и к VK, и к YouTube
function applyVideoCommandUniversal(action, time) {
    // VK
    if (!window.ytBackupVisible && typeof vkPlayerReady !== 'undefined' && vkPlayerReady && vkPlayer) {
        try {
            if (action === 'play') {
                if (time && vkPlayer.seek) vkPlayer.seek(time);
                vkPlayer.play();
            } else if (action === 'pause') {
                if (time && vkPlayer.seek) vkPlayer.seek(time);
                vkPlayer.pause();
            } else if (action === 'seek') {
                if (vkPlayer.seek) vkPlayer.seek(time);
            }
        } catch(e) {}
    }
    // YouTube
    if (window.ytBackupVisible && typeof ytReady !== 'undefined' && ytReady && ytPlayer && ytPlayer.getPlayerState) {
        try {
            if (action === 'play') {
                if (time && ytPlayer.seekTo) ytPlayer.seekTo(time, true);
                ytPlayer.playVideo();
            } else if (action === 'pause') {
                if (time && ytPlayer.seekTo) ytPlayer.seekTo(time, true);
                ytPlayer.pauseVideo();
            } else if (action === 'seek') {
                if (ytPlayer.seekTo) ytPlayer.seekTo(time, true);
            }
        } catch(e) {}
    }
}

// Кнопки учителя — универсальные
function teacherVideoPlayBoth() {
    sendVideoCommand('play', 0);
    applyVideoCommandUniversal('play', 0);
}
function teacherVideoPauseBoth() {
    sendVideoCommand('pause', 0);
    applyVideoCommandUniversal('pause', 0);
}
function teacherVideoSeekToBoth(seconds) {
    sendVideoCommand('seek', seconds);
    applyVideoCommandUniversal('seek', seconds);
}
function teacherVideoSeekByBoth(delta) {
    let t = 0;
    if (typeof vkPlayerReady !== 'undefined' && vkPlayerReady && vkPlayer && vkPlayer.getCurrentTime) {
        t = vkPlayer.getCurrentTime() || 0;
    } else if (typeof ytReady !== 'undefined' && ytReady && ytPlayer && ytPlayer.getCurrentTime) {
        t = ytPlayer.getCurrentTime() || 0;
    }
        t = Math.max(0, t + delta);
    teacherVideoSeekToBoth(t);
}
