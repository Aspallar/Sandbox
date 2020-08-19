class Calculator {
    constructor() {
        this.reset();
    }

    reset() {
        this._accumulator = null;
        this._operator = '';
        this._history = '';
    }

    addBinaryOperation(operator, operand) {
        var newHistory;
        if (this._accumulator === null) {
            this._accumulator = operand;
            newHistory = `${operand} ${operator}`;
        } else {
            let val = this._accumulator;
            switch (this._operator) {
                case '+':
                    val += operand;
                    break;
                case '-':
                    val -= operand;
                    break;
                case '*':
                    val *= operand;
                    break;
                case '/':
                    val /= operand;
                    break;
                case '=':
                    // Do nothing
                    break;
                default:
                    throw new Error('Unknown binary operator');
            }
            this._accumulator = val;
            newHistory = ` ${operand} ${operator}`;
        }

        if (operator === '=') this._history = '';
        else this._history += newHistory;

        this._operator = operator;
    }

    get value() {
        return this._accumulator;
    }

    get history() {
        return this._history;
    }

    static applyUnaryOperation(operator, value) {
        switch (operator) {
            case 'neg':
                return value === 0 ? 0 : -value;
            case '%':
                return value / 100;
            case 'recip':
                return 1 / value;
            case 'sqr':
                return Math.sqrt(value);
            default:
                throw new Error('Unknown unary operator');
        }
    }
}

class CalculatorEntry {
    constructor() {
        this._text = '';
        this._isNew = false;
    }

    addDigit(digit) {
        if (this._isNew) {
            this._text = digit;
            this._isNew = false;
        } else if (digit !== '.' || !this._text.includes('.')) {
            this._text += digit;
        }
    }

    deleteDigit() {
        this._text = this._text.slice(0, -1);
    }

    startNew() {
        this._isNew = true;
    }

    empty() {
        this._text = '';
    }

    get text() {
        return this._text;
    }

    get hasValue() {
        return this._text.length > 0 && this._text !== '.';
    }

    get value() {
        return parseFloat(this._text);
    }

    set value(v) {
        this._text = v.toString();
    }

    get displayText() {
        let display;
        if (this._text.length !== 0) {
            const parts = this._text.split('.');
            const whole = parseFloat(parts[0]);

            if (isNaN(whole)) display = '';
            else display = whole.toLocaleString('en');

            if (parts.length > 1) display += '.' + parts[1];
        } else {
            display = '0';
        }
        return display;
    }
}

class CalculatorMemory {
    constructor() {
        this._value = 0;
    }

    get value() {
        return this._value;
    }

    update(action, value) {
        if (action === 'c') this._value = 0;
        else if (!isNaN(value))
            switch (action) {
                case 's':
                    this._value = value;
                    break;
                case '+':
                    this._value += value;
                    break;
                case '-':
                    this._value -= value;
                    break;
                default:
                    throw new Error('Unkown memeory action');
            }
    }
}

export class RedCalculatorElement extends HTMLElement {
    constructor() {
        super();

        const templateId = 'red-calculator-template';
        const template = document.getElementById(templateId);
        if (template === null)
            throw new Error(`<CalculatorElement> no template with id ${templateId} found.`);

        const root = this.attachShadow({ mode: 'open' });
        root.appendChild(template.content.cloneNode(true));

        this._entry = new CalculatorEntry();
        this._calculator = new Calculator();
        this._memory = new CalculatorMemory();
        this._result = root.querySelector('.result');
        this._history = root.querySelector('.history');
        this._lastActionWasEquals = false;

        this._digitClickHandler = this._digitClick.bind(this);
        this._unaryOperatorClickHandler = this._unaryOperatorClick.bind(this);
        this._cancelEntryClickHandler = this._cancelEntryClick.bind(this);
        this._lifeClickHandler = this._lifeClick.bind(this);
        this._cancelClickHandler = this._cancelClick.bind(this);
        this._binaryOperatorClickHandler = this._binaryOperatorClick.bind(this);
        this._memoryClickHandler = this._memoryClick.bind(this);
        this._deleteClickHandler = this._deleteClick.bind(this);

        this._uodateUi();
    }

