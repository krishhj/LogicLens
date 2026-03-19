const express = require("express");
const cors = require("cors");
const vm = require("vm"); // Node's built-in sandbox for executing custom code
// This points one level up to find analyzer.js
const { analyzeCodeWithAI } = require("../analyzer");

const app = express();
app.use(cors());
app.use(express.json());

// --- ANIMATION STEP GENERATORS ---
const generateBubbleSortSteps = (initialArray) => {
  let steps = [];
  let arr = [...initialArray];
  let sortedIndices = [];
  for (let i = 0; i < arr.length; i++) {
    let swappedThisPass = false;
    for (let j = 0; j < arr.length - i - 1; j++) {
      steps.push({ array: [...arr], highlight: [j, j + 1], action: "compare", sorted: [...sortedIndices], explanation: `Checking ${arr[j]} and ${arr[j + 1]}` });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swappedThisPass = true;
        steps.push({ array: [...arr], highlight: [j, j + 1], action: "swap", sorted: [...sortedIndices], explanation: `Swapping elements` });
      }
    }
    sortedIndices.push(arr.length - 1 - i);
    steps.push({ array: [...arr], highlight: [], action: "none", sorted: [...sortedIndices], explanation: `${arr[arr.length - 1 - i]} has bubbled to its final position.` });
    if (!swappedThisPass) {
        for(let k = 0; k < arr.length - i - 1; k++) sortedIndices.push(k);
        break;
    }
  }
  steps.push({ array: [...arr], highlight: [], action: "none", sorted: arr.map((_, i) => i), explanation: "Array is fully sorted! Execution complete." });
  return steps;
};

const generateSelectionSortSteps = (initialArray) => {
  let steps = [];
  let arr = [...initialArray];
  let sortedIndices = [];
  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      steps.push({ array: [...arr], highlight: [minIdx, j], action: "compare", sorted: [...sortedIndices], explanation: `Comparing ${arr[j]} with current min ${arr[minIdx]}` });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({ array: [...arr], highlight: [minIdx], action: "compare", sorted: [...sortedIndices], explanation: `New minimum found: ${arr[minIdx]}` });
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({ array: [...arr], highlight: [i, minIdx], action: "swap", sorted: [...sortedIndices], explanation: `Swapping minimum ${arr[i]} into position` });
    }
    sortedIndices.push(i);
  }
  sortedIndices.push(arr.length - 1);
  steps.push({ array: [...arr], highlight: [], action: "none", sorted: sortedIndices, explanation: "Array is fully sorted!" });
  return steps;
};

const generateInsertionSortSteps = (initialArray) => {
  let steps = [];
  let arr = [...initialArray];
  let sortedIndices = [0];
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    steps.push({ array: [...arr], highlight: [i], action: "compare", sorted: [...sortedIndices], explanation: `Selecting ${key} to insert` });
    while (j >= 0 && arr[j] > key) {
      steps.push({ array: [...arr], highlight: [j, j+1], action: "compare", sorted: [...sortedIndices], explanation: `Checking ${arr[j]} > ${key}` });
      arr[j + 1] = arr[j];
      steps.push({ array: [...arr], highlight: [j, j+1], action: "swap", sorted: [...sortedIndices], explanation: `Moving ${arr[j]} right` });
      j = j - 1;
    }
    arr[j + 1] = key;
    sortedIndices.push(i);
    steps.push({ array: [...arr], highlight: [j+1], action: "swap", sorted: [...sortedIndices], explanation: `Inserted ${key} at position ${j+1}` });
  }
  steps.push({ array: [...arr], highlight: [], action: "none", sorted: sortedIndices, explanation: "Array is fully sorted!" });
  return steps;
};

const generateQuickSortSteps = (initialArray) => {
  let steps = [];
  let arr = [...initialArray];
  let sortedIndices = [];

  const partition = (low, high) => {
    let pivot = arr[high];
    steps.push({ array: [...arr], highlight: [high], action: "compare", sorted: [...sortedIndices], explanation: `Pivot chosen as ${pivot}` });
    let i = (low - 1);
    for (let j = low; j <= high - 1; j++) {
      steps.push({ array: [...arr], highlight: [high, j], action: "compare", sorted: [...sortedIndices], explanation: `Comparing ${arr[j]} with pivot ${pivot}` });
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ array: [...arr], highlight: [i, j], action: "swap", sorted: [...sortedIndices], explanation: `Swapping ${arr[i]} and ${arr[j]}` });
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ array: [...arr], highlight: [i + 1, high], action: "swap", sorted: [...sortedIndices], explanation: `Placing pivot ${pivot} in correct position` });
    sortedIndices.push(i + 1);
    return (i + 1);
  };

  const quickSortHelper = (low, high) => {
    if (low <= high) {
      let pi = partition(low, high);
      quickSortHelper(low, pi - 1);
      quickSortHelper(pi + 1, high);
    }
  };

  quickSortHelper(0, arr.length - 1);
  
  const finalSorted = arr.map((_, i) => i);
  steps.push({ array: [...arr], highlight: [], action: "none", sorted: finalSorted, explanation: "Array is fully sorted!" });
  return steps;
};

const generateLinearSearchSteps = (initialArray, target) => {
  let steps = [];
  let arr = [...initialArray];
  for (let i = 0; i < arr.length; i++) {
    steps.push({ array: [...arr], highlight: [i], explanation: `Checking if ${arr[i]} equals ${target}...` });
    if (arr[i] === target) {
      steps.push({ array: [...arr], highlight: [i], explanation: `Target ${target} found at index ${i}!` });
      break;
    }
  }
  return steps;
};

