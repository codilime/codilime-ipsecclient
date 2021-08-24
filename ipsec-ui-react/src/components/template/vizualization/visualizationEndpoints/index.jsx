import React from 'react';
import { Stage, Layer } from 'react-konva';
import { VisualizationIcon, VisualizationLine, VisualizationVrf } from 'template';

export const VisualizationEndpoints = ({ data, dimensions }) => {
  const { endpoints, client_name } = data;
  const icon = {
    x: 30,
    y: 30,
    width: 40,
    height: 40,
    color: '#c3d7df',
    text: 'Gigabyth 00'
  };
  const vrfBox = {
    x: icon.x + icon.width + 10,
    y: icon.y + icon.height + 40,
    width: 320,
    height: 55 + endpoints.length * 70,
    title: client_name,
    size: 8,
    endpoints,
    dimensions
  };

  const iconToVRfLine = {
    x: icon.x + icon.width / 2,
    y: icon.y + icon.height + 20,
    color: 'black',
    points: [0, 0, 0, 77.5, 45, 77.5]
  };
  if (!dimensions) {
    return <div>ładowanie</div>;
  }
  return (
    <Stage width={dimensions} height={endpoints.length * 80 + 170}>
      <Layer>
        <VisualizationIcon {...icon} />
        <VisualizationVrf {...vrfBox} />
        <VisualizationLine {...iconToVRfLine} />
      </Layer>
    </Stage>
  );
};
