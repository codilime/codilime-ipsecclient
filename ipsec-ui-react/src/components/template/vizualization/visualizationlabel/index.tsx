import React, { FC } from 'react';
import { Rect, Group, Text, Image } from 'react-konva';
import { variable } from '../visualizationConstants';
import Router from 'images/router.png';
import useImage from 'use-image';
import { VisualizationChecked } from '../visualizationChecked';
const { labelColor, smWidthLabel } = variable;

interface VisualizationOneLabelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export const VisualizationOneLabel: FC<VisualizationOneLabelProps> = ({ x, y, width, height }) => {
  const [image] = useImage(Router);
  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: labelColor }} />
      <Image {...{ image, x: x + width / 2 - 17.5, y, width: 35, height: 25 }} />
    </Group>
  );
};

interface VisualizationTwoLabelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  firstText: string;
  secondText: string;
  vlan: string; // wcześniej był number, ale TS wyrzuca info, że type number is not assigneable to text w linii 43
}

export const VisualizationTwoLabel: FC<VisualizationTwoLabelProps> = ({ x, y, width, height, firstText, secondText, vlan }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: labelColor }} />
    <Text {...{ text: firstText, x: x - 5, y: y + 2, height: height / 2, width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold' }} />
    <Text {...{ text: secondText, x: x + 5, y: y + height / 2, height: height / 2, width: width / 2, align: 'center', verticalAlign: 'middle', fontSize: 10 }} />
    <Text {...{ text: vlan, x: x + width / 2 - 5, y: y + height / 2, height: height / 2, width: width / 2, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold' }} />
  </Group>
);

interface VisualizationThreeLabelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  firstText: string;
  bgpActive: boolean;
  natActive: boolean;
}

export const VisualizationThreeLabel: FC<VisualizationThreeLabelProps> = ({ x, y, width, height, firstText, bgpActive, natActive }) => {
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
