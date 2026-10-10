import { calculate } from "./calc.js";

console.log(calculate(2, "+", 3)); // 5
console.log(calculate(10, "/", 0)); // null
console.log(calculate(0.1, "+", 0.2)); // ???
