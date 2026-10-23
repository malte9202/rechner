import { calculate, formatResult } from "./calc.js";

export const initialState = {
  display: "0", // Was gerade angezeigt wird (String)
  firstOperand: null, // Gemerkte erste Zahl der offenen Rechnung
  operator: null, // Gemerkter Operator der offenen Rechnung
  waitingForSecondOperand: false, // true: die nächste Ziffer ersetzt die Anzeige
  hasError: false, // true: die Anzeige zeigt eine Fehlermeldung
};

// Zustand nach einem Fehler (z. B. Division durch null).
// waitingForSecondOperand ist true, damit die nächste Ziffer oder der nächste
// Punkt die Fehlermeldung ersetzt und eine frische Rechnung beginnt.
function errorState() {
  return {
    ...initialState,
    display: formatResult(null),
    waitingForSecondOperand: true,
    hasError: true,
  };
}

export function inputDigit(state, digit) {
  if (state.waitingForSecondOperand) {
    return {
      ...state,
      display: digit,
      waitingForSecondOperand: false,
      hasError: false,
    };
  }

  return {
    ...state,
    display: state.display === "0" ? digit : state.display + digit,
  };
}

export function inputDecimal(state) {
  if (state.waitingForSecondOperand) {
    return {
      ...state,
      display: "0.",
      waitingForSecondOperand: false,
      hasError: false,
    };
  }

  if (state.display.includes(".")) {
    return state;
  }

  return {
    ...state,
    display: state.display + ".",
  };
}

export function inputBackspace(state) {
  // Regel 1: nichts zu löschen, wenn der Rechner auf den zweiten Operanden wartet
  if (state.waitingForSecondOperand) {
    return state;
  }

  // Regel 2: letztes Zeichen entfernen
  const shortened = state.display.slice(0, -1);

  // Regel 3: ...
  return {
    ...state,
    display: shortened || "0",
  };
}

export function inputOperator(state, nextOperator) {
  // Nach einem Fehler gibt es nichts, womit man weiterrechnen könnte.
  if (state.hasError) {
    return state;
  }

  // Situation 1: Noch kein Operator gemerkt. Die Anzeige wird zum ersten
  // Operanden. Das gilt auch direkt nach "=": Man rechnet mit dem Ergebnis weiter.
  if (state.operator === null) {
    return {
      ...state,
      firstOperand: Number(state.display),
      operator: nextOperator,
      waitingForSecondOperand: true,
    };
  }

  // Situation 2: Zwei Operatoren hintereinander. Nur den Operator austauschen.
  // Diese Prüfung muss vor Situation 3 stehen, sonst würde sie schon rechnen.
  if (state.waitingForSecondOperand) {
    return { ...state, operator: nextOperator };
  }

  // Situation 3: Eine zweite Zahl wurde getippt. Zwischenergebnis berechnen
  // (Verkettung wie bei 1 + 2 + 3).
  const result = calculate(
    state.firstOperand,
    state.operator,
    Number(state.display),
  );
  if (result === null) {
    return errorState();
  }

  const display = formatResult(result);
  return {
    ...state,
    display,
    // Bewusst der gerundete Wert, den die Anzeige zeigt (wie bei echten
    // Taschenrechnern). So summiert sich die Ungenauigkeit bei
    // 0.1 + 0.2 + 0.3 nicht weiter auf.
    firstOperand: Number(display),
    operator: nextOperator,
    waitingForSecondOperand: true,
  };
}

export function inputEquals(state) {
  // Ohne offene Rechnung (oder nach Fehler) ändert "=" nichts.
  if (state.hasError || state.operator === null) {
    return state;
  }

  const result = calculate(
    state.firstOperand,
    state.operator,
    Number(state.display),
  );
  if (result === null) {
    return errorState();
  }

  return {
    ...initialState,
    display: formatResult(result),
    // Das Ergebnis wartet darauf, dass eine neue Ziffer es ersetzt
    // oder ein Operator damit weiterrechnet.
    waitingForSecondOperand: true,
  };
}

export function clearAll() {
  return { ...initialState };
}

// Übersetzt eine Taste ("7", ".", "+", "=", "C") in die passende Funktion.
// Die Oberfläche kennt nur diese eine Funktion.
export function handleKey(state, key) {
  if (/^[0-9]$/.test(key)) return inputDigit(state, key);
  if (key === ".") return inputDecimal(state);
  if (["+", "-", "*", "/"].includes(key)) return inputOperator(state, key);
  if (key === "=") return inputEquals(state);
  if (key === "C") return clearAll();
  if (key === "B") return inputBackspace(state);
  return state;
}
