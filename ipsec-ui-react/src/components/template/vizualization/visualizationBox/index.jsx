import React from 'react';
import { Text, Rect, Group, Path } from 'react-konva';
import Router from 'images/router2.svg';
import PropTypes from 'prop-types';
import { variable } from '../visualizationConstants';

export const VisualizationBox = ({ x, y, width, height, title, children }) => (
  <Group>
    <Rect {...{ x, y, width, height }} fill="white" stroke={variable.bgcColor} strokeWidth={1} />
    <Rect {...{ x, y, width }} height={variable.heightHeader} fill={variable.bgcColor} />
    <Text {...{ text: title, x: x + 5, y, fill: 'white', width, height: variable.heightHeader, align: 'left', verticalAlign: 'middle', fontFamily: 'ciscoSansRegular' }} />
    {children}
    <Path {...{ x: x + width, y, width, height, data: Router, fill: 'black' }} />
  </Group>
);

VisualizationBox.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  children: PropTypes.node
};
