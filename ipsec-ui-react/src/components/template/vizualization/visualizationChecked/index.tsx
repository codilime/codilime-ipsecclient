/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { Text, Circle, Group } from 'react-konva';
import { Visualization } from 'interface/components';

interface VisualizationCheckedType extends Visualization {
  status?: boolean;
  width: number;
  height: number;
}

export const VisualizationChecked: FC<VisualizationCheckedType> = ({ x, y, status, width, height }) => {
  const checked = status ? '✓' : 'x';
  const fillColor = status ? 'green' : 'red';
  return (
    <Group>
      <Circle {...{ x: x + 6.5, y: y + 7, width, height, fill: fillColor }} />
      <Text {...{ text: checked, x: x - 1, y: checked === 'x' ? y - 1 : y, width, height, align: 'center', verticalAlign: 'middle', fontSize: 15, fill: 'white', fontStyle: 'bold' }} />
    </Group>
  );
};
