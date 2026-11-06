const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');

let current = '0';       // number being typed
let previous = null;     // stored left operand
let operator = null;     // pending operator
let justEvaluated = false;

function compute(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);
  let r;
  switch (op) {
    case '+': r = a + b; break;
    case '−': r = a - b; break;
    case '×': r = a * b; break;
    case '÷': if (b === 0) return 'Error'; r = a / b; break;
    default: return String(b);
  }
  return String(parseFloat(r.toPrecision(12)));
}

function update(text) {
  currentEl.textContent = current;
  historyEl.textContent = text !== undefined
    ? text
    : (previous !== null && operator ? previous + ' ' + operator : '');
}

function inputNumber(n) {
  if (current === 'Error' || justEvaluated) { current = '0'; justEvaluated = false; }
  if (current.replace(/[-.]/g, '').length >= 14) return;
  current = current === '0' ? n : current + n;
}

function inputDot() {
  if (current === 'Error' || justEvaluated) { current = '0'; justEvaluated = false; }
  if (!current.includes('.')) current += '.';
}

function chooseOperator(op) {
  if (current === 'Error') return;
  if (operator && previous !== null && !justEvaluated) {
    current = compute(previous, current, operator);
    if (current === 'Error') { previous = null; operator = null; return; }
  }
  previous = current;
  operator = op;
  justEvaluated = true;
}

function equals() {
  if (operator === null || previous === null || current === 'Error' || justEvaluated) return;
  const expr = previous + ' ' + operator + ' ' + current + ' =';
  current = compute(previous, current, operator);
  previous = null;
  operator = null;
  justEvaluated = true;
  update(expr);
  return true;
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  justEvaluated = false;
}

function del() {
  if (justEvaluated || current === 'Error') { current = '0'; justEvaluated = false; return; }
  current = current.length > 1 ? current.slice(0, -1) : '0';
}

function percent() {
  if (current === 'Error') return;
  current = String(parseFloat((parseFloat(current) / 100).toPrecision(12)));
}

function handle(kind, value) {
  let done = false;
  if (kind === 'num') inputNumber(value);
  else if (kind === 'op') chooseOperator(value);
  else if (value === 'dot') inputDot();
  else if (value === 'equals') done = equals();
  else if (value === 'clear') clearAll();
  else if (value === 'delete') del();
  else if (value === 'percent') percent();
  if (!done) update();
}

// Mouse / touch
document.getElementById('keys').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.num !== undefined) handle('num', b.dataset.num);
  else if (b.dataset.op) handle('op', b.dataset.op);
  else handle('action', b.dataset.action);
});

// Keyboard
document.addEventListener('keydown', (e) => {
  const k = e.key;
  if (/^[0-9]$/.test(k)) handle('num', k);
  else if (k === '.') handle('action', 'dot');
  else if (k === '+') handle('op', '+');
  else if (k === '-') handle('op', '−');
  else if (k === '*') handle('op', '×');
  else if (k === '/') { e.preventDefault(); handle('op', '÷'); }
  else if (k === 'Enter' || k === '=') { e.preventDefault(); handle('action', 'equals'); }
  else if (k === 'Backspace') handle('action', 'delete');
  else if (k === 'Escape') handle('action', 'clear');
  else if (k === '%') handle('action', 'percent');
});

update();