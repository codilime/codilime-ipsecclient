import React, { FC } from 'react';
import { Text, Rect, Group, Line } from 'react-konva';
import { variable } from '../visualizationConstants';
import { VisualizationBoxTypeProps } from '../../../../interface/components';

interface VisualizationEndpointLabelProps extends VisualizationBoxTypeProps {
  color?: string;
}

export const VisualizationEndpointLabel: FC<VisualizationEndpointLabelProps> = ({ x, y, width, height, title, value, color = 'black' }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: variable.labelColor }} />
    <Text {...{ x: x - 10, y, width, height: height / 2, align: 'center', text: title, verticalAlign: 'middle', fill: color, fontSize: 10 }} />
    <Text {...{ x: x - 10, y: y + height / 2, width, height: height / 2, align: 'center', text: value, verticalAlign: 'middle', fill: color, fontSize: 10, fontStyle: 'bold' }} />
  </Group>
);
