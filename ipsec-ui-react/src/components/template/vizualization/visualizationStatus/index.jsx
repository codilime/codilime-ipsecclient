import React from 'react';
import PropTypes from 'prop-types';
import { Group } from 'react-konva';
import { VisualizationEndpointLabel, VisualizationLine, VisualizationEndpointBox, VisualizationStatusText } from 'template';
import { variable } from '../visualizationConstants';
const { mdHeightLabel } = variable;

export const VisualizationStatus = ({ x, height, lineStartX, lineStartY, lineWidth, title, endpoint, status }) => {
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
    x: x + lineWidth - 15,
    y: lineStartY - 25 / 2 - height / 2,
    width: 235,
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

  const statusColor = (status) => {
    switch (status) {
      case 'ACTIVE': {
        return 'green';
      }
      case 'DOWN': {
        return 'red';
      }
      default:
        return 'gray';
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

VisualizationStatus.propTypes = {
  x: PropTypes.number,
  lineStartX: PropTypes.number,
  lineStartY: PropTypes.number,
  lineWidth: PropTypes.number,
  height: PropTypes.number,
  title: PropTypes.string,
  endpoint: PropTypes.any
};
