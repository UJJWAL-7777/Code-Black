    import { useState, useEffect } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import { z } from 'zod';
    import { useDispatch, useSelector } from 'react-redux';
    import { useNavigate, NavLink } from 'react-router';
    import { registerUser } from '../authSlice';

    // --- Theme Toggle Component (Duplicated to work independently) ---
    const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

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
        className="btn btn-circle btn-ghost absolute top-4 right-4 z-50 transition-all duration-300 hover:rotate-12"
        aria-label="Toggle Theme"
        >
        {theme === "light" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )}
        </button>
    );
    };

    const signupSchema = z.object({
    firstName: z.string().min(3, "Minimum character should be 3"),
    emailId: z.string().email("Invalid Email"),
    password: z.string().min(8, "Password is too weak")
    });

    function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(signupSchema) });

    useEffect(() => {
        if (isAuthenticated) {
        navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = (data) => {
        dispatch(registerUser(data));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-200 via-base-300 to-base-100 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

        <ThemeToggle />

        <div className="card w-full max-w-md bg-base-100/90 backdrop-blur-sm shadow-2xl border border-base-200 animate-[fadeInUp_0.5s_ease-out]">
            <div className="card-body px-8 py-10">
            
            <div className="text-center mb-6">
                <h2 className="text-4xl font-black tracking-tight text-base-content">
                Code<span className="text-primary">Black</span>
                </h2>
                <p className="text-sm text-base-content/60 mt-2">Create your account to get started.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* First Name Field */}
                <div className="form-control">
                <label className="label pl-1">
                    <span className="label-text font-semibold">First Name</span>
                </label>
                <input
                    type="text"
                    placeholder="John"
                    className={`input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-all ${errors.firstName ? 'input-error' : 'focus:border-primary'}`} 
                    {...register('firstName')}
                />
                {errors.firstName && (
                    <span className="text-error text-xs mt-2 ml-1 flex items-center gap-1">
                    ⚠ {errors.firstName.message}
                    </span>
                )}
                </div>

                {/* Email Field */}
                <div className="form-control">
                <label className="label pl-1">
                    <span className="label-text font-semibold">Email</span>
                </label>
                <input
                    type="email"
                    placeholder="john@example.com"
                    className={`input input-bordered w-full bg-base-200/50 focus:bg-base-100 transition-all ${errors.emailId ? 'input-error' : 'focus:border-primary'}`}
                    {...register('emailId')}
                />
                {errors.emailId && (
                    <span className="text-error text-xs mt-2 ml-1 flex items-center gap-1">
                    ⚠ {errors.emailId.message}
                    </span>
                )}
                </div>

                {/* Password Field with Toggle */}
                <div className="form-control">
                <label className="label pl-1">
                    <span className="label-text font-semibold">Password</span>
                </label>
                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`input input-bordered w-full pr-12 bg-base-200/50 focus:bg-base-100 transition-all ${errors.password ? 'input-error' : 'focus:border-primary'}`}
                    {...register('password')}
                    />
                    <button
                    type="button"
                    className="absolute top-0 right-0 h-full px-4 text-base-content/50 hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                    </button>
                </div>
                {errors.password && (
                    <span className="text-error text-xs mt-2 ml-1 flex items-center gap-1">
                    ⚠ {errors.password.message}
                    </span>
                )}
                </div>

                {/* Submit Button */}
                <div className="form-control mt-8"> 
                <button
                    type="submit"
                    className={`btn btn-primary w-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 ${loading ? 'loading btn-disabled' : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating Account...
                    </>
                    ) : 'Sign Up'}
                </button>
                </div>
            </form>

            {/* Login Redirect */}
            <div className="text-center mt-8">
                <span className="text-sm text-base-content/70">
                Already have an account?{' '}
                <NavLink to="/login" className="link link-primary font-bold no-underline hover:underline transition-all">
                    Login
                </NavLink>
                </span>
            </div>
            </div>
        </div>

        {/* Inline Style for Custom Animation */}
        <style>{`
            @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
        </div>
    );
    }

    export default Signup;