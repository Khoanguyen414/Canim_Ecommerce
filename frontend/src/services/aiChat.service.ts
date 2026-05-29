import aiApi from "@/lib/aiAxios"
import type { AiChatRequest, AiChatResponse } from "@/types/ai-chat"

export const aiChatService = {
  sendMessage: (body: AiChatRequest) =>
    aiApi.post<AiChatResponse>("/ai/chat", body),
}