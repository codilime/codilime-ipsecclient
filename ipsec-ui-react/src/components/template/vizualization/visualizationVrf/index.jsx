import React from 'react';
import PropTypes from 'prop-types';
import { VisualizationOneLabel, VisualizationTwoLabel, VisualizationThreeLabel, VisualizationBox, VisualizationLine, VisualizationStatus } from 'template';
import { variable } from '../visualizationConstants';
import { Group } from 'react-konva';

export const VisualizationVrf = ({ x, y, width, height, title, endpoints, dimensions }) => {
  const { smHeightLabel, lgHeightLabel, mdHeightLabel, smWidthLabel, paddingBox, heightHeader } = variable;
  const eachBreak = 25;

  const firstLabel = {
    x: x + paddingBox,
    y: y + heightHeader + paddingBox,
    width: smWidthLabel,
    height: mdHeightLabel,
    firstText: 'eth0-YYY',
    secondText: 'eth0-YYY'
  };

  const secondLabel = {
    x: x + paddingBox + smWidthLabel + eachBreak,
    y: y + height / 2,
    width: smWidthLabel,
    height: smHeightLabel,
    text: 'x'
  };

  const hightOfX = (height - 20) / 2 - (20 + mdHeightLabel / 2);

  const endpointStatus = endpoints.map((endpoint, index) => {
    const textY = y + heightHeader + paddingBox + index * smWidthLabel;
    const textX = x + width - paddingBox - smWidthLabel;
    const centerX = textX - 25;
    const centerY = y + height / 2 + smHeightLabel / 2 + 2.5;
    const centerLabel = textY + lgHeightLabel / 2;

    const thirdLabel = {
      x: textX,
      y: textY,
      width: smWidthLabel,
      height: lgHeightLabel,
      firstText: `Ipsec ${index + 1}`,
      bgpActive: endpoint.bgp,
      natActive: endpoint.nat
    };

    const line = {
      color: 'black',
      points: [centerX, centerY, centerX + eachBreak / 2, centerY, centerX + eachBreak / 2, centerLabel, centerX + eachBreak + 10, centerLabel]
    };
    const status = {
      x: x + width,
      height: 65,
      lineStartX: textX + smWidthLabel,
      lineStartY: centerLabel,
      title: `Remote Site ${index + 1}`,
      endpoint,
      lineWidth: dimensions - 620
    };

    return (
      <Group key={index}>
        <VisualizationLine {...line} />
        <VisualizationThreeLabel {...thirdLabel} />
        <VisualizationStatus {...status} />
      </Group>
    );
  });

  const line = {
    x: x + paddingBox + smWidthLabel,
    y: y + 40 + mdHeightLabel / 2,
    color: 'black',
    points: [0, 0, eachBreak / 2, 0, eachBreak / 2, hightOfX, eachBreak, hightOfX]
  };

  return (
    <VisualizationBox {...{ x, y, width, height, title }}>
      <VisualizationTwoLabel {...firstLabel} />
      <VisualizationLine {...line} />
      <VisualizationOneLabel {...secondLabel} />
      {endpointStatus}
    </VisualizationBox>
  );
};

VisualizationVrf.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  endpoints: PropTypes.array,
  dimensions: PropTypes.number
};
