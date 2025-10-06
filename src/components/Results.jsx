// Results Component
export default function Results({ wpm, accuracy, highScore, onRestart }) {
  const isNewRecord = highScore && wpm > highScore;

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      <div className="w-full max-w-2xl p-8 bg-white/40 rounded-lg border border-white/30">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6 text-black">Test Completed!</h2>
          
          <div className="space-y-4 mb-6">
            <div className="text-2xl">
              <span className="text-black/70">WPM: </span>
              <span className="font-bold text-black text-4xl">{wpm}</span>
            </div>
            <div className="text-2xl">
              <span className="text-black/70">Accuracy: </span>
              <span className="font-bold text-black text-4xl">{accuracy}%</span>
            </div>
          </div>

          {/* High Score Section */}
          <div className="pt-6 border-t border-black/20">
            <div className="text-xl mb-4">
              <span className="text-black/70">Personal Best: </span>
              <span className="font-bold text-black text-2xl">
                {highScore ? `${highScore} WPM` : `${wpm} WPM`}
              </span>
              {isNewRecord && (
                <span className="ml-2 text-yellow-600 font-bold">NEW RECORD!</span>
              )}
            </div>
          </div>

          <button 
            onClick={onRestart} 
            className="mt-6 px-8 py-3 rounded-lg bg-sky-400 hover:bg-sky-500 text-white font-bold text-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}