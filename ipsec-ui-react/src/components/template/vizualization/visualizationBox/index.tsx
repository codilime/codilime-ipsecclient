import { FC } from 'react';
import { Text, Rect, Group } from 'react-konva';
import { variable, colors } from '../visualizationConstants';
import { Visualization } from 'interface/components';
import { useThemeContext } from 'hooks/';

interface VisualizationBoxType extends Visualization {
  title: string;
}

export const VisualizationBox: FC<VisualizationBoxType> = ({ x, y, width, height, title, children }) => {
  const { bgcBlue } = colors;

  return (
    <Group>
      <Rect {...{ x, y, width, height }} stroke={bgcBlue} strokeWidth={1} cornerRadius={4} />
      <Rect {...{ x, y, width }} height={variable.heightHeader} fill={bgcBlue} cornerRadius={4} />
      <Text {...{ text: title, x: x + 10, y, fill: 'white', width, height: variable.heightHeader, align: 'left', verticalAlign: 'middle', fontSize: 16 }} />
      {children}
    </Group>
  );
};
