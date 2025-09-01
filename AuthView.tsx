import React, { useState } from 'react';
import { User } from '../types';
import * as auth from '../services/authService';
import ErrorMessage from './ErrorMessage';

interface AuthViewProps {
    onLoginSuccess: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [phone, setPhone] = useState('');

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setAge('');
        setPhone('');
        setError(null);
    }

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLoginView) {
                const user = await auth.login(email, password);
                onLoginSuccess(user);
            } else {
                const ageNum = parseInt(age, 10);
                if (isNaN(ageNum) || ageNum <= 0) {
                    throw new Error("Please enter a valid age.");
                }
                if (!name || !phone || !email || !password) {
                     throw new Error("Please fill in all fields.");
                }
                await auth.signup({ name, age: ageNum, phone, email, password: password });
                // Automatically log them in after signup
                const user = await auth.login(email, password);
                onLoginSuccess(user);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="text-center mb-8">
                 <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white flex items-center">
                    <span role="img" aria-label="microscope emoji" className="mr-4 text-4xl">🔬</span>
                    SCFHS MLT AI Exam Simulator
                </h1>
            </div>
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">
                        {isLoginView ? 'Welcome Back' : 'Create an Account'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <ErrorMessage message={error} />}

                        {!isLoginView && (
                             <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                                        <input type="number" id="age" value={age} onChange={e => setAge(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                                    </div>
                                     <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                                        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={isLoginView ? "current-password" : "new-password"} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                             {isLoading ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Processing...
                                </>
                            ) : (isLoginView ? 'Log In' : 'Sign Up')}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={toggleView} className="ml-1 font-medium text-sky-600 hover:text-sky-500">
                            {isLoginView ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
                 <p className="mt-4 text-center text-xs text-slate-400">
                    Admin credentials: admin@scfhs.com / admin
                </p>
            </div>
        </div>
    );
};

export default AuthView;
