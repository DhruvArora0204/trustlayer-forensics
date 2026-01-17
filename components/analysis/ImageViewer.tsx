import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ScanLine, Pen, Square, Trash2, Undo2, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ImageViewerHandle {
  exportAnnotatedImage: () => Promise<string | null>;
}

interface ImageViewerProps {
  imageSrc: string;
}

type ToolType = 'none' | 'pen' | 'box';

interface Point {
  x: number;
  y: number;
}

interface Annotation {
  id: string;
  type: 'pen' | 'box';
  points?: Point[];
  start?: Point;
  end?: Point;
  color: string;
}

export const ImageViewer = forwardRef<ImageViewerHandle, ImageViewerProps>(({ imageSrc }, ref) => {
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAction, setCurrentAction] = useState<Partial<Annotation> | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Expose export function
  useImperativeHandle(ref, () => ({
    exportAnnotatedImage: async () => {
      const img = imageRef.current;
      const container = containerRef.current;
      if (!img || !container) return null;

      // Create high-res canvas matching natural image size
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = img.naturalWidth;
      exportCanvas.height = img.naturalHeight;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return null;

      // 1. Draw Image
      ctx.drawImage(img, 0, 0);

      // 2. Draw Annotations (scaled)
      // Calculate scale factor between rendered size and natural size
      // We need to know how the image is rendered. object-contain centers it.
      
      const containerAspect = container.clientWidth / container.clientHeight;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      
      let renderWidth, renderHeight, offsetX, offsetY;
      let scaleFactor;

      if (containerAspect > imgAspect) {
        // Limited by height
        renderHeight = container.clientHeight;
        renderWidth = img.naturalWidth * (container.clientHeight / img.naturalHeight);
        offsetX = (container.clientWidth - renderWidth) / 2;
        offsetY = 0;
        scaleFactor = img.naturalHeight / container.clientHeight;
      } else {
        // Limited by width
        renderWidth = container.clientWidth;
        renderHeight = img.naturalHeight * (container.clientWidth / img.naturalWidth);
        offsetX = 0;
        offsetY = (container.clientHeight - renderHeight) / 2;
        scaleFactor = img.naturalWidth / container.clientWidth;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3 * scaleFactor; // Scale line width

      const transformPoint = (p: Point) => ({
        x: (p.x - offsetX) * scaleFactor,
        y: (p.y - offsetY) * scaleFactor
      });

      const drawAnnotation = (ann: Partial<Annotation>) => {
        ctx.strokeStyle = ann.color || '#10b981';
        
        if (ann.type === 'pen' && ann.points && ann.points.length > 0) {
          ctx.beginPath();
          const start = transformPoint(ann.points[0]);
          ctx.moveTo(start.x, start.y);
          ann.points.forEach(p => {
            const tp = transformPoint(p);
            ctx.lineTo(tp.x, tp.y);
          });
          ctx.stroke();
        } else if (ann.type === 'box' && ann.start && ann.end) {
          const s = transformPoint(ann.start);
          const e = transformPoint(ann.end);
          const w = e.x - s.x;
          const h = e.y - s.y;
          ctx.strokeRect(s.x, s.y, w, h);
          ctx.fillStyle = ann.color ? `${ann.color}20` : '#f43f5e20'; // Keep opacity low
          ctx.fillRect(s.x, s.y, w, h);
        }
      };

      annotations.forEach(drawAnnotation);
      
      return exportCanvas.toDataURL('image/jpeg', 0.9);
    }
  }));

  // Resize canvas to match container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        // Set canvas internal resolution to match display size for sharp rendering
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        renderCanvas();
      }
    };
    
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef.current, imageSrc]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawAnnotation = (ann: Partial<Annotation>) => {
      ctx.lineWidth = 3;
      ctx.strokeStyle = ann.color || '#10b981';
      ctx.shadowBlur = 8;
      ctx.shadowColor = ann.color || '#10b981';

      if (ann.type === 'pen' && ann.points && ann.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        ann.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      } else if (ann.type === 'box' && ann.start && ann.end) {
        const w = ann.end.x - ann.start.x;
        const h = ann.end.y - ann.start.y;
        ctx.strokeRect(ann.start.x, ann.start.y, w, h);
        ctx.fillStyle = ann.color ? `${ann.color}20` : '#f43f5e20';
        ctx.fillRect(ann.start.x, ann.start.y, w, h);
      }
    };

    annotations.forEach(ann => drawAnnotation(ann));
    if (currentAction) drawAnnotation(currentAction);
  };

  useEffect(() => {
    renderCanvas();
  }, [annotations, currentAction]);

  const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as any).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'none') return;
    setIsDrawing(true);
    const startPoint = getPoint(e);
    
    if (activeTool === 'pen') {
      setCurrentAction({
        type: 'pen',
        points: [startPoint],
        color: '#10b981'
      });
    } else if (activeTool === 'box') {
      setCurrentAction({
        type: 'box',
        start: startPoint,
        end: startPoint,
        color: '#f43f5e'
      });
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentAction) return;
    const point = getPoint(e);

    if (activeTool === 'pen') {
      setCurrentAction(prev => ({
        ...prev,
        points: [...(prev?.points || []), point]
      }));
    } else if (activeTool === 'box') {
      setCurrentAction(prev => ({
        ...prev,
        end: point
      }));
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentAction) {
      let isValid = false;
      if (currentAction.type === 'pen' && (currentAction.points?.length || 0) > 2) isValid = true;
      if (currentAction.type === 'box' && currentAction.start && currentAction.end) {
        const dist = Math.hypot(currentAction.end.x - currentAction.start.x, currentAction.end.y - currentAction.start.y);
        if (dist > 5) isValid = true;
      }

      if (isValid) {
        setAnnotations(prev => [...prev, { ...currentAction, id: Date.now().toString() } as Annotation]);
      }
    }
    setCurrentAction(null);
  };

  const undo = () => setAnnotations(prev => prev.slice(0, -1));
  const clear = () => setAnnotations([]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden group select-none">
       {/* Image - Use object-contain to ensure full evidence visibility */}
       <img 
        ref={imageRef}
        src={imageSrc} 
        alt="Evidence" 
        className="w-full h-full object-contain opacity-90"
        draggable={false}
       />
       
       {/* Canvas Layer */}
       <canvas 
         ref={canvasRef}
         className={`absolute inset-0 z-20 touch-none ${activeTool !== 'none' ? 'cursor-crosshair' : 'cursor-default'}`}
         onMouseDown={startDrawing}
         onMouseMove={draw}
         onMouseUp={stopDrawing}
         onMouseLeave={stopDrawing}
         onTouchStart={startDrawing}
         onTouchMove={draw}
         onTouchEnd={stopDrawing}
       />
       
       {/* Scanline Effect */}
       <motion.div 
         className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] z-10 pointer-events-none"
         animate={{ top: ['0%', '100%', '0%'] }}
         transition={{ duration: 10, repeat: Infinity, ease: "linear" }} 
       />
       
       {/* Top Badge */}
       <div className="absolute top-4 left-4 z-30 pointer-events-none">
         <div className="bg-black/70 backdrop-blur-sm border border-zinc-700 px-3 py-1 rounded text-xs font-mono text-emerald-500 flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            LIVE EVIDENCE VIEW
         </div>
       </div>

       {/* Bottom Toolbar */}
       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 p-1.5 rounded-full shadow-2xl ring-1 ring-black/50">
         <ToolButton 
           icon={<MousePointer2 size={16} />} 
           active={activeTool === 'none'} 
           onClick={() => setActiveTool('none')} 
           label="Cursor"
         />
         <div className="w-px h-4 bg-zinc-700 mx-1"></div>
         <ToolButton 
           icon={<Pen size={16} />} 
           active={activeTool === 'pen'} 
           onClick={() => setActiveTool('pen')} 
           label="Freehand"
         />
         <ToolButton 
           icon={<Square size={16} />} 
           active={activeTool === 'box'} 
           onClick={() => setActiveTool('box')} 
           label="Zone"
         />
         <div className="w-px h-4 bg-zinc-700 mx-1"></div>
         <ToolButton 
           icon={<Undo2 size={16} />} 
           onClick={undo} 
           label="Undo"
           disabled={annotations.length === 0}
         />
         <ToolButton 
           icon={<Trash2 size={16} className="text-rose-500" />} 
           onClick={clear} 
           label="Clear All"
           disabled={annotations.length === 0}
         />
       </div>

    </div>
  );
});

interface ToolButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, active, onClick, label, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
      active 
        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' 
        : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
    } ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : ''}`}
  >
    {icon}
  </button>
);