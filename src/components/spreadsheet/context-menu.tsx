'use client';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onClearContent: () => void;
  type: 'row' | 'column' | null;
  index?: number | string;
}

export function ContextMenu({ x, y, onClose, onDelete, onClearContent, type, index }: ContextMenuProps) {
  return (
    <>
      <div 
        className="fixed inset-0 z-50" 
        onClick={onClose}
      />
      <div 
        className="fixed z-50 bg-white shadow-lg rounded-md py-1 min-w-[200px]"
        style={{ 
          left: `${x}px`, 
          top: `${y}px` 
        }}
      >
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          onClick={() => {
            onClearContent();
            onClose();
          }}
        >
          Clear {type} {index} content
        </button>
        <div className="h-[1px] bg-gray-200 mx-2" />
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          Delete entire {type} {index}
        </button>
      </div>
    </>
  );
} 