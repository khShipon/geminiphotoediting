import React from 'react';
import type { Layer, TextLayer, ShapeLayer } from '../types';

interface PropertiesPanelProps {
  layer: Layer | null;
  onUpdateLayer: (id: string, updatedProperties: Partial<Layer>) => void;
}

const PanelHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-[#4A4A4A] p-2 border-b border-black/30 font-semibold text-xs">
    {children}
  </div>
);

const PropertyRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-2 items-center gap-2 mb-2">
    <label className="text-right truncate">{label}</label>
    <div>{children}</div>
  </div>
);

const NumberInput: React.FC<{ value: number; onChange: (value: number) => void; }> = ({ value, onChange }) => (
  <input
    type="number"
    value={value}
    onChange={e => onChange(parseInt(e.target.value, 10))}
    className="w-full bg-[#2D2D2D] border border-black/30 rounded-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
  />
);

const TextInput: React.FC<{ value: string; onChange: (value: string) => void; }> = ({ value, onChange }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full bg-[#2D2D2D] border border-black/30 rounded-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
  />
);

const ColorInput: React.FC<{ value: string; onChange: (value: string) => void; }> = ({ value, onChange }) => (
    <input
      type="color"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-6 p-0 border-none bg-transparent cursor-pointer"
    />
);


export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ layer, onUpdateLayer }) => {
  if (!layer) {
    return (
      <div className="flex-grow">
        <PanelHeader>Properties</PanelHeader>
        <div className="p-2 text-gray-500 text-xs">No layer selected</div>
      </div>
    );
  }

  const update = (props: Partial<Layer>) => {
    onUpdateLayer(layer.id, props);
  };
  
  const textLayer = layer as TextLayer;
  const shapeLayer = layer as ShapeLayer;

  return (
    <div className="flex-grow">
      <PanelHeader>Properties</PanelHeader>
      <div className="p-2 overflow-y-auto">
        <PropertyRow label="X">
          <NumberInput value={Math.round(layer.x)} onChange={val => update({ x: val })} />
        </PropertyRow>
        <PropertyRow label="Y">
          <NumberInput value={Math.round(layer.y)} onChange={val => update({ y: val })} />
        </PropertyRow>
        <PropertyRow label="Width">
          <NumberInput value={layer.width} onChange={val => update({ width: val })} />
        </PropertyRow>
        <PropertyRow label="Height">
          <NumberInput value={layer.height} onChange={val => update({ height: val })} />
        </PropertyRow>
        <PropertyRow label="Rotation">
          <NumberInput value={layer.rotation} onChange={val => update({ rotation: val })} />
        </PropertyRow>
        
        {layer.type === 'text' && (
          <>
            <hr className="border-gray-600 my-3"/>
            <PropertyRow label="Text">
              <TextInput value={textLayer.text} onChange={val => update({ text: val })} />
            </PropertyRow>
            <PropertyRow label="Font Size">
              <NumberInput value={textLayer.fontSize} onChange={val => update({ fontSize: val })} />
            </PropertyRow>
            <PropertyRow label="Font Weight">
              <NumberInput value={textLayer.fontWeight} onChange={val => update({ fontWeight: val })} />
            </PropertyRow>
            <PropertyRow label="Color">
              <ColorInput value={textLayer.color} onChange={val => update({ color: val })} />
            </PropertyRow>
          </>
        )}

        {layer.type === 'shape' && (
          <>
            <hr className="border-gray-600 my-3"/>
             <PropertyRow label="Color">
               <ColorInput value={shapeLayer.backgroundColor} onChange={val => update({ backgroundColor: val })} />
            </PropertyRow>
          </>
        )}

      </div>
    </div>
  );
};