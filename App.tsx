
import React, { useState, useCallback, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AIPrompt } from './components/AIPrompt';
import { Header } from './components/Header';
import type { Layer, Tool, ImageLayer, EditingAction } from './types';
import { generateImageFromPrompt, removeImageBackground, removeImageBackgroundAI } from './services/geminiService';
import { exportAsImage } from './utils/exportUtils';

const App: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingAction, setEditingAction] = useState<EditingAction>('none');
  const [error, setError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const imageSrc = await generateImageFromPrompt(prompt);
      const newImageLayer: ImageLayer = {
        id: crypto.randomUUID(),
        type: 'image',
        src: imageSrc,
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        rotation: 0,
      };
      // Replace all existing layers with the new generated image.
      setLayers([newImageLayer]);
      setSelectedLayerId(newImageLayer.id);
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please try another prompt.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLayer = useCallback((layerId: string, updatedProperties: Partial<Layer>) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        // FIX: Add type assertion to resolve discriminated union issue with spread operator
        layer.id === layerId ? ({ ...layer, ...updatedProperties } as Layer) : layer
      )
    );
  }, []);
  
  const addLayer = useCallback((type: 'text' | 'shape') => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      type: type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 50 : 100,
      rotation: 0,
      ...(type === 'text' && { text: 'New Text', fontFamily: 'Arial', fontSize: 24, color: '#ffffff', fontWeight: 400 }),
      ...(type === 'shape' && { shapeType: 'rectangle', backgroundColor: '#cccccc' }),
    };
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  }, []);

  const deleteLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.filter(l => l.id !== layerId));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  }, [selectedLayerId]);
  
  const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    setLayers(currentLayers => {
        const index = currentLayers.findIndex(l => l.id === layerId);
        if (index === -1) return currentLayers;
        
        const newLayers = [...currentLayers];
        const [layer] = newLayers.splice(index, 1);
        
        if (direction === 'up' && index < newLayers.length) {
            newLayers.splice(index + 1, 0, layer);
        } else if (direction === 'down' && index > 0) {
            newLayers.splice(index - 1, 0, layer);
        } else if (direction === 'up' && index === newLayers.length) { // it's already at top
            newLayers.push(layer);
        } else if (direction === 'down' && index === 0) { // it's already at bottom
            newLayers.unshift(layer);
        }

        return newLayers;
    });
  }, []);
  
  const handleRemoveBackgroundCode = useCallback(async () => {
    if (!selectedLayerId) return;

    const layer = layers.find(l => l.id === selectedLayerId);
    if (!layer || layer.type !== 'image') return;

    setEditingAction('code-bg');
    setError(null);
    try {
        const newImageSrc = await removeImageBackground((layer as ImageLayer).src);
        updateLayer(layer.id, { src: newImageSrc });
    } catch (err) {
        console.error(err);
        setError('Manual background removal failed. Please try again.');
    } finally {
        setEditingAction('none');
    }
  }, [selectedLayerId, layers, updateLayer]);

  const handleRemoveBackgroundAI = useCallback(async () => {
    if (!selectedLayerId) return;

    const layer = layers.find(l => l.id === selectedLayerId);
    if (!layer || layer.type !== 'image') return;

    setEditingAction('ai-bg');
    setError(null);
    try {
        const newImageSrc = await removeImageBackgroundAI((layer as ImageLayer).src);
        updateLayer(layer.id, { src: newImageSrc });
    } catch (err) {
        console.error(err);
        setError('AI background removal failed. Please try again.');
    } finally {
        setEditingAction('none');
    }
  }, [selectedLayerId, layers, updateLayer]);


  const selectedLayer = layers.find(layer => layer.id === selectedLayerId) || null;

  const handleExport = (format: 'png' | 'jpeg') => {
    if (svgRef.current) {
      exportAsImage(svgRef.current, format);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans text-sm text-gray-300 bg-[#2D2D2D]">
      <Header onExport={handleExport} />
      <AIPrompt onGenerate={handleGenerate} isLoading={isLoading} />
       {error && <div className="bg-red-500 text-white text-center p-2">{error}</div>}
      <div className="flex flex-grow overflow-hidden">
        <Toolbar 
            activeTool={activeTool} 
            onToolSelect={setActiveTool} 
            onAddLayer={addLayer}
            selectedLayer={selectedLayer}
            onRemoveBackgroundCode={handleRemoveBackgroundCode}
            onRemoveBackgroundAI={handleRemoveBackgroundAI}
            editingAction={editingAction}
        />
        <main className="flex-grow flex items-center justify-center bg-[#585858] p-4 overflow-auto">
          <Canvas
            svgRef={svgRef}
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={updateLayer}
          />
        </main>
        <aside className="w-64 bg-[#3B3B3B] flex flex-col border-l border-gray-900/50">
          <PropertiesPanel 
            layer={selectedLayer} 
            onUpdateLayer={updateLayer} 
            />
          <LayersPanel 
            layers={layers} 
            selectedLayerId={selectedLayerId} 
            onSelectLayer={setSelectedLayerId} 
            onDeleteLayer={deleteLayer}
            onMoveLayer={moveLayer}
            />
        </aside>
      </div>
    </div>
  );
};

export default App;