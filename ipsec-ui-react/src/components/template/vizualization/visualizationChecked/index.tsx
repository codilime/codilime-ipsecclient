import { FC } from 'react';
import { Text, Circle, Group } from 'react-konva';
import { Visualization } from 'interface/components';

interface VisualizationCheckedType extends Visualization {
  status?: boolean;
  width: number;
  height: number;
}

export const VisualizationChecked: FC<VisualizationCheckedType> = ({ x, y, status, width, height }) => {
  const checked = status ? '✓' : '';
  const fillColor = status ? 'green' : 'black';
  return (
    <Group>
      <Circle {...{ x: x + 6.5, y: y + 7, width, height, fill: fillColor }} />
      <Text {...{ text: checked, x, y, width, height, align: 'center', verticalAlign: 'middle', fontSize: 15, fill: 'white' }} />
    </Group>
  );
};
