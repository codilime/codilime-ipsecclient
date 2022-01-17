import { FC } from 'react';
import { Text, Rect, Group, Image, Circle } from 'react-konva';
import useImage from 'use-image';
import Cat from 'images/cat.png';
import { variable } from '../visualizationConstants';
import { Visualization } from 'interface/components';

interface VisualizationIconType extends Visualization {
  text: string;
  height: number;
  width: number;
}

export const VisualizationIcon: FC<VisualizationIconType> = ({ x, y, width, height, text }) => {
  const [image] = useImage(Cat);
  return (
    <Group>
      <Circle {...{ x: x + 20, y: y + 15, width, height, fill: variable.bgcColor }} />
      <Image {...{ image, x: x + 5, y, width: width - 10, height: height - 10 }} />
      <Rect {...{ x: x - 25, y: y + height, width: width + 50, height: 32, fill: variable.labelColor, cornerRadius: 4 }} />
      <Text {...{ text, x: x / 2, y: height + y, width: width + x, height: 32, align: 'center', verticalAlign: 'middle', fontSize: 14, fill: 'black', letterSpacing: 1 }} />
    </Group>
  );
};
