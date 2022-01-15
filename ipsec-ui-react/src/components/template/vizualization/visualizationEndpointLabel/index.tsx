import { FC } from 'react';
import { Text, Rect, Group } from 'react-konva';
import { variable } from '../visualizationConstants';
import { Visualization } from 'interface/components';

interface VisualizationEndpointLabelType extends Visualization {
  text: string;
  value: string;
  height: number;
  color?: string;
}

export const VisualizationEndpointLabel: FC<VisualizationEndpointLabelType> = ({ x, y, width, height, text, value, color = variable.labelColor }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: color, cornerRadius: 4 }} />
    <Text {...{ x, y: y - 20, width, height: height / 2, align: 'start', text, verticalAlign: 'middle', fill: variable.textColor, fontSize: 14, letterSpacing: 1, fontStyle: '500' }} />
    <Text {...{ x: x + 5, y, width, height, align: 'start', text: value, verticalAlign: 'middle', fill: 'black', fontSize: 14, fontStyle: '400', letterSpacing: 1 }} />
  </Group>
);
