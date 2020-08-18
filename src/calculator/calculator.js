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
        if (digit !== '.' || !this._text.includes('.')) {
            if (this._isNew) {
                this.empty();
                this._isNew = false;
            }
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

class CalculatorView {
    constructor(container) {
        this.entry = new CalculatorEntry();
        this.calculator = new Calculator();
        this.memory = new CalculatorMemory();
        this.result = container.querySelector('.result');
        this.history = container.querySelector('.history');
        this.lastActionWasEquals = false;

        container.querySelectorAll('.digit').forEach(digit =>
            digit.addEventListener('click', e => {
                this._maybeResetCalculator();
                this.entry.addDigit(e.target.getAttribute('data-digit'));
                this.uodateUi();
            })
        );

        container.querySelectorAll('.unaryop').forEach(digit =>
            digit.addEventListener('click', e => {
                if (this.entry.hasValue) {
                    let op = e.target.getAttribute('data-op');
                    this._maybeResetCalculator();
                    this.entry.value = Calculator.applyUnaryOperation(op, this.entry.value);
                    this.uodateUi();
                }
            })
        );

        container.querySelector('.cancel-entry').addEventListener('click', () => {
            this.entry.empty();
            this.uodateUi();
        });

        container.querySelector('.life').addEventListener('click', () => {
            this._maybeResetCalculator();
            this.entry.value = 42;
            this.uodateUi();
        });

        container.querySelector('.cancel').addEventListener('click', () => {
            this.entry.empty();
            this.calculator.reset();
            this.uodateUi();
        });

        container.querySelectorAll('.binaryop').forEach(op => {
            op.addEventListener('click', e => {
                if (this.entry.hasValue) {
                    let op = e.target.getAttribute('data-op');
                    this.calculator.addBinaryOperation(op, this.entry.value);
                    this.entry.value = this.calculator.value;
                    this.entry.startNew();
                    this.lastActionWasEquals = op === '=';
                    this.uodateUi();
                }
            });
        });

        container.querySelectorAll('.mem').forEach(mem => {
            mem.addEventListener('click', e => {
                let action = e.target.getAttribute('data-action');
                if (action === 'r') {
                    this.entry.value = this.memory.value;
                    this.uodateUi();
                } else {
                    this.memory.update(action, this.entry.value);
                }
            });
        });

        container.querySelector('.del').addEventListener('click', () => {
            this.entry.deleteDigit();
            this.uodateUi();
        });

        this.uodateUi();
    }

    uodateUi() {
        this.result.innerHTML = this.entry.displayText;
        this.history.innerHTML = this.calculator.history;
    }

    _maybeResetCalculator() {
        if (this.lastActionWasEquals) {
            this.calculator.reset();
            this.lastActionWasEquals = false;
        }
    }
}

new CalculatorView(document.querySelector('.calculator'));
