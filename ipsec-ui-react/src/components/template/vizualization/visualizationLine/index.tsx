import { FC } from 'react';
import { Line } from 'react-konva';
import { visualization } from 'interface/components';

interface VisualizationLine {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points: number[];
  color: string;
}

export const VisualizationLine: FC<VisualizationLine> = ({ x, y, width, height, points, color }) => <Line {...{ points, x, y, width, height }} stroke={color} strokeWidth={1} />;
