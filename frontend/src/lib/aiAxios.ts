import axios from "axios"

const aiBaseURL =
  import.meta.env.VITE_AI_API_BASE_URL ||
  "https://ai-service-production-4439.up.railway.app"

export const aiApi = axios.create({
  baseURL: aiBaseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

export default aiApi