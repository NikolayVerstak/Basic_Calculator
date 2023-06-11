import { useState } from "react";
import { evaluate } from "mathjs";
import "./App.scss";

/**
 * Calculator App component.
 */
function App() {
    const [expression, setExpression] = useState("0");
    const [currentSymbol, setCurrentSymbol] = useState("0");
    const [operator, setOperator] = useState("");
    const [operatorPressed, setOperatorPressed] = useState(false);

    // Special buttons "C", "%", "." configuration
    const specialButtons = [
        {
            id: "clear",
            value: "C",
            // Handle clear button click
            handler: () => {
                setExpression("0");
                setCurrentSymbol("0");
            },
        },
        {
            id: "percentage",
            value: "%",
            handler: () => handleOperatorClick("%"),
        },
        {
            id: "decimal",
            value: ".",
            handler: () => handleOperatorClick("."),
        },
    ];

    const numericIDs = [
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
    ];

    /**
     * Represents an individual numeric button.
     * @typedef {{
     *   id: string,
     *   value: number,
     *   handler: Function
     * }} NumericButton
     */

    /**
     * Array of numeric buttons.
     * @type {NumericButton[]}
     */
    const numericButtons = numericIDs.map((id, index) => ({
        id,
        value: index,
        handler: () => handleNumericButtonClick(index),
    }));

    // Operator buttons "+", "-", "*", "/", "="  configuration
    const operatorButtons = [
        {
            id: "divide",
            value: "&#247;",
            selected: operatorPressed && operator === "/",

            handler: () => handleOperatorClick("/"),
        },
        {
            id: "multiply",
            value: "x",
            selected: operatorPressed && operator === "*",
            handler: () => handleOperatorClick("*"),
        },
        {
            id: "subtract",
            value: "-",
            selected: operatorPressed && operator === "-",
            handler: () => handleOperatorClick("-"),
        },
        {
            id: "add",
            value: "+",
            selected: operatorPressed && operator === "+",
            handler: () => handleOperatorClick("+"),
        },
        {
            id: "equals",
            value: "=",
            handler: () => handleEqualsClick(),
        },
    ];

    /**
     * Handle equals button click.
     */
    const handleEqualsClick = () => {
        if (operator === "=") {
            return; // Prevent consecutive equals button clicks
        }

        let newExpression = expression,
            result;

        // Remove any trailing operators at the end of the expression
        let operatorSymbols = /[+\-*/]$/;
        while (operatorSymbols.test(newExpression.slice(-1))) {
            newExpression = newExpression.slice(0, -1);
        }

        try {
            result = evaluate(newExpression);
            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid expression");
            }
            if (result < 10 ** 10) {
                // For numbers less than 10^10
                result = result.toString();
                if (result.length > 12) {
                    result = result.substring(0, 12);
                }
            } else {
                // For big numbers > 10**10 the result will look like 1.12345e+10
                result = result.toExponential(5);
            }
        } catch (error) {
            result = "Error";
        }
        setOperator("=");
        setExpression(newExpression + "=");
        setCurrentSymbol(result);
    };

    /**
     * Handle operator button click.
     * @param {string} value - The operator value.
     */
    const handleOperatorClick = (value) => {
        const operatorSymbols = /[+\-*/]$/;
        const lastCharacter = expression.slice(-1);
        const secondToLastCharacter = expression.slice(-2, -1);

        let newSymbol =
            value === "/"
                ? "&#247;"
                : value === "*"
                ? "x"
                : value === "." && operator === ""
                ? `${currentSymbol}.`
                : value;

        /**
         * Handle setting default operator.
         */
        const handleDefaultOperator = () => {
            setOperator(value);
            setCurrentSymbol(newSymbol);
            setExpression(newExpression);
            setOperatorPressed(true);
        };

        /**
         * Add new operator to the expression.
         */
        const addNewOperator = () => expression + value;

        let newExpression;

        // Forbid enter more than 24 characters if it's not getting of the result
        if (expression.length > 24 && value !== "=" && operator !== "=") {
            setCurrentSymbol("Digital Limit");
            return;
        }

        if (operator === "=" && value !== ".") {
            // Continue calculation with the result of the previous calculation
            newExpression = currentSymbol + value;
            handleDefaultOperator();
            return;
        }

        if (
            operatorSymbols.test(secondToLastCharacter) &&
            lastCharacter === "-" &&
            operatorSymbols.test(value)
        ) {
            // Remove the two operators before the last one and add the new operator
            newExpression = expression.slice(0, -2) + value;
        } else if (
            operatorSymbols.test(lastCharacter) &&
            value !== "-" &&
            operatorSymbols.test(value)
        ) {
            // Remove the last operator and add the new operator
            newExpression = expression.slice(0, -1) + value;
        } else if (operatorSymbols.test(lastCharacter) && value === "-") {
            // Add the new operator to the last operator
            newExpression = addNewOperator();
        } else {
            switch (value) {
                case ".":
                    // Return if number already has decimal
                    if (currentSymbol.includes(".")) return;
                    if (operator === "=") {
                        newExpression = `${currentSymbol}.`;
                        newSymbol = `${currentSymbol}.`;
                    } else if (expression === "0") {
                        newExpression = `0${value}`;
                        newSymbol = `0${value}`;
                    } else if (expression !== "0" && operator === "") {
                        newExpression = addNewOperator();
                        newSymbol = currentSymbol + value;
                    } else {
                        newExpression = expression + `0${value}`;
                        newSymbol = `0${value}`;
                    }
                    break;
                case "%":
                    if (lastCharacter === "%" && value === "%") {
                        return;
                    } else if (operatorSymbols.test(lastCharacter)) {
                        // Remove the last operator and add the new operator
                        newExpression = expression + `0${value}`;
                    } else {
                        newExpression = addNewOperator();
                    }
                    break;
                default:
                    newExpression = expression === "0" ? `0${value}` : addNewOperator();
            }
        }

        handleDefaultOperator();
    };

    /**
     * Handle numeric button click.
     * @param {number} value - The numeric value.
     */
    const handleNumericButtonClick = (value) => {
        const stringValue = String(value);

        /**
         * Update expression and current symbol.
         */
        const updateExpressionAndSymbol = () => {
            setExpression(stringValue);
            setCurrentSymbol(stringValue);
        };

        if (operator === "=") {
            updateExpressionAndSymbol();
            setOperator("");
            return;
        }

        if (expression === "0") {
            updateExpressionAndSymbol();
            return;
        }

        // Limit reached, do not add more digits
        if (currentSymbol.length >= 9) {
            return;
        } else if (operator && operator !== ".") {
            setExpression(expression + stringValue);
            setCurrentSymbol(stringValue);
            // Add decimal dot to the entered number
        } else {
            setExpression(expression + stringValue);
            setCurrentSymbol(currentSymbol + stringValue);
        }

        // Forbid enter more than 24 characters
        if (expression.length > 24) {
            setCurrentSymbol("Digital Limit");
            return;
        }

        setOperator("");
        setOperatorPressed(false);
    };

    /**
     * Render buttons.
     * @param {Array} arrayOfButtons - Array of button configurations.
     * @returns {JSX.Element[]} Array of button elements.
     */
    const renderButtons = (arrayOfButtons) => {
        return arrayOfButtons.map((button) => {
            const { id, value, selected, handler } = button;
            return (
                <button
                    id={id}
                    key={id}
                    className={selected ? "selected" : ""}
                    onClick={handler}
                    dangerouslySetInnerHTML={{ __html: value }}></button>
            );
        });
    };

    return (
        <main className="calculator">
            <section className="screen">
                <span
                    className="expression"
                    // dangerouslySetInnerHTML because the divide sign "&#247;
                    dangerouslySetInnerHTML={{ __html: expression }}></span>
                <span id="display" dangerouslySetInnerHTML={{ __html: currentSymbol }}></span>
            </section>
            <section className="buttons">
                {/* buttons "C, % and ."  */}
                {renderButtons(specialButtons)}
                {/* buttons "+, -, *, / and ="  */}
                {renderButtons(operatorButtons)}
                {/* buttons from 0 to 9  */}
                {renderButtons(numericButtons)}
            </section>
        </main>
    );
}

export default App;
