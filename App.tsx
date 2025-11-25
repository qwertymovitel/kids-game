import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Home, 
  Map as MapIcon, 
  User, 
  Star, 
  ChevronLeft, 
  Camera, 
  Volume2, 
  CheckCircle,
  XCircle,
  Play,
  Award,
  WifiOff,
  Hand
} from 'lucide-react';
import { Lesson, Screen, UserProgress } from './types';
import { verifySign, getEncouragement } from './services/geminiService';
import Confetti from './components/Confetti';

// --- Cartoon & Kid Friendly Data ---
// Added "icon" to loosely approximate the hand shape for visual aid
const LESSONS: Lesson[] & { icon?: string }[] = [
  { id: '1', type: 'alphabet', label: 'A', imageKeyword: 'spongebob', difficulty: 1, description: 'Make a fist. Thumb on the side.', icon: '✊' },
  { id: '2', type: 'alphabet', label: 'B', imageKeyword: 'ladybug,miraculous', difficulty: 1, description: 'Fingers up! Thumb in front.', icon: '✋' },
  { id: '3', type: 'alphabet', label: 'C', imageKeyword: 'bluey', difficulty: 1, description: 'Curve hand like a cookie.', icon: '🗜️' },
  { id: '4', type: 'word', label: 'Hello', imageKeyword: 'minions', difficulty: 1, description: 'Salute from your forehead!', icon: '🫡' },
  { id: '5', type: 'word', label: 'Love', imageKeyword: 'frozen,elsa', difficulty: 2, description: 'Hug yourself tight!', icon: '🫂' },
  { id: '6', type: 'word', label: 'Cat', imageKeyword: 'garfield', difficulty: 2, description: 'Pull whiskers on your cheek.', icon: '😼' },
];

