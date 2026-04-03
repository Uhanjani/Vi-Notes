import { useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { saveSession } from "../api";
import "../styles/Editor.css";

type EventType =
  | { type: "interval"; value: number }
  | { type: "pause"; duration: number }
  | { type: "backspace" }
  | { type: "hold"; duration: number }
  | { type: "paste"; length: number };

type AnalysisSummary = {
  label: "Human" | "AI / Suspicious";
  confidence: number;
  avgInterval: number;
  pauseCount: number;
  backspaceCount: number;
  pasteCount: number;
  lastEvent: string;
};

const DEFAULT_ANALYSIS: AnalysisSummary = {
  label: "AI / Suspicious",
  confidence: 0,
  avgInterval: 0,
  pauseCount: 0,
  backspaceCount: 0,
  pasteCount: 0,
  lastEvent: "No activity captured yet."
};

const evaluateEvents = (events: EventType[]): AnalysisSummary => {
  if (events.length < 2) {
    return DEFAULT_ANALYSIS;
  }

  const recent = events.slice(-60);
  let score = 0;
  let pauseCount = 0;
  let backspaceCount = 0;
  let pasteCount = 0;
  let intervalCount = 0;
  let intervalTotal = 0;
  let lastEvent = "Monitoring live input patterns.";

  recent.forEach((event) => {
    if (event.type === "interval") {
      intervalCount += 1;
      intervalTotal += event.value;
      lastEvent = `Recent interval: ${event.value} ms`;
    }

    if (event.type === "pause") {
      pauseCount += 1;
      lastEvent = `Pause detected: ${event.duration} ms`;
    }

    if (event.type === "backspace") {
      backspaceCount += 1;
      lastEvent = "Backspace used";
    }

    if (event.type === "paste") {
      pasteCount += 1;
      lastEvent = `Paste captured: ${event.length} characters`;
    }
  });

  const avgInterval =
    intervalCount > 0 ? Math.round(intervalTotal / intervalCount) : 0;

  if (pasteCount > 0) score -= 3;
  if (pauseCount >= 2) score += 2;
  if (backspaceCount >= 2) score += 2;
  if (avgInterval >= 80 && avgInterval <= 450) score += 2;

  const humanConfidence = Math.max(0, Math.min(100, 45 + score * 12));
  const label = score >= 2 ? "Human" : "AI / Suspicious";
  const confidence =
    label === "Human" ? humanConfidence : Math.max(0, 100 - humanConfidence);

  return {
    label,
    confidence,
    avgInterval,
    pauseCount,
    backspaceCount,
    pasteCount,
    lastEvent
  };
};

const WorkspaceView = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [events, setEvents] = useState<EventType[]>([]);
  const [saving, setSaving] = useState(false);
  const lastKeyTime = useRef(0);
  const keyDownTime = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const electronWindow = window as Window & {
      electronAPI?: {
        onKeyEvent?: (
          callback: (_event: unknown, data: { keycode: number }) => void
        ) => void;
      };
    };

    if (!electronWindow.electronAPI?.onKeyEvent) {
      return;
    }

    let lastCapturedAt = 0;

    const handler = (_event: unknown, data: { keycode: number }) => {
      const now = Date.now();

      if (now - lastCapturedAt < 50) {
        return;
      }

      lastCapturedAt = now;

      setEvents((previousEvents) => {
        const updated = [...previousEvents];

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

    electronWindow.electronAPI.onKeyEvent(handler);
  }, []);

  const analysis = useMemo(() => evaluateEvents(events), [events]);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characterCount = text.length;

  const recordInterval = (timestamp: number) => {
    if (lastKeyTime.current === 0) {
      lastKeyTime.current = timestamp;
      return;
    }

    const interval = timestamp - lastKeyTime.current;

    setEvents((previousEvents) => {
      const nextEvents: EventType[] = [
        ...previousEvents,
        { type: "interval", value: interval }
      ];

      if (interval > 1000) {
        nextEvents.push({ type: "pause", duration: interval });
      }

      return nextEvents;
    });

    lastKeyTime.current = timestamp;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const now = Date.now();
    recordInterval(now);
    keyDownTime.current = now;

    if (event.key === "Backspace") {
      setEvents((previousEvents) => [
        ...previousEvents,
        { type: "backspace" }
      ]);
    }
  };

  const handleKeyUp = () => {
    if (!keyDownTime.current) {
      return;
    }

    const holdDuration = Date.now() - keyDownTime.current;
    setEvents((previousEvents) => [
      ...previousEvents,
      { type: "hold", duration: holdDuration }
    ]);
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData("text");

    setEvents((previousEvents) => [
      ...previousEvents,
      { type: "paste", length: pastedText.length }
    ]);
  };

  const handleSave = async () => {
    if (!text.trim()) {
      alert("Write something before saving the session");
      return;
    }

    try {
      setSaving(true);
      await saveSession({
        text,
        events,
        analysis: {
          label: analysis.label,
          confidence: analysis.confidence,
          avgInterval: analysis.avgInterval,
          pauseCount: analysis.pauseCount,
          backspaceCount: analysis.backspaceCount,
          pasteCount: analysis.pasteCount
        }
      });
      alert("Session saved");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to save session");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setText("");
    setEvents([]);
    lastKeyTime.current = 0;
    keyDownTime.current = 0;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <p className="workspace-brand">Vi-Notes</p>
        <h1>Behavior-first writing workspace</h1>
        <p className="workspace-intro">
          Draft a note, watch the typing pattern change in real time, and save a
          session report with the final confidence score.
        </p>

        <div className="workspace-summary-grid">
          <div className="summary-tile">
            <span>Words</span>
            <strong>{wordCount}</strong>
          </div>
          <div className="summary-tile">
            <span>Characters</span>
            <strong>{characterCount}</strong>
          </div>
          <div className="summary-tile">
            <span>Tracked events</span>
            <strong>{events.length}</strong>
          </div>
          <div className="summary-tile">
            <span>Latest signal</span>
            <strong>{analysis.lastEvent}</strong>
          </div>
        </div>
      </aside>

      <main className="workspace-main">
        <section className="workspace-topbar">
          <div className="workspace-topbar__title">
            <p className="section-label">Session Status</p>
            <h2>Writing Dashboard</h2>
          </div>

          <div className="workspace-topbar__center">
            <div className="top-status-card top-status-card--center">
              <p className="status-card__label">Current classification</p>
              <div
                className={`status-pill ${
                  analysis.label === "Human" ? "status-pill--human" : "status-pill--risk"
                }`}
              >
                {analysis.label}
              </div>
              <p className="status-card__confidence">
                Confidence score: {analysis.confidence}%
              </p>
              <div className="progress-track">
                <div
                  className={`progress-value ${
                    analysis.label === "Human"
                      ? "progress-value--human"
                      : "progress-value--risk"
                  }`}
                  style={{ width: `${analysis.confidence}%` }}
                />
              </div>
            </div>
          </div>

          <div className="workspace-actions workspace-actions--top">
            <button className="secondary-button" onClick={handleReset}>
              Reset draft
            </button>
            <button className="ghost-button ghost-button--dark" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </section>

        <section className="editor-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Writing Canvas</p>
              <h2>Compose your note</h2>
            </div>
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save session"}
            </button>
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onPaste={handlePaste}
            placeholder="Start writing naturally. The app watches intervals, pauses, backspaces, and paste actions while you work."
          />
        </section>

        <section className="insights-grid">
          <article className="insight-card">
            <p className="section-label">Tempo</p>
            <h3>{analysis.avgInterval} ms</h3>
            <span>Average key interval</span>
          </article>
          <article className="insight-card">
            <p className="section-label">Pauses</p>
            <h3>{analysis.pauseCount}</h3>
            <span>Long breaks above 1000 ms</span>
          </article>
          <article className="insight-card">
            <p className="section-label">Corrections</p>
            <h3>{analysis.backspaceCount}</h3>
            <span>Backspace actions detected</span>
          </article>
          <article className="insight-card">
            <p className="section-label">Paste actions</p>
            <h3>{analysis.pasteCount}</h3>
            <span>Clipboard insertions recorded</span>
          </article>
        </section>

        <section className="analysis-card">
          <div className="section-heading">
            <div>
              <p className="section-label">Live Review</p>
              <h2>How the scoring works</h2>
            </div>
          </div>

          <div className="analysis-copy">
            <p>
              This version uses a rule-based analysis layer. Paste activity
              lowers the score, while pauses, backspaces, and human-like timing
              ranges increase it.
            </p>
            <p>
              Latest observation: <strong>{analysis.lastEvent}</strong>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkspaceView;
