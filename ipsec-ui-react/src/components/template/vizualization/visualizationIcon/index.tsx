import React, { FC } from 'react';
import { Text, Rect, Group, Image } from 'react-konva';
import useImage from 'use-image';
import Spine from 'images/spine.png';
import { variable } from '../visualizationConstants';

interface VisualizationIconProps {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export const VisualizationIcon: FC<VisualizationIconProps> = ({ x, y, width, height, text }) => {
  const [image] = useImage(Spine);
  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: variable.bgcColor }} />
      <Image {...{ image, x: x + 2.5, y: y + 2.5, width: width - 5, height: height - 5 }} />
      <Rect {...{ x: x / 2, y: y + height, width: width + x, height: 20, fill: variable.labelColor }} />
      <Text {...{ text, x: x / 2 - 5, y: height + y, width: width + x, height: 20, align: 'center', verticalAlign: 'middle', fontSize: 10, fill: 'black' }} />
    </Group>
  );
};
