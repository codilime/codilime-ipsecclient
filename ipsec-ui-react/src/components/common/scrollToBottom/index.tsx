/*
 *     Copyright (c) 2021 Cisco and/or its affiliates
 *
 *     This software is licensed under the terms of the Cisco Sample Code License (CSCL)
 *     available here: https://developer.cisco.com/site/license/cisco-sample-code-license/
 */
import { useEffect, useRef, FC } from 'react';

interface ScrollToBottomType {
  change: string | null;
  auto: boolean;
}

export const ScrollToBottom: FC<ScrollToBottomType> = ({ change, auto }) => {
  const scroll = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
    }
  };

  useEffect(() => {
    if (auto) {
      scrollToBottom();
    }
  }, [auto, change]);

  return <div ref={scroll} />;
};
