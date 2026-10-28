document.addEventListener('input', function (e) { if (e.target) e.target._seLastInput = Date.now(); }, true);

// ===== СИНХРОН СКРОЛЛА ПО ЯКОРЮ (а не по пикселям): работает при разной ширине окна у учителя и учеников =====
const SCROLL_REF = 100;
function scrollAnchorAt(y) {
    const refY = y + SCROLL_REF; let best = null, bt = -1;
    document.querySelectorAll('h2[id],h3[id],.exercise[id],[id^="sec-"],[id^="song-"],[data-anchor]').forEach(el => {
        if (!el.offsetParent) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= refY && top > bt) { bt = top; best = el; }
    });
    if (!best) return { y: Math.round(y) };
    return { y: Math.round(y), id: best.id, f: Math.round(((refY - bt) / (best.offsetHeight || 1)) * 1000) / 1000 };
}
function scrollToAnchor(cmd, smooth) {
    let y = cmd.y; const el = cmd.id && document.getElementById(cmd.id);
    if (el && el.offsetParent !== null) y = el.getBoundingClientRect().top + window.scrollY + (cmd.f || 0) * (el.offsetHeight || 1) - SCROLL_REF;
    window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: smooth ? 'smooth' : 'auto' });
}

// ============================================================
// FIREBASE SESSION MANAGEMENT
// ============================================================
let userName      = localStorage.getItem('se_userName')    || '';
let userSurname   = localStorage.getItem('se_userSurname') || '';
let userKey       = localStorage.getItem('se_userKey')     || '';
roomId            = localStorage.getItem('se_roomId')      || '';

// ============================================================
// ЭКРАНЫ ВХОДА
// ============================================================
function hideAllLoginScreens() {
    ['roleSelectScreen','teacherLoginScreen','studentLoginScreen','userInfoBlock','teacherInfoBlock']
      .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
}

function showRoleSelect() {
    hideAllLoginScreens();
    const el = document.getElementById('roleSelectScreen');
    if (el) el.style.display = 'flex';
}

function showTeacherLogin() {
    // Проверяем — может, уже входил как учитель менее 30 дней назад
    try {
        const saved = JSON.parse(localStorage.getItem('se_teacherAuth') || 'null');
        if (saved && saved.until && saved.until > Date.now()) {
            // Автовход без пароля
            isTeacher = true;
            userName = saved.name || 'Учитель';
            localStorage.setItem('se_role', 'teacher');
            hideAllLoginScreens();
            showRoomList();
            return;
        }
    } catch(e) {}

    hideAllLoginScreens();
    const el = document.getElementById('teacherLoginScreen');
    if (el) el.style.display = 'flex';
    const passInput = document.getElementById('teacherPassInput');
    if (passInput) passInput.focus();
}

function showStudentLogin() {
    hideAllLoginScreens();
    const el = document.getElementById('studentLoginScreen');
    if (el) el.style.display = 'flex';
    const info = document.getElementById('studentRoomInfo');
    if (info) {
        info.textContent = roomId ? '🏠 Комната: ' + roomId : '⚠️ Комната не указана. Попросите у учителя ссылку с ?room=...';
    }
}

function backToRoleSelect() {
    showRoleSelect();
}
// ============================================================
// ROOM LOGIC — Учитель создаёт, ученик заходит по ссылке
// ============================================================
const urlParams = new URLSearchParams(window.location.search);
const roomFromUrl  = urlParams.get('room');
const roleFromUrl  = urlParams.get('role');

// Если в URL ?room= — ученик пришёл по ссылке, показываем экран входа ученика
if (roomFromUrl) {
    setTimeout(showStudentLogin, 100);
} else {
    // Если нет room — либо учитель, либо ученик без ссылки. Показываем выбор роли.
    setTimeout(showRoleSelect, 100);
}


// 🔄 Ученик после обновления страницы входит сам (имя, ключ и комната уже известны) — без повторного «Войти».
// Данные берём ДО того, как ниже код очистит старые значения при открытии ссылки с ?room=
const _prevJoin = {
    name: localStorage.getItem('se_userName') || '', surname: localStorage.getItem('se_userSurname') || '',
    key: localStorage.getItem('se_userKey') || '', room: localStorage.getItem('se_joinedRoom') || ''
};
if (roomFromUrl && roleFromUrl !== 'teacher' && localStorage.getItem('se_role') !== 'teacher') {
    setTimeout(function () {
        if (typeof sessionReady !== 'undefined' && sessionReady) return;
        if (_prevJoin.name && _prevJoin.surname && _prevJoin.key && _prevJoin.room === roomFromUrl) {
            const n = document.getElementById('userNameInput'), s = document.getElementById('userSurnameInput');
            if (n && s) {
                n.value = _prevJoin.name; s.value = _prevJoin.surname;
                userKey = _prevJoin.key; localStorage.setItem('se_userKey', userKey);
                joinSession();
            }
        }
    }, 700);
}

// 🔄 Восстановление роли из localStorage
// Если уже входили как учитель ранее — показываем список комнат (или панель в комнате)
if (localStorage.getItem('se_role') === 'teacher' || roleFromUrl === 'teacher') {
    isTeacher = true;
    // Ждём, пока Firebase инициализируется, потом показываем панель учителя
    setTimeout(function() {
        if (roomId) {
            openTeacherPanel(true);   // учитель был в комнате → открываем панель
        } else {
            showRoomList();       // иначе → список комнат
        }
    }, 500);
}

