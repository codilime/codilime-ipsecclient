import { FC } from 'react';
import { VisualizationBox, VisualizationEndpointLabel, VisualizationOneLabel } from 'template';
import { variable } from '../visualizationConstants';
import { visualization } from 'interface/components';

interface visualizationEndpointBoxType extends visualization {
  title: string;
  value: string;
}

export const VisualizationEndpointBox: FC<visualizationEndpointBoxType> = ({ x, y, width, height, title, value }) => {
  const { paddingBox, heightHeader } = variable;

  const firstLabel = {
    x,
    y: y + heightHeader + paddingBox / 2 + 2.5,
    width: 60,
    height: heightHeader
  };
  const secondLabel = {
    x: x + 65,
    y: y + heightHeader + paddingBox / 2 - 2.5,
    width: 150,
    height: 35,
    title: 'Remote IP',
    value,
    color: 'white'
  };

  return (
    <VisualizationBox {...{ x, y, width, height, title }}>
      <VisualizationOneLabel {...firstLabel} />
      <VisualizationEndpointLabel {...secondLabel} />
    </VisualizationBox>
  );
};
