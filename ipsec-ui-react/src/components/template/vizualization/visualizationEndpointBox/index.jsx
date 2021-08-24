import React from 'react';
import PropTypes from 'prop-types';
import { VisualizationBox, VisualizationEndpointLabel, VisualizationOneLabel } from 'template';
import { variable } from '../visualizationConstants';

export const VisualizationEndpointBox = ({ x, y, width, height, title, value }) => {
  const { paddingBox, heightHeader } = variable;
  const firstLabel = {
    x: x + paddingBox / 2,
    y: y + heightHeader + paddingBox / 2,
    width: 60,
    height: heightHeader,
    text: 'Ipsec'
  };
  const secondLabel = {
    x: x + paddingBox / 2 + 70,
    y: y + heightHeader + paddingBox / 2,
    width: 130,
    height: heightHeader,
    title: 'Remote IP',
    value
  };

  return (
    <VisualizationBox {...{ x, y, width, height, title }}>
      <VisualizationOneLabel {...firstLabel} />
      <VisualizationEndpointLabel {...secondLabel} />
    </VisualizationBox>
  );
};

VisualizationEndpointBox.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string
};
