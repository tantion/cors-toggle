(function () {
    'use strict';

    var saveBtn = document.querySelector('.options-save');
    var resumeBtn = document.querySelector('.options-resume');
    var tips = document.querySelector('.options-tips');
    var headersInput = document.getElementById('allow-headers');

    headersInput.value = localStorage.getItem('allowHeaders') || '';

    saveBtn.addEventListener('click', function (e) {
        e.preventDefault();

        saveBtn.disabled = true;

        tips.innerHTML = '';
        localStorage.setItem('allowHeaders', headersInput.value);

        setTimeout(function () {
            saveBtn.disabled = false;
            tips.innerHTML = 'Saved';
        }, 100);
    });

    resumeBtn.addEventListener('click', function (e) {
        e.preventDefault();

        resumeBtn.disabled = true;
        tips.innerHTML = '';
        headersInput.value = headersInput.placeholder;
        localStorage.setItem('allowHeaders', headersInput.value);
        setTimeout(function () {
            resumeBtn.disabled = false;
        }, 100);
    });
})();
