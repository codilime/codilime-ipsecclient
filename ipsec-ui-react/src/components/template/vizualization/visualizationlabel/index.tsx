/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */
import { FC } from 'react';
import { Rect, Group, Text, Image } from 'react-konva';
import { variable, colors } from '../visualizationConstants';
import Router from 'images/Router.png';
import useImage from 'use-image';
import { VisualizationChecked } from '../visualizationChecked';
import { Visualization } from 'interface/components';

const { smWidthLabel } = variable;

interface VisualizationLabel extends Visualization {
  theme: string;
  width: number;
  height: number;
  firstText?: string;
  secondText?: string;
  vlan?: string;
  lan_ip?: string;
  left?: boolean;
  hardware?: boolean;
}

export const VisualizationOneLabel: FC<VisualizationLabel> = ({ x, y, width, height, left, hardware, theme }) => {
  const [image] = useImage(Router);

  const { labelColor, labelColorDark, bgcBlue, textColor, textColorDark } = colors;
  const colorlabel = theme === 'light' ? labelColor : labelColorDark;
  const colorText = theme === 'light' ? textColor : textColorDark;

  const leftWidth = left ? 55 : 35;
  const leftHight = left ? 45 : 35;
  const leftY = left ? 10 : 5;
  const leftX = left ? x + width / 4 : x + width / 2 - 17.5;
  const Icon =
    left && hardware ? (
      <Group>
        <Rect {...{ x, y, width, height, fill: colorlabel, cornerRadius: 4 }} />
        <Text {...{ text: 'PFE', x, y, height: height / 3 + 2, width, align: 'center', verticalAlign: 'middle', fontSize: 14, fontStyle: 'bold', letterSpacing: 1, fill: colorText }} />
        <Text
          {...{
            text: 'Packet Forwarding Engine',
            x: x + 2.5,
            y: y + height / 3 - 2,
            height,
            width,
            align: 'center',
            verticalAlign: 'top',
            fontSize: 14,
            fontStyle: 'normal',
            letterSpacing: 1,
            lineHeight: 1.4,
            fill: colorText
          }}
        />
      </Group>
    ) : (
      <Group>
        <Rect {...{ x: leftX, y: y - leftY, width: leftWidth, height: leftHight, fill: bgcBlue, cornerRadius: 4 }} />
        <Image {...{ image, x: leftX + 8, y: y + 3, width: leftWidth - 15, height: leftHight - 15 }} />
      </Group>
    );

  return Icon;
};

export const VisualizationTwoLabel: FC<VisualizationLabel> = ({ x, y, width, height, vlan, lan_ip, theme }) => {
  const { labelColor, labelColorDark, textColor, textColorDark } = colors;
  const colorlabel = theme === 'light' ? labelColor : labelColorDark;
  const colorText = theme === 'light' ? textColor : textColorDark;
  return (
    <Group>
      <Rect {...{ x, y, width, height: height + 20, fill: colorlabel, cornerRadius: 4 }} />
      <Text {...{ text: 'Vlan', x, y, height: height / 2, width, align: 'center', verticalAlign: 'middle', fontSize: 14, fontStyle: 'normal', letterSpacing: 1, fill: colorText }} />
      <Text {...{ text: vlan, x, y: y + height / 4, height: height / 2, width, align: 'center', verticalAlign: 'middle', fontSize: 14, fontStyle: 'bold', letterSpacing: 1, fill: colorText }} />
      <Text {...{ text: 'Lan IP', x, y: y + height / 2 + 10, height: height / 4, width: width, align: 'center', verticalAlign: 'middle', fontSize: 14, letterSpacing: 1, fill: colorText }} />
      <Text
        {...{ text: lan_ip, x, y: y + height - 5, height: height / 4, width: width, align: 'center', verticalAlign: 'middle', fontSize: 14, fontStyle: 'bold', letterSpacing: 1, fill: colorText }}
      />
    </Group>
  );
};

interface VisualizationThreeLabelType extends VisualizationLabel {
  theme: string;
  bgpActive: boolean;
  natActive?: boolean;
  hardware: boolean;
}

export const VisualizationThreeLabel: FC<VisualizationThreeLabelType> = ({ x, y, width, height, firstText, bgpActive, natActive, hardware, theme }) => {
  const { labelColor, labelColorDark, textColor, textColorDark } = colors;
  const colorlabel = theme === 'light' ? labelColor : labelColorDark;
  const colorText = theme === 'light' ? textColor : textColorDark;

  const hardwareTitleHight = hardware ? height / 2 : height / 3;
  const firstContent = {
    x,
    y: y + 5,
    text: firstText,
    width: smWidthLabel,
    height: hardwareTitleHight,
    fontSize: 14,
    align: 'center',
    verticalAlign: 'middle',
    letterSpacing: 1,
    fontStyle: '400',
    fill: colorText
  };

  const hardwareYChecked = hardware ? y + height / 2 : y + height / 3 - 5;

  const secondContent = {
    x: x + 6,
    y: hardware ? hardwareYChecked : hardwareYChecked,
    text: 'BGP',
    width: smWidthLabel / 2,
    height: height / 2,
    fontSize: 14,
    align: 'center',
    verticalAlign: 'middle',
    letterSpacing: 1,
    fontStyle: 'Bold',
    fill: colorText
  };

  const thirdContent = {
    x: x + 6,
    y: y + (height / 3) * 2,
    text: 'NAT',
    width: smWidthLabel / 2,
    height: height / 3,
    fontSize: 14,
    align: 'center',
    verticalAlign: 'middle',
    fontStyle: 'Bold',
    letterSpacing: 1,
    fill: colorText
  };

  const checkedBgp = {
    x: x + smWidthLabel / 2 + 21,
    y: hardwareYChecked + 12,
    status: bgpActive,
    width: 15,
    height: 15
  };
  const checkedNat = {
    x: x + smWidthLabel / 2 + 21,
    y: y + 5 + (height / 3) * 2,
    status: natActive,
    width: 15,
    height: 15
  };

  const nat = !hardware && (
    <>
      <Text {...{ ...thirdContent }} />
      <VisualizationChecked {...checkedNat} />
    </>
  );

  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: colorlabel, cornerRadius: 4 }} />
      <Text {...firstContent} />
      <Text {...secondContent} />
      <VisualizationChecked {...checkedBgp} />
      {nat}
    </Group>
  );
};
