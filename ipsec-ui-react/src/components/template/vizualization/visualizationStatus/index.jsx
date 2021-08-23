import React from 'react';
import PropTypes from 'prop-types';
import { Group } from 'react-konva';
import { VisualizationEndpointLabel, VisualizationLine, VisualizationEndpointBox, VisualizationStatusText } from 'template';

export const VisualizationStatus = ({ x, height, lineStartX, lineStartY, lineWidth = 750, title, endpoint }) => {
  const firstLabel = {
    x,
    y: lineStartY - 25 / 2,
    width: 130,
    height: 25,
    title: 'Local IP',
    value: endpoint.local_ip
  };

  const secondLabel = {
    x: x + lineWidth - 390,
    y: lineStartY - 25 / 2,
    width: 130,
    height: 25,
    title: 'Peer IP',
    value: endpoint.peer_ip
  };

  const remoteSite = {
    x: x + 600,
    y: lineStartY - 25 / 2 - height / 2,
    width: 235,
    height,
    title,
    value: endpoint.remote_ip_sec
  };
  const contextStatus = {
    x: lineStartX,
    y: lineStartY - 30,
    text: 'Working',
    width: lineWidth - 20
  };

  const line = {
    color: 'green',
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
