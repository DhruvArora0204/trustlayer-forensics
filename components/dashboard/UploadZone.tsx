import React, { useRef } from 'react';
import { UploadCloud, FileImage } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[500px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div 
          onClick={() => inputRef.current?.click()}
          className="group relative cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-emerald-500/50 transition-all duration-300 py-24 px-12"
        >
          <div className="p-4 rounded-full bg-zinc-900 mb-6 group-hover:scale-110 transition-transform duration-300 border border-zinc-800 shadow-xl">
            <UploadCloud className="w-10 h-10 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          
          <h3 className="text-xl font-medium text-zinc-200 mb-2">Initialize Evidence Chain</h3>
          <p className="text-zinc-500 text-center max-w-sm mb-8">
            Drag and drop forensic imagery (JPEG, PNG, TIFF) to begin automated analysis.
          </p>

          <div className="flex gap-4 text-xs font-mono text-zinc-600">
            <span className="flex items-center gap-1"><FileImage size={12}/> EXIF PARSING</span>
            <span className="flex items-center gap-1"><FileImage size={12}/> HASH VERIFICATION</span>
          </div>

          <input 
            type="file" 
            ref={inputRef}
            onChange={handleChange} 
            className="hidden" 
            accept="image/*"
          />
          
          {/* Decorative Corner Markers */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-600 group-hover:border-emerald-500 transition-colors rounded-tl-lg m-2"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-600 group-hover:border-emerald-500 transition-colors rounded-tr-lg m-2"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-600 group-hover:border-emerald-500 transition-colors rounded-bl-lg m-2"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-600 group-hover:border-emerald-500 transition-colors rounded-br-lg m-2"></div>
        </div>
      </motion.div>
    </div>
  );
};
