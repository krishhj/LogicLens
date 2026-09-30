# LogicLens: AI-Powered Interactive DSA & Code Execution Platform

## Project Overview
LogicLens is an interactive web-based developer learning platform and dry-run code emulator.
It translates complex algorithm execution into dynamic step-by-step graphical frames and visualizers.

## Core Features & Modules Implemented

### 1. DSA Learning & Sorting Suite (index.html)
- **Algorithms Supported**: Bubble Sort, Selection Sort, Insertion Sort, and Quick Sort.
- **Playback Engine**: Play, Pause, Step Next/Prev, Speed toggle (Slow/Normal/Fast), interactive timeline slider.
- **Visual Highlights**: Dynamic array bar heights, active comparison/swap indexing, and sorted state coloring.
- **Educational Deep-Dive**: "About Sorting" modal breakdown with time/space complexity, stability, and use cases.

### 2. Custom Code Sandbox & AI Engine (custom.html)
- **Multi-Language Support**: Step dry-run tracing for C++, Java, Python, and JavaScript.
- **Hybrid Execution Architecture**: Node.js Proxy/VM sandbox execution combined with Gemini 2.5 Flash AI.
- **Syntax Interception**: Automated syntax error detection with side-by-side diff display and user fix modal.
- **Optimization Hints**: Auto-generates worst-case complexity analysis and O(N log N) optimization suggestions.

### 3. Graph Algorithms Visualizer (graphs.html)
- **Topologies**: Interactive canvas for Undirected, Directed, and Weighted graph networks.
- **Algorithms**: Breadth-First Search (BFS), Depth-First Search (DFS), and Dijkstra's Shortest Path.
- **State Visualization**: Dynamic FIFO Queue / LIFO Stack state tracking, distance arrays, and edge relaxation.

### 4. Tree Data Structures (trees.html)
- **Structures**: Binary Search Trees (BST) and Self-Balancing AVL Trees with interactive node insertion.
- **Traversals & Rotations**: Step-by-step tree rotations (LL, RR, LR, RL) and In-order/Pre-order/Post-order paths.

### 5. Linear Data Structures (stack.html, queue.html)
- **LIFO Stack**: Push, Pop, and Peek operations with Array and Linked-List memory pointer views.
- **FIFO Queue**: Enqueue and Dequeue operations highlighting Front/Rear pointers and memory allocations.

### 6. Strings & Sentence Processing (strings.html, sentences.html)
- **String Matching**: Naive pattern search, Knuth-Morris-Pratt (KMP), and Rabin-Karp rolling hash.
- **Sentence Parsing**: Word tokenization, linear word search, sentence reversal, and palindrome verification.

### 7. Core Portal & Interactive Mechanics (cover.html)
- **Interactive Cover Portal**: Features overview, "About LogicLens" modal, and math formula drawer accordions.
- **Asymptotic Complexity Cards**: Interactive visual cards for O(1), O(log N), O(N), O(N log N), O(N^2), and O(2^N).

### 8. System Design & UI/UX Features
- **Persistent Theme Engine**: Dark/Light mode glassmorphism toggling backed by localStorage persistence.
- **Internationalization (i18n.js)**: Dynamic multi-language translation switching (English, Hindi, Marathi, Gujarati).
- **Feedback & Telemetry**: /api/feedback & /api/save-visualization endpoints logging visualizer accuracy.
- **Backend Infrastructure**: Express.js REST API server running on port 5000 with Vercel serverless functions.

## Technology Stack
Frontend: Vanilla HTML5, CSS3 Glassmorphism, ES6+ JS | Backend: Node.js, Express, VM Sandbox | AI: Gemini 2.5 Flash
====================================================================================================
