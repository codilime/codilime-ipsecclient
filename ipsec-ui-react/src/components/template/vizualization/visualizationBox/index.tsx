import { FC } from 'react';
import { Text, Rect, Group } from 'react-konva';
import { variable } from '../visualizationConstants';
import { Visualization } from 'interface/components';

interface VisualizationBoxType extends Visualization {
  title: string;
}

export const VisualizationBox: FC<VisualizationBoxType> = ({ x, y, width, height, title, children }) => {
  return (
    <Group>
      <Rect {...{ x, y, width, height }} stroke={variable.bgcColor} strokeWidth={1} cornerRadius={4} />
      <Rect {...{ x, y, width }} height={variable.heightHeader} fill={variable.bgcColor} cornerRadius={4} />
      <Text {...{ text: title, x: x + 10, y, fill: 'white', width, height: variable.heightHeader, align: 'left', verticalAlign: 'middle', fontSize: 16 }} />
      {children}
    </Group>
  );
};
