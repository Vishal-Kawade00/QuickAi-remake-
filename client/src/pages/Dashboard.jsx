import React, { useEffect, useState } from 'react';
import { Gem, Sparkle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreationItems from '../components/CreationItems';
import api from '../api/axios'; // Custom Axios instance
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    const getDashboardData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/history");

            if (data.success) {
                // Destructure the polymorphic data from our backend
                const { textContents = [], imageTasks = [], resumeFeedbacks = [], studySessions = [] } = data.data;

                // Combine and normalize the data so it's easy for <CreationItems /> to render
                const combinedCreations = [
                    ...textContents.map(item => ({ 
                        ...item, 
                        displayTitle: item.title, 
                        displayType: item.type === 'article' ? 'Article' : 'Blog Title' 
                    })),
                    ...imageTasks.map(item => ({ 
                        ...item, 
                        displayTitle: `AI Image ${item.taskType.replace('_', ' ')}`, 
                        displayType: 'Image Tool' 
                    })),
                    ...resumeFeedbacks.map(item => ({ 
                        ...item, 
                        displayTitle: 'Resume Analysis', 
                        displayType: 'Document Tool' 
                    })),
                    ...studySessions.map(item => ({ 
                        ...item, 
                        displayTitle: item.title || 'YouTube Summary', 
                        displayType: 'Study Session' 
                    }))
                ];

                // Sort by most recent first
                combinedCreations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setCreations(combinedCreations);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDashboardData();
    }, []);

    return (
        <div className='h-full overflow-y-auto p-6 custom-scroll'>
            <div className='flex flex-wrap justify-start gap-4'>
                {/* Total Creation Card */}
                <div className='flex items-center justify-between w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                    <div className='text-slate-600'>
                        <p className='text-sm font-medium'>Total Creations</p>
                        <h2 className='text-2xl font-bold mt-1'>{creations.length}</h2>
                    </div>
                    <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center shadow-md'>
                        <Sparkle className='w-6 h-6 text-white' />
                    </div>
                </div>

                {/* Active Plan Card */}
                <div className='flex items-center justify-between w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                    <div className='text-slate-600'>
                        <p className='text-sm font-medium'>Active Plan</p>
                        <h2 className='text-2xl font-bold mt-1 capitalize text-purple-700'>
                            {user?.plan || "Premium"}
                        </h2>
                    </div>
                    <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center shadow-md'>
                        <Gem className='w-6 h-6 text-white' />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className='flex justify-center items-center h-[50vh]'>
                    <div className='animate-spin rounded-full h-11 w-11 border-4 border-purple-500 border-t-transparent'></div>
                </div>
            ) : (
                <div className='mt-8 space-y-4'>
                    <h3 className='text-lg font-semibold text-slate-800 border-b border-gray-200 pb-2 mb-4'>
                        Recent Creations
                    </h3>
                    
                    {creations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-dashed border-gray-300">
                            <Sparkle className="w-10 h-10 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No creations yet</p>
                            <p className="text-gray-400 text-sm mt-1">Start using the tools on the left to generate content!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Note: I use item._id for the key as that is MongoDB's standard ID field */}
                            {creations.map((item) => (
                                <CreationItems key={item._id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Dashboard;