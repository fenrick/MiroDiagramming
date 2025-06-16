import shapeTemplates from '../templates/shapeTemplates.json';

export interface ShapeTemplate {
  name: string;
  shape: string;
  fillColor: string;
  color: string;
  width: number;
  height: number;
}

export interface ShapeTemplateCollection {
  elements: ShapeTemplate[];
}

export const templates: ShapeTemplateCollection =
  shapeTemplates as ShapeTemplateCollection;

export function getTemplate(name: string): ShapeTemplate | undefined {
  return templates.elements.find((el) => el.name === name);
}
