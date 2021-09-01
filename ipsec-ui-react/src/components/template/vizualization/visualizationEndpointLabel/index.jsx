import React from 'react';
import { Text, Rect, Group, Line } from 'react-konva';
import PropTypes from 'prop-types';
import { variable } from '../visualizationConstants';

export const VisualizationEndpointLabel = ({ x, y, width, height, title, value, color = 'black' }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: variable.labelColor }} />
    <Text {...{ x: x - 10, y, width, height: height / 2, align: 'center', text: title, verticalAlign: 'middle', fill: color, fontSize: 10 }} />
    <Text {...{ x: x - 10, y: y + height / 2, width, height: height / 2, align: 'center', text: value, verticalAlign: 'middle', fill: color, fontSize: 10, fontStyle: 'bold' }} />
  </Group>
);

VisualizationEndpointLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  value: PropTypes.string,
  color: PropTypes.string
};
