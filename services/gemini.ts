
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LessonContent, Sender, Message } from "../types";

const SYSTEM_INSTRUCTION = `
You are an interactive Learning Agent that teaches Google Analytics 4 (GA4).
Your goal is to help learners understand and practice GA4 concepts quickly.
You MUST output your response in JSON format strictly adhering to the schema provided.

**TEACHING STYLE:**
- Micro-lessons (3–6 sentences max for the main text).
- **VISUALS FIRST**: Use the 'comparison' object to create tables whenever contrasting UA vs GA4.
- **INTERACTIVE**: Use 'taskOptions' to provide selectable answers for practice questions instead of asking the user to type.
- **HANDS-ON**: If a concept can be checked in the interface (e.g., "Where is the User Acquisition report?"), use the 'simulationRedirect' object to send the user to the specific page in the Simulator with a task.
- Realistic examples (e.g., "Imagine you run an online store...").
- Practical, job-ready tone.

**FORMATTING RULES:**
- **DO NOT USE MARKDOWN** in your text (e.g., do not use **bold** or ## headers). The frontend will format the text for you. Use plain text only.
- Use newlines (\\n) to separate paragraphs or lists in 'microLessonText'.
- **NEVER** return an empty string for 'microLessonText'. Always provide content.

**STRUCTURE OF RESPONSE (JSON):**
1. **microLessonText**: The main teaching content. Short, clear, friendly.
2. **exampleContent** (Optional): A specific scenario or business example.
3. **comparison** (Optional): Use this for UA vs GA4 tables. Provide multiple rows.
4. **quiz** (Optional): A quick check multiple choice question.
5. **practiceTask** (Optional): A specific prompt for the user.
6. **taskOptions** (Optional): A list of short answer choices (or a single 'Continue' button) for the practiceTask.
7. **simulationRedirect** (Optional): Directs the user to the Practice Lab Simulator to find something.

**ADAPTIVE LOGIC:**
- **FEEDBACK LOOP**: If the user's previous message was a correct answer to a practice task (e.g., "2M" or "Direct"), START the 'microLessonText' with praise (e.g., "Excellent!", "That's correct!").
- If wrong, explain simply and retry.
- **QUIZ SEQUENCES**: If the current module requires a set of questions (e.g., 5 questions), present them ONE BY ONE. Do not show Question 2 until Question 1 is answered correctly. Keep track of the question number in the context.
- **SIMULATION TASKS**: If you include 'simulationRedirect', you **MUST** also include 'practiceTask' and 'taskOptions'. 
  - If it is a quiz, options should be answers.
  - If it is just a task, option should be a single confirmation (e.g. ["I found it"] or ["Continue"]).
- **TRANSITIONS**: If the user says "Let's go" or "Ready", immediately trigger the next logical step in the module plan (e.g. Step 2) and provide the corresponding 'practiceTask' and 'taskOptions'. Do NOT return empty options.

**CURRICULUM CONTEXT:**
The user can select modules. If a specific module is mentioned, teach that topic.
Topics: UA vs GA4, Setup, Interface, User Behavior, Reports & Advertising.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    microLessonText: { type: Type.STRING, description: "Main lesson text, 3-6 sentences. Use \\n for new lines. NO MARKDOWN. MUST NOT BE EMPTY." },
    exampleTitle: { type: Type.STRING, description: "Title for the example box, e.g., 'EXAMPLE'" },
    exampleContent: { type: Type.STRING, description: "Content of the example scenario." },
    practiceTask: { type: Type.STRING, description: "A short prompt asking the user to do something or answer a question." },
    taskOptions: {
      type: Type.ARRAY,
      nullable: true,
      items: { type: Type.STRING },
      description: "Selectable options. Can be 2-4 quiz answers OR a single 'Continue' button for tasks."
    },
    comparison: {
      type: Type.OBJECT,
      nullable: true,
      description: "Data for a UA vs GA4 comparison table",
      properties: {
        title: { type: Type.STRING },
        uaLabel: { type: Type.STRING, description: "Label for UA column (e.g. UA (Old))" },
        ga4Label: { type: Type.STRING, description: "Label for GA4 column (e.g. GA4 (New))" },
        rows: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                feature: { type: Type.STRING, description: "The feature being compared" },
                uaValue: { type: Type.STRING, description: "How it works in UA" },
                ga4Value: { type: Type.STRING, description: "How it works in GA4" }
             },
             required: ["feature", "uaValue", "ga4Value"]
          }
        },
        insight: { type: Type.STRING, description: "Key takeaway displayed at the bottom of the card" }
      },
      required: ["title", "uaLabel", "ga4Label", "rows", "insight"]
    },
    quiz: {
      type: Type.OBJECT,
      nullable: true,
      description: "A quick check multiple choice question",
      properties: {
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctAnswerIndex: { type: Type.INTEGER, description: "0-based index of the correct option" },
        explanation: { type: Type.STRING, description: "Explanation of why the answer is correct" }
      },
      required: ["question", "options", "correctAnswerIndex", "explanation"]
    },
    simulationRedirect: {
      type: Type.OBJECT,
      nullable: true,
      description: "Redirects user to the simulator to perform a task.",
      properties: {
        page: { type: Type.STRING, description: "Target page: 'home', 'reports', 'explore', 'advertising', 'admin'" },
        subPage: { type: Type.STRING, description: "Optional sub-page e.g. 'snapshot', 'realtime'" },
        message: { type: Type.STRING, description: "Short instruction for the user in the simulator" }
      },
      required: ["page", "message"]
    }
  },
  required: ["microLessonText"]
};

// Initialize the client
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: Message[],
  currentInput: string,
  moduleContext?: string
): Promise<LessonContent> => {
  try {
    const ai = getAIClient();
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + (moduleContext ? `\n\nCURRENT MODULE FOCUS: ${moduleContext}` : ""),
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
      history: history.filter(h => h.content !== null).map(h => ({
        role: h.sender === Sender.USER ? 'user' : 'model',
        parts: [{ text: h.sender === Sender.USER 
          ? (h.content as string) 
          : JSON.stringify(h.content) 
        }],
      }))
    });

    const result = await chat.sendMessage({ message: currentInput });
    const text = result.text;

    if (!text) {
        throw new Error("No response from AI");
    }

    // Parse the JSON response
    const data: LessonContent = JSON.parse(text);
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      microLessonText: "I'm having trouble connecting to the GA4 knowledge base right now. Please try again in a moment.",
      practiceTask: "Try asking me specifically about 'Events' or 'Users'."
    };
  }
};
