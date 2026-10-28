
    // ===== GRAMMAR REFERENCE TOGGLE =====
    let grammarRefVisible = true;

    function toggleGrammarReference() {
        const content = document.getElementById('grammarReferenceContent');
        const toggle = document.getElementById('grammarRefToggle');
        if (grammarRefVisible) {
            content.style.display = 'none';
            toggle.textContent = '▸';
            toggle.style.transform = 'rotate(0deg)';
            grammarRefVisible = false;
        } else {
            content.style.display = 'block';
            toggle.textContent = '▾';
            toggle.style.transform = 'rotate(0deg)';
            grammarRefVisible = true;
        }
    }
