import { FC } from 'react';
import { VisualizationOneLabel, VisualizationTwoLabel, VisualizationThreeLabel, VisualizationBox, VisualizationLine, VisualizationStatus, VisualizationIcon } from 'template';
import { variable } from '../visualizationConstants';
import { Group } from 'react-konva';
import { visualization } from 'interface/components';
import { endpointsType, vlanInterface, MetricsType } from 'interface/index';

interface VisualizationVrf extends visualization {
  title: string;
  dimensions: number;
  vlans?: vlanInterface[];
  vlan: string;
  lan_ip: string;
  height: number;
  width: number;
  endpoints: endpointsType[];
  metrics: MetricsType[];
  hardware: boolean;
}

export const VisualizationVrf: FC<VisualizationVrf> = ({ x, y, width, height, title, endpoints, dimensions, vlan = '', lan_ip = '', metrics, hardware }) => {
  const { smHeightLabel, lgHeightLabel, mdHeightLabel, smWidthLabel, paddingBox, heightHeader } = variable;
  const eachBreak = hardware ? 35 : 25;

  const label = {
    x: x + paddingBox,
    y: y + heightHeader + paddingBox - 5,
    width: smWidthLabel,
    height: lgHeightLabel,
    vlan,
    lan_ip,
    hardware
  };

  // const vlansLabel = vlans.map((vlans, index) => {
  //   const label = {
  //     x: x + paddingBox,
  //     y: y + heightHeader + paddingBox + index * 80,
  //     width: smWidthLabel,
  //     height: lgHeightLabel,
  //     vlan: vlans.vlan.toString(),
  //     lan_ip: vlans.lan_ip
  //   };

  //   return <VisualizationTwoLabel {...label} />;
  // });

  const hardwareXLabel = hardware ? x + paddingBox + smWidthLabel + 10 : x + paddingBox + smWidthLabel + eachBreak;
  const hardwareSecoundLabel = hardware ? lgHeightLabel + 10 : heightHeader;
  const hadwareYLabel = hardware ? y + height / 2 - hardwareSecoundLabel / 2 + paddingBox : y + height / 2 - hardwareSecoundLabel / 2 + paddingBox - 5;

  const secondLabel = {
    x: hardwareXLabel,
    y: hadwareYLabel,
    width: smWidthLabel,
    height: hardwareSecoundLabel,
    left: true,
    hardware
  };

  const hightOfX = (height - 55) / 2 - (20 + mdHeightLabel / 2) + 7.5;

  const findStatus = (remote: string) => {
    return metrics.filter((status: MetricsType) => status.remote_ip === remote)[0];
  };

  const endpointStatus = endpoints.map((endpoint, index) => {
    const hardwareLabel = hardware ? mdHeightLabel : lgHeightLabel;
    const textY = y + heightHeader + paddingBox + index * 75;
    const textX = x + width - paddingBox - smWidthLabel;
    const centerX = hardware ? textX - 40 : textX - 25;
    const centerY = y + height / 2 + smHeightLabel / 2;
    const centerLabel = textY + lgHeightLabel / 2;

    const status = findStatus(endpoint.remote_ip_sec);
    const hardwareYLabel = hardware ? textY + 10 : textY;

    const thirdLabel = {
      x: textX,
      y: hardwareYLabel,
      width: smWidthLabel,
      height: hardwareLabel,
      firstText: `Endpoint ${index + 1}`,
      bgpActive: endpoint.bgp,
      natActive: endpoint.nat!,
      hardware
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
    y: y + 50 + mdHeightLabel / 2,
    points: [0, 0, eachBreak / 2, 0, eachBreak / 2, hightOfX, eachBreak, hightOfX]
  };
  const hardwareLine = {
    x: x + paddingBox + 60,
    y: y + 50 + mdHeightLabel / 2,
    color: 'black',
    points: [0, 0, 30, 0, 30, hightOfX, 70, hightOfX]
  };

  const icon = {
    x: x + paddingBox + 15,
    y: y + heightHeader + paddingBox,
    width: 45,
    height: 45,
    color: '#c3d7df',
    text: 'Cat9300(X)'
  };
  if (hardware)
    return (
      <VisualizationBox {...{ x, y, width, height, title }}>
        <VisualizationIcon {...icon} />
        <VisualizationLine {...hardwareLine} />
        <VisualizationOneLabel {...secondLabel} />
        {endpointStatus}
      </VisualizationBox>
    );

  return (
    <VisualizationBox {...{ x, y, width, height, title }}>
      <VisualizationTwoLabel {...label} />
      <VisualizationLine {...line} />
      <VisualizationOneLabel {...secondLabel} />
      {endpointStatus}
    </VisualizationBox>
  );
};
