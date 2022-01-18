import { FC } from 'react';
import { Group } from 'react-konva';
import { VisualizationEndpointLabel, VisualizationLine, VisualizationEndpointBox, VisualizationStatusText } from 'template';
import { EndpointsType, MetricsType } from 'interface/index';

interface VisualizationStatusType {
  x: number;
  height: number;
  lineStartX: number;
  lineStartY: number;
  lineWidth: number;
  title: string;
  monitoring: MetricsType;
  endpoint: EndpointsType;
  theme: string;
}

export const VisualizationStatus: FC<VisualizationStatusType> = ({ x, height, lineStartX, lineStartY, lineWidth, title, endpoint, monitoring, theme }) => {
  const firstLabel = {
    x: x + (lineWidth - 260) / 3 - 15,
    y: lineStartY - 18,
    width: 130,
    height: 36,
    text: 'Tunnel Local IP',
    value: endpoint.local_ip,
    theme
  };

  const secondLabel = {
    x: x + lineWidth - (lineWidth - 260) / 3 - 130,
    y: lineStartY - 18,
    width: 130,
    height: 36,
    text: 'Tunnel Peer IP',
    value: endpoint.peer_ip,
    theme
  };

  const remoteSite = {
    x: x + lineWidth,
    y: lineStartY - 25 / 2 - height / 2,
    width: 225,
    height,
    title,
    value: endpoint.remote_ip_sec,
    theme
  };

  const contextStatus = {
    x: lineStartX,
    y: lineStartY + 4,
    width: lineWidth,
    monitoring
  };

  const statusColor = (monitoring: MetricsType) => {
    if (monitoring) {
      switch (monitoring.status) {
        case 'up': {
          return 'green';
        }
        case 'down': {
          return 'red';
        }
        default:
          return 'gray';
      }
    }
  };

  const line = {
    color: statusColor(monitoring),
    points: [lineStartX, lineStartY, lineStartX + lineWidth + 15, lineStartY]
  };

  return (
    <Group>
      <VisualizationLine {...line} />
      <VisualizationStatusText {...contextStatus} />
      <VisualizationEndpointLabel {...firstLabel} />
      <VisualizationEndpointLabel {...secondLabel} />
      <VisualizationEndpointBox {...remoteSite} />
    </Group>
  );
};
