    import { useEffect, useState } from 'react';
    import { NavLink } from 'react-router'; 
    import { useDispatch, useSelector } from 'react-redux';
    import axiosClient from '../utils/axiosClient';
    import { logoutUser } from '../authSlice';

    // --- Assets ---
    //logo URL
    const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/1005/1005141.png"; 

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )}
        </button>
    );
    };

    function Homepage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [filters, setFilters] = useState({
        difficulty: 'all',
        tag: 'all',
        status: 'all' 
    });

    useEffect(() => {
        const fetchProblems = async () => {
        try {
            const { data } = await axiosClient.get('/problem/getAllProblem');
            setProblems(data);
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
        };

        const fetchSolvedProblems = async () => {
        try {
            const { data } = await axiosClient.get('/problem/problemSolvedByUser');
            setSolvedProblems(data);
        } catch (error) {
            console.error('Error fetching solved problems:', error);
        }
        };

        fetchProblems();
        if (user) fetchSolvedProblems();
    }, [user]);

    const handleLogout = () => {
        dispatch(logoutUser());
        setSolvedProblems([]);
    };

    const filteredProblems = problems.filter(problem => {
        const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
        const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
        const statusMatch = filters.status === 'all' || 
                            (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
                            // Logic adjustment: assuming 'solved' filter only shows solved. 
                            // If you want 'unsolved' logic, you'd add that here too.
        return difficultyMatch && tagMatch && statusMatch;
    });

    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
        case 'easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        case 'hard': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
        default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    return (
        <div className="min-h-screen bg-base-200 font-sans">
        
        {/* Navigation Bar */}
        <nav className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-300 px-4 lg:px-8 h-16">
            <div className="flex-1 flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                    {/* <img src="../../public/logo1.png" alt="Logo" className="w-full h-full object-contain" /> */}
                    <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold tracking-tight">Code<span className="text-primary">Black</span></span>
            </NavLink>
            </div>
            
            <div className="flex-none gap-4 flex items-center">
            <ThemeToggle />
            
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder border border-base-300">
                <div className="bg-neutral text-neutral-content rounded-full w-9">
                    <span className="text-lg font-medium">{user?.firstName?.charAt(0).toUpperCase()}</span>
                </div>
                </div>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
                <li className="menu-title px-4 py-2">Hello, {user?.firstName}</li>
                {user?.role === 'admin' && <li><NavLink to="/admin" className="active:bg-primary">Admin Dashboard</NavLink></li>}
                <li><button onClick={handleLogout} className="text-error hover:bg-error/10">Logout</button></li>
                </ul>
            </div>
            </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto p-4 lg:p-8 max-w-6xl">
            
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold mb-2">Problem Set</h1>
                <p className="text-base-content/60">Sharpen your skills with our collection of programming challenges.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-base-100 p-4 rounded-2xl shadow-sm border border-base-300">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div className="form-control w-full">
                <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/50">Status</span></label>
                <select 
                    className="select select-bordered select-sm w-full focus:outline-none focus:border-primary"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="all">All Problems</option>
                    <option value="solved">Solved Only</option>
                </select>
                </div>

                {/* Difficulty Filter */}
                <div className="form-control w-full">
                <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/50">Difficulty</span></label>
                <select 
                    className="select select-bordered select-sm w-full focus:outline-none focus:border-primary"
                    value={filters.difficulty}
                    onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                </div>

                {/* Tags Filter */}
                <div className="form-control w-full">
                <label className="label py-1"><span className="label-text text-xs uppercase font-bold text-base-content/50">Topic</span></label>
                <select 
                    className="select select-bordered select-sm w-full focus:outline-none focus:border-primary"
                    value={filters.tag}
                    onChange={(e) => setFilters({...filters, tag: e.target.value})}
                >
                    <option value="all">All Tags</option>
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                </select>
                </div>
            </div>
            </div>

            {/* Problems List Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-bold text-base-content/50 uppercase tracking-wider">
                <div className="col-span-1">Status</div>
                <div className="col-span-6">Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-2">Tag</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Problems List */}
            <div className="space-y-3">
            {filteredProblems.length > 0 ? (
                filteredProblems.map(problem => {
                    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                    
                    return (
                    <NavLink 
                        to={`/problem/${problem._id}`} 
                        key={problem._id} 
                        className="group block"
                    >
                        <div className={`
                            grid grid-cols-1 md:grid-cols-12 gap-4 items-center 
                            bg-base-100 rounded-xl p-4 md:px-6 md:py-4 
                            border border-base-200 shadow-sm
                            transition-all duration-300 ease-out
                            hover:-translate-y-1 hover:shadow-lg hover:border-primary/30
                            ${isSolved ? 'bg-base-100' : ''}
                        `}>
                            {/* Status Icon */}
                            <div className="col-span-1 flex items-center">
                                {isSolved ? (
                                    <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center" title="Solved">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-base-200 border border-base-300"></div>
                                )}
                            </div>

                            {/* Title */}
                            <div className="col-span-6">
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    {problem.title}
                                </h3>
                                {/* Mobile only view for tags/diff */}
                                <div className="md:hidden flex gap-2 mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                </div>
                            </div>

                            {/* Difficulty (Desktop) */}
                            <div className="col-span-2 hidden md:block">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                                    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                </span>
                            </div>

                            {/* Tag */}
                            <div className="col-span-2 hidden md:block">
                                <div className="badge badge-ghost badge-sm text-xs font-normal">
                                    {problem.tags}
                                </div>
                            </div>

                            {/* Action Arrow */}
                            <div className="col-span-1 hidden md:flex justify-end text-base-content/30 group-hover:text-primary transition-colors group-hover:translate-x-1 duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </NavLink>
                    );
                })
            ) : (
                <div className="text-center py-20">
                    <div className="flex justify-center mb-4 text-base-content/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-base-content/70">No problems found</h3>
                    <p className="text-base-content/50">Try adjusting your filters to see more results.</p>
                </div>
            )}
            </div>
        </div>
        </div>
    );
    }

    export default Homepage;