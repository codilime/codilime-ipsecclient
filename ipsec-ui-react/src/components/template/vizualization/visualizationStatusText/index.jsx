import React from 'react';
import PropTypes from 'prop-types';
import { Circle, Group, Text } from 'react-konva';

export const VisualizationStatusText = ({ x, y, width, height, text, status = true }) => {
  const statusIcon = status ? '✓' : 'X';
  const statusColor = status ? 'green' : 'red';

  return (
    <Group>
      <Circle {...{ x: x + width / 2 - 32, y: y + 6 }} align="center" radius={6} stroke={statusColor} fill={statusColor} />
      <Text
        {...{
          text: statusIcon,
          x: x + width / 2 - 37,
          y,
          width: 12,
          height: 12,
          align: 'center',
          fontSize: 12,
          verticalAlign: 'top',
          fill: 'white',
          fontStyle: 'bold',
          fontFamily: 'ciscoSansRegular'
        }}
      />
      <Text {...{ text, x, y, width, height, align: 'center', verticalAlign: 'top', fill: statusColor, fontFamily: 'ciscoSansRegular' }} />
    </Group>
  );
};

VisualizationStatusText.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  text: PropTypes.string,
  status: PropTypes.bool
};
