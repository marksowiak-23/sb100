import React, { useState } from 'react';
import { ShieldAlert, Edit2 } from 'lucide-react';

interface SbMbrBookEditorProps {
  sectionTitle: string;
  content: string[];
  readOnly?: boolean;
  onSave?: (newContent: string[]) => void;
}

export default function SbMbrBookEditor({
  sectionTitle,
  content,
  readOnly = false,
  onSave
}: SbMbrBookEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const formattedSectionTitle =
    sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1);

  const handleEditClick = () => {
    setEditText(content.join('\n\n'));
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    const paragraphs = editText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (onSave) {
      onSave(paragraphs);
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
      {/* Status Draft indicator & Actions header */}
      <div className="flex items-center justify-between border-b border-[#EFECE7] pb-2">
        <div className="flex flex-col gap-0.5">
          {!readOnly && (
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              {isEditing ? 'Status: Editing' : 'Status: Draft'}
            </span>
          )}
          <h3 className="font-serif text-lg font-bold text-slate-800">
            {formattedSectionTitle}
          </h3>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelClick}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClick}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => alert('Opening Privacy settings for this draft...')}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                  title="Privacy settings"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleEditClick}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                  title={`Edit ${formattedSectionTitle}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Scrollable text paragraphs or Textarea Editor */}
      <div className={`pr-1 scrollbar-thin ${readOnly ? 'max-h-[420px]' : 'max-h-56'} overflow-y-auto`}>
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Type your narrative text here... Separate paragraphs with an empty line."
            className="w-full min-h-48 bg-white border border-[#EFECE7] rounded-2xl p-4 text-xs md:text-sm text-slate-700 leading-relaxed font-serif placeholder-slate-400 focus:outline-none focus:border-slate-350 transition-colors shadow-inner resize-y"
          />
        ) : (
          <div className="space-y-4">
            {content.map((paragraph, index) => (
              <p
                key={index}
                className="text-xs md:text-sm text-slate-650 leading-relaxed font-serif text-justify"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
