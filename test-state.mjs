import { initialState, inputDigit } from "./state.js";

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

// --- Tabellengetriebene Fälle: Startzustand + Ziffer -> erwartete Anzeige und Flag ---
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

// --- Der Eingabezustand darf nicht verändert werden ---
{
  const before = {
    ...initialState,
    display: "12",
    waitingForSecondOperand: true,
  };
  const snapshot = JSON.stringify(before);
  inputDigit(before, "3");
  check(
    "übergebener Zustand bleibt unverändert",
    JSON.stringify(before) === snapshot,
    `vorher: ${snapshot}, nachher: ${JSON.stringify(before)}`,
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

console.log(
  failed === 0
    ? "\nAlle Tests bestanden."
    : `\n${failed} Test(s) fehlgeschlagen.`,
);
process.exitCode = failed === 0 ? 0 : 1;
