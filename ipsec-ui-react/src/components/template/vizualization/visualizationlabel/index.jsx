import React from 'react';
import { Rect, Group, Text, Image } from 'react-konva';
import PropTypes from 'prop-types';
import { variable } from '../visualizationConstants';
import Router from 'images/router.png';
import useImage from 'use-image';
import { VisualizationChecked } from '../visualizationChecked';
const { labelColor, smWidthLabel } = variable;

export const VisualizationOneLabel = ({ x, y, width, height }) => {
  const [image] = useImage(Router);
  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: labelColor }} />
      <Image {...{ image, x: x + width / 2 - 17.5, y, width: 35, height: 25 }} />
    </Group>
  );
};

VisualizationOneLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  text: PropTypes.string
};

export const VisualizationTwoLabel = ({ x, y, width, height, firstText, secondText, vlan }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: labelColor }} />
    <Text {...{ text: firstText, x: x - 5, y: y + 2, height: height / 2, width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold' }} />
    <Text {...{ text: secondText, x: x, y: y + height / 2, height: height / 2, width: width / 2, align: 'center', verticalAlign: 'middle', fontSize: 10 }} />
    <Text {...{ text: vlan, x: x + width / 2, y: y + height / 2, height: height / 2, width: width / 2, align: 'left', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold' }} />
  </Group>
);

VisualizationTwoLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  firstText: PropTypes.string,
  secondText: PropTypes.string,
  vlan: PropTypes.number
};

export const VisualizationThreeLabel = ({ x, y, width, height, firstText, bgpActive, natActive }) => {
  const firstContent = {
    x: x - 7.5,
    y,
    text: firstText,
    width: smWidthLabel,
    height: height / 3,
    fontSize: 10,
    align: 'center',
    verticalAlign: 'middle'
  };

  const secondContent = {
    x: x + 3,
    y: y + height / 3,
    text: 'BGP',
    width: smWidthLabel / 2,
    height: height / 3,
    fontSize: 8,
    align: 'center',
    verticalAlign: 'middle'
  };

  const thirdContent = {
    x: x + 3,
    y: y + (height / 3) * 2,
    text: 'NAT',
    width: smWidthLabel / 2,
    height: height / 3,
    fontSize: 8,
    align: 'center',
    verticalAlign: 'middle'
  };
  const checkedBgp = {
    x: x + smWidthLabel / 2 + 10,
    y: y + 1 + height / 3 + 2,
    status: bgpActive
  };
  const checkedNat = {
    x: x + smWidthLabel / 2 + 10,
    y: y + 1 + (height / 3) * 2,
    status: natActive
  };

  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: labelColor }} />
      <Text {...firstContent} />
      <Text {...{ ...secondContent, fontStyle: 'Bold' }} />
      <VisualizationChecked {...checkedBgp} />
      <Text {...{ ...thirdContent, fontStyle: 'Bold' }} />
      <VisualizationChecked {...checkedNat} />
    </Group>
  );
};

VisualizationThreeLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  firstText: PropTypes.string,
  bgpActive: PropTypes.bool,
  natActive: PropTypes.bool
};
