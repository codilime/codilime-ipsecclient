import { FC, useMemo } from 'react';
import { useAppContext } from 'hooks/';
import './styles.scss';

interface AboutListType {
  title: string;
  value: string;
  link?: string;
}

export const About: FC = () => {
  const {
    context: { version, switchVersion }
  } = useAppContext();

  const listData: AboutListType[] = [
    { title: 'Version:', value: version },
    { title: 'Documentation:', value: 'Link', link: 'dsadsadsa' },
    { title: 'Switch version:', value: switchVersion }
  ];

  const displayList = useMemo(
    () =>
      listData.map(({ title, value, link }) => (
        <li key={title} className="about__item">
          <h3 className="about__title">{title}</h3>
          {!link && <span className="about__value">{value}</span>}
          {link && (
            <a href={link} target="_blank" className="about__link">
              {value}
            </a>
          )}
        </li>
      )),
    [listData, version, switchVersion]
  );

  return (
    <div className="about">
      <ul className="about__list">{displayList}</ul>
    </div>
  );
};
