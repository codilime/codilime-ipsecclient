import { FC } from 'react';
import { Rect, Group, Text, Image } from 'react-konva';
import { variable } from '../visualizationConstants';
import Router from 'images/router.png';
import useImage from 'use-image';
import { VisualizationChecked } from '../visualizationChecked';
import { Visualization } from 'interface/components';
const { smWidthLabel } = variable;

interface VisualizationLabel extends Visualization {
  width: number;
  height: number;
  firstText?: string;
  secondText?: string;
  vlan?: string;
  lan_ip?: string;
  left?: boolean;
  hardware?: boolean;
}

export const VisualizationOneLabel: FC<VisualizationLabel> = ({ x, y, width, height, left, hardware = false }) => {
  const [image] = useImage(Router);

  const leftWidth = left ? 55 : 35;
  const leftHight = left ? 45 : 35;
  const leftY = left ? 10 : 5;
  const leftX = left ? x + width / 4 : x + width / 2 - 17.5;
  const Icon =
    left && hardware ? (
      <Group>
        <Rect {...{ x, y, width, height, fill: 'white' }} />
        <Text {...{ text: 'PFE', x, y, height: height / 3 + 2, width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold', letterSpacing: 1 }} />
        <Text
          {...{
            text: 'Packet Forwarding Engine',
            x: x + 2.5,
            y: y + height / 3 - 2,
            height,
            width: width - 5,
            align: 'center',
            verticalAlign: 'top',
            fontSize: 10,
            fontStyle: 'normal',
            letterSpacing: 1,
            lineHeight: 1.4
          }}
        />
      </Group>
    ) : (
      <Image {...{ image, x: leftX, y: y - leftY, width: leftWidth, height: leftHight }} />
    );

  return Icon;
};

export const VisualizationTwoLabel: FC<VisualizationLabel> = ({ x, y, width, height, vlan, lan_ip }) => (
  <Group>
    <Rect {...{ x, y, width, height: height + 15, fill: 'white' }} />
    <Text {...{ text: 'Vlan', x, y, height: height / 2, width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'normal', letterSpacing: 1 }} />
    <Text {...{ text: vlan, x, y: y + height / 4 + 2.5, height: height / 2, width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold', letterSpacing: 1 }} />
    <Text {...{ text: 'Lan IP', x, y: y + height / 2 + 10, height: height / 4, width: width, align: 'center', verticalAlign: 'middle', fontSize: 10, letterSpacing: 1 }} />
    <Text {...{ text: lan_ip, x, y: y + height - 2.5, height: height / 4, width: width, align: 'center', verticalAlign: 'middle', fontSize: 10, fontStyle: 'bold', letterSpacing: 1 }} />
  </Group>
);

interface VisualizationThreeLabelType extends VisualizationLabel {
  bgpActive: boolean;
  natActive?: boolean;
  hardware: boolean;
}

export const VisualizationThreeLabel: FC<VisualizationThreeLabelType> = ({ x, y, width, height, firstText, bgpActive, natActive, hardware }) => {
  const hardwareTitleHight = hardware ? height / 2 : height / 3;
  const firstContent = {
    x: x - 2.5,
    y,
    text: firstText,
    width: smWidthLabel,
    height: hardwareTitleHight,
    fontSize: 10,
    align: 'center',
    verticalAlign: 'middle',
    letterSpacing: 1
  };

  const hardwareYChecked = hardware ? y + height / 2 : y + height / 3;

  const secondContent = {
    x: x + 3,
    y: hardware ? hardwareYChecked : hardwareYChecked - 6,
    text: 'BGP',
    width: smWidthLabel / 2,
    height: height / 2,
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
    y: hardwareYChecked + 2,
    status: bgpActive
  };
  const checkedNat = {
    x: x + smWidthLabel / 2 + 10,
    y: y + 1 + (height / 3) * 2,
    status: natActive
  };

  const nat = !hardware && (
    <>
      <Text {...{ ...thirdContent }} />
      <VisualizationChecked {...checkedNat} />
    </>
  );

  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: 'white' }} />
      <Text {...firstContent} />
      <Text {...secondContent} />
      <VisualizationChecked {...checkedBgp} />
      {nat}
    </Group>
  );
};
