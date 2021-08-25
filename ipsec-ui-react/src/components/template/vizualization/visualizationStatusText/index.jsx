import React from 'react';
import PropTypes from 'prop-types';
import { Circle, Group, Text } from 'react-konva';

export const VisualizationStatusText = ({ x, y, width, height, status }) => {
  const statusIcon = status === 'ACTIVE' ? '✓' : 'X';
  const statusColor = status === 'ACTIVE' ? 'green' : 'red';
  const statusText = status === 'ACTIVE' ? 'Working' : 'Down';

  return (
    <Group>
      <Circle {...{ x: x + width / 2 - 32, y: y + 6 }} align="center" radius={6} stroke={statusColor} fill={statusColor} />
      <Text
        {...{
          text: statusIcon,
          x: x + width / 2 - 38,
          y: y + 1,
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
      <Text {...{ text: statusText, x, y, width, height, align: 'center', verticalAlign: 'top', fill: statusColor, fontFamily: 'ciscoSansRegular' }} />
    </Group>
  );
};

VisualizationStatusText.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  text: PropTypes.string,
  status: PropTypes.string
};
