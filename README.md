# HeartLens — Privacy-First Relationship Clarity
🔗 **Live Demo:** [Try HeartLens Live](https://heartlens-a2333.web.app/)
HeartLens helps users untangle relationship concerns by breaking situations down into **Valid Concerns**, **Possible Overthinking**, and a **Suggested Next Step**.

## Value Proposition & Hybrid AI
Relationship thoughts are deeply personal. HeartLens uses the **Firebase AI Logic Hybrid Inference SDK** (`InferenceMode.PREFER_ON_DEVICE`) to run prompts locally on **Gemini Nano** in Chrome whenever available—keeping thoughts fast, free, and private—while seamlessly falling back to the cloud on unsupported devices.

## Firebase Products Used
- **Firebase AI Logic:** Hybrid inference (`src/firebase.js` & `src/main.js`)
- **Firebase App Check:** Enabled with debug token support for local/judging environments
- **Firebase Authentication:** Anonymous sign-in for private user sessions
- **Cloud Firestore:** Stores each user's private reflection history under `users/{uid}/reflections`
- **Firebase Remote Config:** Dynamically switches AI tone (`gentle` vs. `direct`) via the `ai_tone` parameter
- **Firebase Hosting:** Live web deployment

## Run Locally
1. Clone this repository and run `npm install`
2. Add your Firebase web config in `src/firebase.js`
3. Run `npm run dev` and open `http://localhost:5173`
4. Register the App Check debug token printed in the browser console in your Firebase Console
