import { Visualization } from 'interface/components';
import { FC } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { variable } from '../visualizationConstants';

interface VisualizationEndpointLabelType extends Visualization {
  text: string;
  value: string;
  height: number;
  width: number;
}

export const VisualizationBoxLabel: FC<VisualizationEndpointLabelType> = ({ x, y, width, height, text, value }) => {
  return (
    <Group>
      <Rect {...{ x, y, width, height: height, fill: variable.labelColor, cornerRadius: 4 }} />
      <Text {...{ x: x + 10, y: y + 5, width, height: height / 2, align: 'start', text, verticalAlign: 'middle', fill: variable.textColor, fontSize: 14, letterSpacing: 1, fontStyle: '500' }} />
      <Text {...{ x: x + 10, y: y + 15, width, height, align: 'start', text: value, verticalAlign: 'middle', fill: 'black', fontSize: 14, fontStyle: '400', letterSpacing: 1 }} />
    </Group>
  );
};
