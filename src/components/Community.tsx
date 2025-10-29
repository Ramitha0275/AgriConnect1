import React, { useState, useEffect } from 'react';
import { CommunityPost } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PaperAirplaneIcon } from './icons/Icons';
import { getDataForUser, setDataForUser } from '../cloud/database';

const initialPosts: CommunityPost[] = [
    { id: 1, author: 'Jane Doe', avatarUrl: 'https://picsum.photos/seed/jane/40/40', content: 'Has anyone had success with no-till farming for corn? Looking for tips!', timestamp: '2 hours ago' },
    { id: 2, author: 'John Smith', avatarUrl: 'https://picsum.photos/seed/john/40/40', content: 'I\'m seeing early signs of blight on my potatoes. What\'s the best organic treatment you\'ve used?', timestamp: '5 hours ago' },
    { id: 3, author: 'AgriConnect AI', avatarUrl: 'https://img.icons8.com/fluency/48/bot.png', content: 'Welcome to the community! Ask a question or share your knowledge with fellow farmers.', timestamp: '1 day ago', isAI: true },
];

const Community: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    
    const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
    const [newPost, setNewPost] = useState('');

    useEffect(() => {
        if (!user) {
            setPosts(initialPosts); // Show default posts if not logged in
            return;
        }

        const storedPosts = getDataForUser<CommunityPost[]>(user.email, 'posts');
        if (storedPosts) {
            setPosts(storedPosts);
        } else {
            setPosts(initialPosts);
        }
    }, [user]);

    const updateStoredPosts = (updatedPosts: CommunityPost[]) => {
        setPosts(updatedPosts);
        if (user) {
            setDataForUser(user.email, 'posts', updatedPosts);
        }
    }

    const handlePost = () => {
        if(newPost.trim() === '' || !user) return;
        const post: CommunityPost = {
            id: Date.now(),
            author: user.name,
            avatarUrl: `https://picsum.photos/seed/${user.email}/40/40`,
            content: newPost,
            timestamp: 'Just now'
        };
        const updatedPosts = [post, ...posts];
        updateStoredPosts(updatedPosts);
        setNewPost('');
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{t('community.title')}</h1>
            <p className="text-slate-200 mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{t('community.subtitle')}</p>

            <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-4 ring-1 ring-black/5 mb-6">
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-text-primary"
                    rows={3}
                    placeholder={t('community.postPlaceholder')}
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handlePost}
                        className="bg-primary text-white px-6 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-primary-focus transition-colors disabled:bg-slate-400"
                        disabled={!newPost.trim()}
                    >
                        <PaperAirplaneIcon className="w-5 h-5"/>
                        {t('community.postBtn')}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className={`p-4 rounded-2xl shadow-xl flex gap-4 ring-1 ring-black/5 ${post.isAI ? 'bg-green-500/30 backdrop-blur-lg' : 'bg-white/60 backdrop-blur-lg'}`}>
                        <img src={post.avatarUrl} alt={post.author} className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="w-full">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{post.author}</p>
                                <p className="text-xs text-slate-200">{post.timestamp}</p>
                            </div>
                            <p className="mt-1 text-white" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.4)' }}>{post.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Community;