import React from 'react';
import { Text, Rect, Group } from 'react-konva';
import PropTypes from 'prop-types';

export const VisualizationChecked = ({ x, y, status }) => {
  const checked = status ? '✓' : '';
  const strokeColor = status ? 'green' : 'black';
  return (
    <Group>
      <Rect {...{ x, y, width: 10, height: 10, fill: 'transparent' }} stroke={strokeColor} strokeWidth={1} />
      <Text {...{ text: checked, x, y, width: 10, height: 10, align: 'center', verticalAlign: 'middle', fontSize: 10, fill: strokeColor }} />
    </Group>
  );
};

VisualizationChecked.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  status: PropTypes.bool
};