// Если в URL есть ?room=XXX — значит, ученик пришёл по ссылке учителя
// и мы ВСЕГДА используем этот roomId, а свой старый userKey сбрасываем
if (roomFromUrl) {
    // Сбрасываем старые данные, чтобы ученик не подхватил чужой ключ
    localStorage.removeItem('se_userKey'); localStorage.removeItem('se_joinedRoom');
    localStorage.removeItem('se_userName');
    localStorage.removeItem('se_userSurname');
    userKey     = '';
    userName    = '';
    userSurname = '';

    roomId = roomFromUrl;
    localStorage.setItem('se_roomId', roomId);
} else {
    // Нет ?room= в URL — это либо учитель, либо ученик без ссылки.
    // Если уже есть сохранённая комната — используем её.
    if (!roomId) {
        // Генерируем новую (учитель откроет её первым)
        const now = new Date();
        const pad = n => String(n).padStart(2,'0');
        roomId = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}-${pad(now.getMinutes())}`;
        localStorage.setItem('se_roomId', roomId);
    }
}

// Роль учителя — только если явно ?role=teacher
if (roleFromUrl === 'teacher') {
    isTeacher = true;
    // кнопки ещё нет на странице (скрипт выполняется раньше разметки) — покажем её, когда страница загрузится
    const showSyncBtn = () => { const b = document.getElementById('syncPauseBtn'); if (b) b.style.display = 'flex'; };
    if (document.getElementById('syncPauseBtn')) showSyncBtn(); else document.addEventListener('DOMContentLoaded', showSyncBtn);
}



function buildRoomUrl(rid, asTeacher) {
    const url = new URL(window.location.href);
    url.searchParams.set('room', rid);
    if (asTeacher) {
        url.searchParams.set('role', 'teacher');
    } else {
        url.searchParams.delete('role');
    }
    return url.toString();
}



document.getElementById('roomIdLabel').textContent = roomId;

function waitForFB() {
    return new Promise(resolve => {
        const check = () => {
            if (window.__FB) { fb = window.__FB; resolve(fb); }
            else setTimeout(check, 100);
        };
        check();
    });
}

async function joinSession() {
    const nameEl    = document.getElementById('userNameInput');
    const surnameEl = document.getElementById('userSurnameInput');
    const name      = (nameEl.value || '').trim();
    const surname   = (surnameEl.value || '').trim();

    if (!name)    { alert('🩸 Введите имя'); return; }
    if (!surname) { alert('🩸 Введите хотя бы первую букву фамилии'); return; }

    userName    = name;
    userSurname = surname;
    localStorage.setItem('se_userName', userName);
    localStorage.setItem('se_userSurname', userSurname);
    localStorage.setItem('se_joinedRoom', roomId);   // запомнили: в этой комнате ученик уже был (для автовхода после обновления)

    fb = await waitForFB();

    try {   // комнаты, которой нет (удалена или неверная ссылка), заново не создаём
        const m = await fb.get(fb.ref(fb.db, `rooms/${roomId}/meta`));
        if (!m.exists()) { alert('Эта комната не найдена или уже закрыта. Попроси учителя прислать новую ссылку.'); return; }
    } catch (e) { console.warn('meta check', e); }

    if (!userKey) {
        userKey = await findOrCreateStudentKey(fb, roomId, userName, userSurname);
        localStorage.setItem('se_userKey', userKey);
    }

    const userRef = fb.ref(fb.db, `rooms/${roomId}/students/${userKey}`);
    await fb.set(userRef, {
        name: userName,
        surname: userSurname,
        joinedAt: fb.serverTimestamp(),
        online: true
    });
    fb.onDisconnect(userRef).update({ online: false, leftAt: fb.serverTimestamp() });

        // Скрываем экраны входа, показываем блок "внутри комнаты"
    hideAllLoginScreens();
    document.getElementById('userInfoBlock').style.display = 'flex';
    document.getElementById('currentUserLabel').textContent = `👤 ${userName} ${surname[0].toUpperCase()}. (${userKey})`;
    document.getElementById('roomIdLabel').textContent = roomId;

       sessionReady = true;
    startSyncListener();
    startPresenceListener();
    restoreAnswersFromFirebase();
    setupFirebaseAutosave();
    startTeacherAutoScroll();
    listenTeacherScroll();
    startHeartbeat();
    if (!isTeacher) showFreezeBtnIfStudent();
}

// ============================================================
// ВХОД УЧИТЕЛЯ ПО ПАРОЛЮ
// ============================================================
async function teacherLogin() {
    const nameEl = document.getElementById('teacherNameInput');
    const passEl = document.getElementById('teacherPassInput');
    const name   = (nameEl.value || '').trim() || 'Учитель';
    const pass   = (passEl.value || '').trim();

    if (pass !== 'winchester') {
        alert('❌ Неверный пароль');
        return;
    }

    isTeacher = true;
    localStorage.setItem('se_role', 'teacher');
localStorage.setItem('se_isTeacher', 'true'); 
    localStorage.setItem('se_userName', name);
    // Запоминаем учителя на 30 дней
    localStorage.setItem('se_teacherAuth', JSON.stringify({
        name: name,
        until: Date.now() + 30 * 24 * 60 * 60 * 1000
    }));
    userName = name;

    fb = await waitForFB();

    // Переключаемся на экран учителя (без комнаты)
    hideAllLoginScreens();
    // Показываем панель "Мои комнаты"
    showRoomList();
}

// ============================================================
// СПИСОК КОМНАТ УЧИТЕЛЯ
// ============================================================
async function showRoomList() {
    fb = await waitForFB();

    // Убираем старую панель, если есть
    const old = document.getElementById('roomListOverlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'roomListOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:100002;overflow-y:auto;padding:30px;';
    overlay.innerHTML = `
      <div style="max-width:900px;margin:0 auto;background:#14110d;border:2px solid #8b3a2a;border-radius:14px;padding:30px 35px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
          <h2 style="color:#d4a060;font-family:'Cinzel',serif;margin:0;">🏠 Мои комнаты</h2>
          <div style="display:flex;gap:8px;">
            <button onclick="createNewRoom()" style="background:linear-gradient(135deg,#1a3a1a,#0a2a0a);color:#7dcea0;border:1px solid #27ae60;border-radius:8px;padding:10px 20px;cursor:pointer;font-family:'Cinzel',serif;font-size:0.85em;">🆕 Создать новую комнату</button>
            <button onclick="closeRoomList()" style="background:#3a1a0a;color:#d4a060;border:1px solid #8b3a2a;border-radius:8px;padding:10px 20px;cursor:pointer;font-family:'Cinzel',serif;">✕ Закрыть</button>
          </div>
        </div>
        <p style="color:#6a5a4a;font-size:0.85em;margin:0 0 20px 0;">Каждая комната — отдельный класс или группа. Ученики не пересекаются между комнатами.</p>
        <div id="roomsGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
          <p style="color:#888;">Загрузка...</p>
        </div>
        <div style="margin-top:25px;padding-top:20px;border-top:1px solid #2a2018;text-align:center;">
                    <button onclick="logoutTeacherForever()" style="background:linear-gradient(135deg,#3a1a0a,#1a0a05);color:#d4a060;border:1px solid #8b3a2a;border-radius:8px;padding:8px 20px;cursor:pointer;font-family:'Cinzel',serif;font-size:0.85em;">🚪 Выйти из аккаунта учителя</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    renderRoomsList();
}

