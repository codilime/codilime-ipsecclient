import React, { FC } from 'react';
import { Text, Rect, Group, Image } from 'react-konva';
import { variable } from '../visualizationConstants';

interface VisualizationBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
}

export const VisualizationBox: FC<VisualizationBoxProps> = ({ x, y, width, height, title, children }) => {
  return (
    <Group>
      <Rect {...{ x, y, width, height }} fill="white" stroke={variable.bgcColor} strokeWidth={1} />
      <Rect {...{ x, y, width }} height={variable.heightHeader} fill={variable.bgcColor} />
      <Text {...{ text: title, x: x + 5, y, fill: 'white', width, height: variable.heightHeader, align: 'left', verticalAlign: 'middle', fontSize: 14 }} />
      {children}
    </Group>
  );
};
