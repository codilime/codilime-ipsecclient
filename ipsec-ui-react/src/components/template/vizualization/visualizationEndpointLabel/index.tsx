import { FC } from 'react';
import { Text, Rect, Group } from 'react-konva';
import { variable } from '../visualizationConstants';
import { visualization } from 'interface/components';

interface VisualizationEndpointLabelType extends visualization {
  title: string;
  value: string;
  height: number;
}

export const VisualizationEndpointLabel: FC<VisualizationEndpointLabelType> = ({ x, y, width, height, title, value }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: variable.labelColor }} />
    <Text {...{ x, y, width, height: height / 2, align: 'center', text: title, verticalAlign: 'middle', fill: 'black', fontSize: 10, letterSpacing: 1 }} />
    <Text {...{ x, y: y + height / 2, width, height: height / 2, align: 'center', text: value, verticalAlign: 'middle', fill: 'black', fontSize: 10, fontStyle: 'bold', letterSpacing: 1 }} />
  </Group>
);
