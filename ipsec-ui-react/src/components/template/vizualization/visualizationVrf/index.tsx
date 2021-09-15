import { FC } from 'react';
import { VisualizationOneLabel, VisualizationTwoLabel, VisualizationThreeLabel, VisualizationBox, VisualizationLine, VisualizationStatus } from 'template';
import { variable } from '../visualizationConstants';
import { Group } from 'react-konva';
import { visualization } from 'interface/components';
import { endpointsType } from 'interface/index';

interface VisualizationVrf extends visualization {
  title: string;
  dimensions: number;
  physical_interface: string;
  vlan: string;
  height: number;
  width: number;
  endpoints: endpointsType[];
}

export const VisualizationVrf: FC<VisualizationVrf> = ({ x, y, width, height, title, endpoints, dimensions, physical_interface, vlan }) => {
  const { smHeightLabel, lgHeightLabel, mdHeightLabel, smWidthLabel, paddingBox, heightHeader } = variable;
  const eachBreak = 25;

  const firstLabel = {
    x: x + paddingBox,
    y: y + heightHeader + paddingBox,
    width: smWidthLabel,
    height: mdHeightLabel,
    firstText: physical_interface,
    secondText: `VLAN`,
    vlan
  };

  const secondLabel = {
    x: x + paddingBox + smWidthLabel + eachBreak,
    y: y + height / 2 - 4,
    width: smWidthLabel,
    height: heightHeader,
    router: true
  };

  const hightOfX = (height - 20) / 2 - (20 + mdHeightLabel / 2);

  const endpointStatus = endpoints.map((endpoint, index) => {
    const textY = y + heightHeader + paddingBox + index * 80;
    const textX = x + width - paddingBox - smWidthLabel;
    const centerX = textX - 25;
    const centerY = y + height / 2 + smHeightLabel / 2 ;
    const centerLabel = textY + lgHeightLabel / 2;
    const status = 'ACTIVE';
    const thirdLabel = {
      x: textX,
      y: textY,
      width: smWidthLabel,
      height: lgHeightLabel,
      firstText: `Endpoint ${index + 1}`,
      bgpActive: endpoint.bgp,
      natActive: endpoint.nat!
    };

    const line = {
      color: 'black',
      points: [centerX, centerY, centerX + eachBreak / 2, centerY, centerX + eachBreak / 2, centerLabel, centerX + eachBreak + 10, centerLabel]
    };
    const connectStatus = {
      x: x + width,
      height: 65,
      lineStartX: textX + smWidthLabel,
      lineStartY: centerLabel,
      title: `Remote Site ${index + 1}`,
      endpoint,
      lineWidth: dimensions - 700,
      status
    };

    return (
      <Group key={index}>
        <VisualizationLine {...line} />
        <VisualizationThreeLabel {...thirdLabel} />
        <VisualizationStatus {...connectStatus} />
      </Group>
    );
  });

  const line = {
    x: x + paddingBox + smWidthLabel,
    y: y + 38 + mdHeightLabel / 2,
    color: 'black',
    points: [0, 0, eachBreak / 2, 0, eachBreak / 2, hightOfX, eachBreak, hightOfX]
  };

  return (
    <VisualizationBox {...{ x, y, width, height, title }}>
      <VisualizationTwoLabel {...firstLabel} />
      <VisualizationLine {...line} />
      <VisualizationOneLabel {...secondLabel} />
      {endpointStatus}
    </VisualizationBox>
  );
};
