import React from 'react';
import { Text, Rect, Group, Image } from 'react-konva';
import PropTypes from 'prop-types';
import useImage from 'use-image';
import Spine from 'images/spine.png';
import { variable } from '../visualizationConstants';

export const VisualizationIcon = ({ x, y, width, height, text }) => {
  const [image] = useImage(Spine);
  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: variable.bgcColor }} />
      <Image {...{ image, x, y, width, height }} />
      <Rect {...{ x: x / 2, y: y + height, width: width + x, height: 20, fill: variable.labelColor }} />
      <Text {...{ text, x: x / 2, y: height + y, width: width + x, height: 20, align: 'center', verticalAlign: 'middle', fontSize: 10, fill: 'black', fontFamily: 'ciscoSansRegular' }} />
    </Group>
  );
};

VisualizationIcon.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  text: PropTypes.string
};