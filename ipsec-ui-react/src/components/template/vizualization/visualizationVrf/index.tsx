import { FC } from 'react';
import { VisualizationOneLabel, VisualizationTwoLabel, VisualizationThreeLabel, VisualizationBox, VisualizationLine, VisualizationStatus, VisualizationIcon } from 'template';
import { variable } from '../visualizationConstants';
import { Group } from 'react-konva';
import { Visualization } from 'interface/components';
import { EndpointsType, VlanInterface, MetricsType } from 'interface/index';

interface VisualizationVrf extends Visualization {
  title: string;
  dimensions: number;
  vlan?: VlanInterface[];
  height: number;
  width: number;
  endpoint: EndpointsType[];
  monitoring: MetricsType[];
  hardware: boolean;
}

export const VisualizationVrf: FC<VisualizationVrf> = ({ x, y, width, height, title, endpoint, dimensions, monitoring, hardware, vlan = [] }) => {
  const { lgHeightLabel, mdHeightLabel, smWidthLabel, paddingBox, heightHeader } = variable;
  const eachBreak = hardware ? 35 : 25;

  const hardwareXLabel = hardware ? x + paddingBox + smWidthLabel + 20 : x + paddingBox + smWidthLabel + 30;
  const hardwareSecoundLabel = hardware ? lgHeightLabel + 40 : heightHeader;
  const hadwareYLabel = hardware ? y + height / 2 - hardwareSecoundLabel / 2 + 15 : y + height / 2 - hardwareSecoundLabel / 2 + paddingBox - 10;
  console.log(height / 2);
  const secondLabel = {
    x: hardwareXLabel,
    y: hadwareYLabel,
    width: smWidthLabel,
    height: hardwareSecoundLabel,
    left: true,
    hardware
  };

  const hightOfX = (height - 100) / 2 - (20 + mdHeightLabel / 2) + 5;

  const findStatus = (id: number) => {
    return monitoring.filter((status: MetricsType) => status.id === id)[0];
  };

  const getCenterEndpoints = () => {
    if (vlan.length > endpoint.length) {
      const amount = endpoint.length - vlan.length;
      return Math.abs(amount) * 40;
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

  const endpointStatus = endpoint.map((endpoint, index) => {
    console.log(getCenterEndpoints());
    const hardwareLabel = hardware ? mdHeightLabel : lgHeightLabel;
    const textY = y + heightHeader + 25 + index * 100 + getCenterEndpoints();
    const textX = x + width - paddingBox - smWidthLabel;
    const centerX = textX - 40;
    const centerY = y + height / 2 + hardwareLabel / 2 - 10;
    const centerLabel = textY + hardwareLabel;

    const status = findStatus(endpoint.id!);
    const hardwareYLabel = hardware ? textY + 25 : textY;

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
      y: 0,
      x: 0,
      color: 'black',
      points: [centerX, centerY, centerX + eachBreak / 1.5, centerY, centerX + eachBreak / 1.5, centerLabel, centerX + eachBreak * 2, centerLabel]
    };
    const connectStatus = {
      x: x + width,
      height: 90,
      lineStartX: textX + smWidthLabel,
      lineStartY: centerLabel,
      title: `Remote Site ${index + 1}`,
      endpoint,
      lineWidth: dimensions - 650,
      monitoring: status
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
    vlan &&
    vlan.map(({ vlan, lan_ip }, index) => {
      const centerX = x - 32.5;
      const centerY = y + 50 + mdHeightLabel / 2 + index * 80 + getCenterVlan();
      const label = {
        x: x + paddingBox,
        y: y + heightHeader + paddingBox / 2 + index * 80 + getCenterVlan(),
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
    x: x + paddingBox + 95,
    y: y + 70 + hardwareSecoundLabel / 2,
    color: 'black',
    points: [0, 0, 15, 0, 15, hightOfX - 5, 40, hightOfX - 5]
  };

  const icon = {
    x: x + paddingBox + 30,
    y: y + heightHeader + paddingBox + 10,
    width: 40,
    height: 40,
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
