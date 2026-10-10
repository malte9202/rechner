import { calculate, formatResult } from "./calc.js";

const cases = [
  { a: 0.1, op: "+", b: 0.2, expected: "0.3" },
  { a: 2, op: "-", b: 5, expected: "-3" },
  { a: 5, op: "-", b: 5, expected: "0" },
  { a: 1, op: "/", b: 3000000000, expected: "3.33333333333e-10" },
  { a: 123456789, op: "*", b: 987654321, expected: "1.21932631113e+17" },
  { a: 999999999999.9999, op: "+", b: 0, expected: "1000000000000" },
  { a: 10, op: "/", b: 0, expected: "Fehler: Division durch Null" },
];

let failed = 0;

for (const { a, op, b, expected } of cases) {
  const result = formatResult(calculate(a, op, b));
  const typeOk = typeof result === "string";
  const valueOk = result === expected;

  if (typeOk && valueOk) {
    console.log(`OK    ${a} ${op} ${b} -> ${result}`);
  } else {
    failed++;
    console.log(`FEHLER ${a} ${op} ${b}`);
    console.log(`       erwartet: ${expected}`);
    console.log(`       erhalten: ${result} (Typ: ${typeof result})`);
  }
}

console.log(
  failed === 0
    ? "\nAlle Tests bestanden."
    : `\n${failed} Test(s) fehlgeschlagen.`,
);
process.exitCode = failed === 0 ? 0 : 1;
