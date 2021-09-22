import { FC } from 'react';
import { Rect, Group, Text, Image } from 'react-konva';
import { variable } from '../visualizationConstants';
import Router from 'images/router.png';
import useImage from 'use-image';
import { VisualizationChecked } from '../visualizationChecked';
import { visualization } from 'interface/components';
const { labelColor, smWidthLabel } = variable;

interface VisualizationLabel extends visualization {
  width: number;
  height: number;
  firstText?: string;
  secondText?: string;
  vlan?: string;
  lan_ip?: string;
}

export const VisualizationOneLabel: FC<VisualizationLabel> = ({ x, y, width, height }) => {
  const [image] = useImage(Router);

  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: labelColor }} />
      <Image {...{ image, x: x + width / 2 - 17.5, y, width: 35, height: 25 }} />
    </Group>
  );
};

export const VisualizationTwoLabel: FC<VisualizationLabel> = ({ x, y, width, height, vlan, lan_ip }) => (
  <Group>
    <Rect {...{ x, y, width, height: height + 15, fill: labelColor }} />
    <Text {...{ text: 'Vlan', x, y: y, height: height / 2, width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'normal', letterSpacing: 1 }} />
    <Text {...{ text: vlan, x, y: y + height / 4 + 2.5, height: height / 2, width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold', letterSpacing: 1 }} />
    <Text {...{ text: 'Lan IP', x, y: y + height / 2 + 10, height: height / 4, width: width, align: 'center', verticalAlign: 'middle', fontSize: 10, letterSpacing: 1 }} />
    <Text {...{ text: lan_ip, x, y: y + height - 2.5, height: height / 4, width: width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold', letterSpacing: 1 }} />
  </Group>
);

interface VisualizationThreeLabelType extends VisualizationLabel {
  bgpActive: boolean;
  natActive: boolean;
}

export const VisualizationThreeLabel: FC<VisualizationThreeLabelType> = ({ x, y, width, height, firstText, bgpActive, natActive }) => {
  const firstContent = {
    x: x - 7.5,
    y,
    text: firstText,
    width: smWidthLabel,
    height: height / 3,
    fontSize: 10,
    align: 'center',
    verticalAlign: 'middle',
    letterSpacing: 1
  };

  const secondContent = {
    x: x + 3,
    y: y + height / 3,
    text: 'BGP',
    width: smWidthLabel / 2,
    height: height / 3,
    fontSize: 8,
    align: 'center',
    verticalAlign: 'middle',
    letterSpacing: 1,
    fontStyle: 'Bold'
  };

  const thirdContent = {
    x: x + 3,
    y: y + (height / 3) * 2,
    text: 'NAT',
    width: smWidthLabel / 2,
    height: height / 3,
    fontSize: 8,
    align: 'center',
    verticalAlign: 'middle',
    fontStyle: 'Bold',
    letterSpacing: 1
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
      <Text {...{ ...secondContent }} />
      <VisualizationChecked {...checkedBgp} />
      <Text {...{ ...thirdContent }} />
      <VisualizationChecked {...checkedNat} />
    </Group>
  );
};
