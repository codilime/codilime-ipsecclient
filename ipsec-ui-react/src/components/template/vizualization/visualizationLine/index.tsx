import React, { FC } from 'react';
import { Line } from 'react-konva';
import { VisualizationBoxTypeProps } from '../../../../interface/components';

interface VisualizationLineProps extends VisualizationBoxTypeProps {
  points: number[];
  color: string;
}

export const VisualizationLine: FC<VisualizationLineProps> = ({ x, y, width, height, points, color }) => <Line {...{ points, x, y, width, height }} stroke={color} strokeWidth={1} />;
