// TypingTest Component
import { TIME_OPTIONS } from "../constants";

export default function TypingTest({ 
  text, 
  typed, 
  finished, 
  timeLeft, 
  timeOptIdx, 
  started, 
  profileName, 
  mute, 
  onKeyDown, 
  onRestart, 
  onCycleTime, 
  onSetSound, 
  onToggleMute, 
  inputRef, 
  onFocus 
}) {
  const chars = [...text];

  return (
    <div className="flex flex-col items-center gap-6 select-none transition-opacity duration-500">
      {/* Countdown */}
      <div className="text-9xl font-extrabold tabular-nums">{timeLeft}</div>

      {/* Text panel */}
      <div className="w-full p-5 text-xl leading-loose overflow-x-auto relative">
        {chars.map((ch, i) => {
          const judged = i < typed.length;
          const isCurrent = i === typed.length && !finished;
          let cls = "text-gray-400";
          if (judged) {
            const typedChar = typed[i];
            cls = (typedChar === ch) ? "text-green-600" : "text-red-600 underline";
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
        <button onClick={onRestart} className="px-2 py-2 rounded-lg bg-white/0 hover:bg-white/40 border border-white/30">
          <img src={`${import.meta.env.BASE_URL}images/restart.png`} alt="Restart Button" className="h-7 w-auto" />
        </button>
        <button onClick={onCycleTime} disabled={started} className="px-2 py-2 rounded-lg bg-white/0 hover:bg-white/40 border border-white/30 disabled:opacity-50">
          <img src={`${import.meta.env.BASE_URL}images/clock.png`} alt="Timer Button" className="h-7 w-auto" /> 
        </button>
        <button onClick={onSetSound} className="px-2 py-2 rounded-lg bg-white/0 hover:bg-white/40 border border-white/30">
          <img src={`${import.meta.env.BASE_URL}images/switch.png`} alt="Switch Selector Button" className="h-7 w-auto" /> 
            <span className="font-bold"> {profileName} </span>
        </button>
        <button onClick={onToggleMute} className="px-4 py-2 rounded-lg bg-white/0 hover:bg-white/40 border border-white/30">
          {mute ? <img src={`${import.meta.env.BASE_URL}images/mute.png`} alt="Mute Button" className="h-7 w-auto" /> : <img src={`${import.meta.env.BASE_URL}images/unmute.png`} alt="Unmute Button" className="h-7 w-auto" />}
        </button>
      </div>
    </div>
  );
}