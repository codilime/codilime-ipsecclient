import { FC } from 'react';
import { Circle, Group, Text } from 'react-konva';
import { visualization } from 'interface/components';
import { MetricsType } from 'interface/index';
import { AiOutlineReload } from 'react-icons/ai';

interface VisualizationStatusText extends visualization {
  status?: MetricsType;
  width: number;
}

export const VisualizationStatusText: FC<VisualizationStatusText> = ({ x, y, width, height, status }) => {
  const handleGetIcon = () => {
    if (!status) return '';
    switch (status.sa_status) {
      case 'up':
        return '✓';
      case 'down':
        return 'X';
    }
  };
  const handleGetColor = () => {
    if (!status) return 'gray';
    switch (status?.sa_status) {
      case 'up':
        return 'green';
      case 'down':
        return 'red';
    }
  };
  const handleGetText = () => {
    if (!status) return 'Check';
    switch (status?.sa_status) {
      case 'up':
        return 'Working';
      case 'down':
        return 'Down';
    }
  };

  return (
    <Group>
      <Circle {...{ x: x + width / 2 - 28, y: y - 4 }} align="center" radius={6} stroke={handleGetColor()} fill={handleGetColor()} />
      <Text
        {...{
          text: handleGetIcon(),
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
          strokeWidth: 1,
          letterSpacing: 1
        }}
      />
      <Text {...{ text: handleGetText(), x: x + 15, y: y - 10, width: width - 15, height, align: 'center', verticalAlign: 'top', fill: handleGetColor(), fontStyle: 'bold', letterSpacing: 1 }} />
    </Group>
  );
};
