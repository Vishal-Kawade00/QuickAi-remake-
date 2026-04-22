import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Plan = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handlePremiumClick = () => {
        if (user) navigate('/ai');
        else navigate('/register');
    };

    return (
        <div className='max-w-6xl mx-auto z-20 my-32 px-4'>
            <div className='text-center mb-16'>
                <h2 className='text-slate-800 text-3xl sm:text-[42px] font-bold mb-4'>Simple, Transparent Pricing</h2>
                <p className='text-gray-500 max-w-xl mx-auto text-lg'>Start for free and scale up as you grow. Gain access to our exclusive YouTube AI Tutor.</p>
            </div>
            
            {/* items-stretch ensures both children are the exact same height */}
            <div className='flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto'>
                
                {/* Free Plan */}
                <div className='flex flex-col flex-1 p-8 bg-white rounded-3xl border border-gray-200 shadow-sm transition-all hover:shadow-md'>
                    <h3 className='text-xl font-semibold text-gray-800'>Hobby</h3>
                    <div className='mt-4 flex items-baseline text-5xl font-extrabold text-gray-900'>
                        $0
                        <span className='ml-1 text-xl font-medium text-gray-500'>/mo</span>
                    </div>
                    <p className='mt-4 text-gray-500'>Perfect for trying out basic text generation.</p>
                    
                    <ul className='mt-8 space-y-4 mb-8'>
                        {['5 AI Articles per month', 'Basic Image Generation', 'Standard Support'].map((feature, i) => (
                            <li key={i} className='flex items-center gap-3 text-gray-600'>
                                <CheckCircle2 className='w-5 h-5 text-gray-400 shrink-0' /> 
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    {/* mt-auto pushes the button to the absolute bottom of the flex container */}
                    <button 
                        onClick={() => navigate('/register')} 
                        className='mt-auto w-full bg-gray-50 text-gray-700 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors'
                    >
                        Get Started
                    </button>
                </div>

                {/* Premium Plan - Slightly scaled up on desktop to look more appealing */}
                <div className='flex flex-col flex-1 p-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden md:scale-105 z-10'>
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                        Most Popular
                    </div>
                    <h3 className='text-xl font-semibold text-white'>Pro Creator</h3>
                    <div className='mt-4 flex items-baseline text-5xl font-extrabold text-white'>
                        $15
                        <span className='ml-1 text-xl font-medium text-gray-400'>/mo</span>
                    </div>
                    <p className='mt-4 text-gray-400'>Unlock the full power of QuickAi, including video chunking.</p>
                    
                    <ul className='mt-8 space-y-4 mb-8'>
                        {[
                            'Unlimited AI Articles', 
                            'Advanced Object & BG Removal', 
                            'YouTube Study Sessions (Detailed Notes)',
                            'Agentic AI Chat (Stateful Memory)',
                            'Priority Support'
                        ].map((feature, i) => (
                            <li key={i} className='flex items-center gap-3 text-gray-300'>
                                <CheckCircle2 className='w-5 h-5 text-blue-400 shrink-0' /> 
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    
                    {/* mt-auto keeps this button perfectly aligned with the Free plan button */}
                    <button 
                        onClick={handlePremiumClick} 
                        className='mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/30'
                    >
                        Go Premium Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Plan;