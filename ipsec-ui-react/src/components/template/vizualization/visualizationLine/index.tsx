/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { Line } from 'react-konva';
import { colors } from '../visualizationConstants';

interface VisualizationLine {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points: number[];
  color?: string;
}

export const VisualizationLine: FC<VisualizationLine> = ({ x, y, width, height, points, color = colors.lineColor }) => <Line {...{ points, x, y, width, height }} stroke={color} strokeWidth={1} />;
