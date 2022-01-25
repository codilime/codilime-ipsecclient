/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { Group, Image, Circle } from 'react-konva';
import Router from 'images/Router.png';
import useImage from 'use-image';
import { Visualization } from 'interface/components';
import { colors } from '../visualizationConstants';

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
