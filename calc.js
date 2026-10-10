const MAX_PLAIN_NUMBER = 1e12;
const MIN_PLAIN_NUMBER = 1e-6;

export function calculate(a, operator, b) {
  switch (operator) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      if (b === 0) return null;
      return a / b;
    default:
      throw new Error(`Unbekannter Operator: ${operator}`);
  }
}

export function formatResult(value) {
  if (value === null) {
    return "Fehler: Division durch Null";
  }
  const roundedValue = Number(value.toPrecision(12));
  if (roundedValue === 0) {
    return "0";
  }
  if (
    Math.abs(roundedValue) < MIN_PLAIN_NUMBER ||
    Math.abs(roundedValue) > MAX_PLAIN_NUMBER
  ) {
    return roundedValue.toExponential();
  }
  return roundedValue.toString();
}
