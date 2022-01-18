import { useThemeContext } from 'hooks/';
import { Visualization } from 'interface/components';
import { FC } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { colors } from '../visualizationConstants';

interface VisualizationEndpointLabelType extends Visualization {
  theme: string;
  text: string;
  value: string;
  height: number;
  width: number;
}

export const VisualizationBoxLabel: FC<VisualizationEndpointLabelType> = ({ x, y, width, height, text, value, theme }) => {
  const { labelColor, labelColorDark, textColor, textColorDark, labelIpColor } = colors;
  const colorlabel = theme === 'light' ? labelColor : labelColorDark;
  const colorText = theme === 'light' ? textColor : textColorDark;
  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: colorlabel, cornerRadius: 4 }} />
      <Text {...{ x, y, width, height: height / 2, align: 'center', text, verticalAlign: 'middle', fill: labelIpColor, fontSize: 14, letterSpacing: 1, fontStyle: '500' }} />
      <Text {...{ x, y: y + 10, width, align: 'center', height, text: value, verticalAlign: 'middle', fontSize: 14, fontStyle: '400', letterSpacing: 1, fill: colorText }} />
    </Group>
  );
};
