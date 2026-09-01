# MEMORA FIX 02
## Fix and Verify the Voice AI Companion

The audit reports voice functionality exists. **Do not build a second voice system. Fix the existing implementation.**

### Tasks

1. Inspect the actual mobile architecture before changing anything.
2. Inspect:
   - AI assistant screen/page
   - STT implementation
   - TTS implementation
   - AI API service
   - navigation
   - mobile configuration
   - backend AI endpoint

3. Verify this complete flow:
```text
Microphone
→ Speech-to-text
→ Transcript
→ AI companion endpoint
→ Memora Agent
→ Gemini
→ Response
→ Text-to-speech
→ Phone audio
→ Bluetooth earbuds if connected
```

4. Ensure the transcript reaches the real AI endpoint, with authentication and correct API base URL.

5. Implement/verify states:
```text
READY
LISTENING
PROCESSING
SPEAKING
ERROR
```

6. If the existing Web Speech API is browser-only and unsuitable for the target mobile application, replace it with an appropriate mobile implementation.

7. Verify TTS on the actual target platform.

8. Do not implement custom Bluetooth protocols. The phone OS should route audio to paired earbuds.

9. Handle microphone permission denial/retry.

10. Do not continuously upload microphone audio while inactive and do not silently record.

11. Actually run the app and test:
```text
Hello Memora.
```

12. Then test:
```text
Remind me to turn off the stove in 15 minutes.
```

Verify STT → Gemini → reminder tool → response → TTS.

### Acceptance Criteria

- [ ] Voice input works.
- [ ] Real Gemini response works.
- [ ] TTS works.
- [ ] Bluetooth earbuds receive audio when connected.
- [ ] Phone speaker fallback works.
- [ ] Permission states work.
- [ ] Errors do not crash the app.
- [ ] Text fallback works if voice fails.

### Final Report

Provide:
- Files modified.
- STT provider.
- TTS provider.
- Target platform.
- API endpoint.
- Actual end-to-end voice test.
- Bluetooth test.
- Permission test.
- Remaining limitations.

Do not claim PASS without testing.
