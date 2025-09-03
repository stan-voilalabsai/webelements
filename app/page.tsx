"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Chat content constants
const USER_MESSAGE = "What is the EBITDA of Acme Corp for Q1 2024? What challenges did the company face?"

const AGENT_MESSAGE = `**Acme Corp Q1 2024 — EBITDA and Key Challenges**  
**Answer:**  
- **EBITDA (Q1 2024):** -1.02 mCHF (Swiss GAAP FER, consolidated).  
- The quarter shows a negative EBITDA margin of about **-5.8%** on sales, consistent with the Q1 reporting pack.  

**Main challenges (Q1 2024):**  
- **Seasonality/weather effects:** Q1 is the most weather-driven quarter (late project starts, slower construction site ramp-up).  
- **Resource factors:** vacation/overhours in January impacting utilization and productivity.  
- **Revenue shortfall vs. budget:** sales at **18.2 mCHF**, ~**6.8%** below budget in Q1.  

**Sources:**  
- 20240430 Acme Corp Schweiz Gruppe — Reporting Swiss GAAP FER Q1.2024.pdf, page 3  
- 20240512 Acme Corp Gruppe — Reporting Swiss GAAP FER Q1.pdf, page 3`

const USER_FOLLOWUP = "Thank you. Please send these data to ceo@ourfund.com"

const AGENT_FOLLOWUP = "Done! I've sent the EBITDA analysis and Q1 2024 challenges summary to ceo@ourfund.com."

// Animation states
type AnimationState =
  | "intro"
  | "userTyping"
  | "agentThinking"
  | "agentTyping"
  | "userFollowup"
  | "agentFollowupThinking"
  | "agentFollowupTyping"
  | "hold"
  | "reset"

// Timing constants (in milliseconds)
const TIMINGS = {
  intro: 300,
  userTyping: 2755, // ~22 chars/sec for user message (1.5x faster again)
  agentThinking: 2000, // exactly 2 seconds
  agentTyping: 9000, // ~22 chars/sec for agent message (1.5x faster)
  userFollowup: 1667, // typing time for follow-up user message (1.5x faster)
  agentFollowupThinking: 1500, // thinking time for follow-up
  agentFollowupTyping: 2667, // typing time for follow-up agent message (1.5x faster)
  hold: 1000,
  reset: 1000,
}

