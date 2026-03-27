const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeCodeWithAI = async (code) => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ GEMINI_API_KEY is missing. Returning default analysis payload.");
        return {
            algorithm: "Custom Runtime",
            language: "Unknown",
            complexity: { time: { best: "O(?)", average: "O(?)", worst: "O(?)" }, space: "O(?)" },
            explanation: "Code execution tracking (AI breakdown disabled without API key).",
            interview_steps: ["⚠️ Gemini API Key not found. Add it to server/.env to enable AI conceptual breakdowns."]
        };
    }

    // 1. Initialize the model with the strict JSON requirement
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json", // <-- THIS IS THE MAGIC LINE
        }
    });

    const prompt = `
    You are an expert Technical Interviewer and Computer Science Tutor. Analyze this code.
    1. Identify the algorithm. PLEASE use EXACTLY one of these strings if applicable: "Bubble Sort", "Quick Sort", "Merge Sort", "Selection Sort", "Insertion Sort", "Linear Search", "Binary Search". Otherwise, output "Custom".
    2. Determine Time and Space Complexity.
    3. Identify the programming language used (e.g., C++, Java, Python, JavaScript).
    4. Generate a 3-4 step "Interview Breakdown" explaining the logic, time complexity reasoning, and space complexity reasoning to help a student prepare for a software engineering interview.

    Return a valid JSON object matching this schema exactly:
    {
        "algorithm": "Descriptive Name Here",
        "language": "Programming Language",
        "complexity": { "time": { "best": "O(n)", "average": "O(n log n)", "worst": "O(n^2)" }, "space": "O(1)" },
        "explanation": "A short 1-sentence explanation.",
        "interview_steps": [
            "🧠 **Core Logic:** Explain how the algorithm fundamentally works.",
            "⏱️ **Time Complexity:** Explain step-by-step mathematically why the time complexity for best, average, and worst cases are what they are.",
            "💾 **Space Complexity:** Explain step-by-step the memory and auxiliary space usage."
        ]
    }

    Code to analyze:
    ${code}
    `;

    try {
        const result = await model.generateContent(prompt);
        // Because we set responseMimeType, we don't need messy regex anymore!
        const text = result.response.text(); 
        return JSON.parse(text);
        
    } catch (error) {
        // If it STILL fails, we will log the exact reason to your terminal
        console.error("🚨 CRITICAL AI ERROR:", error.message);
        return {
            algorithm: "Analysis Failed",
            complexity: { time: { best: "O(n)", average: "O(n)", worst: "O(n)" }, space: "O(1)" },
            explanation: "Could not analyze custom code.",
            interview_steps: ["⚠️ Analysis failed. Please check your Node.js terminal for the exact error message."]
        };
    }
};

module.exports = { analyzeCodeWithAI };