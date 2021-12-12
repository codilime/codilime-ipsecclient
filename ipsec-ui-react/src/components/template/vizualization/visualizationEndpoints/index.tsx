import { FC } from 'react';
import { VrfDataTypes } from 'interface/index';
import { Stage, Layer } from 'react-konva';
import { MetricsType } from 'interface/index';
import { VisualizationIcon, VisualizationLine, VisualizationVrf, Cube } from 'template';

interface VisualizationEndpoints {
  dimensions: number;
  hardware: boolean;
  data: VrfDataTypes;
  monitoring: MetricsType[];
}

export const VisualizationEndpoints: FC<VisualizationEndpoints> = ({ data, dimensions, monitoring, hardware }) => {
  const { endpoint, client_name, vlan } = data;
  const getAmount = () => {
    if (vlan.length && endpoint) {
      return endpoint.length > vlan.length ? endpoint.length : vlan.length;
    }
    if (endpoint?.length) {
      return endpoint.length;
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
    endpoint,
    dimensions,
    monitoring
  };

  const getVisualizationHeight = () => {
    if (vlan.length && endpoint !== null) {
      return endpoint.length > vlan.length ? endpoint.length * 100 : vlan.length * 100;
    }
    if (endpoint !== null) {
      return endpoint.length * 100;
    }
    return 0;
  };

  const getCenterVlan = () => {
    if (vlan.length < endpoint.length) {
      const amount = endpoint.length - vlan.length;
      return Math.abs(amount) * 40;
    }
    return 0;
  };

  const endYOfVlans = () => {
    if (vlan.length) {
      return 87.5 + (vlan.length - 1) * 80 + getCenterVlan();
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
      <Stage width={dimensions} height={endpoint!.length * 90 + 90}>
        <Layer>
          <VisualizationVrf {...{ ...vrfBox, hardware }} />
        </Layer>
      </Stage>
    );

  return (
    <Stage width={dimensions} height={getVisualizationHeight() + 170}>
      <Layer>
        <VisualizationIcon {...{ ...icon, hardware }} />
        <VisualizationVrf {...{ ...vrfBox, hardware, vlan }} />
        <VisualizationLine {...iconToVRfLine} />
      </Layer>
    </Stage>
  );
};
