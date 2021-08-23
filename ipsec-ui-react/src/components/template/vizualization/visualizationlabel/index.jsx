import React from 'react';
import { Rect, Group, Text } from 'react-konva';
import PropTypes from 'prop-types';
import { variable } from '../visualizationConstants';
const { labelColor, smWidthLabel } = variable;

export const VisualizationOneLabel = ({ x, y, width, height, text }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: labelColor }} />
    <Text {...{ text, x, y, width, height, verticalAlign: 'middle', align: 'center' }} />
  </Group>
);

VisualizationOneLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  text: PropTypes.string
};

export const VisualizationTwoLabel = ({ x, y, width, height, firstText, secondText }) => (
  <Group>
    <Rect {...{ x, y, width, height, fill: labelColor }} />
    <Text {...{ text: firstText, x, y: y + 5, width, height, align: 'center', verticalAlign: 'top', fontSize: 10 }} />
    <Text {...{ text: secondText, x, y: y - 5, width, height, align: 'center', verticalAlign: 'bottom', fontSize: 8 }} />
  </Group>
);

VisualizationTwoLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  firstText: PropTypes.string,
  secondText: PropTypes.string
};

export const VisualizationThreeLabel = ({ x, y, width, height, firstText, bgpActive, natActive }) => {
  const firstContent = {
    x,
    y,
    text: firstText,
    width: smWidthLabel,
    height: height / 3,
    fontSize: 10,
    fontFamily: 'ciscoSansRegular',
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
    fontFamily: 'ciscoSansRegular',
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
    fontFamily: 'ciscoSansRegular',
    align: 'center',
    verticalAlign: 'middle'
  };
  const bgp = bgpActive ? 'Active' : 'Disactive';
  const nat = natActive ? 'Active' : 'Disactive';
  const bgpColor = bgpActive ? 'green' : 'red';
  const natColor = natActive ? 'green' : 'red';
  return (
    <Group>
      <Rect {...{ x, y, width, height, fill: labelColor }} />
      <Text {...firstContent} />
      <Text {...{ ...secondContent, fontStyle: 'Bold' }} />
      <Text {...{ ...secondContent, x: x + smWidthLabel / 2 - 3, y: y + height / 3, text: bgp, align: 'left', fill: bgpColor }} />
      <Text {...{ ...thirdContent, fontStyle: 'Bold' }} />
      <Text {...{ ...thirdContent, x: x + smWidthLabel / 2 - 3, text: nat, align: 'left', fill: natColor }} />
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
