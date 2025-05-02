import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '1. Components gather and format data',
    Svg: require('@site/static/img/components-graphic.svg').default,
    description: (
      <>
        Write your own Components, or use Components created by others.
        Components can be written in Javascript or any language which compiles to
        WASM, such as Rust.
      </>
    ),
  },
  {
    title: '2. Rigs compose Components together',
    Svg: require('@site/static/img/rig-graphic.svg').default,
    description: (
      <>
        A Rig is a set of Components rigged together so that data flows from one Component to the next,
        with the final output being a dashboard showing what matters to you.
      </>
    ),
  },
  {
    title: '3. Slipway hosts Rigs for your devices',
    Svg: require('@site/static/img/slipway-graphic.svg').default,
    description: (
      <>
        Slipway lets you <Link to="/docs/getting-started/create-your-first-rig">quickly</Link> and <Link to="/docs/basics/permissions">securely</Link> run 
        and host Rigs on your local infrastructure or in the cloud, making them available to all your devices.
        Playlists let you serve different Rigs to a device depending on the day and time.
      </>
    ),
  },
  {
    title: '4. See the information you want, where you want it',
    Svg: require('@site/static/img/devices-graphic.svg').default,
    description: (
      <>
        Display your Rigs on any device with a screen,
        including <Link to="/docs/using-with-trmnl/slipway-for-trmnl-devices">eInk screens</Link>,
        phone widgets, monitor arrays , and more.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--6')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
          <Heading as="h3">How does it work?</Heading>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
