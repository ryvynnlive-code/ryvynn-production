import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { detectCrisis, getCrisisAwareSystemPrompt } from "./lib/crisisDetection";

/**
 * Chat router for persistent AI companion
 */
export const chatRouter = router({
  /**
   * Send message to AI companion
   */
  send: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(5000),
    }))
    .mutation(async ({ input, ctx }) => {
      // Detect crisis keywords
      const crisisResult = detectCrisis(input.message);

      // Get user's personalization
      const voicePersona = ctx.user.voicePersona || "gentle";
      const ageTier = ctx.user.ageTier || "18-24";
      
      // Map voice persona to style
      let voiceStyle = "";
      if (voicePersona === "gentle") {
        voiceStyle = "Speak with warm, nurturing energy. Use soft, flowing language.";
      } else if (voicePersona === "strong") {
        voiceStyle = "Speak with grounding, protective energy. Use solid, steady language.";
      } else {
        voiceStyle = "Speak with balanced, calm energy. Use clear, centered language.";
      }

      // Base system prompt
      const basePrompt = `You are RYVYNN, a compassionate AI wellness companion.

${voiceStyle}

Your role:
- Listen without judgment
- Offer empathetic, supportive responses
- Help users process emotions and thoughts
- Suggest healthy coping strategies when appropriate
- NEVER provide medical advice or therapy
- Always remind users you're a wellness tool, not a therapist, when appropriate
- Be warm, real, and human-like in your responses

User context:
- Age range: ${ageTier}
- Voice preference: ${voicePersona}

Respond naturally and compassionately to what the user shares.`;

      const ageTierForCrisis = ageTier === "13-17" ? "MINOR_13_17" : "ADULT_18_PLUS";
      const systemPrompt = getCrisisAwareSystemPrompt(basePrompt, ageTierForCrisis);

      // Generate AI response
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.message },
        ],
      });

      const aiResponse = String(response.choices[0]?.message?.content || "I'm here for you. Take a deep breath.");

      return {
        response: aiResponse,
        crisisDetected: crisisResult.detected,
        crisisLevel: crisisResult.level,
        crisisMessage: crisisResult.message,
        crisisResources: crisisResult.resources,
      };
    }),
});
