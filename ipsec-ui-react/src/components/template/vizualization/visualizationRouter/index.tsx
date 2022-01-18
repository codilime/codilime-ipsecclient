import { FC } from 'react';
import { Rect, Group, Text, Image, Circle } from 'react-konva';
import Router from 'images/Router.png';
import useImage from 'use-image';
import { Visualization } from 'interface/components';
import { colors } from '../visualizationConstants';
import { useThemeContext } from 'hooks/';

interface VisualizationLabel extends Visualization {
  width: number;
  height: number;
}

export const VisualizationRouter: FC<VisualizationLabel> = ({ x, y, width, height }) => {
  const [image] = useImage(Router);
  const { bgcBlue } = colors;

  return (
    <Group>
      <Circle {...{ x, y, width, height, fill: bgcBlue }} />
      <Image {...{ image, x: x - 10, y: y - 10, width: width - 20, height: height - 20 }} />
    </Group>
  );
};
