import React, { FC } from 'react';
import { Text, Rect, Group } from 'react-konva';

interface IVisualizationChecked {
  x: number;
  y: number;
  status: boolean;
}

export const VisualizationChecked: FC<IVisualizationChecked> = ({ x, y, status }) => {
  const checked = status ? '✓' : '';
  const strokeColor = status ? 'green' : 'black';
  return (
    <Group>
      <Rect {...{ x, y, width: 10, height: 10, fill: 'transparent' }} stroke={strokeColor} strokeWidth={1} />
      <Text {...{ text: checked, x, y, width: 10, height: 10, align: 'center', verticalAlign: 'middle', fontSize: 10, fill: strokeColor }} />
    </Group>
  );
};