    connectedCallback() {
        const root = this.shadowRoot;

        root.querySelectorAll('.digit').forEach(digit =>
            digit.addEventListener('click', this._digitClickHandler)
        );

        root.querySelectorAll('.unaryop').forEach(op =>
            op.addEventListener('click', this._unaryOperatorClickHandler)
        );

        root.querySelector('.cancel-entry').addEventListener(
            'click',
            this._cancelEntryClickHandler
        );

        root.querySelector('.life').addEventListener('click', this._lifeClickHandler);

        root.querySelector('.cancel').addEventListener('click', this._cancelClickHandler);

        root.querySelectorAll('.binaryop').forEach(op =>
            op.addEventListener('click', this._binaryOperatorClickHandler)
        );

        root.querySelectorAll('.mem').forEach(mem =>
            mem.addEventListener('click', this._memoryClickHandler)
        );

        root.querySelector('.del').addEventListener('click', this._deleteClickHandler);
    }

    disconnectedCallback() {
        const root = this.shadowRoot;

        root.querySelectorAll('.digit').forEach(digit =>
            digit.removeEventListener('click', this._digitClickHandler)
        );

        root.querySelectorAll('.unaryop').forEach(op =>
            op.removeEventListener('click', this._unaryOperatorClickHandler)
        );

        root.querySelector('.cancel-entry').removeEventListener(
            'click',
            this._cancelEntryClickHandler
        );

        root.querySelector('.life').removeEventListener('click', this._lifeClickHandler);

        root.querySelector('.cancel').removeEventListener('click', this._cancelClickHandler);

        root.querySelectorAll('.binaryop').forEach(op =>
            op.removeEventListener('click', this._binaryOperatorClickHandler)
        );

        root.querySelectorAll('.mem').forEach(mem =>
            mem.removeEventListener('click', this._memoryClickHandler)
        );

        root.querySelector('.del').removeEventListener('click', this._deleteClickHandler);
    }

    _digitClick(event) {
        this._maybeResetCalculator();
        this._entry.addDigit(event.target.getAttribute('data-digit'));
        this._uodateUi();
    }

    _unaryOperatorClick(event) {
        if (this._entry.hasValue) {
            let op = event.target.getAttribute('data-op');
            this._maybeResetCalculator();
            this._entry.value = Calculator.applyUnaryOperation(op, this._entry.value);
            this._uodateUi();
        }
    }

    _cancelEntryClick() {
        this._entry.empty();
        this._uodateUi();
    }

    _lifeClick() {
        this._maybeResetCalculator();
        this._entry.value = 42;
        this._uodateUi();
    }

    _cancelClick() {
        this._entry.empty();
        this._calculator.reset();
        this._uodateUi();
    }

    _binaryOperatorClick(event) {
        if (this._entry.hasValue) {
            let op = event.target.getAttribute('data-op');
            this._calculator.addBinaryOperation(op, this._entry.value);
            this._entry.value = this._calculator.value;
            this._entry.startNew();
            this._lastActionWasEquals = op === '=';
            this._uodateUi();
        }
    }

    _memoryClick(event) {
        let action = event.target.getAttribute('data-action');
        if (action === 'r') {
            this._entry.value = this._memory.value;
            this._uodateUi();
        } else {
            this._memory.update(action, this._entry.value);
        }
    }

    _deleteClick() {
        this._entry.deleteDigit();
        this._uodateUi();
    }

    _uodateUi() {
        this._result.innerHTML = this._entry.displayText;
        this._history.innerHTML = this._calculator.history;
    }

    _maybeResetCalculator() {
        if (this._lastActionWasEquals) {
            this._calculator.reset();
            this._lastActionWasEquals = false;
        }
    }
}

window.customElements.define('red-calculator', RedCalculatorElement);
