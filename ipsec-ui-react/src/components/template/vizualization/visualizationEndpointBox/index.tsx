import React, { FC } from 'react';
import { VisualizationBox, VisualizationEndpointLabel, VisualizationOneLabel } from 'template';
import { variable } from '../visualizationConstants';
import { VisualizationBoxTypeProps } from '../../../../interface/components';

export const VisualizationEndpointBox: FC<VisualizationBoxTypeProps> = ({ x, y, width, height, title, value }) => {
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
    width: 150,
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
