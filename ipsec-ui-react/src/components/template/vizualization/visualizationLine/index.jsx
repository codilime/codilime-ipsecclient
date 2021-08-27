import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-konva';

export const VisualizationLine = ({ x, y, width, height, points, color }) => <Line {...{ points, x, y, width, height }} stroke={color} strokeWidth={1} />;

VisualizationLine.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  points: PropTypes.array,
  color: PropTypes.string
};
