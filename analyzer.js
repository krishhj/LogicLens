const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// WE NOW ACCEPT THE USER'S ARRAY AS A PARAMETER
const analyzeCodeWithAI = async (code, baseArray) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // Using the latest active model
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = `
    You are an expert Computer Science execution engine.
    I will give you a code snippet and an initial array.
    Your job is to "dry run" the code and trace exactly how the array changes step-by-step.
    
    Initial Array: [${baseArray.join(", ")}]
    
    Return a valid JSON object matching this exact schema:
    {
        "algorithm": "Descriptive Name Here",
        "complexity": { "time": { "best": "O(n)", "average": "O(n log n)", "worst": "O(n^2)" }, "space": "O(1)" },
        "explanation": "A short 1-sentence explanation.",
        "interview_steps": [
            "🧠 **Core Logic:** Explain how the algorithm works.",
            "⏱️ **Time Complexity:** Explain the mathematical time complexity for best, average, and worst cases.",
            "💾 **Space Complexity:** Explain the space usage."
        ],
        "steps": [
            {
                "array": [ ... ], // The exact state of the array at this moment in execution
                "highlight": [0, 1], // Indices being compared, swapped, or accessed (max 3)
                "explanation": "Comparing element A and B..." // What is happening on this line?
            }
        ]
    }

    Code to analyze:
    ${code}
    `;

    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("🚨 CRITICAL AI ERROR:", error.message);
        return {
            algorithm: "Analysis Failed",
            complexity: { time: { best: "O(n)", average: "O(n)", worst: "O(n)" }, space: "O(1)" },
            explanation: "Could not trace custom code execution.",
            interview_steps: ["⚠️ Analysis failed."],
            steps: [{ array: baseArray, highlight: [], explanation: "Execution failed." }]
        };
    }
};

module.exports = { analyzeCodeWithAI };