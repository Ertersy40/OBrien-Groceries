document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const keys = document.querySelectorAll('.key');
    const enterBtn = document.querySelector('.enter');
    const backspaceBtn = document.querySelector('.backspace')

    keys.forEach(key => {
        key.addEventListener('click', () => {
            if (display.innerText.length < 10) {
                display.innerText += key.innerText;
            }
        });
    });

    backspaceBtn.addEventListener('click', () => {
        const code = display.innerText;
        display.innerText = code.slice(0, code.length - 1); // Clear display after entering
    });

    enterBtn.addEventListener('click', () => {
        const code = display.innerText;
        checkCode(code);
        display.innerText = ''; // Clear display after entering
    });
});

function checkCode(code) {
    fetch('https://secure-garden-42141-74fb08bc459f.herokuapp.com/api/check-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            unhideEverything();
        }
    })
    .catch(error => console.error('Error:', error));
}

function unhideEverything() {
    document.getElementById("keypad-container").style.display = 'none';
    document.getElementById("avg").style.display = 'block';
    document.getElementById("contributions").style.display = 'block';
    document.getElementById("groceryList").style.display = 'block';
    document.getElementById("transactions-container").style.display = 'block';
}