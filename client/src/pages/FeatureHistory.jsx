import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CreationItems from '../components/CreationItems'; 

const FeatureHistory = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    
    const [creations, setCreations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const categoryDetails = {
        'all': { title: 'All Creation History' },
        'text': { title: 'Text & Blog History' },
        'image': { title: 'Image Generation History' },
        'document': { title: 'Resume Review History' },
        'youtube': { title: 'YouTube Study History' },
        'chat': { title: 'AI Chat Conversations' }
    };

    const details = categoryDetails[category] || { title: 'History' };
useEffect(() => {
        const fetchCategoryHistory = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/history/${category}`);
                
                if (data.success) {
                    let formattedData = [];

                    if (category === 'all') {
                        formattedData = data.data.map(item => {
                            let displayType = 'Content';
                            
                            if (item.modelType === 'text') displayType = item.type === 'article' ? 'Article' : 'Blog Title';
                            if (item.modelType === 'image') displayType = 'Image Tool';
                            if (item.modelType === 'document') displayType = 'Document Tool';
                            if (item.modelType === 'youtube') displayType = 'Study Session'; // <-- Removed the stray period here!
                            if (item.modelType === 'chat') displayType = 'AI Chat';
                            
                            return { ...item, displayType, mappedType: item.modelType }; 
                        });
                    } else {
                        formattedData = data.data.map(item => ({ 
                            ...item, 
                            displayType: category === 'text' ? (item.type === 'article' ? 'Article' : 'Blog Title') : 
                                         category === 'image' ? 'Image Tool' : 
                                         category === 'document' ? 'Document Tool' : 
                                         category === 'chat' ? 'AI Chat' : 'Study Session',
                            mappedType: category
                        }));
                    }
                    
                    setCreations(formattedData);
                }
            } catch (error) {
                console.error("History fetch error:", error);
                toast.error("Failed to load history");
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            fetchCategoryHistory();
            setCurrentPage(1);
        }
    }, [category]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = creations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(creations.length / itemsPerPage);

    return (
        <div className='h-full flex flex-col bg-gray-50'>
            <div className="bg-white border-b border-gray-200 p-6 shrink-0 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate('/ai')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{details.title}</h1>
                    <p className="text-sm text-gray-500 font-medium">Total Items: {creations.length}</p>
                </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 custom-scroll'>
                {loading ? (
                    <div className='flex justify-center items-center h-64'>
                        <div className='animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent'></div>
                    </div>
                ) : creations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Inbox className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium text-lg">No history found</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-5xl mx-auto">
                        {currentItems.map((item) => (
                            <CreationItems key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            {!loading && creations.length > 0 && (
                <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex justify-between items-center px-6">
                    <p className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900">{indexOfFirstItem + 1}</span> to <span className="text-gray-900">{Math.min(indexOfLastItem, creations.length)}</span> of <span className="text-gray-900">{creations.length}</span> entries
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-700">
                            Page {currentPage} of {totalPages || 1}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeatureHistory;