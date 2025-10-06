import {useEffect, useRef, useState} from "react";
import TypingTest from "./components/TypingTest.jsx";
import Results from "./components/Results.jsx";
import {TIME_OPTIONS, PROFILES} from "./constants";

export default function App() {
  // Typing State
  const [text, setText] = useState("Hi, I'm Rachel, a junior at Northwestern University pursuing a combined bachelors and masters in Computer Engineering. I am interested in software development, and am currently seeking summer 2026 opportunities!");
  const [idx, setIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [timeOptIdx, setTimeOptIdx] = useState(1); // default 30s
  const [timeLeft, setTimeLeft] = useState(TIME_OPTIONS[timeOptIdx]);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  // Sounds
  const [mute, setMute] = useState(false);
  const [profileName, setProfileName] = useState("kg");

  // High Score (using React state instead of localStorage for this environment)
  const [highScore, setHighScore] = useState(null);

  // Ref
  const inputRef = useRef(null);
  const timerId = useRef(null);

  // Typing buffer
  const [typed, setTyped] = useState("");

  // Load high score on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('typingHighScore');
      if (saved) setHighScore(parseInt(saved));
    } catch (e) {
      console.log('localStorage not available');
    }
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

  const focus = () => inputRef.current?.focus();

  // Typing handler
  function onKeyDown(e) {
    if (finished) return;
    const k = e.key;

    if (!started && (k.length === 1 || k === "Backspace" || k === " ")) {
      setStarted(true);
    }

    if (k.length === 1 || k === "Backspace" || k === "Enter") e.preventDefault();

    const nav = ["Shift","Alt","Meta","Control","Tab","CapsLock","Escape","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"];
    if (nav.includes(k)) return;

    if (k === "Backspace") {
      // Play backspace sound
      if (!mute) {
        try {
          const currentProfile = PROFILES[profileName];
          const soundArray = currentProfile.mods;
          if (soundArray && soundArray.length > 0) {
            const randomSound = soundArray[Math.floor(Math.random() * soundArray.length)];
            const audio = new Audio(randomSound);
            audio.volume = 1.0;
            audio.play().catch(err => console.error('Audio play error:', err));
          }
        } catch (err) {
          console.error('Audio error:', err);
        }
      }
      
      if (idx > 0) {
        setIdx((i) => i - 1);
        setTyped((prev) => prev.slice(0, -1)); 
      }
      return;
    }

    if (k.length === 1) {
      if (!mute) {
        try {
          const currentProfile = PROFILES[profileName];
          let soundArray;
          
          // Define keyboard rows
          const topRowKeys = 'qwertyuiop';
          const homeRowKeys = 'asdfghjkl';
          const bottomRowKeys = 'zxcvbnm';
          
          if (k === ' ') {
            soundArray = currentProfile.space;
          } else if (['Shift', 'Enter', 'Tab', 'Backspace'].includes(k)) {
            soundArray = currentProfile.mods;
          } else if (topRowKeys.includes(k.toLowerCase())) {
            soundArray = currentProfile.top_alphas;
          } else if (homeRowKeys.includes(k.toLowerCase())) {
            soundArray = currentProfile.mid_alphas;
          } else if (bottomRowKeys.includes(k.toLowerCase())) {
            soundArray = currentProfile.bot_alphas;
          } else {
            // default sound
            soundArray = currentProfile.top_alphas;
          }
          
          const randomSound = soundArray[Math.floor(Math.random() * soundArray.length)];
          console.log('Trying to play:', randomSound);
          const audio = new Audio(randomSound);
          audio.play().catch(err => console.error('Audio play error:', err));
            } catch (err) {
              console.error('Audio error:', err);
            }
          }

      const expected = text[idx];
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

  // Update high score when test finishes
  useEffect(() => {
    if (finished && wpm > 0) {
      if (!highScore || wpm > highScore) {
        setHighScore(wpm);
        try {
          localStorage.setItem('typingHighScore', wpm.toString());
        } catch (e) {
          console.log('localStorage not available');
        }
      }
    }
  }, [finished, wpm, highScore]);

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
    if (started) return;
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-sky-200">
        <div className="mx-auto max-w-6xl px-2 py-3 flex items-center justify-between">
          <p className="text-sm text-black/80">
            a typing test made by{" "}
            <a 
              href={`${import.meta.env.BASE_URL}Rachel_Li_Resume.pdf`}
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold hover:underline"
            >
              Rachel Li
            </a>
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 bg-sky-100">
        <div className="mx-auto max-w-4xl px-4 py-10" onClick={focus}>
          {!finished ? (
            <TypingTest
              text={text}
              typed={typed}
              finished={finished}
              timeLeft={timeLeft}
              timeOptIdx={timeOptIdx}
              started={started}
              profileName={profileName}
              mute={mute}
              onKeyDown={onKeyDown}
              onRestart={restart}
              onCycleTime={cycleTime}
              onSetSound={setSound}
              onToggleMute={() => setMute(m => !m)}
              inputRef={inputRef}
              onFocus={focus}
            />
          ) : (
            <Results
              wpm={wpm}
              accuracy={accuracy}
              highScore={highScore}
              onRestart={restart}
            />
          )}
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

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}