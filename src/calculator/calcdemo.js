window.addEventListener('DOMContentLoaded', () => {
    const calc = document.querySelector('red-calculator');

    document.getElementById('fetch').addEventListener('click', () => {
        // eslint-disable-next-line no-alert
        alert(`You have calcualted ${calc.getValue()}`);
    });
});
