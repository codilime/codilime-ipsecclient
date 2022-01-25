/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */

import { FC } from 'react';
import { VrfDataTypes } from 'interface/index';
import { Stage, Layer } from 'react-konva';
import { MetricsType } from 'interface/index';
import { VisualizationIcon, VisualizationLine, VisualizationVrf } from 'template';
import { colors } from '../visualizationConstants';

interface VisualizationEndpoints {
  dimensions: number;
  theme: string;
  hardware: boolean;
  data: VrfDataTypes;
  monitoring: MetricsType[];
}

export const VisualizationEndpoints: FC<VisualizationEndpoints> = ({ data, dimensions, monitoring, hardware, theme }) => {
  const { endpoint, client_name, vlan } = data;

  const getAmount = () => {
    if (vlan.length && endpoint) {
      return endpoint.length > vlan.length ? endpoint.length : vlan.length;
    }
    if (endpoint?.length) {
      return endpoint.length;
    }
    return 0;
  };

  const icon = {
    x: 45,
    y: 10,
    width: 40,
    height: 40,
    color: '#c3d7df',
    text: 'Cat9300(X)',
    theme
  };

  const hardwareBox = {
    x: hardware ? 0 : icon.x + icon.width + 10,
    y: hardware ? 0 : icon.y + icon.height + 40,
    width: 420,
    height: 100 + getAmount() * 100,
    title: client_name,
    size: 8,
    endpoint,
    dimensions,
    monitoring,
    vlan
  };
  const vrfBox = {
    x: hardware ? 0 : icon.x + icon.width + 10,
    y: hardware ? 0 : icon.y + icon.height + 40,
    width: 420,
    height: 60 + getAmount() * 100,
    title: client_name,
    size: 8,
    endpoint,
    dimensions,
    monitoring
  };

  const getVisualizationHeight = () => {
    if (vlan.length && endpoint !== null) {
      return endpoint.length > vlan.length ? endpoint.length * 100 : vlan.length * 105;
    }
    if (endpoint !== null) {
      return endpoint.length * 100;
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

  const endYOfVlans = () => {
    if (vlan.length) {
      return 108 + (vlan.length - 1) * 100 + getCenterVlan();
    }
    return 0;
  };

  const iconToVRfLine = {
    x: icon.x + icon.width / 2 - 3,
    y: icon.y + icon.height + 32,
    color: colors.lineColor,
    points: [0, 0, 0, endYOfVlans()]
  };

  if (hardware)
    return (
      <Stage width={dimensions} height={endpoint!.length * 110 + 100}>
        <Layer>
          <VisualizationVrf {...{ ...hardwareBox, hardware, theme }} />
        </Layer>
      </Stage>
    );

  return (
    <Stage width={dimensions} height={getVisualizationHeight() + 160}>
      <Layer>
        <VisualizationIcon {...icon} />
        <VisualizationVrf {...{ ...vrfBox, hardware, vlan, theme }} />
        <VisualizationLine {...iconToVRfLine} />
      </Layer>
    </Stage>
  );
};