async function deleteRoom(rid) {
    if (!confirm('🩸 Удалить комнату "' + rid + '" и ВСЕ ответы учеников?\n\nЭто действие нельзя отменить.')) return;
    if (!confirm('⚠️ Точно удалить? Ответы всех учеников этой комнаты будут потеряны.')) return;

    fb = await waitForFB();
    try {
        if (fb.markGone) fb.markGone(rid);                         // с этого момента записи внутрь неё отбрасываются
        if (rid === roomId) { try { exitRoomToRoomList(); } catch (e) {} }   // учитель сам находится в этой комнате → выходим
        await fb.remove(fb.ref(fb.db, `rooms/${rid}`));
        console.log('🗑 Комната удалена:', rid);
        renderRoomsList();
    } catch(e) {
        alert('❌ Не удалось удалить: ' + (e.message || e));
    }
}
// Выход из комнаты в список "Мои комнаты" (учитель остаётся учителем)
function exitRoomToRoomList() {
    // Скрываем панель учителя
    const teacherBar = document.getElementById('teacherInfoBlock');
    if (teacherBar) teacherBar.style.display = 'none';
    document.body.classList.remove('teacher-bar-active');
    document.body.classList.remove('teacher-bar-collapsed');

    // Скрываем кнопку ⏸
    const pauseBtn = document.getElementById('syncPauseBtn');
    if (pauseBtn) pauseBtn.style.display = 'none';

    // Закрываем панель управления
    const panel = document.getElementById('teacherPanelOverlay');
    if (panel) panel.remove();

    // Возвращаемся в список комнат
    roomId = '';
    showRoomList();

roomId = '';
    localStorage.removeItem('se_roomId');

    // 👇 Очищаем URL от ?room и ?role
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.searchParams.delete('role');
    window.history.replaceState({}, '', url.toString());

    showRoomList();

}

function closeRoomList() {
    const el = document.getElementById('roomListOverlay');
    if (el) el.remove();
}

async function renderRoomsList() {
    fb = await waitForFB();
    const grid = document.getElementById('roomsGrid');
    if (!grid) return;

    // Читаем все комнаты из Firebase
    const roomsSnap = await fb.get(fb.ref(fb.db, 'rooms'));
    const allRooms = roomsSnap.val() || {};
    // «Призраки»: узлы без meta (остатки от записей в уже удалённую комнату) — не показываем и удаляем
    const rooms = {};
    Object.keys(allRooms).forEach(k => {
        if (allRooms[k] && allRooms[k].meta) rooms[k] = allRooms[k];
        else fb.remove(fb.ref(fb.db, `rooms/${k}`)).catch(() => {});
    });
    const roomIds = Object.keys(rooms).sort().reverse();

    if (roomIds.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;border:1px dashed #3a2a1a;border-radius:10px;">
            <p style="font-size:1.1em;margin:0 0 8px 0;">📭 Комнат пока нет</p>
            <p style="font-size:0.85em;margin:0;">Нажми <strong style="color:#7dcea0;">🆕 Создать новую комнату</strong> чтобы начать.</p>
          </div>`;
        return;
    }

    let html = '';
    for (const rid of roomIds) {
        const room = rooms[rid] || {};
        const students = room.students || {};
        const studentCount = Object.keys(students).length;
        // Онлайн: lastSeen < 60 сек назад
        const now = Date.now();
        const onlineCount = Object.values(students).filter(s => {
            if (!s) return false;
            if (s.lastSeen) {
                const last = new Date(s.lastSeen).getTime();
                return (now - last) < 60000;
            }
            return s.online === true;
        }).length;
        const answersCount = Object.keys(room.answers || {}).length;

        html += `
          <div style="background:#1e1a15;border:1px solid #3a2a1a;border-left:4px solid #d4a060;border-radius:8px;padding:16px 18px;">
            <div style="color:#d4a060;font-family:'Cinzel',serif;font-size:0.95em;margin-bottom:8px;word-break:break-all;">🏠 ${rid}</div>
            <div style="color:#b0a890;font-size:0.8em;margin-bottom:4px;">👥 Учеников: <strong>${studentCount}</strong> · 🟢 Онлайн: <strong style="color:#27ae60;">${onlineCount}</strong></div>
            <div style="color:#6a7a7a;font-size:0.75em;margin-bottom:12px;">📝 Ответов: <strong>${answersCount}</strong></div>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button onclick="enterRoomAsTeacher('${rid}')" style="background:linear-gradient(135deg,#1a2a3a,#0a1a2a);color:#5dade2;border:1px solid #2980b9;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:0.75em;flex:1;min-width:120px;">🎓 Войти в комнату</button>
              <button onclick="copyRoomLink('${rid}')" style="background:linear-gradient(135deg,#1a3a1a,#0a2a0a);color:#7dcea0;border:1px solid #27ae60;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:0.75em;flex:1;min-width:120px;">🔗 Скопировать ссылку</button>
              <button onclick="deleteRoom('${rid}')" style="background:linear-gradient(135deg,#3a1a1a,#2a0a0a);color:#e74c3c;border:1px solid #c0392b;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:0.75em;flex:0 0 auto;">🗑 Удалить</button>
            </div>
          </div>
        `;
    }
    grid.innerHTML = html;
}

async function createNewRoom() {
    const name = prompt('Название комнаты (например, "Группа 5 — Intermediate" или "Иван — Individual"):');
    if (!name || name.trim() === '') return;

    // Генерируем ID: дата-время-слаг
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9а-я]+/gi, '-').slice(0, 30);
    const rid = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${slug}`;

    fb = await waitForFB();
    // Создаём пустую комнату в Firebase
    await fb.set(fb.ref(fb.db, `rooms/${rid}/meta`), {
        name: name.trim(),
        createdAt: fb.serverTimestamp(),
        createdBy: userName || 'teacher'
    });

    // Обновляем список
    renderRoomsList();

    // И сразу копируем ссылку
    copyRoomLink(rid);
}

function copyRoomLink(rid) {
    const url = new URL(window.location.href);
    url.searchParams.set('room', rid);
    url.searchParams.delete('role');
    const link = url.toString();
    navigator.clipboard.writeText(link).then(() => {
        alert('🔗 Ссылка для учеников скопирована:\n\n' + link + '\n\nОтправьте её ученикам этой группы.');
    }).catch(() => {
        prompt('Скопируйте ссылку вручную:', link);
    });
}

async function enterRoomAsTeacher(rid) {
    roomId = rid;
    localStorage.setItem('se_roomId', rid);
    isTeacher = true;
    localStorage.setItem('se_role', 'teacher');
 localStorage.setItem('se_isTeacher', 'true'); 


 // 👇 ДОБАВИТЬ: обновляем URL без перезагрузки
    const url = new URL(window.location.href);
    url.searchParams.set('room', rid);
    url.searchParams.set('role', 'teacher');
    window.history.replaceState({}, '', url.toString());


    // Закрываем список комнат
    closeRoomList();

    // Открываем панель учителя
    openTeacherPanel();

    // Обновляем индикатор
    const teacherRoomLabel = document.getElementById('teacherRoomLabel');
    if (teacherRoomLabel) teacherRoomLabel.textContent = rid;
    const teacherLabel = document.getElementById('teacherLabel');
    if (teacherLabel) teacherLabel.textContent = '🎓 Учитель — ' + (userName || '');
}



   
    

async function findOrCreateStudentKey(fb, rid, name, surname) {
    const studentsRef = fb.ref(fb.db, `rooms/${rid}/students`);
    const snap = await fb.get(studentsRef);
    const students = snap.val() || {};
    const shortName = (name + ' ' + surname[0].toUpperCase()).toLowerCase();

    let maxN = 0;
    let foundKey = null;
    for (const [key, val] of Object.entries(students)) {
        if (val && val.name && val.surname) {
            const short = (val.name + ' ' + val.surname[0].toUpperCase()).toLowerCase();
            if (short === shortName) { foundKey = key; break; }
        }
        const m = key.match(/^student_(\d+)$/);
        if (m) maxN = Math.max(maxN, parseInt(m[1]));
    }
    if (foundKey) return foundKey;
    return `student_${maxN + 1}`;
}

function logoutSession() {
    localStorage.removeItem('se_userKey'); localStorage.removeItem('se_joinedRoom');
    localStorage.removeItem('se_userName');
    localStorage.removeItem('se_userSurname');
    localStorage.removeItem('se_role');
    localStorage.removeItem('se_roomId');
    // НЕ трогаем se_teacherAuth — учитель может быстро вернуться
    // Просто перезагружаем без параметров — покажется экран "Кто вы?"
    location.href = window.location.pathname;
}

// Полный выход учителя с потерей авторизации (на 30 дней)
function logoutTeacherForever() {
    if (!confirm('🩸 Выйти из аккаунта учителя?\n\nВ следующий раз придётся снова ввести пароль.')) return;
    localStorage.removeItem('se_userKey'); localStorage.removeItem('se_joinedRoom');
    localStorage.removeItem('se_userName');
    localStorage.removeItem('se_userSurname');
    localStorage.removeItem('se_role');
    localStorage.removeItem('se_roomId');
    localStorage.removeItem('se_teacherAuth');  // вот это сотрёт автовход
localStorage.removeItem('se_role');         // ← ДОБАВИТЬ
    localStorage.removeItem('se_isTeacher');    // ← ДОБАВИТЬ
    location.href = window.location.pathname;
}

function copyStudentLink() {
    const url = buildRoomUrl(roomId, false);
    navigator.clipboard.writeText(url).then(() => {
        alert('🔗 Ссылка для учеников скопирована:\n\n' + url + '\n\nУченики откроют её, введут имя и первую букву фамилии.');
    }).catch(() => {
        prompt('Скопируйте ссылку вручную:', url);
    });
}


// ============================================================
// HEARTBEAT — ученик "онлайн" если был активен < 60 сек назад
// ============================================================
let heartbeatInterval = null;
let roomClosed = false;   // комнату удалил учитель: больше ничего в неё не пишем, чтобы она не воскресла
function showRoomClosed() {
    if (document.getElementById('roomClosedBanner')) return;
    const d = document.createElement('div'); d.id = 'roomClosedBanner';
    d.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:100001;background:#5a1a12;color:#f0d9c0;padding:12px 16px;text-align:center;font:600 14px Montserrat,sans-serif;box-shadow:0 4px 16px #000a';
    d.textContent = '🚪 Комната закрыта учителем. Твои ответы больше не сохраняются — попроси новую ссылку.';
    document.body.appendChild(d);
}

function startHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (!sessionReady || !fb || !userKey || !roomId) return;

    // Сразу отправляем
    fb.update(fb.ref(fb.db, `rooms/${roomId}/students/${userKey}`), {
        lastSeen: fb.serverTimestamp(),
        online: true
    }).catch(() => {});

    // Если запись ученика (или вся комната) исчезла — комнату удалили: перестаём писать
    if (!window._roomWatch) {
        window._roomWatch = true; let seen = false;
        fb.onValue(fb.ref(fb.db, `rooms/${roomId}/students/${userKey}`), s => {
            if (s.exists()) { seen = true; roomClosed = false; return; }
            if (seen) { roomClosed = true; if (heartbeatInterval) clearInterval(heartbeatInterval); showRoomClosed(); }
        });
    }

    // Каждые 30 секунд
    heartbeatInterval = setInterval(() => {
        if (!sessionReady || !fb || !userKey || roomClosed) return;
        fb.update(fb.ref(fb.db, `rooms/${roomId}/students/${userKey}`), {
            lastSeen: fb.serverTimestamp(),
            online: true
        }).catch(() => {});
       }, 60000);

    // При закрытии вкладки
    window.addEventListener('beforeunload', () => {
        if (fb && roomId && userKey && !roomClosed) {
            fb.update(fb.ref(fb.db, `rooms/${roomId}/students/${userKey}`), {
                online: false,
                leftAt: fb.serverTimestamp()
            });
        }
    });
}

