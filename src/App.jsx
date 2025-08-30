import { useEffect, useRef, useState } from "react";

import { Link , Route, Routes } from "react-router-dom";
// Later: set up the portfolio website

const TIME_OPTIONS = [15, 30, 60]; // in seconds

// TODO: audio files (the path fiiles arent right either)
// also need to get the button working to change the selected array
const PROFILES = {
  hmx: {
    alphas: ["/audio/hmx/key1.mp3", "/audio/hmx/key2.mp3", "/audio/hmx/key3.mp3", "/audio/hmx/key4.mp3", "/audio/hmx/key5.mp3"],
    space:  ["/audio/hmx/space1.mp3", "/audio/hmx/space2.mp3"],
    mods:   ["/audio/hmx/mods1.mp3", "/audio/hmx/mods2.mp3"],
  },
  kg: {
    alphas: ["/audio/kg/key1.mp3", "/audio/kg/key2.mp3", "/audio/kg/key3.mp3", "/audio/kg/key4.mp3", "/audio/kg/key5.mp3"],
    space:  ["/audio/kg/space1.mp3", "/audio/kg/space2.mp3"],
    mods:   ["/audio/kg/mods1.mp3", "/audio/kg/mods2.mp3"],
  },
  mac: {
    alphas: ["/audio/mac/key1.mp3", "/audio/mac/key2.mp3", "/audio/mac/key3.mp3", "/audio/mac/key4.mp3", "/audio/mac/key5.mp3"],
    space:  ["/audio/mac/space1.mp3", "/audio/mac/space2.mp3"],
    mods:   ["/audio/mac/mods1.mp3", "/audio/mac/mods2.mp3"],
  },
};

export default function App() {
  // Typing State
  // adding new text options later
  const [text, setText] = useState("Hi, I'm Rachel, a junior at Northwestern University pursuing a combined bachelors and masters in Computer Engineering. I am interested in software development, and am currently seeking summer 2026 opportunities!");
  const [idx, setIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [timeOptIdx, setTimeOptIdx] = useState(1); // default 30s
  const [timeLeft, setTimeLeft] = useState(TIME_OPTIONS[timeOptIdx]); // idk what this is for

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  // Sounts
  const [mute, setMute] = useState(false);
  const [profileName, setProfileName] = useState("hmx"); // default profile

  // Ref
  const inputRef = useRef(null);
  const timerId = useRef(null);

  // Typing buffer
  const [typed, setTyped] = useState("");

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
        setIdx((i) => i - 1);
        setTyped((prev) => prev.slice(0, -1)); 
        // Simple mode: not refunding correct/wrong counts
      }
      return;
    }

    if (k.length === 1) {
      // Optional key sound
      if (!mute) {
        try {
          const currentProfile = PROFILES[profileName];
          new Audio(currentProfile.alphas[0]).play();
        } catch {}
      }

      const expected = text[idx];
      // judge this keystroke
      if (k === expected) setCorrect((c) => c + 1);
      else setWrong((w) => w + 1);

      setTyped((prev) => prev + k); 
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
    setTyped(""); 
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

 function setSound() {
  const order = ["hmx", "kg", "mac"];
  const currentIndex = order.indexOf(profileName);
  const nextIndex = (currentIndex + 1) % order.length;
  setProfileName(order[nextIndex]);
}
  // Render helpers
  const chars = [...text];


//
// The actual website:
//

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-sky-200">
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
            <div className="w-full bg-[var(--panel)] p-5 text-xl leading-loose overflow-x-auto relative">
              {chars.map((ch, i) => {
                const judged = i < typed.length;
                const isCurrent = i === typed.length && !finished;
                // simple correctness (green/red), muted gray otherwise
                let cls = "text-gray-400";
                if (judged) {
                  const typedChar = typed[i];
                  cls = (typedChar === ch) ? "text-green-400" : "text-red-400 underline";
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

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <button onClick={restart} className="px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
              <img src={`${import.meta.env.BASE_URL}images/restart.png`} alt="Restart Button" className="h-7 w-auto" />
              </button>
              <button onClick={cycleTime} disabled={started} className="px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 disabled:opacity-50">
                <img src={`${import.meta.env.BASE_URL}images/clock.png`} alt="Timer Button" className="h-7 w-auto" /> 
              </button>
              <button onClick={setSound} className="px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                <img src={`${import.meta.env.BASE_URL}images/switch.png`} alt="Switch Selector Button" className="h-7 w-auto" /> 
                 <span className="font-bold"> {profileName} </span>
              </button>
              <button onClick={() => setMute(m => !m)} className="px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                {mute ? <img src={`${import.meta.env.BASE_URL}images/mute.png`} alt="Mute Button" className="h-7 w-auto" /> : <img src={`${import.meta.env.BASE_URL}images/unmute.png`} alt="Unmute Button" className="h-7 w-auto" />}
              </button>
            </div>

            {/* inline results */}
            {finished && (
              <div className="mt-4 text-center text-black/80">
                <div className="text-lg font-semibold">Test Completed</div>
                <div>WPM <span className="font-semibold text-black"> {accuracy}%</span> • Accuracy <span className="font-semibold text-black"> {accuracy}%</span></div>

                {/* TODO: Save/load personal bests in localStorage if you want */}


              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-sky-100">
        <div className="mx-auto max-w-6xl px-2 py-3 flex items-center justify-between text-sm">
          <span className="text-black/70">© {new Date().getFullYear()} Rachel Li</span>
          <div className="flex gap-4 text-center">
            <a className="hover:underline" href="https://github.com/rachelnwk"><img src={`${import.meta.env.BASE_URL}images/github.png`} alt="Github Logo" className="h-7 w-auto" /></a>
            <a className="hover:underline" href="mailto:RachelLi2027@u.northwestern.edu"><img src={`${import.meta.env.BASE_URL}images/email.png`} alt="Email Logo" className="h-7 w-auto" /></a>
            <a className="hover:underline" href="https://linkedin.com/in/rachelnwk/"><img src={`${import.meta.env.BASE_URL}images/linkedin.png`} alt="LinkedIn Logo" className="h-7 w-auto" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
