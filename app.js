import { initialState, handleKey } from "./state.js";
import { formatResult } from "./calc.js";

// Der gesamte Zustand der App lebt in dieser einen Variablen.
let state = initialState;

const displayEl = document.querySelector("#display");
const pendingEl = document.querySelector("#pending");
const keysEl = document.querySelector("#keys");

// Operatoren sind intern "*", "/", "-". Angezeigt werden die schöneren Zeichen.
const OPERATOR_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// Der Punkt ist intern ein ".", auf der Anzeige steht ein deutsches Komma.
function toGerman(text) {
  return text.replace(".", ",");
}

// render: Zustand -> DOM. Hier steht keine Rechenlogik.
function render() {
  displayEl.textContent = toGerman(state.display);
  displayEl.classList.toggle("is-error", state.hasError);
  displayEl.classList.toggle(
    "is-long",
    !state.hasError && state.display.length > 10,
  );

  pendingEl.textContent =
    state.operator === null
      ? ""
      : `${toGerman(formatResult(state.firstOperand))} ${OPERATOR_SYMBOLS[state.operator]}`;
}

// dispatch: Taste -> neuer Zustand -> neu zeichnen.
function dispatch(key) {
  state = handleKey(state, key);
  render();
}

// Event-Delegation: ein einziger Listener am Container statt 16 an den Buttons.
// Der Klick "blubbert" nach oben, und event.target verrät, welcher Button es war.
keysEl.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-key]");
  if (!button) return;
  dispatch(button.dataset.key);
});

// Tastatursteuerung
const KEYBOARD_ALIASES = {
  ",": ".",
  Enter: "=",
  Escape: "C",
  Delete: "C",
  x: "*",
  X: "*",
  Backspace: "B",
};

document.addEventListener("keydown", (event) => {
  // Browser-Kürzel (Cmd+C, Strg+R ...) nicht abfangen
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const key = KEYBOARD_ALIASES[event.key] ?? event.key;
  const known =
    /^[0-9]$/.test(key) ||
    [".", "+", "-", "*", "/", "=", "C", "B"].includes(key);
  if (!known) return;

  // Verhindert z. B., dass Enter einen fokussierten Button zusätzlich anklickt
  // oder "/" die Schnellsuche im Browser öffnet.
  event.preventDefault();
  dispatch(key);
});

render();
