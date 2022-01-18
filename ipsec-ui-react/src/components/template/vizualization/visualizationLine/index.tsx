import { FC } from 'react';
import { Line } from 'react-konva';
import { colors } from '../visualizationConstants';

interface VisualizationLine {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points: number[];
  color?: string;
}

export const VisualizationLine: FC<VisualizationLine> = ({ x, y, width, height, points, color = colors.lineColor }) => <Line {...{ points, x, y, width, height }} stroke={color} strokeWidth={1} />;
