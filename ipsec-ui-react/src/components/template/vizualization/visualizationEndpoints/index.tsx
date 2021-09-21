import { FC } from 'react';
import { vrfDataTypes } from 'interface/index';
import { Stage, Layer } from 'react-konva';
import { MetricsType } from 'interface/index';
import { VisualizationIcon, VisualizationLine, VisualizationVrf, Cube } from 'template';

interface visualizationEndpoints {
  dimensions: number;
  data: vrfDataTypes;
  metrics: MetricsType[];
}

export const VisualizationEndpoints: FC<visualizationEndpoints> = ({ data, dimensions, metrics }) => {
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
    x: icon.x + icon.width + 10,
    y: icon.y + icon.height + 40,
    width: 380,
    height: 55 + endpoints!.length * 75,
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
    points: [0, 0, 0, 92.5, 47.5, 92.5]
  };

  if (!dimensions) {
    return <Cube loading={false} />;
  }
  return (
    <Stage width={dimensions} height={endpoints!.length * 100 + 170}>
      <Layer>
        <VisualizationIcon {...icon} />
        <VisualizationVrf {...vrfBox} />
        <VisualizationLine {...iconToVRfLine} />
      </Layer>
    </Stage>
  );
};
