import React from 'react';
import PropTypes from 'prop-types';
import { VisualizationBox, VisualizationEndpointLabel, VisualizationOneLabel } from 'template';

export const VisualizationEndpointBox = ({ x, y, width, height, title, value }) => {
  const firstLabel = {
    x: x + 15 / 2,
    y: y + 25 + 15 / 2,
    width: 60,
    height: 25,
    text: 'Ipsec'
  };
  const secondLabel = {
    x: x + 15 / 2 + 70,
    y: y + 25 + 15 / 2,
    width: 150,
    height: 25,
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
