
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Layer, TextLayer, ShapeLayer, ImageLayer } from '../types';

interface CanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updatedProperties: Partial<Layer>) => void;
}

const DraggableLayer: React.FC<{
  layer: Layer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id:string, props: Partial<Layer>) => void;
}> = ({ layer, isSelected, onSelect, onUpdate }) => {
    
    const [isDragging, setIsDragging] = useState(false);
    const offset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(layer.id);
        setIsDragging(true);
        // FIX: Cast to SVGGraphicsElement which has getScreenCTM method, instead of SVGElement.
        const CTM = (e.currentTarget as SVGGraphicsElement).getScreenCTM();
        if (CTM) {
            offset.current = {
                x: (e.clientX - CTM.e) / CTM.a - layer.x,
                y: (e.clientY - CTM.f) / CTM.d - layer.y
            };
        }
    };
    
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            const svgElement = document.querySelector('#editor-canvas');
            if (!svgElement) return;
            
            const CTM = (svgElement as SVGSVGElement).getScreenCTM();
             if (CTM) {
                const newX = (e.clientX - CTM.e) / CTM.a - offset.current.x;
                const newY = (e.clientY - CTM.f) / CTM.d - offset.current.y;
                onUpdate(layer.id, { x: newX, y: newY });
            }
        }
    }, [isDragging, layer.id, onUpdate]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);
    
     useEffect(() => {
        const svgElement = document.querySelector('#editor-canvas');
        if (isDragging && svgElement) {
            // Attach to the SVG canvas itself to capture mouse events outside the dragged element
            svgElement.addEventListener('mousemove', handleMouseMove as EventListener);
            svgElement.addEventListener('mouseup', handleMouseUp as EventListener);
            svgElement.addEventListener('mouseleave', handleMouseUp as EventListener);
        }

        return () => {
            if (svgElement) {
                svgElement.removeEventListener('mousemove', handleMouseMove as EventListener);
                svgElement.removeEventListener('mouseup', handleMouseUp as EventListener);
                svgElement.removeEventListener('mouseleave', handleMouseUp as EventListener);
            }
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);


    const transform = `rotate(${layer.rotation} ${layer.x + layer.width / 2} ${layer.y + layer.height / 2})`;

    return (
        <g transform={transform} onMouseDown={handleMouseDown} cursor={isDragging ? 'grabbing' : 'grab'}>
            {layer.type === 'text' && (
                <text
                    x={layer.x}
                    y={layer.y + layer.fontSize * 0.8} // Adjust for baseline
                    fontFamily={(layer as TextLayer).fontFamily}
                    fontSize={(layer as TextLayer).fontSize}
                    fontWeight={(layer as TextLayer).fontWeight}
                    fill={(layer as TextLayer).color}
                    style={{ userSelect: 'none' }}
                >
                    {(layer as TextLayer).text}
                </text>
            )}
            {layer.type === 'shape' && layer.shapeType === 'rectangle' && (
                <rect
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    fill={(layer as ShapeLayer).backgroundColor}
                />
            )}
            {layer.type === 'shape' && layer.shapeType === 'ellipse' && (
                <ellipse
                    cx={layer.x + layer.width / 2}
                    cy={layer.y + layer.height / 2}
                    rx={layer.width / 2}
                    ry={layer.height / 2}
                    fill={(layer as ShapeLayer).backgroundColor}
                />
            )}
            {layer.type === 'image' && (
                <image
                    href={(layer as ImageLayer).src}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                />
            )}
            {isSelected && (
                <rect
                    x={layer.x - 2}
                    y={layer.y - 2}
                    width={layer.width + 4}
                    height={layer.height + 4}
                    fill="none"
                    stroke="#0078d7"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    pointerEvents="none"
                />
            )}
        </g>
    );
};

const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect x='0' y='0' width='12' height='12' fill='%23444444'/%3E%3Crect x='12' y='12' width='12' height='12' fill='%23444444'/%3E%3C/svg%3E`;

export const Canvas: React.FC<CanvasProps> = ({ svgRef, layers, selectedLayerId, onSelectLayer, onUpdateLayer }) => {
    
    const handleCanvasClick = (e: React.MouseEvent) => {
        if(e.target === e.currentTarget) {
            onSelectLayer(null);
        }
    };
    
    return (
        <div
            className="w-[800px] h-[600px] bg-[#2D2D2D] shadow-lg"
            style={{ backgroundImage: `url("${checkerboardPattern}")` }}
        >
            <svg 
                id="editor-canvas"
                ref={svgRef} 
                width="800" 
                height="600" 
                className="bg-transparent"
                onClick={handleCanvasClick}
            >
                {layers.map(layer => (
                    <DraggableLayer
                        key={layer.id}
                        layer={layer}
                        isSelected={layer.id === selectedLayerId}
                        onSelect={onSelectLayer}
                        onUpdate={onUpdateLayer}
                    />
                ))}
            </svg>
        </div>
    );
};
