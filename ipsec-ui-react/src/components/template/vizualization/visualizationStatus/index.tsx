import { FC } from 'react';
import { Group } from 'react-konva';
import { VisualizationEndpointLabel, VisualizationLine, VisualizationEndpointBox, VisualizationStatusText } from 'template';
import { variable } from '../visualizationConstants';
import { EndpointsType, MetricsType } from 'interface/index';
const { mdHeightLabel } = variable;

interface VisualizationStatusType {
  x: number;
  height: number;
  lineStartX: number;
  lineStartY: number;
  lineWidth: number;
  title: string;
  status: MetricsType;
  endpoint: EndpointsType;
}

export const VisualizationStatus: FC<VisualizationStatusType> = ({ x, height, lineStartX, lineStartY, lineWidth, title, endpoint, status }) => {
  const firstLabel = {
    x: x + (lineWidth - 260) / 3 - 15,
    y: lineStartY - mdHeightLabel / 2,
    width: 130,
    height: mdHeightLabel,
    title: 'Tunnel Local IP',
    value: endpoint.local_ip
  };

  const secondLabel = {
    x: x + lineWidth - (lineWidth - 260) / 3 - 130,
    y: lineStartY - mdHeightLabel / 2,
    width: 130,
    height: mdHeightLabel,
    title: 'Tunnel Peer IP',
    value: endpoint.peer_ip
  };

  const remoteSite = {
    x: x + lineWidth - 35,
    y: lineStartY - 25 / 2 - height / 2,
    width: 225,
    height,
    title,
    value: endpoint.remote_ip_sec
  };

  const contextStatus = {
    x: lineStartX,
    y: lineStartY - 30,
    width: lineWidth,
    status
  };

  const statusColor = (status: MetricsType) => {
    if (status) {
      switch (status.sa_status) {
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
    color: statusColor(status),
    points: [lineStartX, lineStartY, lineStartX + lineWidth, lineStartY]
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
