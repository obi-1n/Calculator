const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelector(".keypad");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let shouldResetDisplay = false;
let lastExpression = "";
//xyz
const operatorLabels = {
  "+": "+",
  "−": "−",
  "×": "×",
  "÷": "÷",
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const rounded = Number.parseFloat(value.toPrecision(12));
  return rounded.toLocaleString("en-US", {
    maximumFractionDigits: 10,
    useGrouping: false,
  });
}

function updateDisplay() {
  display.value = currentValue;
  display.textContent = currentValue;
  expression.textContent = lastExpression || "\u00a0";
}

function clearCalculator() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  shouldResetDisplay = false;
  lastExpression = "";
  updateDisplay();
}

function inputDigit(digit) {
  if (currentValue === "Error" || shouldResetDisplay) {
    currentValue = digit;
    shouldResetDisplay = false;
  } else if (currentValue === "0") {
    currentValue = digit;
  } else if (currentValue.replace("-", "").replace(".", "").length < 12) {
    currentValue += digit;
  }
  updateDisplay();
}

function inputDecimal() {
  if (currentValue === "Error" || shouldResetDisplay) {
    currentValue = "0.";
    shouldResetDisplay = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  updateDisplay();
}

function deleteLast() {
  if (currentValue === "Error" || shouldResetDisplay) {
    clearCalculator();
    return;
  }
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
  if (currentValue === "-") currentValue = "0";
  updateDisplay();
}

function calculate(left, operator, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "−":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? null : left / right;
    default:
      return right;
  }
}

function chooseOperator(operator) {
  if (currentValue === "Error") return;

  const value = Number(currentValue);
  if (storedValue !== null && pendingOperator && !shouldResetDisplay) {
    const result = calculate(storedValue, pendingOperator, value);
    if (result === null) {
      currentValue = "Error";
      lastExpression = "Cannot divide by zero";
      storedValue = null;
      pendingOperator = null;
      updateDisplay();
      return;
    }
    storedValue = result;
    currentValue = formatNumber(result);
  } else {
    storedValue = value;
  }

  pendingOperator = operator;
  shouldResetDisplay = true;
  lastExpression = `${formatNumber(storedValue)} ${operatorLabels[operator]}`;
  updateDisplay();
}

function evaluate() {
  if (storedValue === null || !pendingOperator || currentValue === "Error") return;

  const right = Number(currentValue);
  const result = calculate(storedValue, pendingOperator, right);
  lastExpression = `${formatNumber(storedValue)} ${operatorLabels[pendingOperator]} ${formatNumber(right)} =`;

  if (result === null) {
    currentValue = "Error";
    lastExpression = "Cannot divide by zero";
  } else {
    currentValue = formatNumber(result);
  }

  storedValue = null;
  pendingOperator = null;
  shouldResetDisplay = true;
  updateDisplay();
}

function handleValue(value) {
  if (/^\d$/.test(value)) {
    inputDigit(value);
  } else if (value === ".") {
    inputDecimal();
  } else if (Object.hasOwn(operatorLabels, value)) {
    chooseOperator(value);
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "clear") clearCalculator();
  else if (button.dataset.action === "delete") deleteLast();
  else if (button.dataset.action === "equals") evaluate();
  else handleValue(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  const keyMap = { "*": "×", "/": "÷", "-": "−" };
  if (/^\d$/.test(event.key) || event.key === ".") {
    event.preventDefault();
    handleValue(event.key);
  } else if (keyMap[event.key] || event.key === "+") {
    event.preventDefault();
    handleValue(keyMap[event.key] || event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    evaluate();
  } else if (event.key === "Backspace") {
    event.preventDefault();
    deleteLast();
  } else if (event.key === "Escape") {
    clearCalculator();
  }
});

updateDisplay();
