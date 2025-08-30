import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";



const TIME_OPTIONS = [15, 30, 60];

// TODO: audio files
const CLICK_SOUNDS = ["/public/click1.mp3", "/sounds/click2.mp3", "/sounds/click3.mp3"];
const KEY_SOUND = "/sounds/key1.mp3";

export default function App() {
  // ---- Core state
  const [text, setText] = useState("Hi, I'm Rachel, a junior at Northwestern University pursuing a combined bachelors and masters in Computer Engineering!");
  const [idx, setIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [timeOptIdx, setTimeOptIdx] = useState(2); // default 60s
  const [timeLeft, setTimeLeft] = useState(TIME_OPTIONS[timeOptIdx]);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  // ---- Sound state
  const [mute, setMute] = useState(false);
  const [clickIdx, setClickIdx] = useState(0);

  // ---- Refs
  const inputRef = useRef(null);
  const timerId = useRef(null);
  const clickAudio = useRef(null);
  const keyAudio = useRef(null);

  // Preload sounds when index changes
  useEffect(() => {
    clickAudio.current = new Audio(CLICK_SOUNDS[clickIdx]);
  }, [clickIdx]);

  useEffect(() => {
    keyAudio.current = new Audio(KEY_SOUND);
  }, []);

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    timerId.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerId.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerId.current);
  }, [started, finished]);

  // Global click sound
  useEffect(() => {
    const onMouseDown = () => {
      if (mute) return;
      try {
        clickAudio.current.currentTime = 0;
        clickAudio.current.play();
      } catch {}
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [mute, clickIdx]);

  const focus = () => inputRef.current?.focus();

  // Typing handler
  function onKeyDown(e) {
    if (finished) return;
    const k = e.key;

    // start on first real input
    if (!started && (k.length === 1 || k === "Backspace" || k === " ")) {
      setStarted(true);
    }

    // keep hidden input empty
    if (k.length === 1 || k === "Backspace" || k === "Enter") e.preventDefault();

    // ignore navigation keys
    const nav = ["Shift","Alt","Meta","Control","Tab","CapsLock","Escape","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"];
    if (nav.includes(k)) return;

    if (k === "Backspace") {
      if (idx > 0) {
        setIdx(idx - 1);
        // Simple mode: not refunding correct/wrong. (You can refine later.)
      }
      return;
    }

    if (k.length === 1) {
      // Optional key sound
      if (!mute) {
        try {
          keyAudio.current.currentTime = 0;
          keyAudio.current.play();
        } catch {}
      }

      const expected = text[idx];
      if (k === expected) setCorrect((c) => c + 1);
      else setWrong((w) => w + 1);

      const next = idx + 1;
      setIdx(next);
      if (next >= text.length) setFinished(true);
    }
  }

  // Stats
  const initialTime = TIME_OPTIONS[timeOptIdx];
  const elapsedMin = Math.max((initialTime - timeLeft) / 60, 1 / 60);
  const wpm = Math.round((correct / 5) / elapsedMin);
  const accuracy = correct + wrong === 0 ? 0 : Math.round((correct / (correct + wrong)) * 100);

  // Buttons
  function restart() {
    clearInterval(timerId.current);
    setIdx(0);
    setCorrect(0);
    setWrong(0);
    setStarted(false);
    setFinished(false);
    setTimeLeft(TIME_OPTIONS[timeOptIdx]);
    focus();
  }
  function cycleTime() {
    if (started) return; // lock while running
    const n = (timeOptIdx + 1) % TIME_OPTIONS.length;
    setTimeOptIdx(n);
    setTimeLeft(TIME_OPTIONS[n]);
  }
  function cycleClick() {
    setClickIdx((i) => (i + 1) % CLICK_SOUNDS.length);
  }

  // Render helpers
  const chars = [...text];


//
// The actual website:
//

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[var(--panel)]/60 backdrop-blur relative z-50">
  <div className="mx-auto max-w-6xl px-2 py-3 flex items-center justify-between">
    <p className="text-sm text-black/80">
      a typing test made by{" "}
      <Link to="/portfolio" className="font-bold hover:underline">
        Rachel Li
      </Link>
    </p>
  </div>
</header>

      {/* Main */}
      <main className="flex-1 bg-sky-100">
        <div className="mx-auto max-w-4xl px-4 py-10" onClick={focus}>
          {/* Center column */}
          <div className="flex flex-col items-center gap-6 select-none">
            {/* Countdown */}
            <div className="text-9xl font-extrabold tabular-nums">{timeLeft}</div>

            {/* Text panel */}
            <div className="w-full bg-[var(--panel)] rounded-xl p-5 text-xl leading-loose overflow-x-auto relative">
              {chars.map((ch, i) => {
                const judged = i < idx;
                const isCurrent = i === idx && !finished;
                // simple correctness (green/red), muted gray otherwise
                let cls = "text-gray-400";
                if (judged) {
                  const typedChar = text.slice(0, idx)[i]; // what we "typed" by index
                  cls = (typedChar === text[i]) ? "text-green-400" : "text-red-400 underline";
                }
                return (
                  <span
                    key={i}
                    className={`${cls} relative`}
                    style={isCurrent ? { boxShadow: "inset 2px 0 0 0 #60a5fa" } : {}}
                  >
                    {ch}
                  </span>
                );
              })}
              {/* Hidden input */}
              <input
                ref={inputRef}
                onKeyDown={onKeyDown}
                className="absolute w-px h-px opacity-0 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {/* Stats */}
            <div className="text-sm text-white/70">
              WPM: <span className="font-semibold text-white">{wpm}</span> •
              Accuracy: <span className="font-semibold text-white"> {accuracy}%</span> •
              Correct: <span className="font-semibold text-white">{correct}</span> •
              Wrong: <span className="font-semibold text-white">{wrong}</span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <button onClick={restart} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">Restart</button>
              <button onClick={cycleTime} disabled={started} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 disabled:opacity-50">
                Time: {TIME_OPTIONS[timeOptIdx]}s
              </button>
              <button onClick={cycleClick} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                Click Sound #{clickIdx + 1}
              </button>
              <button onClick={() => setMute(m => !m)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                {mute ? "Unmute" : "Mute"}
              </button>
            </div>

            {/* Simple inline results (optional) */}
            {finished && (
              <div className="mt-4 text-center text-white/80">
                <div className="text-lg font-semibold">Time!</div>
                <div>WPM {wpm} • Accuracy {accuracy}%</div>
                {/* TODO: Save/load personal bests in localStorage if you want */}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer (no absolute positioning to avoid horizontal scroll) */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-2 py-6 flex items-center justify-between text-sm">
          <span className="text-black/70">© {new Date().getFullYear()} Rachel Li</span>
          <div className="flex gap-4 text-center">
            {/* TODO: Replace with your socials */}
            <a className="hover:underline" href="https://github.com/yourhandle" target="_blank" rel="noreferrer">GitHub</a>
            <a className="hover:underline" href="https://x.com/yourhandle" target="_blank" rel="noreferrer">X</a>
            <a className="hover:underline" href="https://linkedin.com/in/yourhandle" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
