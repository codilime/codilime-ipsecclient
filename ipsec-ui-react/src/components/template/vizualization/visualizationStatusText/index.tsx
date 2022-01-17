import { FC } from 'react';
import { Circle, Group, Text } from 'react-konva';
import { Visualization } from 'interface/components';
import { MetricsType } from 'interface/index';

interface VisualizationStatusText extends Visualization {
  monitoring: MetricsType;
  width: number;
}

export const VisualizationStatusText: FC<VisualizationStatusText> = ({ x, y, width, height, monitoring }) => {
  const handleGetIcon = () => {
    if (!monitoring) return '';
    switch (monitoring.status) {
      case 'up':
        return '✓';
      case 'down':
        return 'X';
    }
  };
  const handleGetColor = () => {
    if (!monitoring) return 'gray';
    switch (monitoring.status) {
      case 'up':
        return 'green';
      case 'down':
        return 'red';
    }
  };
  const handleGetText = () => {
    if (!monitoring) return 'Checking';
    switch (monitoring.status) {
      case 'up':
        return 'Working';
      case 'down':
        return 'Down';
    }
  };

  return (
    <Group>
      <Circle {...{ x: x + width / 2, y: y - 4 }} align="center" radius={8} stroke={handleGetColor()} fill={handleGetColor()} />
      <Text
        {...{
          text: handleGetIcon(),
          x: x + width / 2 - 6,
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
      <Text {...{ text: handleGetText(), x, y: y - 30, width, height, align: 'center', verticalAlign: 'top', fill: handleGetColor(), fontStyle: '400', letterSpacing: 1, fontSize: 14 }} />
    </Group>
  );
};
