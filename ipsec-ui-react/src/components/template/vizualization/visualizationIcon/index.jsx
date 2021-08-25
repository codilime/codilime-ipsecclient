import React from 'react';
import { Text, Rect, Group } from 'react-konva';
import PropTypes from 'prop-types';
import { variable } from '../visualizationConstants';

export const VisualizationIcon = ({ x, y, width, height, text }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: variable.bgcColor }} />
    <Text {...{ x, y, width, height, align: 'center', verticalAlign: 'middle', text: 'icon', fill: 'white' }} />
    <Rect x={x / 2} y={y + height} width={width + x} height={20} fill={variable.labelColor} />
    <Text {...{ text, x: x / 2, y: height + y, width: width + x, height: 20, align: 'center', verticalAlign: 'middle', fontSize: 10, fill: 'black' }} />
  </Group>
);

VisualizationIcon.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  text: PropTypes.string
};