function startPresenceListener() {
    const studentsRef = fb.ref(fb.db, `rooms/${roomId}/students`);
        fb.onValue(studentsRef, snap => {
        const list = snap.val() || {};
        const now = Date.now();
        // Онлайн — если lastSeen < 60 сек назад ИЛИ online:true без lastSeen
        const onlineCount = Object.values(list).filter(s => {
            if (!s) return false;
            if (s.lastSeen) {
                const last = new Date(s.lastSeen).getTime();
                return (now - last) < 60000;
            }
            return s.online === true;
        }).length;
        document.getElementById('onlineCount').textContent = onlineCount || 1;
    });
}

function setupFirebaseAutosave() {
    document.addEventListener('input', e => {
        if (!sessionReady || !fb) return;
        const t = e.target;
        if (!t.id) return;
        if (['INPUT','TEXTAREA','SELECT'].includes(t.tagName)) {
            window._fbSaveTimers = window._fbSaveTimers || {};
            clearTimeout(window._fbSaveTimers[t.id]);
            window._fbSaveTimers[t.id] = setTimeout(() => {
                saveFieldToFirebase(t.id, t.value, t.tagName === 'SELECT' ? 'select' : 'text');
            }, 700);
        }
    });
    document.addEventListener('change', e => {
        if (!sessionReady || !fb) return;
        const t = e.target;
        if (t.id && ['INPUT','TEXTAREA','SELECT'].includes(t.tagName) && t.type !== 'radio' && t.type !== 'checkbox') {
            clearTimeout((window._fbSaveTimers || {})[t.id]);
            saveFieldToFirebase(t.id, t.value, t.tagName === 'SELECT' ? 'select' : 'text');
        }
        if (t.type === 'radio' && t.name)   saveFieldToFirebase('radio_' + t.name, t.value, 'radio');
        if (t.type === 'checkbox' && t.id)  saveFieldToFirebase('cb_' + t.id, t.checked, 'checkbox');
        if (t.classList && t.classList.contains('progress-check'))
            saveFieldToFirebase('progress_' + t.dataset.section, t.checked, 'checkbox');
        if (t.classList && t.classList.contains('final-check'))
            saveFieldToFirebase('final_' + t.dataset.task, t.checked, 'checkbox');
    });
}

