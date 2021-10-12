import { FC } from 'react';
import { VisualizationOneLabel, VisualizationTwoLabel, VisualizationThreeLabel, VisualizationBox, VisualizationLine, VisualizationStatus, VisualizationIcon } from 'template';
import { variable } from '../visualizationConstants';
import { Group } from 'react-konva';
import { Visualization } from 'interface/components';
import { EndpointsType, VlanInterface, MetricsType } from 'interface/index';

interface VisualizationVrf extends Visualization {
  title: string;
  dimensions: number;
  vlans?: VlanInterface[] | null;
  height: number;
  width: number;
  endpoints: EndpointsType[];
  metrics: MetricsType[];
  hardware: boolean;
}

export const VisualizationVrf: FC<VisualizationVrf> = ({ x, y, width, height, title, endpoints, dimensions, metrics, hardware, vlans = [] }) => {
  const { smHeightLabel, lgHeightLabel, mdHeightLabel, smWidthLabel, paddingBox, heightHeader } = variable;
  const eachBreak = hardware ? 35 : 25;

  const hardwareXLabel = hardware ? x + paddingBox + smWidthLabel + 10 : x + paddingBox + smWidthLabel + 30;
  const hardwareSecoundLabel = hardware ? lgHeightLabel + 10 : heightHeader;
  const hadwareYLabel = hardware ? y + height / 2 - hardwareSecoundLabel / 2 + paddingBox - 5 : y + height / 2 - hardwareSecoundLabel / 2 + paddingBox - 10;

  const secondLabel = {
    x: hardwareXLabel,
    y: hadwareYLabel,
    width: smWidthLabel,
    height: hardwareSecoundLabel,
    left: true,
    hardware
  };

  const hightOfX = (height - 55) / 2 - (20 + mdHeightLabel / 2) + 7.5;

  const findStatus = (id: string) => {
    return metrics.filter((status: MetricsType) => status.id === id)[0];
  };

  const getCenterEndpoints = () => {
    if (vlans && vlans.length && endpoints && endpoints.length) {
      const amount = endpoints.length - vlans.length;
      return Math.abs(amount) * 40;
    }
    return 0;
  };

  const endpointStatus = endpoints.map((endpoint, index) => {
    const hardwareLabel = hardware ? mdHeightLabel : lgHeightLabel;
    const textY = y + heightHeader + paddingBox + index * 80 + getCenterEndpoints();
    const textX = x + width - paddingBox - smWidthLabel;
    const centerX = textX - 40;
    const centerY = y + height / 2 + smHeightLabel / 2 - 2.5;
    const centerLabel = textY + lgHeightLabel / 2;

    const status = findStatus(endpoint.id!);
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
      points: [centerX, centerY, centerX + eachBreak / 1.5, centerY, centerX + eachBreak / 1.5, centerLabel, centerX + eachBreak * 2, centerLabel]
    };
    const connectStatus = {
      x: x + width,
      height: 70,
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

  const vlansLabel =
    !hardware &&
    vlans &&
    vlans.map(({ vlan, lan_ip }, index) => {
      const centerX = x - 32.5;
      const centerY = y + 50 + mdHeightLabel / 2 + index * 80 + 4;
      const label = {
        x: x + paddingBox,
        y: y + heightHeader + paddingBox / 2 + index * 80 + 4,
        width: smWidthLabel,
        height: lgHeightLabel,
        vlan: vlan.toString(),
        lan_ip: lan_ip
      };
      const firstBreak = +paddingBox + smWidthLabel + eachBreak + 42.5;
      const line = {
        points: [centerX, centerY, centerX + firstBreak, centerY, centerX + firstBreak, y + height / 2 + paddingBox / 2, centerX + firstBreak + 40, y + height / 2 + paddingBox / 2]
      };

      return (
        <Group key={index}>
          <VisualizationLine {...line} />
          <VisualizationTwoLabel {...label} />
        </Group>
      );
    });

  const hardwareLine = {
    x: x + paddingBox + 60,
    y: y + 50 + mdHeightLabel / 2,
    color: 'black',
    points: [0, 0, 30, 0, 30, hightOfX - 2.5, 70, hightOfX - 2.5]
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
      {vlansLabel}
      <VisualizationOneLabel {...secondLabel} />
      {endpointStatus}
    </VisualizationBox>
  );
};
