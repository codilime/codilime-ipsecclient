import React from 'react';
import { useToggle } from 'hooks';
import { Popup, Wrapper } from 'template';
import './styles.scss';
import { EachError } from '../../notifications';

export const PopupNotification = ({ open, handleToggle }) => {
  //   const { open, handleToggle } = useToggle();
  return (
    <Popup {...{ open, handleToggle, title: 'Notifications' }}>
      <section className="notifications">
        <Wrapper {...{ title: 'Errors', className: 'notifications__wrapper' }}>
          <header className="notifications__header">
            <div className="notifications__time">Time</div>
            <div className="notifications__response">Response</div>
          </header>
          <EachError time="19.11.2021" error="przykładowy error" />
          <EachError time="19.11.2021" error="przykładowy error" />
          <EachError time="19.11.2021" error="przykładowy error" />
          <EachError time="19.11.2021" error="przykładowy error" />
          <EachError time="19.11.2021" error="przykładowy error" />
          <EachError time="19.11.2021" error="przykładowy error" />
          <EachError time="19.11.2021" error="przykładowy error" />
          <EachError time="19.11.2021" error="przykładowy error" />
          <EachError time="19.11.2021" error="przykładowy error" />
        </Wrapper>
      </section>
    </Popup>
  );
};
