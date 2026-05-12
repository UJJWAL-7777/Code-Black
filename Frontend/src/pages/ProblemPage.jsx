    import { useState, useEffect, useRef } from 'react';
    import { useForm } from 'react-hook-form';
    import Editor from '@monaco-editor/react';
    import { useParams } from 'react-router';
    import axiosClient from "../utils/axiosClient";
    import SubmissionHistory from "../components/SubmissionHistory";
    import ChatAi from '../components/ChatAi';
    import Editorial from '../components/Editorial';

    import { useSelector } from 'react-redux';

    // --- Assets ---
    // You can replace this URL with your actual local image path
    const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/1005/1005141.png"; 

    const langMap = {
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript'
    };

    // --- Theme Toggle Component ---
    const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <button 
        onClick={toggleTheme} 
        className="btn btn-ghost btn-circle btn-sm transition-transform hover:rotate-12"
        title="Toggle Theme"
        >
        {theme === "light" ? (
            // Moon Icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        ) : (
            // Sun Icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )}
        </button>
    );
    };

    const ProblemPage = () => {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [activeRightTab, setActiveRightTab] = useState('code');
    const editorRef = useRef(null);
    let { problemId } = useParams();

    // ADD HERE
    const { user } =
    useSelector(
        (state) => state.auth
    );
    

    const { handleSubmit } = useForm();

    useEffect(() => {
        const fetchProblem = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/problem/problemById/${problemId}`);
            const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
            setProblem(response.data);
            setCode(initialCode);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching problem:', error);
            setLoading(false);
        }
        };

        fetchProblem();
    }, [problemId]);

    // Update code when language changes
    useEffect(() => {
        if (problem) {
        const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
        setCode(initialCode);
        }
    }, [selectedLanguage, problem]);

    const handleEditorChange = (value) => {
        setCode(value || '');
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
    };

    const handleRun = async () => {
        setLoading(true);
        setRunResult(null);

        try {
        const response = await axiosClient.post(`/submission/run/${problemId}`, {
            code,
            language: selectedLanguage
        });

        setRunResult(response.data);
        setLoading(false);
        setActiveRightTab('testcase');

        } catch (error) {
        console.error('Error running code:', error);
        setRunResult({
            success: false,
            error: 'Internal server error'
        });
        setLoading(false);
        setActiveRightTab('testcase');
        }
    };

    const handleSubmitCode = async () => {
        setLoading(true);
        setSubmitResult(null);

        try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
            code: code,
            language: selectedLanguage
        });

        setSubmitResult(response.data);
        setLoading(false);
        setActiveRightTab('result');

        } catch (error) {
        console.error('Error submitting code:', error);
        setSubmitResult(null);
        setLoading(false);
        setActiveRightTab('result');
        }
    };

    const getLanguageForMonaco = (lang) => {
        switch (lang) {
        case 'javascript': return 'javascript';
        case 'java': return 'java';
        case 'cpp': return 'cpp';
        default: return 'javascript';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
        case 'easy': return 'text-success bg-success/10 border-success/20';
        case 'medium': return 'text-warning bg-warning/10 border-warning/20';
        case 'hard': return 'text-error bg-error/10 border-error/20';
        default: return 'text-base-content';
        }
    };

    if (loading && !problem) {
        return (
        <div className="flex justify-center items-center min-h-screen bg-base-100">
            <div className="flex flex-col items-center gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <span className="text-base-content/60 animate-pulse">Loading Problem...</span>
            </div>
        </div>
        );
    }

    // --- Helper Components for Tabs ---
    const TabButton = ({ isActive, label, onClick }) => (
        <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 hover:bg-base-200/50 ${
            isActive 
            ? 'border-primary text-primary' 
            : 'border-transparent text-base-content/60 hover:text-base-content'
        }`}
        >
        {label}
        </button>
    );

    return (
        <div className="h-screen flex flex-col bg-base-100 overflow-hidden font-sans">
        
        {/* --- Top Navigation Bar --- */}
        <header className="h-14 min-h-[3.5rem] bg-base-200/50 border-b border-base-300 flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                {/* Logo Image */}
                {/* <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center p-1">
                    <img src="../../public/logo1.png" alt="Logo" className="w-full h-full object-contain" />
                </div> */}

                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center p-1">
                    <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-bold tracking-tight">Code<span className="text-primary">Black</span></span>
                
                {/* Problem Title Breadcrumb style */}
                {problem && (
                    <>
                        <span className="text-base-content/30 mx-2">/</span>
                        <span className="text-sm font-medium truncate max-w-[200px]">{problem.title}</span>
                    </>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                {/* Run/Submit Buttons in Header for easy access (Optional, keeping them in bottom for now based on your logic flow) */}
                <ThemeToggle />
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                        <span className="text-xs p-3">{user?.firstName?.charAt(0)?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>


        <div className="flex-1 flex overflow-hidden">
            
            {/* --- Left Panel --- */}
            <div className="w-1/2 flex flex-col border-r border-base-300 bg-base-100">
            {/* Left Tabs Header */}
            <div className="flex overflow-x-auto bg-base-200/30 border-b border-base-300 shrink-0">
                <TabButton isActive={activeLeftTab === 'description'} onClick={() => setActiveLeftTab('description')} label="Description" />
                <TabButton isActive={activeLeftTab === 'editorial'} onClick={() => setActiveLeftTab('editorial')} label="Editorial" />
                <TabButton isActive={activeLeftTab === 'solutions'} onClick={() => setActiveLeftTab('solutions')} label="Solutions" />
                <TabButton isActive={activeLeftTab === 'submissions'} onClick={() => setActiveLeftTab('submissions')} label="Submissions" />
                <TabButton isActive={activeLeftTab === 'chatAI'} onClick={() => setActiveLeftTab('chatAI')} label="AI Helper" />
            </div>

            {/* Left Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
                {problem && (
                <div className="animate-fadeIn">
                    {activeLeftTab === 'description' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold text-base-content">{problem.title}</h1>
                        </div>
                        
                        <div className="flex gap-2 mb-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-base-300 text-base-content/70 border border-base-content/10">
                                {problem.tags}
                            </span>
                        </div>

                        <div className="prose prose-sm md:prose-base max-w-none prose-p:text-base-content/80 prose-headings:text-base-content">
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {problem.description}
                        </div>
                        </div>

                        <div className="mt-10 space-y-6">
                        {problem.visibleTestCases.map((example, index) => (
                            <div key={index} className="bg-base-200/50 rounded-xl overflow-hidden border border-base-300">
                            <div className="px-4 py-2 bg-base-200/80 border-b border-base-300">
                                <h4 className="font-semibold text-sm">Example {index + 1}</h4>
                            </div>
                            <div className="p-4 space-y-3 font-mono text-sm">
                                <div className="flex gap-4">
                                    <span className="text-base-content/50 w-20 shrink-0">Input:</span>
                                    <span className="text-base-content bg-base-300/50 px-2 rounded">{example.input}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-base-content/50 w-20 shrink-0">Output:</span>
                                    <span className="text-base-content bg-base-300/50 px-2 rounded">{example.output}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-base-content/50 w-20 shrink-0">Explanation:</span>
                                    <span className="text-base-content/80">{example.explanation}</span>
                                </div>
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {activeLeftTab === 'editorial' && (
                    <div className="prose max-w-none animate-fadeIn">
                        <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                    </div>
                    )}

                    {activeLeftTab === 'solutions' && (
                    <div className="animate-fadeIn">
                        <h2 className="text-xl font-bold mb-6">Community Solutions</h2>
                        <div className="space-y-6">
                        {problem.referenceSolution?.map((solution, index) => (
                            <div key={index} className="border border-base-300 rounded-xl overflow-hidden">
                            <div className="bg-base-200 px-4 py-2 border-b border-base-300 flex justify-between items-center">
                                <h3 className="font-semibold text-sm">Solution in {solution?.language}</h3>
                                <button className="btn btn-xs btn-ghost">Copy</button>
                            </div>
                            <div className="p-0">
                                <Editor
                                    height="200px"
                                    language={getLanguageForMonaco(solution?.language)}
                                    value={solution?.completeCode}
                                    theme="vs-dark"
                                    options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                                />
                            </div>
                            </div>
                        )) || <div className="alert alert-info bg-info/10 text-info border-info/20"><span>Solutions will be available after you solve the problem.</span></div>}
                        </div>
                    </div>
                    )}

                    {activeLeftTab === 'submissions' && (
                    <div className="animate-fadeIn">
                        <h2 className="text-xl font-bold mb-4">Submission History</h2>
                        <SubmissionHistory problemId={problemId} />
                    </div>
                    )}

                    {activeLeftTab === 'chatAI' && (
                    <div className="animate-fadeIn h-full">
                        <ChatAi problem={problem}></ChatAi>
                    </div>
                    )}
                </div>
                )}
            </div>
            </div>

            {/* --- Right Panel --- */}
            <div className="w-1/2 flex flex-col bg-base-100 h-full">
            
            {/* Right Tabs Header */}
            <div className="flex justify-between items-center bg-base-200/30 border-b border-base-300 px-2 shrink-0 h-[50px]">
                <div className="flex">
                    <TabButton isActive={activeRightTab === 'code'} onClick={() => setActiveRightTab('code')} label="Code" />
                    <TabButton isActive={activeRightTab === 'testcase'} onClick={() => setActiveRightTab('testcase')} label="Testcase" />
                    <TabButton isActive={activeRightTab === 'result'} onClick={() => setActiveRightTab('result')} label="Result" />
                </div>
                
                {/* Language Selector (Only visible in Code tab usually, but good here for access) */}
                {activeRightTab === 'code' && (
                    <div className="join">
                        {['javascript', 'java', 'cpp'].map((lang) => (
                        <button
                            key={lang}
                            className={`join-item btn btn-xs ${selectedLanguage === lang ? 'btn-active btn-neutral' : 'btn-ghost'}`}
                            onClick={() => handleLanguageChange(lang)}
                        >
                            {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Java'}
                        </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {activeRightTab === 'code' && (
                <div className="flex-1 flex flex-col animate-fadeIn h-full">
                    <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        language={getLanguageForMonaco(selectedLanguage)}
                        value={code}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        theme={localStorage.getItem('theme') === 'light' ? 'light' : 'vs-dark'}
                        options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        padding: { top: 16 },
                        fontFamily: '"Fira Code", monospace',
                        }}
                    />
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="p-4 bg-base-100 border-t border-base-300 flex justify-between items-center z-10">
                    <button 
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={() => setActiveRightTab('testcase')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        Console
                    </button>
                    <div className="flex gap-3">
                        <button
                        className={`btn btn-neutral btn-sm px-6 ${loading ? 'loading' : ''}`}
                        onClick={handleRun}
                        disabled={loading}
                        >
                        Run
                        </button>
                        <button
                        className={`btn btn-success btn-sm px-6 text-white hover:bg-success-focus shadow-lg shadow-success/20 ${loading ? 'loading' : ''}`}
                        onClick={handleSubmitCode}
                        disabled={loading}
                        >
                        Submit
                        </button>
                    </div>
                    </div>
                </div>
                )}

                {activeRightTab === 'testcase' && (
                <div className="flex-1 p-6 overflow-y-auto animate-fadeIn bg-base-100">
                    <h3 className="text-sm uppercase tracking-wider font-bold text-base-content/50 mb-4">Test Results</h3>
                    {runResult ? (
                    <div className="space-y-4">
                        <div className={`alert ${runResult.success ? 'alert-success bg-success/10 text-success border-success/20' : 'alert-error bg-error/10 text-error border-error/20'} shadow-sm`}>
                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2">
                                {runResult.success ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                <h4 className="font-bold">{runResult.success ? 'Accepted' : 'Compilation/Runtime Error'}</h4>
                            </div>
                            {runResult.success && (
                                <div className="flex gap-4 mt-1 text-xs opacity-80 pl-8">
                                    <span>Runtime: {runResult.runtime}s</span>
                                    <span>Memory: {runResult.memory}KB</span>
                                </div>
                            )}
                        </div>
                        </div>

                        <div className="grid gap-4">
                        {runResult.testCases.map((tc, i) => (
                            <div key={i} className="card bg-base-200/50 border border-base-300 shadow-sm">
                            <div className="card-body p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold uppercase text-base-content/50">Case {i + 1}</span>
                                    <div className={`badge ${tc.status_id === 3 ? 'badge-success badge-outline' : 'badge-error badge-outline'} gap-1`}>
                                        {tc.status_id === 3 ? 'Passed' : 'Failed'}
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm font-mono bg-base-100 p-3 rounded-md">
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-base-content/50">Input:</span>
                                    <span className="text-base-content">{tc.stdin}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-base-content/50">Expected:</span>
                                    <span className="text-base-content">{tc.expected_output}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-2">
                                    <span className="text-base-content/50">Output:</span>
                                    <span className={`${tc.status_id === 3 ? 'text-success' : 'text-error'}`}>{tc.stdout}</span>
                                </div>
                                </div>
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    ) : (
                    <div className="h-full flex flex-col items-center justify-center text-base-content/40 gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>Run your code to see output here</p>
                        <button className="btn btn-sm btn-outline" onClick={handleRun}>Run Code</button>
                    </div>
                    )}
                </div>
                )}

                {activeRightTab === 'result' && (
                <div className="flex-1 p-6 overflow-y-auto animate-fadeIn bg-base-100">
                    <h3 className="text-sm uppercase tracking-wider font-bold text-base-content/50 mb-4">Final Submission</h3>
                    {submitResult ? (
                    <div className="flex flex-col items-center justify-center pt-10">
                        {submitResult.accepted ? (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 className="text-3xl font-bold text-success mb-2">Accepted</h2>
                                <p className="text-base-content/60 mb-8">Great job! You solved this problem.</p>
                                
                                <div className="stats shadow bg-base-200">
                                    <div className="stat place-items-center">
                                        <div className="stat-title">Runtime</div>
                                        <div className="stat-value text-success text-2xl">{submitResult.runtime}s</div>
                                        <div className="stat-desc">Faster than 80%</div>
                                    </div>
                                    <div className="stat place-items-center">
                                        <div className="stat-title">Memory</div>
                                        <div className="stat-value text-secondary text-2xl">{submitResult.memory}KB</div>
                                    </div>
                                    <div className="stat place-items-center">
                                        <div className="stat-title">Test Cases</div>
                                        <div className="stat-value text-primary text-2xl">{submitResult.passedTestCases}/{submitResult.totalTestCases}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-error/20 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </div>
                                <h2 className="text-3xl font-bold text-error mb-2">Wrong Answer</h2>
                                <p className="text-base-content/60 mb-6">{submitResult.error}</p>
                                <div className="badge badge-lg badge-outline gap-2">
                                    Passed: {submitResult.passedTestCases} / {submitResult.totalTestCases}
                                </div>
                            </div>
                        )}
                    </div>
                    ) : (
                    <div className="h-full flex flex-col items-center justify-center text-base-content/40 gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>Submit your code to see the verdict</p>
                    </div>
                    )}
                </div>
                )}
            </div>
            </div>
        </div>
        
        {/* Inline Styles for Animation */}
        <style>{`
            @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
            }
        `}</style>
        </div>
    );
    };

    export default ProblemPage;