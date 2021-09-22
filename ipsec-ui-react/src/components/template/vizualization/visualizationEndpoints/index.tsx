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
  const { endpoints, client_name, vlan, lan_ip } = data;

  const icon = {
    x: 30,
    y: 30,
    width: 45,
    height: 45,
    color: '#c3d7df',
    text: 'Cat9300(X)'
  };
  const vrfBox = {
    x: hardware ? 40 : icon.x + icon.width + 10,
    y: hardware ? 40 : icon.y + icon.height + 40,
    width: 380,
    height: 40 + endpoints!.length * 75,
    title: client_name,
    vlan: vlan.toString(),
    lan_ip,
    size: 8,
    endpoints: endpoints!,
    dimensions,
    metrics
  };

  const iconToVRfLine = {
    x: icon.x + icon.width / 2,
    y: icon.y + icon.height + 20,
    color: 'black',
    points: [0, 0, 0, 87.5, 47.5, 87.5]
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
    <Stage width={dimensions} height={endpoints!.length * 100 + 170}>
      <Layer>
        <VisualizationIcon {...{ ...icon, hardware }} />
        <VisualizationVrf {...{ ...vrfBox, hardware }} />
        <VisualizationLine {...iconToVRfLine} />
      </Layer>
    </Stage>
  );
};
