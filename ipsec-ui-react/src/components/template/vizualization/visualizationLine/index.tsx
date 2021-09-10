import React, { FC } from 'react';
import { Line } from 'react-konva';

interface VisualizationLineProps {
  x: number;
  y: number;
  width: number;
  height: number;
  points: string[];
  color: string[];
}

export const VisualizationLine: FC<VisualizationLineProps> = ({ x, y, width, height, points, color }) => <Line {...{ points, x, y, width, height }} stroke={color} strokeWidth={1} />;
