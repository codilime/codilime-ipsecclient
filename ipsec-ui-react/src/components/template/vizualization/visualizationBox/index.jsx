import React from 'react';
import { Text, Rect, Group, Image } from 'react-konva';
import Router from 'images/router.png';
import useImage from 'use-image';
import PropTypes from 'prop-types';
import { variable } from '../visualizationConstants';

export const VisualizationBox = ({ x, y, width, height, title, children }) => {
  const [image] = useImage(Router);
  return (
    <Group>
      <Rect {...{ x, y, width, height }} fill="white" stroke={variable.bgcColor} strokeWidth={1} />
      <Rect {...{ x, y, width }} height={variable.heightHeader} fill={variable.bgcColor} />
      <Image {...{ image, x: x + width - 35, y, width: 35, height: 25 }} />
      <Text {...{ text: title, x: x + 5, y, fill: 'white', width, height: variable.heightHeader, align: 'left', verticalAlign: 'middle', fontFamily: 'ciscoSansRegular' }} />
      {children}
    </Group>
  );
};

VisualizationBox.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  children: PropTypes.node
};