const generateBinarySearchSteps = (initialArray, target) => {
  let steps = [];
  let arr = [...initialArray].sort((a, b) => a - b);
  steps.push({ array: [...arr], highlight: [], explanation: `First, the array must be sorted.` });
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    steps.push({ array: [...arr], highlight: [left, mid, right], explanation: `Checking middle element ${arr[mid]}...` });
    if (arr[mid] === target) {
      steps.push({ array: [...arr], highlight: [mid], explanation: `Target ${target} found at index ${mid}!` });
      break;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return steps;
};

const generateConstantTimeSteps = (initialArray) => {
  return [ { array: [...initialArray], highlight: [0], explanation: `Instantly accessing array[0] -> ${initialArray[0]}` } ];
};

const executeDynamicCode = (code, initialArray) => {
  let steps = [];
  let sortedIndices = [];

  const trackerHandler = {
    get(target, prop) {
      if (typeof prop === 'symbol' || isNaN(Number(prop))) return Reflect.get(target, prop);
      steps.push({ array: [...target], highlight: [Number(prop)], action: "compare", sorted: [...sortedIndices], explanation: `Accessing element at index ${prop}...` });
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      if (!isNaN(Number(prop))) {
        target[prop] = value;
        steps.push({ array: [...target], highlight: [Number(prop)], action: "swap", sorted: [...sortedIndices], explanation: `Updating index ${prop} to ${value}.` });
        return true;
      }
      return Reflect.set(target, prop, value);
    }
  };

  const proxyArray = new Proxy([...initialArray], trackerHandler);

  try {
    const sandbox = { arr: proxyArray, Math: Math, console: { log: () => {} } };
    vm.createContext(sandbox);

    const executionScript = `
      ${code}
      if (typeof myAlgorithm === "function") myAlgorithm(arr);
    `;

    vm.runInContext(executionScript, sandbox, { timeout: 1000 });
    steps.push({ array: [...proxyArray], highlight: [], action: "none", explanation: "Custom execution complete." });
    return steps;
  } catch (error) {
    console.error("Dynamic Execution Error:", error);
    return null;
  }
};

// --- API ROUTE ---
app.post("/api/analyze", async (req, res) => {
  const { code, array } = req.body;
  const baseArray = array || [30, 10, 45, 20, 15];

  try {
    const analysis = await analyzeCodeWithAI(code);
    let steps = [];

    const aiAlgorithm = analysis.algorithm ? analysis.algorithm.toLowerCase() : "custom";
    const timeComp = analysis.complexity.time ? analysis.complexity.time.replace(/\s/g, "") : "";
    
    const searchTarget = baseArray[Math.floor(baseArray.length / 2)];

    // PRIORITY ROUTING BASED ON AI ALGORITHM DETECTION
    if (aiAlgorithm.includes("bubble")) {
      steps = generateBubbleSortSteps(baseArray);
    } else if (aiAlgorithm.includes("selection")) {
      steps = generateSelectionSortSteps(baseArray);
    } else if (aiAlgorithm.includes("insertion")) {
      steps = generateInsertionSortSteps(baseArray);
    } else if (aiAlgorithm.includes("quick")) {
      steps = generateQuickSortSteps(baseArray);
    } else if (aiAlgorithm.includes("merge")) {
      steps = generateBubbleSortSteps(baseArray); // Fallback until merge is fully supported
    } else if (aiAlgorithm.includes("binary search") || timeComp.includes("log")) {
      steps = generateBinarySearchSteps(baseArray, searchTarget);
    } else if (aiAlgorithm.includes("linear search")) {
      steps = generateLinearSearchSteps(baseArray, searchTarget);
    } 
    // IF C++/JAVA OR UNKNOWN AND FALLS THROUGH TO CUSTOM
    else {
      steps = executeDynamicCode(code, baseArray);
      if (!steps) {
        // If it's custom C++/Java and VM fails to parse it
        steps = [{ array: baseArray, highlight: baseArray.map((_,i)=>i), action: "swap", explanation: "Execution failed. Cannot dynamically run C++/Java/Python limit. Standard algorithm pattern not detected." }];
      }
    }

    const cLine = (code ? code.split('\n').findIndex(l => l.includes('>') || l.includes('<') || l.includes('==')) : -1);
    let sLine = (code ? code.split('\n').findIndex(l => l.includes('temp') || l.includes('swap') || (l.includes('=') && l.includes('['))) : -1);
    if (sLine === -1) sLine = (code ? code.split('\n').findIndex(l => l.includes('arr[')) : -1);
    
    steps = steps.map(s => {
      let lIdx = -1;
      if (s.action === "compare") lIdx = cLine;
      else if (s.action === "swap") lIdx = sLine;
      
      if (lIdx === -1 && code && s.explanation && s.explanation.toLowerCase().includes("found")) {
          lIdx = code.split('\n').findIndex(l => l.toLowerCase().includes('return'));
      }
      return { ...s, line: lIdx >= 0 ? lIdx : undefined };
    });

    const interviewSteps = analysis.interview_steps || [];
    res.json({ ...analysis, steps, interview_steps: interviewSteps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

if (require.main === module) {
  app.listen(5000, () =>
    console.log("🚀 LogicLens AI Server live at http://localhost:5000")
  );
}

module.exports = app;