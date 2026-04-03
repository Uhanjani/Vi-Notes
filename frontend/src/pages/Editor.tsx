import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";
import { saveSession } from "../api";
import "../styles/Editor.css";
import { useNavigate } from "react-router-dom";

type EventType =
  | { type: "interval"; value: number }
  | { type: "pause"; duration: number }
  | { type: "backspace" }
  | { type: "hold"; duration: number }
  | { type: "paste"; length: number };

const Editor = () => {
    const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/login");
};
  const [text, setText] = useState("");
  const [events, setEvents] = useState<EventType[]>([]);
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState(0);

  const [avgInterval, setAvgInterval] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [lastEvent, setLastEvent] = useState("");

  const lastKeyTime = useRef(0);
  const keyDownTime = useRef(0);

  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);


  useEffect(() => {
    if (!(window as any).electronAPI) return;

    let lastTime = 0;

    const handler = (_: any, data: any) => {
      const now = Date.now();

     
      if (now - lastTime < 50) return;
      lastTime = now;

      setEvents((prev) => {
        let updated = [...prev];

        if (lastKeyTime.current !== 0) {
          const interval = now - lastKeyTime.current;
          updated.push({ type: "interval", value: interval });

          if (interval > 1000) {
            updated.push({ type: "pause", duration: interval });
          }
        }

        if (data.keycode === 14) {
          updated.push({ type: "backspace" });
        }

        lastKeyTime.current = now;
        keyDownTime.current = now;

        return updated;
      });
    };

    (window as any).electronAPI.onKeyEvent(handler);

   
    return () => {
   
    };
  }, []);


  useEffect(() => {
    if (events.length < 5) return;

    const recent = events.slice(-50);

    let score = 0;
    let pasteDetected = false;
    let pauses = 0;
    let backs = 0;
    let intervals = 0;
    let totalInterval = 0;

    recent.forEach((e) => {
      if (e.type === "paste") {
        pasteDetected = true;
        setLastEvent(` Pasted ${e.length} chars`);
      }
      if (e.type === "pause") {
        pauses++;
        setLastEvent(`Pause detected`);
      }
      if (e.type === "backspace") {
        backs++;
        setLastEvent(` Backspace used`);
      }
      if (e.type === "interval") {
        intervals++;
        totalInterval += e.value;
      }
    });

    const avg = intervals ? totalInterval / intervals : 0;

    setAvgInterval(Math.round(avg));
    setPauseCount(pauses);
    setBackspaceCount(backs);
    setPasteCount(pasteDetected ? 1 : 0);

    if (pasteDetected) score -= 2;
    if (pauses > 2) score += 2;
    if (backs > 2) score += 2;
    if (avg > 80 && avg < 400) score += 2;

    let conf = Math.min(Math.max((score + 5) * 10, 0), 100);

    if (score >= 2) {
      setResult("Human");
      setConfidence(conf);
    } else {
      setResult("AI / Suspicious");
      setConfidence(100 - conf);
    }
  }, [events]);


  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const now = Date.now();

    if (lastKeyTime.current !== 0) {
      const interval = now - lastKeyTime.current;

      setEvents((prev) => [...prev, { type: "interval", value: interval }]);

      if (interval > 1000) {
        setEvents((prev) => [...prev, { type: "pause", duration: interval }]);
      }
    }

    lastKeyTime.current = now;
    keyDownTime.current = now;

    if (e.key === "Backspace") {
      setEvents((prev) => [...prev, { type: "backspace" }]);
    }
  };

  const handleKeyUp = () => {
    const now = Date.now();
    const hold = now - keyDownTime.current;

    setEvents((prev) => [...prev, { type: "hold", duration: hold }]);
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");

    setEvents((prev) => [
      ...prev,
      { type: "paste", length: pastedText.length }
    ]);
  };

  const handleSave = async () => {
    await saveSession({ text, events });
    alert("Session saved!");
  };

  return (
    <div className="container">
      <div className="header">
  <h2>Vi-Notes</h2>

  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
    
    {result && (
      <div className={`badge ${result === "Human" ? "human-badge" : "ai-badge"}`}>
        {result}
      </div>
    )}

   
    <button
      onClick={handleLogout}
      style={{
        background: "#ef4444",
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        color: "white",
        cursor: "pointer"
      }}
    >
      Logout
    </button>
  </div>
</div>

      <div className="main-layout">
        <div className="editor-section">
          <div className="editor-box">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onPaste={handlePaste}
              placeholder="Start writing..."
            />
          </div>

          <div className="bottom">
            <button onClick={handleSave}>Save Session</button>
          </div>
        </div>

        <div className="analysis-section">
          <div className="result-card">
            <h3>Live Behaviour Analysis</h3>

            <p> Avg Interval: {avgInterval} ms</p>
            <p> Pauses: {pauseCount}</p>
            <p> Backspaces: {backspaceCount}</p>
            <p> Paste Events: {pasteCount}</p>

            <p>{lastEvent}</p>

            {result && (
              <>
                <h4>Confidence: {confidence}%</h4>

                <div className="progress">
                  <div
                    className={`progress-bar ${
                      result === "Human" ? "human" : "ai"
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;