export default function LoopingChatInterface() {
  const [state, setState] = useState<AnimationState>("intro")
  const [userText, setUserText] = useState("")
  const [agentText, setAgentText] = useState("")
  const [userFollowupText, setUserFollowupText] = useState("")
  const [agentFollowupText, setAgentFollowupText] = useState("")
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showCursor, setShowCursor] = useState(false)
  const [cursorType, setCursorType] = useState<"user" | "agent" | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const stateStartTime = useRef<number>(0)
  const pausedTime = useRef<number>(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Typewriter effect
  const typeText = (text: string, setter: (text: string) => void, speed: number, onComplete?: () => void) => {
    let index = 0
    const tokens = text.split("")

    const typeChar = () => {
      if (index < tokens.length && isPlaying) {
        setter(text.substring(0, index + 1))
        index++

        // Add small random jitter (20-40ms) but maintain overall timing
        const baseDelay = speed
        const jitter = Math.random() * 20 + 20
        const delay = Math.min(baseDelay + jitter, speed * 1.5)

        timeoutRef.current = setTimeout(typeChar, delay)
      } else if (index >= tokens.length) {
        onComplete?.()
      }
    }

    if (isPlaying) {
      typeChar()
    }
  }

  // State machine
  const transitionToState = (newState: AnimationState) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)

    setState(newState)
    stateStartTime.current = Date.now()

    switch (newState) {
      case "intro":
        setUserText("")
        setAgentText("")
        setUserFollowupText("")
        setAgentFollowupText("")
        setShowCursor(false)
        setCursorType(null)
        timeoutRef.current = setTimeout(() => transitionToState("userTyping"), TIMINGS.intro)
        break

      case "userTyping":
        setShowCursor(true)
        setCursorType("user")
        if (prefersReducedMotion) {
          setUserText(USER_MESSAGE)
          timeoutRef.current = setTimeout(() => transitionToState("agentThinking"), TIMINGS.userTyping)
        } else {
          typeText(USER_MESSAGE, setUserText, TIMINGS.userTyping / USER_MESSAGE.length, () => {
            setShowCursor(false)
            timeoutRef.current = setTimeout(() => transitionToState("agentThinking"), 300)
          })
        }
        break

      case "agentThinking":
        setCursorType("agent")
        setShowCursor(true)
        timeoutRef.current = setTimeout(() => transitionToState("agentTyping"), TIMINGS.agentThinking)
        break

      case "agentTyping":
        if (prefersReducedMotion) {
          setAgentText(AGENT_MESSAGE)
          timeoutRef.current = setTimeout(() => transitionToState("userFollowup"), TIMINGS.agentTyping)
        } else {
          typeText(AGENT_MESSAGE, setAgentText, TIMINGS.agentTyping / AGENT_MESSAGE.length, () => {
            setShowCursor(false)
            timeoutRef.current = setTimeout(() => transitionToState("userFollowup"), 500)
          })
        }
        break

      case "userFollowup":
        setShowCursor(true)
        setCursorType("user")
        if (prefersReducedMotion) {
          setUserFollowupText(USER_FOLLOWUP)
          timeoutRef.current = setTimeout(() => transitionToState("agentFollowupThinking"), TIMINGS.userFollowup)
        } else {
          typeText(USER_FOLLOWUP, setUserFollowupText, TIMINGS.userFollowup / USER_FOLLOWUP.length, () => {
            setShowCursor(false)
            timeoutRef.current = setTimeout(() => transitionToState("agentFollowupThinking"), 300)
          })
        }
        break

      case "agentFollowupThinking":
        setCursorType("agent")
        setShowCursor(true)
        timeoutRef.current = setTimeout(() => transitionToState("agentFollowupTyping"), TIMINGS.agentFollowupThinking)
        break

      case "agentFollowupTyping":
        if (prefersReducedMotion) {
          setAgentFollowupText(AGENT_FOLLOWUP)
          timeoutRef.current = setTimeout(() => transitionToState("hold"), TIMINGS.agentFollowupTyping)
        } else {
          typeText(AGENT_FOLLOWUP, setAgentFollowupText, TIMINGS.agentFollowupTyping / AGENT_FOLLOWUP.length, () => {
            setShowCursor(false)
            timeoutRef.current = setTimeout(() => transitionToState("hold"), 300)
          })
        }
        break

      case "hold":
        setShowCursor(false)
        setCursorType(null)
        timeoutRef.current = setTimeout(() => transitionToState("reset"), TIMINGS.hold)
        break

      case "reset":
        timeoutRef.current = setTimeout(() => transitionToState("intro"), TIMINGS.reset)
        break
    }
  }

  // Initialize animation loop
  useEffect(() => {
    if (isPlaying) {
      transitionToState("intro")
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setIsPlaying(!isPlaying)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying])

  // Cursor blink effect
  useEffect(() => {
    if (showCursor && !prefersReducedMotion) {
      intervalRef.current = setInterval(() => {
        const cursor = document.querySelector(".typing-cursor")
        if (cursor) {
          cursor.classList.toggle("opacity-0")
        }
      }, 800)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [showCursor, prefersReducedMotion])

  const formatMessage = (text: string) => {
    return text.split("\n").map((line, index) => {
      // Handle bold text
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <div key={index} className={index > 0 ? "mt-2" : ""}>
          {parts.map((part, partIndex) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={partIndex} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
              )
            }
            return part
          })}
        </div>
      )
    })
  }

  // Auto-scroll function to keep bottom of conversation visible
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [userText, agentText, userFollowupText, agentFollowupText, state])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {/* Chat Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        className={`w-full ${isMobile ? "max-w-sm" : "max-w-4xl"}`}
      >
        {/* Chat Card */}
        <div
          ref={chatContainerRef}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-slate-200/50 max-h-[80vh] overflow-y-auto scroll-smooth"
        >
          <div className="space-y-6">
            {/* User Message */}
            <AnimatePresence>
              {userText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-end items-start gap-3"
                >
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-lg">
                    <div className="text-base leading-relaxed font-medium">
                      {userText}
                      {showCursor && cursorType === "user" && <span className="typing-cursor ml-1 font-mono">|</span>}
                    </div>
                  </div>
                  <div className="text-2xl" role="img" aria-label="User">
                    🧑🏻‍💼
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Agent Message */}
            <AnimatePresence>
              {(agentText || state === "agentThinking") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start items-start gap-3"
                >
                  <div className="text-2xl" role="img" aria-label="Agent">
                    🤖
                  </div>
                  <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] shadow-lg border border-slate-200">
                    {state === "agentThinking" && !agentText ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600" aria-live="polite">
                          Thinking…
                        </span>
                      </div>
                    ) : (
                      <div className="text-base leading-relaxed">
                        {formatMessage(agentText)}
                        {showCursor && cursorType === "agent" && (
                          <span className="typing-cursor ml-1 font-mono">|</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Follow-up User Message */}
            <AnimatePresence>
              {userFollowupText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-end items-start gap-3"
                >
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%] shadow-lg">
                    <div className="text-base leading-relaxed font-medium">
                      {userFollowupText}
                      {showCursor && cursorType === "user" && <span className="typing-cursor ml-1 font-mono">|</span>}
                    </div>
                  </div>
                  <div className="text-2xl" role="img" aria-label="User">
                    🧑🏻‍💼
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Follow-up Agent Message */}
            <AnimatePresence>
              {(agentFollowupText || state === "agentFollowupThinking") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start items-start gap-3"
                >
                  <div className="text-2xl" role="img" aria-label="Agent">
                    🤖
                  </div>
                  <div className="bg-slate-100 text-slate-900 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%] shadow-lg border border-slate-200">
                    {state === "agentFollowupThinking" && !agentFollowupText ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600" aria-live="polite">
                          Thinking…
                        </span>
                      </div>
                    ) : (
                      <div className="text-base leading-relaxed">
                        {agentFollowupText}
                        {showCursor && cursorType === "agent" && (
                          <span className="typing-cursor ml-1 font-mono">|</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