function saveFieldToFirebase(fieldId, value, type) {
    if (!sessionReady || !fb || isTeacher || roomClosed) return;
    const path = `rooms/${roomId}/answers/${userKey}/${fieldId}`;
    fb.set(fb.ref(fb.db, path), { v: value, t: type, at: fb.serverTimestamp() }).catch(e => console.warn(e));
}

function startSyncListener() {
    if (!sessionReady || !fb || !userKey) return;
    const myRef = fb.ref(fb.db, `rooms/${roomId}/answers/${userKey}`);
    fb.onValue(myRef, snap => {
        const data = snap.val() || {};
        for (const [fid, obj] of Object.entries(data)) {
            applyRemoteField(fid, obj.v, obj.t);
        }
    });

       // 🎥 Подписка на команды видео от учителя (только один раз)
    if (!window._videoCmdListenerAttached) {
        window._videoCmdListenerAttached = true;
        listenVideoCommands();
    }

    // 🎬 Слушаем команды учителя (скролл / презентация)
    if (!isTeacher) {
        const cmdRef = fb.ref(fb.db, `rooms/${roomId}/command`);
        let lastCommandAt = 0;
        fb.onValue(cmdRef, snap => {
            const cmd = snap.val();
            if (!cmd || !cmd.at || cmd.from === 'teacher-not-me') return;
            // Не реагируем дважды на одну команду
            const cmdTime = new Date(cmd.at).getTime ? new Date(cmd.at).getTime() : cmd.at;
            if (cmdTime <= lastCommandAt) return;
            lastCommandAt = cmdTime;

            if (cmd.action === 'scroll') {
                showTeacherCommandToast('📺 Учитель ведёт урок: ' + cmd.target);
                if (cmd.target === 'top') {
                    window.scrollTo({top: 0, behavior: 'smooth'});
                } else {
                    const el = document.getElementById(cmd.target);
                    if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({top: y, behavior: 'smooth'});
                    }
                }
            }
        });
    }
}

// ============ ПЛАШКА (тихая, больше не используется) ============
function showTeacherCommandToast(text) {
    return; // отключено — не хотим мешать ученикам
}
    



function applyRemoteField(fieldId, value, type) {
    if (fieldId.startsWith('radio_')) {
        const r = document.querySelector(`input[name="${fieldId.replace('radio_','')}"][value="${value}"]`);
        if (r) r.checked = true;
        return;
    }
    if (fieldId.startsWith('cb_')) {
        const el = document.getElementById(fieldId.replace('cb_',''));
        if (el) el.checked = !!value;
        return;
    }
    if (fieldId.startsWith('progress_')) {
        const el = document.querySelector(`.progress-check[data-section="${fieldId.replace('progress_','')}"]`);
        if (el) el.checked = !!value;
        return;
    }
    if (fieldId.startsWith('final_')) {
        const el = document.querySelector(`.final-check[data-task="${fieldId.replace('final_','')}"]`);
        if (el) el.checked = !!value;
        return;
    }
    const el = document.getElementById(fieldId);
    if (!el) return;
    if (el.value === String(value)) return;
    // не трогаем поле, в которое человек печатает прямо сейчас (иначе приходит «эхо» старой версии и стирает буквы)
    if (document.activeElement === el || (Date.now() - (el._seLastInput || 0)) < 2500) return;
    el.value = value;
    el.style.transition = 'background 0.4s';
    el.style.background = 'rgba(212,160,96,0.15)';
    setTimeout(() => { el.style.background = ''; }, 700);
}

async function restoreAnswersFromFirebase() {
    if (!fb || !userKey) return;
    const snap = await fb.get(fb.ref(fb.db, `rooms/${roomId}/answers/${userKey}`));
    const data = snap.val() || {};
    for (const [fid, obj] of Object.entries(data)) {
        applyRemoteField(fid, obj.v, obj.t);
    }
}

// ============================================================
// ПАНЕЛЬ УЧИТЕЛЯ — РЕАЛЬНОЕ ВРЕМЯ
// ============================================================
function openTeacherPanel(auto) {
    if (!isTeacher) {
        alert('⚠️ Сначала войдите как учитель');
        return;
    }
    // Показываем панель учителя (внутри комнаты)
    hideAllLoginScreens();
    const el = document.getElementById('teacherInfoBlock');
    if (el) el.style.display = 'flex';

    // Показываем кнопку ⏸ Стоп-синхрон у учителя
    const pauseBtn = document.getElementById('syncPauseBtn');
    if (pauseBtn) pauseBtn.style.display = 'flex';

    const videoBar = document.getElementById('videoControlsBar');
    if (videoBar) videoBar.style.display = 'block';

    // Запускаем автоскролл учителя (шлёт команды при скролле)
    startTeacherAutoScroll();
    // Слушаем команды скролла для учеников
    listenTeacherScroll();

    // Обновляем body класс для отступа
    document.body.classList.add('teacher-bar-active');
    // Активируем класс body для отступа контента
    document.body.classList.add('teacher-bar-active');
    // Восстанавливаем свёрнутое состояние
    const collapsed = localStorage.getItem('teacherBarCollapsed') === 'true';
    if (collapsed && el) {
        el.classList.add('collapsed');
        document.body.classList.add('teacher-bar-collapsed');
        const btn = document.getElementById('teacherBarToggle');
        if (btn) btn.textContent = '▴';
    }
    // Обновляем лейбл комнаты
    const teacherRoomLabel = document.getElementById('teacherRoomLabel');
    if (teacherRoomLabel) teacherRoomLabel.textContent = roomId || '—';
    const teacherLabel = document.getElementById('teacherLabel');
    if (teacherLabel) teacherLabel.textContent = '🎓 Учитель — ' + (userName || '');

    if (!auto) renderTeacherPanel();   // большое окно — только по кнопке, не при автовосстановлении
    // Запускаем heartbeat и слушателей для учителя
    startTeacherPresence();
}

let teacherUnsub = null;
let teacherAnswersUnsub = null;


function startTeacherPresence() {
    if (!fb || !roomId) return;
    const studentsRef = fb.ref(fb.db, `rooms/${roomId}/students`);
    fb.onValue(studentsRef, snap => {
        const list = snap.val() || {};
        const now = Date.now();
        const onlineCount = Object.values(list).filter(s => {
            if (!s) return false;
            if (s.lastSeen) {
                const last = new Date(s.lastSeen).getTime();
                return (now - last) < 60000;
            }
            return s.online === true;
        }).length;
        const el = document.getElementById('teacherOnlineCount');
        if (el) el.textContent = onlineCount || 0;
    });
}


async function renderTeacherPanel() {
    fb = await waitForFB();

    // Убираем старую панель, если есть
    const old = document.getElementById('teacherPanelOverlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'teacherPanelOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:100000;overflow-y:auto;padding:30px;';
    overlay.innerHTML = `
      <div style="max-width:1100px;margin:0 auto;background:#14110d;border:2px solid #8b3a2a;border-radius:14px;padding:25px 30px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
          <h2 style="color:#d4a060;font-family:'Cinzel',serif;margin:0;">🎓 Teacher Panel — Room: ${roomId}</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button onclick="copyStudentLink()" style="background:#1a2a1a;color:#7dcea0;border:1px solid #27ae60;border-radius:8px;padding:8px 16px;cursor:pointer;font-family:'Cinzel',serif;font-size:0.8em;">🔗 Ссылка для учеников</button>
            <button onclick="document.getElementById('teacherPanelOverlay').remove()" style="background:#3a1a0a;color:#d4a060;border:1px solid #8b3a2a;border-radius:8px;padding:8px 20px;cursor:pointer;font-family:'Cinzel',serif;">✕ Закрыть</button>
          </div>
        </div>

        <!-- ПАНЕЛЬ УПРАВЛЕНИЯ ПРЕЗЕНТАЦИЕЙ -->
        <div style="background:#1a1611;border:1px solid #3a2a1a;border-radius:10px;padding:14px 18px;margin-bottom:18px;">
          <p style="color:#d4a060;font-family:'Cinzel',serif;font-size:0.95em;margin:0 0 10px 0;">🎬 Управление презентацией (для всех учеников)</p>
          <p style="color:#d4a060;font-family:'Cinzel',serif;font-size:0.95em;margin:14px 0 8px 0;">🎥 Управление видео (VK)</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
                       <button onclick="teacherVideoPlayBoth()" class="tp-btn" style="background:linear-gradient(135deg,#1a3a1a,#0a2a0a);border-color:#27ae60;color:#7dcea0;">▶ Play у всех</button>
            <button onclick="teacherVideoPauseBoth()" class="tp-btn" style="background:linear-gradient(135deg,#3a1a1a,#2a0a0a);border-color:#c0392b;color:#e74c3c;">⏸ Pause у всех</button>
            <button onclick="teacherVideoSeekByBoth(-10)" class="tp-btn">⏪ -10 сек</button>
            <button onclick="teacherVideoSeekByBoth(-5)" class="tp-btn">⏪ -5 сек</button>
            <button onclick="teacherVideoSeekByBoth(5)" class="tp-btn">⏩ +5 сек</button>
            <button onclick="teacherVideoSeekByBoth(10)" class="tp-btn">⏩ +10 сек</button>
            <button onclick="teacherVideoSeekToBoth(0)" class="tp-btn">⏮ В начало</button>
          </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button onclick="teacherScrollTo('top')" class="tp-btn">⬆ В начало</button>
            <button onclick="teacherScrollTo('sec-id')" class="tp-btn">🆔 ID Card</button>
            <button onclick="teacherScrollTo('sec-intro')" class="tp-btn">👋 Getting to Know</button>
            <button onclick="teacherScrollTo('sec-supernatural')" class="tp-btn">🎬 Supernatural</button>
            <button onclick="teacherScrollTo('sec-whoiswho')" class="tp-btn">🔍 Who is Who</button>
            <button onclick="teacherScrollTo('sec-brother')" class="tp-btn">🤔 Which Brother</button>
            <button onclick="teacherScrollTo('sec-trunk')" class="tp-btn">🧳 Trunk</button>
            <button onclick="teacherScrollTo('sec-grammar')" class="tp-btn">📝 Grammar</button>
                        <button onclick="teacherScrollTo('sec-song')" class="tp-btn">🎵 Song</button>
            <button onclick="teacherScrollTo('song-listen')" class="tp-btn">🎸 Listen</button>
            <button onclick="teacherScrollTo('sec-reading')" class="tp-btn">📖 Reading</button>
            <button onclick="teacherScrollTo('sec-reflection')" class="tp-btn">📝 Reflection</button>
            <button onclick="teacherScrollTo('sec-final')" class="tp-btn">🏆 Final</button>
          </div>
          <p style="color:#6a5a4a;font-size:0.75em;margin:8px 0 0 0;">💡 Ученики автоматически прокрутят страницу к нужному разделу.</p>
        </div>

        <!-- СПИСОК УЧЕНИКОВ -->
        <div id="teacherStudentsGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">
          <p style="color:#888;font-size:0.9em;">Загрузка учеников...</p>
        </div>
        <p style="color:#6a5a4a;font-size:0.75em;margin-top:16px;text-align:center;">🔄 Список обновляется автоматически</p>
      </div>

      <style>
        .tp-btn { background:linear-gradient(135deg,#2a1a12,#1a100a); color:#d4c9a8; border:1px solid #4a3a2a; border-radius:6px; padding:6px 12px; cursor:pointer; font-family:'Cinzel',serif; font-size:0.78em; transition:all 0.2s; }
        .tp-btn:hover { border-color:#8b3a2a; color:#d4a060; }
      </style>
    `;
    document.body.appendChild(overlay);

    // Подписываемся на изменение списка учеников — авто-обновление
           if (teacherUnsub) teacherUnsub();
    const studentsRef = fb.ref(fb.db, `rooms/${roomId}/students`);
    teacherUnsub = fb.onValue(studentsRef, async snap => {
        const students = snap.val() || {};
        const grid = document.getElementById('teacherStudentsGrid');
        if (!grid) return;

        const keys = Object.keys(students);
        const onlineCount = keys.filter(k => students[k] && students[k].online).length;

        const cardsData = [];
        for (const key of keys) {
            const s = students[key] || {};
            const aSnap = await fb.get(fb.ref(fb.db, `rooms/${roomId}/answers/${key}`));
            const answers = aSnap.val() || {};
            let filled = 0;
            for (const k in answers) {
                if (answers[k] && answers[k].v !== undefined && answers[k].v !== '') filled++;
            }
            cardsData.push({ key, s, filled });
        }

        if (keys.length === 0) {
            grid.innerHTML = `
              <div style="grid-column:1/-1;text-align:center;padding:30px;color:#888;border:1px dashed #3a2a1a;border-radius:10px;">
                <p style="font-size:1.1em;margin:0 0 8px 0;">👻 Учеников пока нет</p>
                <p style="font-size:0.85em;margin:0;">Нажми <strong style="color:#7dcea0;">🔗 Ссылка для учеников</strong> и отправь её группе.</p>
              </div>`;
            return;
        }

        cardsData.sort((a,b) => (b.s.online?1:0) - (a.s.online?1:0));

        let html = `
          <div style="grid-column:1/-1;color:#b0a890;font-size:0.85em;padding:8px 12px;background:#1a1611;border-radius:8px;margin-bottom:6px;">
            👥 Всего: <strong>${keys.length}</strong> · 🟢 Онлайн: <strong style="color:#27ae60;">${onlineCount}</strong>
          </div>
        `;

        cardsData.forEach(({key, s, filled}) => {
            const initial = s.surname ? s.surname[0].toUpperCase()+'.' : '';
            html += `
              <div style="background:#1e1a15;border:1px solid #3a2a1a;border-left:4px solid ${s.online?'#27ae60':'#555'};border-radius:8px;padding:14px 18px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <strong style="color:#d4a060;font-family:'Cinzel',serif;">${key}</strong>
                  <span style="color:${s.online?'#27ae60':'#888'};font-size:0.75em;">${s.online?'● online':'○ offline'}</span>
                </div>
                <div style="color:#fff;font-size:1em;margin-bottom:6px;font-weight:bold;">👤 ${s.name||'—'} ${initial}</div>
                <div style="color:#6a7a7a;font-size:0.75em;margin-bottom:10px;">📝 Полей заполнено: <strong style="color:#d4a060;">${filled}</strong></div>
                <button onclick="viewStudentAnswers('${key}')" style="background:linear-gradient(135deg,#2a1a12,#1a100a);color:#d4c9a8;border:1px solid #4a3a2a;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:0.8em;width:100%;">👁 Показать ответы</button>
              </div>
            `;
        });

        grid.innerHTML = html;
    });
}

/// ============ УПРАВЛЕНИЕ ПРЕЗЕНТАЦИЕЙ ============
async function teacherScrollTo(sectionId) {
    if (!fb) fb = await waitForFB();
    if (syncPaused) return;  // учитель на паузе — не шлём
    let y = 0;
    if (sectionId !== 'top') {
        const el = document.getElementById(sectionId);
        if (el) y = Math.round(el.getBoundingClientRect().top + window.scrollY - 120);
    }
    // Локально едем сами
    window.scrollTo({ top: y, behavior: 'smooth' });
    // Шлём ученикам через ОДИН канал
    await fb.set(fb.ref(fb.db, `rooms/${roomId}/scrollCommand`), Object.assign(scrollAnchorAt(y), { at: Date.now() }));
}
// ============ ПРОСМОТР ОТВЕТОВ УЧЕНИКА ============
async function viewStudentAnswers(studentKey) {
    fb = await waitForFB();
    const snap = await fb.get(fb.ref(fb.db, `rooms/${roomId}/answers/${studentKey}`));
    const data = snap.val() || {};

    // Данные ученика
    const sSnap = await fb.get(fb.ref(fb.db, `rooms/${roomId}/students/${studentKey}`));
    const student = sSnap.val() || {};

    let html = `<div id="studentAnswersOverlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.94);z-index:100001;overflow-y:auto;padding:30px;">
      <div style="max-width:850px;margin:0 auto;background:#14110d;border:2px solid #8b3a2a;border-radius:14px;padding:25px 30px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="color:#d4a060;font-family:'Cinzel',serif;margin:0;">👁 ${studentKey} — ${student.name||''} ${student.surname?student.surname[0].toUpperCase()+'.':''}</h3>
          <button onclick="document.getElementById('studentAnswersOverlay').remove()" style="background:#3a1a0a;color:#d4a060;border:1px solid #8b3a2a;border-radius:8px;padding:8px 20px;cursor:pointer;">✕</button>
        </div>`;

    const sorted = Object.entries(data).sort((a,b) => a[0].localeCompare(b[0]));
    if (sorted.length === 0) {
        html += `<p style="color:#888;text-align:center;padding:20px;">(нет данных — ученик ещё не заполнил ни одного поля)</p>`;
    } else {
        for (const [fid, obj] of sorted) {
            let displayValue = obj.v;
            if (typeof obj.v === 'boolean') displayValue = obj.v ? '✅ Да' : '❌ Нет';
            if (obj.t === 'radio') displayValue = `🔘 ${obj.v}`;
            if (obj.t === 'select') {
                const el = document.getElementById(fid);
                if (el && el.options) {
                    const opt = Array.from(el.options).find(o => o.value === obj.v);
                    if (opt) displayValue = opt.text;
                }
            }
            html += `<div style="margin:6px 0;padding:10px 14px;background:#1e1a15;border-radius:6px;border-left:3px solid #4a3a2a;">
              <span style="color:#6a7a7a;font-size:0.72em;font-family:monospace;">${fid}</span><br>
              <span style="color:#d4c9a8;font-size:0.92em;">${displayValue||'(пусто)'}</span>
            </div>`;
        }
    }
    html += `</div></div>`;

    const overlay = document.createElement('div');
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
}



// ============ ЖИВОЙ ПРОСМОТР ОТВЕТОВ УЧЕНИКА ============
async function viewStudentAnswers(studentKey) {
    fb = await waitForFB();

    // Убираем старую панель, если открыта
    const old = document.getElementById('studentAnswersOverlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'studentAnswersOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.94);z-index:100001;overflow-y:auto;padding:30px;';
    overlay.innerHTML = `
      <div style="max-width:850px;margin:0 auto;background:#14110d;border:2px solid #8b3a2a;border-radius:14px;padding:25px 30px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 id="studentAnswersTitle" style="color:#d4a060;font-family:'Cinzel',serif;margin:0;">👁 ${studentKey} — загрузка...</h3>
          <button onclick="closeStudentAnswers()" style="background:#3a1a0a;color:#d4a060;border:1px solid #8b3a2a;border-radius:8px;padding:8px 20px;cursor:pointer;">✕</button>
        </div>
        <p style="color:#6a5a4a;font-size:0.75em;margin:0 0 12px 0;">🔄 Обновляется в реальном времени — ты видишь, что ученик печатает прямо сейчас.</p>
        <div id="studentAnswersBody"><p style="color:#888;">Загрузка...</p></div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Заголовок
    const sSnap = await fb.get(fb.ref(fb.db, `rooms/${roomId}/students/${studentKey}`));
    const student = sSnap.val() || {};
    const title = document.getElementById('studentAnswersTitle');
    if (title) {
        const initial = student.surname ? student.surname[0].toUpperCase() + '.' : '';
        title.textContent = `👁 ${studentKey} — ${student.name || ''} ${initial}`;
    }

    // 🎯 ЖИВАЯ ПОДПИСКА
    if (teacherAnswersUnsub) { teacherAnswersUnsub(); teacherAnswersUnsub = null; }
    const answersRef = fb.ref(fb.db, `rooms/${roomId}/answers/${studentKey}`);
    teacherAnswersUnsub = fb.onValue(answersRef, snap => {
        const data = snap.val() || {};
        renderStudentAnswersLive(data);
    });
}

function closeStudentAnswers() {
    if (teacherAnswersUnsub) { teacherAnswersUnsub(); teacherAnswersUnsub = null; }
    const el = document.getElementById('studentAnswersOverlay');
    if (el) el.remove();
}

function renderStudentAnswersLive(data) {
    const body = document.getElementById('studentAnswersBody');
    if (!body) return;

    const sorted = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
    if (sorted.length === 0) {
        body.innerHTML = `<p style="color:#888;text-align:center;padding:20px;">(нет данных — ученик ещё не заполнил ни одного поля)</p>`;
        return;
    }

    // Считаем статистику
    let total = 0, answered = 0;
    for (const [fid, obj] of sorted) {
        total++;
        if (obj && obj.v !== undefined && obj.v !== '' && obj.v !== null) answered++;
    }

    let html = `<div style="color:#b0a890;font-size:0.8em;margin-bottom:10px;padding:8px 12px;background:#1a1611;border-radius:6px;">
        📊 Заполнено: <strong style="color:#d4a060;">${answered}</strong> / ${total} полей
    </div>`;

    for (const [fid, obj] of sorted) {
        if (!obj) continue;
        let displayValue = obj.v;
        if (typeof obj.v === 'boolean') displayValue = obj.v ? '✅ Да' : '❌ Нет';
        if (obj.t === 'radio') displayValue = `🔘 ${obj.v}`;
        if (obj.t === 'select') {
            const el = document.getElementById(fid);
            if (el && el.options) {
                const opt = Array.from(el.options).find(o => o.value === obj.v);
                if (opt) displayValue = opt.text;
            }
        }
        const isEmpty = (obj.v === '' || obj.v === null || obj.v === undefined);
        html += `<div style="margin:6px 0;padding:10px 14px;background:#1e1a15;border-radius:6px;border-left:3px solid ${isEmpty ? '#4a3a2a' : '#27ae60'};">
            <span style="color:#6a7a7a;font-size:0.72em;font-family:monospace;">${fid}</span><br>
            <span style="color:${isEmpty ? '#6a5a4a' : '#d4c9a8'};font-size:0.92em;white-space:pre-wrap;">${displayValue === '' || displayValue === undefined ? '(пусто)' : String(displayValue).replace(/</g, '&lt;')}</span>
        </div>`;
    }
    body.innerHTML = html;
}





// ============================================================
// АВТО-СКРОЛЛ УЧЕНИКОВ ЗА УЧИТЕЛЕМ (реальное время)
// ============================================================
let autoScrollTimer = null;
let lastSentScroll = 0;

function startTeacherAutoScroll() {
    if (!isTeacher) return;
    if (!fb || !roomId) return;
    if (window._teacherScrollAttached) return;   // не вешаем второй слушатель
    window._teacherScrollAttached = true;

    window.addEventListener('scroll', function() {
        if (syncPaused) return;                   // учитель на паузе
        clearTimeout(autoScrollTimer);
        autoScrollTimer = setTimeout(function() {
            const y = Math.round(window.scrollY);
            const threshold = 10;   // было 50
if (Math.abs(y - lastSentScroll) < threshold) return;
            lastSentScroll = y;
            fb.set(fb.ref(fb.db, `rooms/${roomId}/scrollCommand`), Object.assign(scrollAnchorAt(y), { at: Date.now() })).catch(function(e) { console.warn('scroll sync:', e); });
        }, 100);   // было 250
    });
}

// Ученик подписывается и едет за учителем
function listenTeacherScroll() {
    if (isTeacher) return;                        // учитель не слушает себя
    if (!fb || !roomId) return;
    if (window._studentScrollAttached) return;
    window._studentScrollAttached = true;

    const scrollRef = fb.ref(fb.db, `rooms/${roomId}/scrollCommand`);
    fb.onValue(scrollRef, function(snap) {
    const cmd = snap.val();
    if (!cmd || cmd.y === undefined) return;
    if (studentFrozen) return;
    scrollToAnchor(cmd, false);   // едем к тому же месту по якорю
});
}



// Автовход: если пришли по ?room= и уже вводили имя ранее — показываем экран ученика,
// НО не входим сразу (пусть ученик подтвердит). Кнопка "Войти в комнату" отработает.
// Если ученик уже был в этой комнате — можно восстановить сессию:
// Автовход, если уже логинился
window.addEventListener('load', async () => {
    // 🎓 Восстановление учителя
    const savedRole = localStorage.getItem('se_role');
    const savedIsTeacher = localStorage.getItem('se_isTeacher');
    const isTeacherRestored = savedRole === 'teacher' || savedIsTeacher === 'true' || roleFromUrl === 'teacher';

    if (isTeacherRestored) {
        isTeacher = true;
        fb = await waitForFB();
        if (roomId) {
            openTeacherPanel(true);
        } else {
            showRoomList();
        }
        return;
    }

    // 👤 Восстановление ученика (если уже входил ранее)
    if (userName && userSurname && userKey && roomId) {
        fb = await waitForFB();
        const userRef = fb.ref(fb.db, `rooms/${roomId}/students/${userKey}`);
        await fb.set(userRef, {
            name: userName, surname: userSurname,
            joinedAt: fb.serverTimestamp(), online: true
        });
        fb.onDisconnect(userRef).update({ online: false, leftAt: fb.serverTimestamp() });

        hideAllLoginScreens();
        const infoBlock = document.getElementById('userInfoBlock');
        if (infoBlock) infoBlock.style.display = 'flex';
        const label = document.getElementById('currentUserLabel');
        if (label) label.textContent = `👤 ${userName} ${userSurname[0].toUpperCase()}. (${userKey})`;
        const rid = document.getElementById('roomIdLabel');
        if (rid) rid.textContent = roomId;

        sessionReady = true;
        startSyncListener();
        startPresenceListener();
        restoreAnswersFromFirebase();
        setupFirebaseAutosave();
        startTeacherAutoScroll();
        listenTeacherScroll();
        startHeartbeat();
        showFreezeBtnIfStudent();
    }
});
