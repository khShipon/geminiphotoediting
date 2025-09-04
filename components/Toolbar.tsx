
import React from 'react';
import type { Tool, Layer, EditingAction } from '../types';
import { MoveIcon } from './icons/MoveIcon';
import { TextIcon } from './icons/TextIcon';
import { ShapeIcon } from './icons/ShapeIcon';
import { RemoveBgIcon } from './icons/RemoveBgIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { AIRemoveBgIcon } from './icons/AIRemoveBgIcon';

interface ToolbarProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onAddLayer: (type: 'text' | 'shape') => void;
  selectedLayer: Layer | null;
  onRemoveBackgroundCode: () => void;
  onRemoveBackgroundAI: () => void;
  editingAction: EditingAction;
}

const ToolButton: React.FC<{
  label: string;
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ label, isActive, onClick, children, disabled }) => (
  <button
    title={label}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={`w-10 h-10 flex items-center justify-center m-1 p-2 rounded-sm
      ${isActive ? 'bg-blue-600' : 'bg-[#585858] hover:bg-[#6a6a6a]'}
      border border-transparent ${isActive ? 'border-blue-400' : ''}
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#585858]`}
  >
    {children}
  </button>
);


export const Toolbar: React.FC<ToolbarProps> = ({ 
    activeTool, 
    onToolSelect, 
    onAddLayer,
    selectedLayer,
    onRemoveBackgroundCode,
    onRemoveBackgroundAI,
    editingAction 
}) => {
  const isImageLayerSelected = selectedLayer?.type === 'image';

  return (
    <nav className="w-16 bg-[#3B3B3B] border-r border-gray-900/50 p-1 flex flex-col items-center">
      <ToolButton label="Select/Move Tool" isActive={activeTool === 'select'} onClick={() => onToolSelect('select')}>
        <MoveIcon className="w-6 h-6" />
      </ToolButton>
       <div className="w-full h-px bg-gray-900/50 my-1"></div>
      <ToolButton label="Text Tool" isActive={activeTool === 'text'} onClick={() => onAddLayer('text')}>
        <TextIcon className="w-6 h-6" />
      </ToolButton>
      <ToolButton label="Shape Tool" isActive={activeTool === 'shape'} onClick={() => onAddLayer('shape')}>
        <ShapeIcon className="w-6 h-6" />
      </ToolButton>
      <div className="w-full h-px bg-gray-900/50 my-1"></div>
      <ToolButton 
        label={editingAction === 'code-bg' ? "Processing..." : "Remove Background (Manual)"} 
        onClick={onRemoveBackgroundCode}
        disabled={!isImageLayerSelected || editingAction !== 'none'}
      >
        {editingAction === 'code-bg' ? <SpinnerIcon className="w-6 h-6" /> : <RemoveBgIcon className="w-6 h-6" />}
      </ToolButton>
       <ToolButton 
        label={editingAction === 'ai-bg' ? "Processing..." : "Remove Background (AI)"} 
        onClick={onRemoveBackgroundAI}
        disabled={!isImageLayerSelected || editingAction !== 'none'}
      >
        {editingAction === 'ai-bg' ? <SpinnerIcon className="w-6 h-6" /> : <AIRemoveBgIcon className="w-6 h-6" />}
      </ToolButton>
    </nav>
  );
};