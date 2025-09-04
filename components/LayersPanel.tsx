
import React from 'react';
import type { Layer } from '../types';

interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
}

const PanelHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-[#4A4A4A] p-2 border-b border-t border-black/30 font-semibold text-xs">
    {children}
  </div>
);

export const LayersPanel: React.FC<LayersPanelProps> = ({ layers, selectedLayerId, onSelectLayer, onDeleteLayer, onMoveLayer }) => {
  // Render layers in reverse order so top layer is at the top of the list
  const reversedLayers = [...layers].reverse();
  
  const getLayerName = (layer: Layer): string => {
    switch (layer.type) {
        case 'text':
            return layer.text;
        case 'shape':
            return `${layer.shapeType.charAt(0).toUpperCase() + layer.shapeType.slice(1)}`;
        case 'image':
            return 'Image Layer';
        default:
            return 'Layer';
    }
  }

  return (
    <div className="flex flex-col h-1/2">
      <PanelHeader>Layers</PanelHeader>
      <div className="flex-grow overflow-y-auto bg-[#3B3B3B] p-1">
        {reversedLayers.map(layer => (
          <div
            key={layer.id}
            onClick={() => onSelectLayer(layer.id)}
            className={`flex items-center justify-between p-2 mb-1 rounded-sm cursor-pointer ${
              selectedLayerId === layer.id ? 'bg-blue-600' : 'hover:bg-[#4A4A4A]'
            }`}
          >
            <span className="truncate">
              {getLayerName(layer)}
            </span>
          </div>
        ))}
         {layers.length === 0 && <div className="text-gray-500 text-center p-4 text-xs">No layers yet.</div>}
      </div>
      <div className="bg-[#4A4A4A] p-1 border-t border-black/30 flex justify-end gap-1">
          <button onClick={() => selectedLayerId && onMoveLayer(selectedLayerId, 'up')} disabled={!selectedLayerId} className="px-2 py-1 text-xs rounded-sm bg-[#585858] hover:bg-[#6a6a6a] disabled:opacity-50 disabled:cursor-not-allowed">Up</button>
          <button onClick={() => selectedLayerId && onMoveLayer(selectedLayerId, 'down')} disabled={!selectedLayerId} className="px-2 py-1 text-xs rounded-sm bg-[#585858] hover:bg-[#6a6a6a] disabled:opacity-50 disabled:cursor-not-allowed">Down</button>
          <button onClick={() => selectedLayerId && onDeleteLayer(selectedLayerId)} disabled={!selectedLayerId} className="px-2 py-1 text-xs rounded-sm bg-[#585858] hover:bg-[#6a6a6a] disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
      </div>
    </div>
  );
};
