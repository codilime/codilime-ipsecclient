import React from 'react';
import { Text, Rect, Group, Line } from 'react-konva';
import PropTypes from 'prop-types';
import { variable } from '../visualizationConstants';

export const VisualizationEndpointLabel = ({ x, y, width, height, title, value, color = 'black' }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: variable.labelColor }} />
    <Text {...{ x, y, width: width * 0.4, height, align: 'center', text: title, verticalAlign: 'middle', fill: color, fontSize: 10, fontFamily: 'ciscoSansRegular' }} />
    <Text {...{ x: x + width * 0.4, y, width: width * 0.6, height, align: 'center', text: value, verticalAlign: 'middle', fill: color, fontSize: 10, fontFamily: 'ciscoSansRegular' }} />
    <Line {...{ x: x + width * 0.45, y: y + 6, stroke: 'black', strokeWidth: 0.5, points: [0, 0, 0, height - 12] }} />
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
