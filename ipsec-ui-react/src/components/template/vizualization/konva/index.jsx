import React, { useContext } from 'react';
import { Wrapper } from 'template';
import { Stage, Layer } from 'react-konva';
import { VisualizationIcon, VisualizationLine, VisualizationVrf } from 'template';
import { VrfsContext } from 'context';
import './styles.scss';

export const Visualization = () => {
  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;
  const {
    vrf: { data }
  } = useContext(VrfsContext);
  const { endpoints } = data;
  if (endpoints === null || !endpoints.length) {
    return <Wrapper title="Visualization">{emptyEndpoint}</Wrapper>;
  }

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
    title: data.client_name,
    size: 8,
    endpoints
  };

  const iconToVRfLine = {
    x: icon.x + icon.width / 2,
    y: icon.y + icon.height + 20,
    color: 'black',
    points: [0, 0, 0, 77.5, 45, 77.5]
  };

  return (
    <Wrapper title="Visualization">
      <Stage width={2000} height={700}>
        <Layer>
          <VisualizationIcon {...icon} />
          <VisualizationVrf {...vrfBox} />
          <VisualizationLine {...iconToVRfLine} />
        </Layer>
      </Stage>
    </Wrapper>
  );
};
