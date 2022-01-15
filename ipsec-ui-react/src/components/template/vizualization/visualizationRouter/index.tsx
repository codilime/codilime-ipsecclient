import { FC } from 'react';
import { Rect, Group, Text, Image, Circle } from 'react-konva';
import Router from 'images/Router.png';
import useImage from 'use-image';
import { Visualization } from 'interface/components';
import { variable } from '../visualizationConstants';

interface VisualizationLabel extends Visualization {
  width: number;
  height: number;
}

export const VisualizationRouter: FC<VisualizationLabel> = ({ x, y, width, height }) => {
  const [image] = useImage(Router);
  return (
    <Group>
      <Circle {...{ x, y, width, height, fill: variable.bgcColor }} />
      <Image {...{ image, x: x - 10, y: y - 10, width: width - 20, height: height - 20 }} />
    </Group>
  );
};
