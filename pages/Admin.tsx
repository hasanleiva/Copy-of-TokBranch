
import React, { useState } from 'react';
import { Branch, VideoData } from '../types';
import { VideoService } from '../services/mockData';
import { Plus, Trash2, Video as VideoIcon, ChevronLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../services/authContext';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [docId, setDocId] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbUrl, setThumbUrl] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  
  const [newBranchLabel, setNewBranchLabel] = useState('');
  const [targetId, setTargetId] = useState('');

  const addBranch = () => {
    if (!newBranchLabel || !targetId) return;
    
    const newOption: Branch = {
      label: newBranchLabel,
      targetJson: targetId, // This is the Document ID of the next video
      targetVideoUrl: '', 
      appearAtSecond: 5,
      PauseAtappersecond: true,
      labelpositionx: 50,
      labelpositiony: 50
    };

    setBranches([...branches, newOption]);
    setNewBranchLabel('');
    setTargetId('');
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId || !title || !videoUrl) {
      alert("Document ID, Title, and Video URL are required.");
      return;
    }

    const payload: VideoData = {
      id: docId,
      title,
      description: desc,
      mainVideoUrl: videoUrl,
      thumbnailUrl: thumbUrl || 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=800',
      branches: branches,
      uploaderId: user?.email.split('@')[0] || 'admin',
      likes: 0,
      viewsCount: 0
    };

    try {
      await VideoService.uploadVideo(payload);
      alert('Video logic saved to Firestore successfully!');
      // Optional: Clear form
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-white text-black pb-24">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-4 border-b border-gray-100 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-bold tracking-tight">Interactive Story Creator</h2>
        <div className="w-8" />
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <VideoIcon size={16} className="text-[#fe2c55]" />
              Metadata (Firestore)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 px-1">Document ID (e.g. feed_1, segment_a)</label>
                <input 
                  value={docId} onChange={e => setDocId(e.target.value)}
                  className="w-full bg-white rounded-xl p-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/20 focus:border-[#fe2c55]"
                  placeholder="ID for branching logic"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 px-1">Story Title</label>
                <input 
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white rounded-xl p-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/20 focus:border-[#fe2c55]"
                  placeholder="Ex: Escape the Dungeon"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 px-1">Bunny CDN Video URL (Relative or Full)</label>
                <input 
                  value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                  className="w-full bg-white rounded-xl p-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/20 focus:border-[#fe2c55]"
                  placeholder="https://vz-... OR /videos/clip.mp4"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 px-1">Thumbnail Image URL</label>
                <input 
                  value={thumbUrl} onChange={e => setThumbUrl(e.target.value)}
                  className="w-full bg-white rounded-xl p-3 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/20 focus:border-[#fe2c55]"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Story Branches</h3>
            <div className="grid grid-cols-2 gap-2">
               <div>
                 <label className="text-[10px] font-bold text-gray-500 px-1">Option Label</label>
                 <input 
                    value={newBranchLabel} onChange={e => setNewBranchLabel(e.target.value)}
                    className="w-full bg-white rounded-lg p-2.5 text-xs border border-gray-200"
                    placeholder="Open Door"
                 />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-gray-500 px-1">Next Document ID</label>
                 <div className="flex gap-2">
                    <input 
                        value={targetId} onChange={e => setTargetId(e.target.value)}
                        className="w-full bg-white rounded-lg p-2.5 text-xs border border-gray-200"
                        placeholder="dungeon_hall"
                    />
                    <button type="button" onClick={addBranch} className="bg-black p-2.5 rounded-lg text-white">
                        <Plus size={16} />
                    </button>
                 </div>
               </div>
            </div>

            <div className="space-y-2 mt-4">
              {branches.map((b, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <p className="font-bold text-xs">{b.label}</p>
                    <p className="text-[10px] text-gray-400">Target Doc: {b.targetJson}</p>
                  </div>
                  <button type="button" onClick={() => removeBranch(i)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-[#fe2c55] hover:bg-[#e6264c] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#fe2c55]/20 flex items-center justify-center gap-2">
            <Save size={18} />
            Save to Firestore
          </button>
        </form>
      </div>
    </div>
  );
};
