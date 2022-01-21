import { FC } from 'react';
import { Text, Rect, Group } from 'react-konva';
import { colors } from '../visualizationConstants';
import { Visualization } from 'interface/components';

interface VisualizationEndpointLabelType extends Visualization {
  theme: string;
  text: string;
  value: string;
  height: number;
  color?: string;
}

export const VisualizationEndpointLabel: FC<VisualizationEndpointLabelType> = ({ x, y, width, height, text, value, theme }) => {
  const { labelColor, labelColorDark, textColor, textColorDark, labelIpColor } = colors;
  const colorlabel = theme === 'light' ? labelColor : labelColorDark;
  const colorText = theme === 'light' ? textColor : textColorDark;
  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: colorlabel, cornerRadius: 4 }} />
      <Text {...{ x, y: y - 20, width, height: height / 2, align: 'start', text, verticalAlign: 'middle', fontSize: 14, letterSpacing: 1, fontStyle: '500', fill: labelIpColor }} />
      <Text {...{ x: x + 5, y, width, height, align: 'start', text: value, verticalAlign: 'middle', fontSize: 14, fontStyle: '400', letterSpacing: 1, fill: colorText }} />
    </Group>
  );
};
