# Supernatural English
Публикация: залить СОДЕРЖИМОЕ папки site в корень GitHub-репозитория → Settings → Pages → main / root.
Меню учителя (все уроки + книга): .../t-a05ec467/index.html  — не давать ученикам.
Ученикам — только ссылки: .../lessons/u00-intro/index.html?room=...  и .../lessons/hw-reading-1/index.html
Локальная проверка: двойной клик по урокам теперь работает (нужен интернет для Firebase).

## Правила для новых уроков (чтобы скролл-синхрон не «ехал»)
- После любого блока, который виден ТОЛЬКО учителю (панель управления, заметки), ставь якорь:
  `<span id="после-блока" data-anchor style="display:block;height:0"></span>` — тогда у учителя и учеников одинаковая «привязка».
- Крупные блоки (видео, упражнения) можно помечать `data-anchor` и уникальным `id`.
- Открытые задания (нет правильного ответа) не должны использовать класс `correct`; используй `answered` (см. lessons/u00-intro/open-checks.js).

## Адреса (GitHub Pages, аккаунт tutorhanna)
- Сайт: https://tutorhanna.github.io/supernatural-lessons-1/
- Меню учителя (всё, не давать ученикам): .../t-a05ec467/index.html
- ДЗ Ravenwood: .../lessons/hw-ravenwood/index.html — Zero Lesson (только учитель): .../t-a05ec467/zero-lesson/index.html
