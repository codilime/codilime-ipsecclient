import { FC } from 'react';
import { Text, Rect, Group, Image, Circle } from 'react-konva';
import useImage from 'use-image';
import Cat from 'images/cat.png';
import { colors } from '../visualizationConstants';
import { Visualization } from 'interface/components';

interface VisualizationIconType extends Visualization {
  theme: string;
  text: string;
  height: number;
  width: number;
}

export const VisualizationIcon: FC<VisualizationIconType> = ({ x, y, width, height, text, theme }) => {
  const [image] = useImage(Cat);
  const { labelColor, labelColorDark, bgcBlue, textColor, textColorDark } = colors;
  const colorlabel = theme === 'light' ? labelColor : labelColorDark;
  const colorText = theme === 'light' ? textColor : textColorDark;
  return (
    <Group>
      <Circle {...{ x: x + 20, y: y + 15, width, height, fill: bgcBlue }} />
      <Image {...{ image, x: x + 5, y, width: width - 10, height: height - 10 }} />
      <Rect {...{ x: x - 30, y: y + height, width: width + 60, height: 32, fill: colorlabel, cornerRadius: 4 }} />
      <Text {...{ text, x: x / 2, y: height + y, width: width + x, height: 32, align: 'center', verticalAlign: 'middle', fontSize: 14, fill: colorText, letterSpacing: 1 }} />
    </Group>
  );
};