const App: React.FC = () => {
  // --- State ---
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [progress, setProgress] = useState<UserProgress>({ stars: 12, completedLessons: [], currentLevel: 1 });
  const [currentLesson, setCurrentLesson] = useState<(Lesson & { icon?: string }) | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [funFact, setFunFact] = useState<string>("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Monitor Online Status
  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // --- Components ---

  // 1. Navigation Bar
  const NavBar = () => (
    <div className="fixed bottom-0 left-0 w-full h-20 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-3xl flex justify-around items-center z-40 pb-2">
      <button 
        onClick={() => setScreen(Screen.HOME)} 
        className={`flex flex-col items-center p-2 transition-transform ${screen === Screen.HOME ? 'scale-110 text-blue-500' : 'text-gray-400'}`}
      >
        <Home size={32} strokeWidth={2.5} />
        <span className="text-xs font-bold mt-1">Home</span>
      </button>
      <button 
        onClick={() => setScreen(Screen.MAP)} 
        className={`flex flex-col items-center p-2 transition-transform ${screen === Screen.MAP ? 'scale-110 text-green-500' : 'text-gray-400'}`}
      >
        <MapIcon size={32} strokeWidth={2.5} />
        <span className="text-xs font-bold mt-1">Journey</span>
      </button>
      <button 
        onClick={() => setScreen(Screen.PROFILE)} 
        className={`flex flex-col items-center p-2 transition-transform ${screen === Screen.PROFILE ? 'scale-110 text-purple-500' : 'text-gray-400'}`}
      >
        <User size={32} strokeWidth={2.5} />
        <span className="text-xs font-bold mt-1">Me</span>
      </button>
    </div>
  );

  // 2. Header
  const Header = ({ title, showBack = false }: { title: string, showBack?: boolean }) => (
    <div className="flex items-center justify-between px-6 pt-6 pb-4">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={() => setScreen(Screen.MAP)} 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md active:scale-95"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
        )}
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full shadow-sm border-2 border-yellow-200">
        <Star className="fill-yellow-400 text-yellow-500" size={24} />
        <span className="text-xl font-bold text-yellow-600">{progress.stars}</span>
      </div>
    </div>
  );

  // 3. Home Screen
  const HomeScreen = () => (
    <div className="h-full overflow-y-auto pb-24 bg-sky-50">
      <Header title="Hi, Buddy!" />
      
      <div className="px-6 mt-4">
        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Ready to Play?</h2>
            <p className="mb-4 opacity-90 text-lg">Let's learn some magic signs!</p>
            <button 
              onClick={() => setScreen(Screen.MAP)}
              className="bg-white text-blue-500 px-8 py-3 rounded-full font-bold text-lg shadow-md active:scale-95 transition-transform flex items-center gap-2"
            >
              <Play size={24} fill="currentColor" /> Let's Go
            </button>
          </div>
          <Star size={120} className="absolute -right-6 -bottom-6 text-white opacity-20 rotate-12" />
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4 text-slate-700">Fun Games</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-100 p-6 rounded-3xl flex flex-col items-center gap-3 shadow-sm border-b-4 border-orange-200 active:translate-y-1 active:border-b-0 transition-all cursor-pointer" onClick={() => {
              setCurrentLesson(LESSONS[3]); // Hello
              setScreen(Screen.LESSON);
          }}>
            <div className="w-14 h-14 bg-orange-400 rounded-full flex items-center justify-center text-white shadow-md">
               <span className="text-3xl">👋</span>
            </div>
            <span className="font-bold text-orange-700 text-lg">Greetings</span>
          </div>
          <div className="bg-pink-100 p-6 rounded-3xl flex flex-col items-center gap-3 shadow-sm border-b-4 border-pink-200 active:translate-y-1 active:border-b-0 transition-all cursor-pointer" onClick={() => {
             setCurrentLesson(LESSONS[0]); // A
             setScreen(Screen.LESSON);
          }}>
            <div className="w-14 h-14 bg-pink-400 rounded-full flex items-center justify-center text-white shadow-md">
               <span className="text-3xl">ABC</span>
            </div>
            <span className="font-bold text-pink-700 text-lg">Alphabet</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. Map/Journey Screen
  const MapScreen = () => (
    <div className="h-full overflow-y-auto pb-24 bg-gradient-to-b from-sky-100 to-green-100">
      <Header title="My Path" />
      <div className="flex flex-col items-center gap-8 py-8 relative px-4">
        {/* Path Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-white/60 -translate-x-1/2 rounded-full border-2 border-white border-dashed" />
        
        {LESSONS.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const isLocked = index > 0 && !progress.completedLessons.includes(LESSONS[index-1].id);
          
          return (
            <div key={lesson.id} className={`relative z-10 w-full flex ${index % 2 === 0 ? 'justify-start pl-4' : 'justify-end pr-4'}`}>
              <button 
                onClick={() => {
                  if (!isLocked) {
                    setCurrentLesson(lesson);
                    setScreen(Screen.LESSON);
                  }
                }}
                disabled={isLocked}
                className={`
                  w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl transition-all active:scale-90
                  ${isCompleted ? 'bg-green-400 border-green-200 text-white' : 
                    isLocked ? 'bg-gray-300 border-gray-200 text-gray-500' : 'bg-yellow-400 border-yellow-200 text-white animate-bounce-gentle'}
                `}
              >
                {isCompleted ? <CheckCircle size={40} strokeWidth={3} /> : isLocked ? <span className="text-3xl font-bold opacity-50">{index+1}</span> : <Play size={40} fill="currentColor" />}
              </button>
              
              {/* Label Bubble */}
              <div className={`absolute top-1/2 -translate-y-1/2 ${index % 2 === 0 ? 'left-32' : 'right-32'} bg-white px-5 py-3 rounded-2xl shadow-md border-b-4 border-slate-200`}>
                <span className="font-bold text-slate-700 text-lg">{lesson.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 5. Lesson Screen
  const LessonScreen = () => {
    if (!currentLesson) return null;

    useEffect(() => {
        getEncouragement(currentLesson.label).then(setFunFact);
    }, []);

    const playSound = () => {
      const utterance = new SpeechSynthesisUtterance(`${currentLesson.label}. ${currentLesson.description}`);
      utterance.rate = 0.8; // Slower for kids
      window.speechSynthesis.speak(utterance);
    };

    return (
      <div className="h-full bg-white flex flex-col">
        {/* Nav Header */}
        <div className="p-4 flex justify-between items-center bg-yellow-50 z-20 shadow-sm">
          <button onClick={() => setScreen(Screen.MAP)} className="p-3 bg-white rounded-full shadow-sm active:scale-95"><ChevronLeft size={28} className="text-slate-700" /></button>
          <div className="flex flex-col items-center">
             <h2 className="text-xl font-black text-slate-800 tracking-wide uppercase">Learn This Sign</h2>
             <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{currentLesson.type}</span>
          </div>
          <button onClick={playSound} className="p-3 bg-blue-100 text-blue-600 rounded-full shadow-sm active:scale-95"><Volume2 size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24 pt-6 bg-slate-50">
          
          {/* Main Cartoon Visual with Overlay */}
          <div className="w-full aspect-[4/5] bg-slate-200 rounded-[2.5rem] overflow-hidden relative shadow-xl border-4 border-white mb-6 group mx-auto max-w-sm">
            <img 
              src={`https://loremflickr.com/600/800/cartoon,${currentLesson.imageKeyword}/all`} 
              alt={currentLesson.label} 
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
            
            {/* Overlay Content: Top Sign, Bottom Description */}
            <div className="absolute inset-0 flex flex-col p-4">
                
                {/* Top: The Big Sign/Letter */}
                <div className="flex-1 flex flex-col items-center justify-center animate-bounce-gentle pb-12">
                     <span className="text-8xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-4" style={{ WebkitTextStroke: '4px #3b82f6' }}>
                        {currentLesson.label}
                     </span>
                     {/* If we have an icon/emoji approximation, show it near the letter */}
                     {currentLesson.icon && (
                        <div className="bg-white/20 backdrop-blur-xl rounded-full w-52 h-52 flex items-center justify-center border-[6px] border-white mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
                            <span className="text-[7rem] filter drop-shadow-md">{currentLesson.icon}</span>
                        </div>
                     )}
                </div>

                {/* Bottom: Instructions */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-lg border-b-8 border-slate-200 text-center relative z-10">
                    <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">How to do it</h3>
                    <p className="text-slate-800 text-2xl font-black leading-tight">{currentLesson.description}</p>
                </div>
            </div>
          </div>

          {/* Fun Fact Section */}
          <div className="bg-yellow-100 rounded-3xl p-5 border-l-8 border-yellow-400 mb-6">
             <div className="flex gap-2 items-center mb-2">
                 <Star className="fill-yellow-400 text-yellow-600" size={20} />
                 <span className="font-bold text-yellow-700 text-sm uppercase">Fun Fact</span>
             </div>
             <p className="text-yellow-900 font-medium italic">
                 {funFact ? `"${funFact}"` : "Did you know learning signs makes your brain stronger?"}
             </p>
          </div>

          <button 
            onClick={() => setScreen(Screen.PRACTICE)}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white py-5 rounded-3xl text-2xl font-black shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-3 border-b-8 border-green-600 mb-4"
          >
            <Camera size={32} strokeWidth={3} />
            TRY IT NOW!
          </button>
        </div>
      </div>
    );
  };

  // 6. Practice Screen (Camera & AI)
  const PracticeScreen = () => {
    if (!currentLesson) return null;
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<{correct: boolean, text: string} | null>(null);

    // Camera Init
    useEffect(() => {
      let stream: MediaStream | null = null;
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera error:", err);
          alert("Ask a grown-up to help enable the camera!");
        }
      };
      startCamera();
      return () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
      };
    }, []);

    const handleCheck = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      setIsChecking(true);
      setFeedback(null);

      // Capture frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.6);
        
        // Call AI
        const result = await verifySign(imageBase64, currentLesson.label);
        setFeedback({ correct: result.correct, text: result.feedback });

        if (result.correct) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
          
          // Update progress if not already completed
          if (!progress.completedLessons.includes(currentLesson.id)) {
            setProgress(prev => ({
              ...prev,
              stars: prev.stars + 5,
              completedLessons: [...prev.completedLessons, currentLesson.id]
            }));
          }
        }
      }
      setIsChecking(false);
    };

    return (
      <div className="h-full bg-slate-900 flex flex-col relative">
        {showConfetti && <Confetti />}
        
        {/* Top Overlay */}
        <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={() => setScreen(Screen.LESSON)} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform">
            <ChevronLeft size={32} />
          </button>
          
          <div className="flex gap-2">
            {isOffline && (
                <div className="bg-red-500/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white font-bold text-sm">
                    <WifiOff size={16} /> Offline Mode
                </div>
            )}
            <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white flex items-center gap-2">
                {currentLesson.icon && <span className="text-2xl">{currentLesson.icon}</span>}
                <span className="font-bold text-2xl text-slate-800">{currentLesson.label}</span>
            </div>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden rounded-b-[3rem]">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform -scale-x-100" 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Guide Overlay */}
          <div className="absolute inset-0 border-[8px] border-dashed border-white/40 rounded-[2.5rem] m-6 pointer-events-none flex flex-col items-center justify-center">
            <span className="text-white font-black text-5xl opacity-60 drop-shadow-md mb-4 text-center">SHOW ME<br/>"{currentLesson.label}"</span>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="bg-white rounded-t-[3rem] -mt-8 p-8 min-h-[240px] flex flex-col items-center gap-4 z-20 relative shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          
          {feedback ? (
            <div className={`text-center animate-bounce-gentle w-full`}>
              {feedback.correct ? (
                <div className="flex flex-col items-center bg-green-100 p-4 rounded-3xl border-2 border-green-200">
                    <CheckCircle className="text-green-500 mb-2" size={56} />
                    <p className="text-2xl font-black text-green-600">AMAZING!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center bg-orange-100 p-4 rounded-3xl border-2 border-orange-200">
                     <XCircle className="text-orange-500 mb-2" size={56} />
                    <p className="text-2xl font-black text-orange-600">SO CLOSE!</p>
                </div>
              )}
              <p className="text-slate-600 mt-3 text-xl font-medium leading-snug">{feedback.text}</p>
              <button 
                onClick={() => setFeedback(null)}
                className="mt-6 w-full bg-slate-100 py-4 rounded-2xl font-bold text-slate-600 text-xl active:bg-slate-200"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
                <p className="text-slate-400 font-bold text-lg uppercase tracking-wider">Ready?</p>
                <button 
                    onClick={handleCheck}
                    disabled={isChecking}
                    className={`
                    w-24 h-24 rounded-full border-8 border-white shadow-2xl flex items-center justify-center transition-all
                    ${isChecking ? 'bg-gray-300 scale-95' : 'bg-red-500 hover:bg-red-600 active:scale-90 ring-4 ring-red-100'}
                    `}
                >
                    {isChecking ? (
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                    <Camera size={40} className="text-white" />
                    )}
                </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // 7. Profile Screen
  const ProfileScreen = () => (
    <div className="h-full overflow-y-auto pb-24 bg-purple-50">
      <Header title="My Profile" />
      <div className="px-6 flex flex-col items-center mt-4">
        <div className="w-40 h-40 bg-gradient-to-tr from-purple-300 to-fuchsia-300 rounded-full mb-4 flex items-center justify-center border-8 border-white shadow-2xl">
             <User size={80} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-800">Super Star</h2>
        <p className="text-slate-500 font-bold text-lg">Level {progress.currentLevel}</p>

        <div className="w-full mt-8 grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-slate-100 flex flex-col items-center">
                <Star size={48} className="text-yellow-400 fill-yellow-400 mb-2 filter drop-shadow-sm" />
                <span className="text-4xl font-black text-slate-800">{progress.stars}</span>
                <span className="text-sm text-slate-400 uppercase tracking-wider font-bold">Stars</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-slate-100 flex flex-col items-center">
                <Award size={48} className="text-blue-400 mb-2 filter drop-shadow-sm" />
                <span className="text-4xl font-black text-slate-800">{progress.completedLessons.length}</span>
                <span className="text-sm text-slate-400 uppercase tracking-wider font-bold">Signs</span>
            </div>
        </div>

        <div className="mt-8 w-full bg-white rounded-3xl p-8 shadow-sm border-b-4 border-slate-100">
            <h3 className="font-bold text-slate-700 mb-6 text-xl">My Trophies</h3>
            <div className="space-y-6">
                <div className="flex items-center gap-4 opacity-100">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-yellow-200">🌟</div>
                    <div>
                        <p className="font-bold text-slate-800 text-lg">First Steps</p>
                        <p className="text-sm text-slate-500 font-medium">Learned first sign</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4 opacity-50 grayscale">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-orange-200">🔥</div>
                    <div>
                        <p className="font-bold text-slate-800 text-lg">On Fire</p>
                        <p className="text-sm text-slate-500 font-medium">3 day streak</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full relative font-sans">
      {screen === Screen.HOME && <HomeScreen />}
      {screen === Screen.MAP && <MapScreen />}
      {screen === Screen.LESSON && <LessonScreen />}
      {screen === Screen.PRACTICE && <PracticeScreen />}
      {screen === Screen.PROFILE && <ProfileScreen />}
      
      {(screen === Screen.HOME || screen === Screen.MAP || screen === Screen.PROFILE) && <NavBar />}
    </div>
  );
};

export default App;