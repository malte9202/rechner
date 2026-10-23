import {
  initialState,
  inputDigit,
  inputDecimal,
  handleKey,
} from "./state.js";

let failed = 0;

function check(name, ok, details = "") {
  if (ok) {
    console.log(`OK    ${name}`);
  } else {
    failed++;
    console.log(`FEHLER ${name}`);
    if (details) {
      console.log(`       ${details}`);
    }
  }
}

// --- inputDigit: Startzustand + Ziffer -> erwartete Anzeige und Flag ---
const cases = [
  {
    name: "erste Ziffer ersetzt die Start-0",
    state: { ...initialState },
    digit: "5",
    expectedDisplay: "5",
    expectedWaiting: false,
  },
  {
    name: "weitere Ziffer wird angehängt",
    state: { ...initialState, display: "5" },
    digit: "3",
    expectedDisplay: "53",
    expectedWaiting: false,
  },
  {
    name: "nach Operator ersetzt die Ziffer die Anzeige",
    state: { ...initialState, display: "12", waitingForSecondOperand: true },
    digit: "3",
    expectedDisplay: "3",
    expectedWaiting: false,
  },
  {
    name: "0 auf 0 bleibt 0 (kein '00')",
    state: { ...initialState },
    digit: "0",
    expectedDisplay: "0",
    expectedWaiting: false,
  },
  {
    name: "0 nach Operator ersetzt die Anzeige",
    state: { ...initialState, display: "12", waitingForSecondOperand: true },
    digit: "0",
    expectedDisplay: "0",
    expectedWaiting: false,
  },
];

for (const { name, state, digit, expectedDisplay, expectedWaiting } of cases) {
  const result = inputDigit(state, digit);
  const ok =
    result.display === expectedDisplay &&
    result.waitingForSecondOperand === expectedWaiting;
  check(
    name,
    ok,
    `erwartet: "${expectedDisplay}" / ${expectedWaiting}, erhalten: "${result.display}" / ${result.waitingForSecondOperand}`,
  );
}

// --- inputDecimal ---
const decimalCases = [
  {
    name: "Punkt nach Start-0 ergibt '0.'",
    state: { ...initialState },
    expectedDisplay: "0.",
    expectedWaiting: false,
  },
  {
    name: "Punkt wird an '5' angehängt",
    state: { ...initialState, display: "5" },
    expectedDisplay: "5.",
    expectedWaiting: false,
  },
  {
    name: "zweiter Punkt wird ignoriert",
    state: { ...initialState, display: "5.2" },
    expectedDisplay: "5.2",
    expectedWaiting: false,
  },
  {
    name: "Punkt nach Operator beginnt mit '0.'",
    state: { ...initialState, display: "12", waitingForSecondOperand: true },
    expectedDisplay: "0.",
    expectedWaiting: false,
  },
];

for (const { name, state, expectedDisplay, expectedWaiting } of decimalCases) {
  const result = inputDecimal(state);
  const ok =
    result.display === expectedDisplay &&
    result.waitingForSecondOperand === expectedWaiting;
  check(
    name,
    ok,
    `erwartet: "${expectedDisplay}" / ${expectedWaiting}, erhalten: "${result.display}" / ${result.waitingForSecondOperand}`,
  );
}

// --- Unveränderlichkeit ---
{
  const before = {
    ...initialState,
    display: "12",
    waitingForSecondOperand: true,
  };
  const snapshot = JSON.stringify(before);
  inputDigit(before, "3");
  check(
    "inputDigit: übergebener Zustand bleibt unverändert",
    JSON.stringify(before) === snapshot,
    `vorher: ${snapshot}, nachher: ${JSON.stringify(before)}`,
  );
}

{
  const before = { ...initialState, display: "5" };
  const snapshot = JSON.stringify(before);
  inputDecimal(before);
  check(
    "inputDecimal: übergebener Zustand bleibt unverändert",
    JSON.stringify(before) === snapshot,
  );
}

{
  const before = {
    ...initialState,
    display: "7",
    firstOperand: 5,
    operator: "+",
  };
  const snapshot = JSON.stringify(before);
  handleKey(before, "=");
  handleKey(before, "-");
  check(
    "inputEquals/inputOperator: übergebener Zustand bleibt unverändert",
    JSON.stringify(before) === snapshot,
  );
}

// --- Andere Felder bleiben erhalten ---
{
  const before = {
    display: "12",
    firstOperand: 12,
    operator: "+",
    waitingForSecondOperand: true,
  };
  const result = inputDigit(before, "3");
  check(
    "firstOperand und operator bleiben erhalten",
    result.firstOperand === 12 && result.operator === "+",
    `erhalten: firstOperand=${result.firstOperand}, operator=${result.operator}`,
  );
}

