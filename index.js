const express = require("express");
const cors = require("cors");
const vm = require("vm"); // Node's built-in sandbox for executing custom code
const { analyzeCodeWithAI } = require("../analyzer"); // Your Gemini integration

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. DYNAMIC SANDBOX (For Custom Code)
// ==========================================
const executeDynamicCode = (code, initialArray) => {
    let steps = [];
    let sortedIndices = [];

    // The Tracker Array: A Proxy that spies on reads/writes
    const trackerHandler = {
        get(target, prop) {
            if (typeof prop === 'symbol' || isNaN(Number(prop))) return Reflect.get(target, prop);
            
            steps.push({
                array: [...target],
                highlight: [Number(prop)],
                action: "compare", // Color it Yellow
                sorted: [...sortedIndices],
                explanation: `Accessing element at index ${prop}...`
            });
            return Reflect.get(target, prop);
        },
        set(target, prop, value) {
            if (!isNaN(Number(prop))) {
                target[prop] = value;
                steps.push({
                    array: [...target],
                    highlight: [Number(prop)],
                    action: "swap", // Color it Red
                    sorted: [...sortedIndices],
                    explanation: `Updating index ${prop} to ${value}.`
                });
                return true;
            }
            return Reflect.set(target, prop, value);
        }
    };

    const proxyArray = new Proxy([...initialArray], trackerHandler);

    try {
        // Create a secure sandbox to run the user's code
        const sandbox = { arr: proxyArray, Math: Math, console: { log: () => {} } };
        vm.createContext(sandbox);

        // We append a call to their function assuming they named it standardly, 
        // or we just let it execute if it's an immediate script.
        const executionScript = `
            ${code}
            // Auto-invoke if they wrote a function named 'myAlgorithm'
            if (typeof myAlgorithm === "function") myAlgorithm(arr);
        `;

        vm.runInContext(executionScript, sandbox, { timeout: 1000 });
        
        // Push final frame
        steps.push({ array: [...proxyArray], highlight: [], action: "none", explanation: "Custom execution complete." });
        return steps;
    } catch (error) {
        console.error("Dynamic Execution Error:", error);
        return null;
    }
};

// ==========================================
// 2. TEMPLATE GENERATORS (Perfectly Colored)
// ==========================================
const generateBubbleSortSteps = (initialArray) => {
    let steps = [];
    let arr = [...initialArray];
    let sortedIndices = [];

    for (let i = 0; i < arr.length; i++) {
        let swappedThisPass = false;
        
        for (let j = 0; j < arr.length - i - 1; j++) {
            // COMPARE FRAME (Yellow)
            steps.push({
                array: [...arr], highlight: [j, j + 1], action: "compare", 
                sorted: [...sortedIndices], explanation: `Comparing ${arr[j]} and ${arr[j + 1]}...`
            });

            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swappedThisPass = true;

                // SWAP FRAME (Red)
                steps.push({
                    array: [...arr], highlight: [j, j + 1], action: "swap", 
                    sorted: [...sortedIndices], explanation: `Since ${arr[j+1]} > ${arr[j]}, swap them.`
                });
            }
        }

        // Add largest bubbled element to green list
        sortedIndices.push(arr.length - 1 - i);
        
        // LOCK IN FRAME (Green)
        steps.push({
            array: [...arr], highlight: [], action: "none", sorted: [...sortedIndices], 
            explanation: `${arr[arr.length - 1 - i]} has bubbled to its final sorted position.`
        });
        
        if (!swappedThisPass) break; 
    }

    // FINAL FRAME
    steps.push({
        array: [...arr], highlight: [], action: "none", sorted: arr.map((_, i) => i), 
        explanation: "Array is fully sorted! Execution complete."
    });

    return steps;
};

// ==========================================
// 3. MAIN API ROUTE (The Hybrid Engine)
// ==========================================
app.post("/api/analyze", async (req, res) => {
    const { code, array, algorithm } = req.body;
    const baseArray = array || [30, 10, 45, 20, 15];

    try {
        // 1. Fire off Gemini API asynchronously (doesn't block the animation logic)
        const aiAnalysisPromise = analyzeCodeWithAI(code, baseArray);

        // 2. Generate the deterministic animation frames instantly
        let steps = [];
        if (algorithm === "bubble") {
            steps = generateBubbleSortSteps(baseArray);
        } else if (!algorithm) {
            // If they are on "Custom Code" tab, use the Proxy Sandbox!
            steps = executeDynamicCode(code, baseArray) || [{ array: baseArray, highlight: [], explanation: "Execution failed. Check syntax." }];
        } else {
            // Fallback for other templates (you can add Selection/Merge generators here later)
            steps = generateBubbleSortSteps(baseArray); 
        }

        // 3. Wait for Gemini to finish writing the textual conceptual breakdown
        const aiAnalysis = await aiAnalysisPromise;

        // 4. Send the combined data back to the React UI
        res.json({ ...aiAnalysis, steps });
    } catch (err) {
        console.error("Analysis Failed:", err);
        res.status(500).json({ error: "Analysis failed. Please try again." });
    }
});

// Start the server
app.listen(5000, () => {
    console.log("🚀 LogicLens AI Hybrid Server live at http://localhost:5000");
});