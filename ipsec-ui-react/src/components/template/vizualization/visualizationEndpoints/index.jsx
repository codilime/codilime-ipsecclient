import React from 'react';
import { Stage, Layer } from 'react-konva';
import { VisualizationIcon, VisualizationLine, VisualizationVrf } from 'template';

export const VisualizationEndpoints = ({ data, dimensions, status }) => {
  const { endpoints, client_name, physical_interface, vlan } = data;

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
    height: 55 + endpoints.length * 70,
    title: client_name,
    physical_interface,
    vlan,
    size: 8,
    endpoints,
    status,
    dimensions
  };

  const iconToVRfLine = {
    x: icon.x + icon.width / 2,
    y: icon.y + icon.height + 20,
    color: 'black',
    points: [0, 0, 0, 77.5, 47.5, 77.5]
  };
  if (!dimensions) {
    return <div>ładowanie</div>;
  }
  return (
    <Stage width={dimensions} height={endpoints.length * 100 + 170}>
      <Layer>
        <VisualizationIcon {...icon} />
        <VisualizationVrf {...vrfBox} />
        <VisualizationLine {...iconToVRfLine} />
      </Layer>
    </Stage>
  );
};
