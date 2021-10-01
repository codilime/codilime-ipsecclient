import { FC } from 'react';
import { vrfDataTypes } from 'interface/index';
import { Stage, Layer } from 'react-konva';
import { MetricsType } from 'interface/index';
import { VisualizationIcon, VisualizationLine, VisualizationVrf, Cube } from 'template';

interface visualizationEndpoints {
  dimensions: number;
  hardware: boolean;
  data: vrfDataTypes;
  metrics: MetricsType[];
}

export const VisualizationEndpoints: FC<visualizationEndpoints> = ({ data, dimensions, metrics, hardware }) => {
  const { endpoints, client_name, vlans } = data;
  const getAmount = () => {
    if (vlans !== null && endpoints !== null) {
      return endpoints.length > vlans.length ? endpoints.length : vlans.length;
    }
    if (endpoints !== null) {
      return endpoints.length;
    }
    return 0;
  };

  const icon = {
    x: 30,
    y: 30,
    width: 45,
    height: 45,
    color: '#c3d7df',
    text: 'Cat9300(X)'
  };
  const vrfBox = {
    x: hardware ? 60 : icon.x + icon.width + 10,
    y: hardware ? 40 : icon.y + icon.height + 40,
    width: 380,
    height: 40 + getAmount() * 80,
    title: client_name,
    size: 8,
    endpoints: endpoints!,
    dimensions,
    metrics
  };

  const getVisualizationHeight = () => {
    if (vlans !== null && endpoints !== null) {
      return endpoints.length > vlans.length ? endpoints.length * 100 : vlans.length * 100;
    }
    if (endpoints !== null) {
      return endpoints.length * 100;
    }
    return 0;
  };

  const endYOfVlans = () => {
    if (vlans) {
      return 65 + (vlans?.length - 1) * 80 + 55 / 2;
    }
    return 0;
  };

  const iconToVRfLine = {
    x: icon.x + icon.width / 2,
    y: icon.y + icon.height + 20,
    color: 'black',
    points: [0, 0, 0, endYOfVlans()]
  };

  if (!dimensions) {
    return <Cube loading={false} />;
  }
  if (hardware)
    return (
      <Stage width={dimensions} height={endpoints!.length * 90 + 90}>
        <Layer>
          <VisualizationVrf {...{ ...vrfBox, hardware }} />
        </Layer>
      </Stage>
    );

  return (
    <Stage width={dimensions} height={getVisualizationHeight() + 170}>
      <Layer>
        <VisualizationIcon {...{ ...icon, hardware }} />
        <VisualizationVrf {...{ ...vrfBox, hardware, vlans }} />
        <VisualizationLine {...iconToVRfLine} />
      </Layer>
    </Stage>
  );
};
