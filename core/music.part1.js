
        let musicPlaying = false;
        const musicBtn = document.getElementById('musicBtn');
        const audio = document.getElementById('bgMusic');
        if (localStorage.getItem('musicPlaying') === 'true') {
            musicPlaying = true;
            audio.play().catch(() => {});
            musicBtn.textContent = '🔇 Stop Music';
            musicBtn.style.color = '#d4a060';
            musicBtn.style.borderColor = '#8b3a2a';
        }
        function toggleMusic() {
            if (musicPlaying) {
                audio.pause();
                musicPlaying = false;
                localStorage.setItem('musicPlaying', 'false');
                musicBtn.textContent = '🎵 Play Supernatural Theme';
                musicBtn.style.color = '#6a5a4a';
                musicBtn.style.borderColor = '#3a2a1a';
            } else {
                audio.play().catch(function(e) { alert('🩸 Click anywhere on the page first, then try again!'); });
                musicPlaying = true;
                localStorage.setItem('musicPlaying', 'true');
                musicBtn.textContent = '🔇 Stop Music';
                musicBtn.style.color = '#d4a060';
                musicBtn.style.borderColor = '#8b3a2a';
            }
        }
    