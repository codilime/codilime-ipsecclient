import { FC } from 'react';
import { VisualizationOneLabel, VisualizationTwoLabel, VisualizationThreeLabel, VisualizationBox, VisualizationLine, VisualizationStatus, VisualizationIcon } from 'template';
import { colors, variable } from '../visualizationConstants';
import { Group } from 'react-konva';
import { Visualization } from 'interface/components';
import { EndpointsType, VlanInterface, MetricsType } from 'interface/index';
import { VisualizationRouter } from '..';

interface VisualizationVrf extends Visualization {
  theme: string;
  title: string;
  dimensions: number;
  vlan: VlanInterface[];
  height: number;
  width: number;
  endpoint: EndpointsType[];
  monitoring: MetricsType[];
  hardware: boolean;
}

export const VisualizationVrf: FC<VisualizationVrf> = ({ x, y, width, height, title, endpoint, dimensions, monitoring, hardware, vlan, theme }) => {
  const { lgHeightLabel, mdHeightLabel, smWidthLabel, paddingBox, heightHeader } = variable;
  const eachBreak = hardware ? 35 : 25;

  const hardwareSecoundLabel = hardware ? lgHeightLabel + 40 : heightHeader;

  const hardwareLabel = {
    x: x + paddingBox + smWidthLabel + 20,
    y: y + height / 2 - hardwareSecoundLabel / 2 + 15,
    width: smWidthLabel,
    height: hardwareSecoundLabel,
    left: true,
    hardware,
    theme
  };

  const secondLabel = {
    x: x + width / 2 - 5,
    y: y + height / 2 + 20,
    width: 40,
    height: 40,
    left: true,
    hardware
  };

  const findStatus = (id: number) => {
    return monitoring.filter((status: MetricsType) => status.id === id)[0];
  };

  const getCenterEndpoints = () => {
    if (vlan.length > endpoint.length) {
      const amount = endpoint.length - vlan.length;
      return Math.abs(amount) * 50;
    }
    return 0;
  };

  const getCenterVlan = () => {
    if (vlan.length < endpoint.length) {
      const amount = endpoint.length - vlan.length;
      return Math.abs(amount) * 50;
    }
    return 0;
  };

  const endpointStatus = endpoint.map((endpoint, index) => {
    const textY = y + heightHeader + 25 + index * 100 + getCenterEndpoints();
    const textX = x + width - paddingBox - smWidthLabel;
    const centerX = hardware ? textX - 40 : textX - 70;
    const centerY = y + height / 2 + mdHeightLabel / 2 - 20;
    const centerLabel = hardware ? textY - 20 + mdHeightLabel : textY - 40 + mdHeightLabel;
    const firstBreak = hardware ? centerX + eachBreak / 1.5 : centerX + eachBreak + 5;
    const status = findStatus(endpoint.id!);
    const hardwareYLabel = hardware ? textY + 15 : textY;

    const thirdLabel = {
      x: textX,
      y: hardwareYLabel,
      width: smWidthLabel,
      height: mdHeightLabel,
      firstText: `Endpoint ${index + 1}`,
      bgpActive: endpoint.bgp,
      natActive: endpoint.nat!,
      hardware,
      theme
    };

    const line = {
      y: 0,
      x: 0,
      color: colors.lineColor,
      points: [centerX, centerY, firstBreak, centerY, firstBreak, centerLabel, centerX + eachBreak * 3, centerLabel]
    };
    const connectStatus = {
      x: x + width,
      height: 90,
      lineStartX: textX + smWidthLabel,
      lineStartY: centerLabel,
      title: `Remote Site ${index + 1}`,
      endpoint,
      lineWidth: hardware ? dimensions - 650 : dimensions - 750,
      monitoring: status,
      theme
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
    vlan.map(({ vlan, lan_ip }, index) => {
      const centerX = x - 32.5;
      const centerY = y + 65 + heightHeader + index * 100 + getCenterVlan();
      const label = {
        x: x + paddingBox,
        y: y + heightHeader + 15 + index * 100 + getCenterVlan(),
        width: smWidthLabel,
        height: 75,
        vlan: vlan.toString(),
        lan_ip,
        theme
      };
      const firstBreak = +paddingBox + smWidthLabel + eachBreak + 42.5;
      const labelCenter = y + height / 2 + paddingBox / 2 + 12.5;
      const line = {
        points: [centerX, centerY, centerX + firstBreak, centerY, centerX + firstBreak, labelCenter, centerX + firstBreak + 40, labelCenter]
      };

      return (
        <Group key={index}>
          <VisualizationLine {...line} />
          <VisualizationTwoLabel {...label} />
        </Group>
      );
    });

  const hardwareLine = {
    x: x + paddingBox + 100,
    y: y + height / 2 + 20,
    color: colors.lineColor,
    points: [0, 0, 75, 0]
  };

  const icon = {
    x: x + paddingBox + 30,
    y: y + height / 2 - 35,
    width: 40,
    height: 40,
    color: '#c3d7df',
    text: 'Cat9300(X)',
    theme
  };

  if (hardware)
    return (
      <VisualizationBox {...{ x, y, width, height, title }}>
        <VisualizationIcon {...icon} />
        <VisualizationLine {...hardwareLine} />
        <VisualizationOneLabel {...hardwareLabel} />
        {endpointStatus}
      </VisualizationBox>
    );
  return (
    <VisualizationBox {...{ x, y, width, height, title }}>
      {vlansLabel}
      <VisualizationRouter {...secondLabel} />
      {endpointStatus}
    </VisualizationBox>
  );
};
