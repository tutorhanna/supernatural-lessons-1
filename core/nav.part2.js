
function toggleSubnav(id) {
    const sub = document.getElementById(id);
    if (!sub) return;
    const parent = sub.previousElementSibling;
    sub.classList.toggle('open');
    if (parent) parent.classList.toggle('open');
    localStorage.setItem('nav_sub_' + id, sub.classList.contains('open') ? '1' : '0');
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.nav-sub').forEach(sub => {
        if (localStorage.getItem('nav_sub_' + sub.id) === '1') {
            sub.classList.add('open');
            const parent = sub.previousElementSibling;
            if (parent) parent.classList.add('open');
        }
    });
});
