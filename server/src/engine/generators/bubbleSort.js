/**
 * Generates a step-by-step trace of Bubble Sort
 * @param {Array} initialArray - The array to sort
 * @returns {Array} List of steps for animation
 */
const generateBubbleSortSteps = (initialArray) => {
    let steps = [];
    let arr = [...initialArray];
    let n = arr.length;

    // Initial State
    steps.push({
        step: 0,
        line: 1,
        array: [...arr],
        highlight: [],
        explanation: "Starting Bubble Sort"
    });

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Step: Comparison
            steps.push({
                step: steps.length,
                line: 4, // Mapping to a hypothetical code line
                array: [...arr],
                highlight: [j, j + 1],
                explanation: `Comparing indices ${j} and ${j+1}`
            });

            if (arr[j] > arr[j + 1]) {
                // Swap
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                
                // Step: After Swap
                steps.push({
                    step: steps.length,
                    line: 5,
                    array: [...arr],
                    highlight: [j, j + 1],
                    explanation: `Swapped ${arr[j+1]} and ${arr[j]}`
                });
            }
        }
    }
    return steps;
};

module.exports = { generateBubbleSortSteps };