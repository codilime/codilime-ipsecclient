import React from 'react';
import { Text, Rect, Group, Line } from 'react-konva';
import PropTypes from 'prop-types';
import { variable } from '../visualizationConstants';

export const VisualizationEndpointLabel = ({ x, y, width, height, title, value, color = 'black' }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: variable.labelColor }} />
    <Text {...{ x, y, width: width * 0.4, height, align: 'right', text: title, verticalAlign: 'middle', fill: color, fontSize: 10, fontFamily: 'ciscoSansRegular' }} />
    <Text {...{ x: x + width * 0.4, y, width: width * 0.6, height, align: 'center', text: value, verticalAlign: 'middle', fill: color, fontSize: 10, fontFamily: 'ciscoSansRegular' }} />
    <Line {...{ x: x + width * 0.45, y: y + 6, stroke: 1, strokeWidth: 0.5, points: [0, 0, 0, height - 12] }} />
  </Group>
);
// {...{ x: x + width / 2, y: y + 2, fill: 'red', points: [0, 0, 10, height - 4] }}
VisualizationEndpointLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  value: PropTypes.string,
  color: PropTypes.string
};
