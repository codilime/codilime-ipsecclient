import React, { FC } from 'react';
import { Circle, Group, Text } from 'react-konva';

interface IVisualizationStatusText {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  status: string;
}

export const VisualizationStatusText: FC<IVisualizationStatusText> = ({ x, y, width, height, status }) => {
  const statusIcon = status === 'ACTIVE' ? '✓' : 'X';
  const statusColor = status === 'ACTIVE' ? 'green' : 'red';
  const statusText = status === 'ACTIVE' ? 'Working' : 'Down';

  return (
    <Group>
      <Circle {...{ x: x + width / 2 - 28, y: y - 4 }} align="center" radius={6} stroke={statusColor} fill={statusColor} />
      <Text
        {...{
          text: statusIcon,
          x: x + width / 2 - 33.5,
          y: y - 9.5,
          width: 12,
          height: 12,
          align: 'center',
          fontSize: 12,
          verticalAlign: 'top',
          fill: 'white',
          fontStyle: 'bold',
          stroke: '#fff',
          strokeWidth: 1
        }}
      />
      <Text {...{ text: statusText, x: x + 15, y: y - 10, width: width - 15, height, align: 'center', verticalAlign: 'top', fill: statusColor, fontStyle: 'bold' }} />
    </Group>
  );
};
