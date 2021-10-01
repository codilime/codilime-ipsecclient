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
