import { RedCalculatorElement } from './element/calculator.js';

window.addEventListener('DOMContentLoaded', () => {
    document
        .getElementById('add')
        .addEventListener('click', () =>
            document.querySelector('.container').appendChild(new RedCalculatorElement())
        );

    document.getElementById('remove').addEventListener('click', () => {
        const calculator = document.querySelector('.container').lastElementChild;
        if (calculator !== null) calculator.remove();
    });
});
