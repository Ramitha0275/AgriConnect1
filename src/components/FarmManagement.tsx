import React, { useState, useCallback, useEffect } from 'react';
import { FarmTask } from '../types';
import { analyzeCropImage } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircleIcon, PlusIcon, SparklesIcon, UploadIcon } from './icons/Icons';
import { getDataForUser, setDataForUser } from '../cloud/database';

const FarmManagement: React.FC = () => {
    const { user } = useAuth();
    const { language, t } = useLanguage();
    
    const [tasks, setTasks] = useState<FarmTask[]>([]);
    const [newTask, setNewTask] = useState('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysisPrompt, setAnalysisPrompt] = useState('Is this plant healthy? Identify any potential issues.');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        const storedTasks = getDataForUser<FarmTask[]>(user.email, 'tasks');
        if (storedTasks) {
            setTasks(storedTasks);
        } else {
             setTasks([
                { id: 1, text: 'Check irrigation in Field A', completed: true },
                { id: 2, text: 'Plant corn seeds', completed: false },
                { id: 3, text: 'Order new fertilizer', completed: false },
            ]);
        }
    }, [user]);

    const updateStoredTasks = (updatedTasks: FarmTask[]) => {
        setTasks(updatedTasks);
        if (user) {
            setDataForUser(user.email, 'tasks', updatedTasks);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setAnalysisResult('');
        }
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile || !imagePreview) return;
        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const base64String = imagePreview.split(',')[1];
            const result = await analyzeCropImage(base64String, imageFile.type, analysisPrompt, language);
            setAnalysisResult(result);
        } catch (error) {
            setAnalysisResult('Failed to analyze image. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [imageFile, imagePreview, analysisPrompt, language]);

    const handleAddTask = () => {
        if (newTask.trim() === '') return;
        const newTasks = [...tasks, { id: Date.now(), text: newTask, completed: false }];
        updateStoredTasks(newTasks);
        setNewTask('');
    };

    const toggleTask = (id: number) => {
        const newTasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
        updateStoredTasks(newTasks);
    };

    return (
        <div className="animate-fade-in">
             <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{t('farmManager.title')}</h1>
            <p className="text-slate-200 mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{t('farmManager.subtitle')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Task Manager */}
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 ring-1 ring-black/5">
                    <h2 className="text-2xl font-bold mb-4 text-text-primary">{t('farmManager.taskManagerTitle')}</h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                            placeholder={t('farmManager.taskPlaceholder')}
                            className="flex-grow px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <button onClick={handleAddTask} className="bg-primary text-white p-2 rounded-md hover:bg-primary-focus transition-colors">
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {tasks.map(task => (
                            <li key={task.id} onClick={() => toggleTask(task.id)} className="flex items-center gap-3 p-3 rounded-md hover:bg-white/50 cursor-pointer transition-colors">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-primary border-primary' : 'border-slate-400'}`}>
                                    {task.completed && <CheckCircleIcon className="w-5 h-5 text-white" />}
                                </div>
                                <span className={`${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Crop Analysis */}
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 ring-1 ring-black/5">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-text-primary"><SparklesIcon className="w-6 h-6 text-secondary" />{t('farmManager.cropAnalysisTitle')}</h2>
                    <div className="border-2 border-dashed border-slate-400 rounded-lg p-4 text-center">
                        <input type="file" id="crop-image-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <label htmlFor="crop-image-upload" className="cursor-pointer">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Crop preview" className="max-h-48 mx-auto rounded-md mb-2" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-text-secondary py-4">
                                    <UploadIcon className="w-12 h-12 text-slate-400" />
                                    <span>{t('farmManager.uploadPrompt')}</span>
                                    <span className="text-xs">{t('farmManager.uploadHint')}</span>
                                </div>
                            )}
                        </label>
                    </div>
                    {imagePreview && (
                        <div className="mt-4">
                            <textarea
                                value={analysisPrompt}
                                onChange={(e) => setAnalysisPrompt(e.target.value)}
                                rows={2}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder={t('farmManager.askAboutImage')}
                            />
                            <button
                                onClick={handleAnalyzeClick}
                                disabled={isAnalyzing || !imageFile}
                                className="w-full mt-2 bg-secondary text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {isAnalyzing && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isAnalyzing ? t('farmManager.analyzing') : t('farmManager.analyzeBtn')}
                            </button>
                        </div>
                    )}
                    {analysisResult && (
                        <div className="mt-4 p-4 bg-slate-100/70 rounded-md">
                            <article className="prose max-w-none text-text-primary" dangerouslySetInnerHTML={{__html: analysisResult.replace(/\n/g, '<br />')}} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmManagement;