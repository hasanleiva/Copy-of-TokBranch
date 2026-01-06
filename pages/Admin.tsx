import React, { useState } from 'react';
import { Branch, VideoData } from '../types';
import { VideoService } from '../services/mockData';
import { Plus, Trash2, Video as VideoIcon, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [newBranchLabel, setNewBranchLabel] = useState('');
  const [targetJson, setTargetJson] = useState('');

  const addBranch = () => {
    if (!newBranchLabel || !targetJson) return;
    
    const newOption: Branch = {
      label: newBranchLabel,
      targetJson: targetJson,
      targetVideoUrl: '', 
      appearAtSecond: 5,
      PauseAtappersecond: true,
      labelpositionx: 50,
      labelpositiony: 50
    };

    setBranches([...branches, newOption]);
    setNewBranchLabel('');
    setTargetJson('');
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: VideoData = {
      title,
      description: desc,
      mainVideoUrl: videoUrl,
      branches: branches
    }
    await VideoService.uploadVideo(payload);
    alert('Video configuration saved!');
    setTitle('');
    setDesc('');
    setVideoUrl('');
    setBranches([]);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-white text-black pb-24">
      {/* Admin Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-gray-100 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold tracking-tight">Creator Dashboard</h2>
        <div className="w-8" /> {/* Spacer */}
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Video Details */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <VideoIcon size={16} className="text-pink-500" />
              Content Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 px-1">Video Title</label>
                <input 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white rounded-xl p-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-inner"
                  placeholder="Ex: The Secret Map"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 px-1">Source URL (MP4/HLS)</label>
                <input 
                  value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                  className="w-full bg-white rounded-xl p-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-inner"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 px-1">Description & Tags</label>
                <textarea 
                  value={desc} onChange={e => setDesc(e.target.value)}
                  className="w-full bg-white rounded-xl p-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-inner h-24"
                  placeholder="#interactive #storytelling"
                />
              </div>
            </div>
          </div>

          {/* Branching Logic */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Interaction Rules</h3>
            
            <div className="grid grid-cols-2 gap-2">
               <div>
                 <label className="text-[10px] font-bold text-gray-500 px-1">Action Label</label>
                 <input 
                    value={newBranchLabel} onChange={e => setNewBranchLabel(e.target.value)}
                    className="w-full bg-white rounded-lg p-2.5 text-xs border border-gray-200 focus:outline-none"
                    placeholder="Turn Left"
                 />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-gray-500 px-1">Target JSON Filename</label>
                 <div className="flex gap-2">
                    <input 
                        value={targetJson} onChange={e => setTargetJson(e.target.value)}
                        className="w-full bg-white rounded-lg p-2.5 text-xs border border-gray-200 focus:outline-none"
                        placeholder="level2.json"
                    />
                    <button 
                        type="button"
                        onClick={addBranch}
                        className="bg-black hover:bg-gray-800 p-2.5 rounded-lg text-white transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                 </div>
               </div>
            </div>

            {/* List of branches */}
            <div className="space-y-2 mt-4">
              {branches.map((b, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-top-1">
                  <div>
                    <p className="font-bold text-xs">{b.label}</p>
                    <p className="text-[10px] text-gray-400">Path: {b.targetJson}</p>
                  </div>
                  <button type="button" onClick={() => removeBranch(i)} className="text-gray-300 hover:text-red-500 p-1 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {branches.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">No interactions defined</p>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-[#fe2c55] hover:bg-[#e6264c] text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
          >
            Deploy JSON Config
          </button>
        </form>
      </div>
    </div>
  );
};