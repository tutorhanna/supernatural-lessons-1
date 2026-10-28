
    // ============================================================
    // ГЛОБАЛЬНОЕ ОБЪЯВЛЕНИЕ
    // ============================================================
    var answerStates = {};
    var answerStatesHW = {};
    var syncPaused = false;       // учитель нажал "Пауза"
    var studentFrozen = false;    // ученик нажал "Стоп"
    var isTeacher = false;        // кто мы
    var roomId = '';              // комната
    var sessionReady = false;     // сессия готова
    var fb = null;                // Firebase хэндл