// --- Es wird ein neues Objekt zurückgegeben ---
{
  const before = { ...initialState };
  const result = inputDigit(before, "5");
  check("Rückgabe ist ein neues Objekt", result !== before);
}

// --- Ganze Tastenfolgen: Tasten tippen -> erwartete Anzeige ---
// "C" steht für die Löschtaste. Jedes Zeichen im String ist ein Tastendruck.
function press(keys) {
  return [...keys].reduce((state, key) => handleKey(state, key), initialState);
}

const ERROR = "Fehler: Division durch Null";

const keyCases = [
  { keys: "", expected: "0", name: "Startzustand zeigt 0" },
  { keys: "12+3=", expected: "15", name: "12 + 3 = 15" },
  { keys: "5-2=", expected: "3", name: "5 - 2 = 3" },
  { keys: "6*7=", expected: "42", name: "6 * 7 = 42" },
  { keys: "9/4=", expected: "2.25", name: "9 / 4 = 2.25" },
  { keys: "0.1+0.2=", expected: "0.3", name: "0.1 + 0.2 = 0.3 (Rundung)" },
  { keys: ".5+.5=", expected: "1", name: ".5 + .5 = 1 (Punkt am Anfang)" },
  { keys: "2-5=", expected: "-3", name: "negatives Ergebnis" },
  { keys: "1+2+3=", expected: "6", name: "Verkettung: 1 + 2 + 3 = 6" },
  { keys: "1+2+", expected: "3", name: "Zwischenergebnis nach zweitem Operator" },
  { keys: "5+*2=", expected: "10", name: "zwei Operatoren: der letzte gilt" },
  { keys: "5-2=7", expected: "7", name: "Ziffer nach '=' beginnt neue Rechnung" },
  { keys: "5-2=*4=", expected: "12", name: "mit dem Ergebnis weiterrechnen" },
  { keys: "5=", expected: "5", name: "'=' ohne Operator ändert nichts" },
  { keys: "5+=", expected: "10", name: "5 + = rechnet mit der Anzeige (5 + 5)" },
  { keys: "5+3=", expected: "8", name: "Ergebnis steht auf der Anzeige" },
  { keys: "5+3=C", expected: "0", name: "C setzt alles zurück" },
  { keys: "5+3C2=", expected: "2", name: "nach C ist keine Rechnung mehr offen" },
  { keys: "1.5+1.5=", expected: "3", name: "Dezimalzahlen" },
  { keys: "1..5", expected: "1.5", name: "doppelter Punkt wird ignoriert" },
  { keys: "007", expected: "7", name: "führende Nullen werden nicht angehängt" },
  { keys: "5/0=", expected: ERROR, name: "Division durch null mit '='" },
  { keys: "5/0+", expected: ERROR, name: "Division durch null in der Kette" },
  { keys: "5/0=+", expected: ERROR, name: "Operator nach Fehler wird ignoriert" },
  { keys: "5/0==", expected: ERROR, name: "'=' nach Fehler wird ignoriert" },
  { keys: "5/0=7", expected: "7", name: "Ziffer nach Fehler beginnt neu" },
  { keys: "5/0=7+1=", expected: "8", name: "Rechnen nach Fehler funktioniert wieder" },
  { keys: "5/0=.", expected: "0.", name: "Punkt nach Fehler beginnt neu" },
  { keys: "5/0=C", expected: "0", name: "C nach Fehler" },
  {
    keys: "999999999999*10=",
    expected: "9.99999999999e+12",
    name: "große Zahl in Exponentialschreibweise",
  },
  { keys: "1/3=", expected: "0.333333333333", name: "1 / 3 auf 12 Stellen" },
  { keys: "0.1+0.2+0.3=", expected: "0.6", name: "0.1 + 0.2 + 0.3 = 0.6" },
  { keys: "x", expected: "0", name: "unbekannte Taste wird ignoriert" },
];

for (const { keys, expected, name } of keyCases) {
  const result = press(keys).display;
  check(
    `Tasten "${keys}": ${name}`,
    result === expected,
    `erwartet: "${expected}", erhalten: "${result}"`,
  );
}

console.log(
  failed === 0
    ? "\nAlle Tests bestanden."
    : `\n${failed} Test(s) fehlgeschlagen.`,
);
process.exitCode = failed === 0 ? 0 : 1;
