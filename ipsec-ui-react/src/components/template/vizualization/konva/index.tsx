import { FC, useRef, useEffect, useState } from 'react';
import { Wrapper, VisualizationEndpoints } from 'template';
import { MetricsType } from 'interface/index';
import { useAppContext, useFetchData, useThemeContext, useWindowDimensions } from 'hooks/';
import './styles.scss';
import { Dotted } from '../../loading';

export const Visualization: FC = () => {
  const { width } = useWindowDimensions();
  const [themeloading, setThemeLoading] = useState(true);
  const { theme } = useThemeContext();
  const {
    context: { data, hardware, loading }
  } = useAppContext();

  const [monitoring, setMonitoring] = useState<MetricsType[]>([]);
  const { fetchEndpointStatus } = useFetchData();
  const [dimensions, setDimensions] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);
  const { endpoint } = data;

  const emptyEndpoint = <div className="visualization__empty">Add endpoints to vizualize them</div>;

  useEffect(() => {
    if (wrapper.current) {
      setDimensions(wrapper.current.offsetWidth);
    }
  }, [wrapper, width]);

  const handleFetchStatus = async () => {
    if (!data.id || endpoint === null || !endpoint.length) return;
    const status = await fetchEndpointStatus(data.id);

    setMonitoring(status.monitoring[0].endpoint);
  };

  useEffect(() => {
    if (data.active && !loading) handleFetchStatus();
  }, [data]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (data.active) handleFetchStatus();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [data]);

  useEffect(() => {
    setThemeLoading(true);
    const timeout = setTimeout(() => {
      setThemeLoading(false);
    }, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [theme]);

  const context = !endpoint.length ? emptyEndpoint : <VisualizationEndpoints {...{ data, dimensions, monitoring, hardware, theme }} />;

  return (
    <Wrapper {...{ className: 'visualization__wrapper' }} title="Visualization" references={wrapper}>
      {!themeloading ? context : <Dotted {...{ loading: themeloading }} />}
    </Wrapper>
  );
};
