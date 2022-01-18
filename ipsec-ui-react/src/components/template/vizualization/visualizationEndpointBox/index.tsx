import { FC } from 'react';
import { VisualizationBox, VisualizationOneLabel, VisualizationBoxLabel } from 'template';
import { variable } from '../visualizationConstants';
import { Visualization } from 'interface/components';

interface VisualizationEndpointBoxType extends Visualization {
  theme: string;
  title: string;
  value: string;
}

export const VisualizationEndpointBox: FC<VisualizationEndpointBoxType> = ({ x, y, width, height, title, value, theme }) => {
  const { paddingBox, heightHeader } = variable;

  const firstLabel = {
    x,
    y: y + heightHeader + paddingBox,
    width: 60,
    height: heightHeader,
    theme
  };

  const secondLabel = {
    x: x + 65,
    y: y + heightHeader + paddingBox / 2,
    width: 150,
    height: 40,
    text: 'Remote IP',
    value,
    theme
  };

  return (
    <VisualizationBox {...{ x, y, width, height, title }}>
      <VisualizationOneLabel {...firstLabel} />
      <VisualizationBoxLabel {...secondLabel} />
    </VisualizationBox>
  );
};
