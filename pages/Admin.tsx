import React, { useState } from 'react';
import { BranchOption, Video } from '../types';
import { VideoService } from '../services/mockData';
import { Plus, Trash2, Video as VideoIcon } from 'lucide-react';

export const Admin: React.FC = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [branches, setBranches] = useState<BranchOption[]>([]);
  
  // Temp state for adding a branch
  const [newBranchLabel, setNewBranchLabel] = useState('');
  const [newBranchTargetId, setNewBranchTargetId] = useState('');

  const addBranch = () => {
    if (!newBranchLabel || !newBranchTargetId) return;
    
    const newOption: BranchOption = {
      id: `b-${Date.now()}`,
      label: newBranchLabel,
      thumbnailUrl: 'https://picsum.photos/100/100', // Mock thumb
      targetVideoId: newBranchTargetId
    };

    setBranches([...branches, newOption]);
    setNewBranchLabel('');
    setNewBranchTargetId('');
  };

  const removeBranch = (id: string) => {
    setBranches(branches.filter(b => b.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await VideoService.uploadVideo({
      title,
      description: desc,
      url: videoUrl,
      branchOptions: branches
    });
    alert('Video uploaded successfully!');
    // Reset form
    setTitle('');
    setDesc('');
    setVideoUrl('');
    setBranches([]);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-900 pb-24">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <VideoIcon className="text-pink-500" />
          Upload New Content
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Video Details */}
          <div className="space-y-4 bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold text-gray-300">Details</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <input 
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full bg-gray-800 rounded p-2 text-sm border border-gray-700"
                placeholder="Ex: Epic Mountain Climb"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Video URL (Mock R2)</label>
              <input 
                value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                className="w-full bg-gray-800 rounded p-2 text-sm border border-gray-700"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea 
                value={desc} onChange={e => setDesc(e.target.value)}
                className="w-full bg-gray-800 rounded p-2 text-sm border border-gray-700 h-20"
                placeholder="#adventure #nature"
              />
            </div>
          </div>

          {/* Branching Logic Configuration */}
          <div className="space-y-4 bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold text-gray-300">Branching Options</h3>
            <p className="text-xs text-gray-500">Add up to 4 options that appear below the video.</p>
            
            <div className="flex gap-2 items-end">
               <div className="flex-1">
                 <label className="text-xs text-gray-500">Label</label>
                 <input 
                    value={newBranchLabel} onChange={e => setNewBranchLabel(e.target.value)}
                    className="w-full bg-gray-800 rounded p-2 text-sm border border-gray-700"
                    placeholder="Go Left"
                 />
               </div>
               <div className="flex-1">
                 <label className="text-xs text-gray-500">Target Video ID</label>
                 <input 
                    value={newBranchTargetId} onChange={e => setNewBranchTargetId(e.target.value)}
                    className="w-full bg-gray-800 rounded p-2 text-sm border border-gray-700"
                    placeholder="v2"
                 />
               </div>
               <button 
                type="button"
                onClick={addBranch}
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-white"
               >
                 <Plus size={20} />
               </button>
            </div>

            {/* List of branches */}
            <div className="space-y-2 mt-4">
              {branches.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-600 rounded overflow-hidden">
                      <img src={b.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold">{b.label}</p>
                      <p className="text-xs text-gray-400">Leads to: {b.targetVideoId}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeBranch(b.id)} className="text-red-500 hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {branches.length === 0 && <p className="text-center text-xs text-gray-600 py-2">No branches added yet.</p>}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-900/20"
          >
            Upload Video
          </button>
        </form>
      </div>
    </div>
  );
};