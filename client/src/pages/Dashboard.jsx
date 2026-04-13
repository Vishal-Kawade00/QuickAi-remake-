import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkle, Gem, FileText, Image as ImageIcon, Youtube, AlignLeft, Layers, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [counts, setCounts] = useState({ all: 0, text: 0, image: 0, document: 0, youtube: 0, chat: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const getDashboardData = async () => {
            try {
                const { data } = await api.get("/history/all");
                if (data.success) {
                    const allData = data.data;
                    setCounts({
                        all: allData.length,
                        text: allData.filter(i => i.modelType === 'text').length,
                        image: allData.filter(i => i.modelType === 'image').length,
                        document: allData.filter(i => i.modelType === 'document').length,
                        youtube: allData.filter(i => i.modelType === 'youtube').length,
                        chat: allData.filter(i => i.modelType === 'chat').length
                    });
                }
            } catch (error) {
                toast.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        getDashboardData();
    }, []);

    const featureCards = [
        { id: 'all', title: 'All Generations', count: counts.all, icon: Layers, bg: 'from-indigo-600 to-purple-600', path: '/ai/history/all' },
        { id: 'text', title: 'Text & Blogs', count: counts.text, icon: AlignLeft, bg: 'from-blue-500 to-cyan-400', path: '/ai/history/text' },
        { id: 'image', title: 'Image Generation', count: counts.image, icon: ImageIcon, bg: 'from-green-500 to-emerald-400', path: '/ai/history/image' },
        { id: 'document', title: 'Resume Reviews', count: counts.document, icon: FileText, bg: 'from-teal-500 to-cyan-500', path: '/ai/history/document' },
        { id: 'youtube', title: 'YouTube Study Notes', count: counts.youtube, icon: Youtube, bg: 'from-red-500 to-rose-400', path: '/ai/history/youtube' },
        { id: 'chat', title: 'AI Chat', count: counts.chat, icon: MessageSquare, bg: 'from-orange-500 to-amber-500', path: '/ai/history/chat' }
    ];

    return (
        <div className='h-full overflow-y-auto p-6 custom-scroll'>
            <div className='flex flex-wrap justify-start gap-4 mb-10'>
                <div className='flex items-center justify-between w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                    <div className='text-slate-600'>
                        <p className='text-sm font-medium'>Total Generations</p>
                        <h2 className='text-2xl font-bold mt-1'>{loading ? "..." : counts.all}</h2>
                    </div>
                    <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center shadow-md'>
                        <Sparkle className='w-6 h-6' />
                    </div>
                </div>

                <div className='flex items-center justify-between w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm'>
                    <div className='text-slate-600'>
                        <p className='text-sm font-medium'>Active Plan</p>
                        <h2 className='text-2xl font-bold mt-1 capitalize text-purple-700'>{user?.plan || "Premium"}</h2>
                    </div>
                    <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center shadow-md'>
                        <Gem className='w-6 h-6' />
                    </div>
                </div>
            </div>

            <h3 className='text-xl font-bold text-slate-800 border-b border-gray-200 pb-3 mb-6'>
                Your Creation History
            </h3>
            
            {loading ? (
                <div className='flex justify-center items-center h-40'>
                    <div className='animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent'></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    {featureCards.map((card) => (
                        <div 
                            key={card.id}
                            onClick={() => navigate(card.path)}
                            className="bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group flex flex-col justify-between min-h-[150px]"
                        >
                            <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${card.bg} text-white shadow-md group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div className="mt-4">
                                <h4 className="text-md font-bold text-gray-800">{card.title}</h4>
                                <p className="text-gray-500 text-sm font-medium mt-1">
                                    {card.count} {card.count === 1 ? 'Item' : 'Items'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;