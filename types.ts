
export type Tool = 'select' | 'text' | 'shape';
export type EditingAction = 'none' | 'code-bg' | 'ai-bg';

export interface BaseLayer {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: number;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rectangle' | 'ellipse';
  backgroundColor: string;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string; // data:image/png;base64,...
}

export type Layer = TextLayer | ShapeLayer | ImageLayer;