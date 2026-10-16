export const initialState = {
  display: "0", // The current value shown on the calculator display
  firstOperand: null, // The first operand for the current operation
  operator: null, // The operator for the current operation
  waitingForSecondOperand: false, // Flag to indicate if the calculator is waiting for the second operand
};

export function inputDigit(state, digit) {
  if (state.waitingForSecondOperand) {
    return {
      ...state,
      display: digit,
      waitingForSecondOperand: false,
    };
  }

  return {
    ...state,
    display: state.display === "0" ? digit : state.display + digit,
  };
}
