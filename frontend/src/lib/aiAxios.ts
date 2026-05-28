import axios from "axios"

const aiBaseURL =
  import.meta.env.VITE_AI_API_BASE_URL ?? "http://localhost:8001"

export const aiApi = axios.create({
  baseURL: aiBaseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

export default aiApi