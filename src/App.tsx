import { useCallback, useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [words, setWords] = useState({ player1: [], player2: [] });
  const [word, setWord] = useState("");
  const [turn, setTurn] = useState(1);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(12);
  const [lastChar, setLastChar] = useState("");

  // handle timer
  useEffect(() => {
    if (timer === 0) {
      handleInvalidWord();
    }

    const countdown = setInterval(() => {
      // console.log("timer", timer);
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  // console.log(timer);

  const handleInvalidWord = useCallback(() => {
    setScores((prev) => ({
      ...prev,
      [`player${turn}`]: prev[`player${turn}` as keyof typeof prev] - 1,
    }));

    setTurn((turn) => (turn === 1 ? 2 : 1));
    setTimer(12);
    setError("");
  }, [turn]);

  const validateWord = async (word: string) => {
    try {
      const { data } = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      if (data.length) {
        return true;
      }
      return false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return false;
    }
  };

  const handleWordSubmit = async () => {
    if (!word || word.length < 4)
      return setError("Word must contain 4 characters or upper");
    const wordsOfCurrentPlayer = words[
      `player${turn}` as keyof typeof words
    ] as string[];
    const wordsOfOpositPlayer = words[
      `player${turn === 1 ? 2 : 1}` as keyof typeof words
    ] as string[];
    if (wordsOfOpositPlayer.length > 0) {
      const lastWordOfOposit =
        wordsOfOpositPlayer[wordsOfCurrentPlayer.length - 1];

      if (
        word[0].toLowerCase() !==
        (lastWordOfOposit as string).slice(-1).toLowerCase()
      ) {
        setScores((prev) => ({
          ...prev,
          [`player${turn}`]: prev[`player${turn}` as keyof typeof scores] - 1,
        }));
        setWord("");
        return setError(
          "Word 1st character not matched with oposite player word's last character"
        );
      }
    }

    // check if the word is already used
    if (wordsOfCurrentPlayer.includes(word)) {
      setWord("");
      return setError(
        "You already use this word before. Please enter new word"
      );
    }

    // check the word is valid or invalid using api
    const isValid = await validateWord(word);
    if (!isValid) {
      setError("Word is invalid.");
      setWord("");
      return;
    }

    setWords((prev) => {
      const currentUser = `player${turn}` as keyof typeof words;
      return { ...prev, [currentUser]: [...prev[currentUser], word] };
    });
    setWord("");
    setTimer(12);
    setTurn((prev) => (prev === 1 ? 2 : 1));
    setError("");
    setScores((prev) => {
      const player = `player${turn}` as keyof typeof scores;

      return { ...prev, [player]: prev[player] + 1 };
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Shiritori Game</h1>
      {/* player section */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((player) => (
          <div
            key={player}
            className={`p-4 rounded-lg ${
              turn === player ? "bg-gray-700" : "bg-gray-600"
            }`}
          >
            <h2 className="text-lg font-semibold">Player {player}</h2>
            <p className="text-3xl font-bold">
              {scores[`player${player}` as keyof typeof scores]}
            </p>
            {/* timer  */}
            {turn === player && (
              <>
                <p
                  className={`text-lg font-semibold ${
                    timer < 4 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {timer}s
                </p>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => {
                    setWord(e.target.value);
                  }}
                  className="w-full p-2 mt-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                  placeholder={lastChar || "Enter a word"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleWordSubmit();
                      setLastChar(word.charAt(-1));
                    }
                  }}
                />
                <p className="text-red-500 font-semibold">{error}</p>
              </>
            )}
            {/* Word history */}
            <div className="mt-4">
              <h5>Word history</h5>
              <div className="p-2 bg-gray-600 rounded">
                {words[`player${player}` as keyof typeof words].map((word) => (
                  <p key={word} className="my-3 text-sm">
                    {word}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
