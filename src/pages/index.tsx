import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const logoUrl = useBaseUrl('/img/slipway-logo.svg');
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          
        <img alt="Slipway Logo" src={logoUrl} width="48px"></img>
        <span style={{"margin": "0.75rem"}}>Slipway</span>
          
        </Heading>
        <p className="hero__subtitle">
          Write once, display anywhere.
        </p>
        <p>
          Slipway is an open source framework for displaying useful information on your devices.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Quick Start ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const Svg: React.ComponentType<React.ComponentProps<'svg'>> = require('@site/static/img/slipway-multi-device.svg').default;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <section className={clsx('hero hero--secondary', styles.heroSecondary)}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <Svg className={styles.multiDeviceSvg} height="100%" role="img"/>
              </div>
            </div>
            <div className="row">
              <div className={clsx('col col--4 margin-top--lg')}>
                <div className="card-demo">
                  <div className={clsx('card', styles.heroSecondaryCard)}>
                    <div className="card__header">
                      <h3>Display anywhere</h3>
                    </div>
                    <div className="card__body">
                      <p>
                        Slipway lets you <Link to="/docs/getting-started/create-your-first-rig">quickly</Link> create 
                        custom dashboards (called Rigs) that can be displayed
                        on almost any device with a screen. View them in browsers, as phone widgets, on eInk screens, and more.
                      </p>
                      <p>
                        If you have data in one place and want to display it in another place, Slipway is designed to do that
                        quickly and with minimum fuss.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={clsx('col col--4 margin-top--lg')}>
                <div className="card-demo">
                  <div className={clsx('card', styles.heroSecondaryCard)}>
                    <div className="card__header">
                      <h3>Reusable Components</h3>
                    </div>
                    <div className="card__body">
                      <p>
                        By utilizing an ecosystem of <Link to="/components">Components</Link> you can often create custom Rigs with just some JSON and
                        a small amount of code. If someone else has already done what you need, you might not
                        even need any code.
                      </p>
                      <p>
                        Rigs compose components together, allowing you to mix and match information to create dashboards
                        that are tailored to your needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={clsx('col col--4 margin-top--lg')}>
                <div className="card-demo">
                  <div className={clsx('card', styles.heroSecondaryCard)}>
                    <div className="card__header">
                      <h3>Information when you need it</h3>
                    </div>
                    <div className="card__body">
                      <p>
                        Using playlists, you can schedule Rigs to be displayed at different times of the day,
                        or on different days of the week.
                      </p>
                      <p>
                        Perhaps in the morning you want today's calendar alongside train departures, 
                        in the afternoon your house solar stats, and in the evening some movie recommendations.
                        Playlists make that trivial.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className={clsx('col col--4 margin-top--lg')}>
                <div className="card-demo">
                  <div className={clsx('card', styles.heroSecondaryCard)}>
                    <div className="card__header">
                      <h3>Designed for simple self hosting</h3>
                    </div>
                    <div className="card__body">
                      <p>
                        Slipway has been designed to make self hosting as simple, hassle
                        free, <Link to="/docs/basics/permissions">and safe</Link> as possible.
                      </p>
                      <p>
                        All you need is a cheap, basic server. There are no databases or other dependencies.
                        Slipway is deployed as a single binary with some static configuration,
                        or as a single Docker image.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={clsx('col col--4 margin-top--lg')}>
                <div className="card-demo">
                  <div className={clsx('card', styles.heroSecondaryCard)}>
                    <div className="card__header">
                      <h3>Language and renderer agnostic</h3>
                    </div>
                    <div className="card__body">
                      <p>
                        Slipway lets you write Components in Javascript or any language that compiles to WASM, such as Rust,
                        and mix and match within your Rigs.
                      </p>
                      <p>
                        Renderers are also just Components. Currently Slipway supports rendering using JSX, SVG, ECharts,
                        Adaptive Cards, or a mix of all of them.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={clsx('col col--4 margin-top--lg')}>
                <div className="card-demo">
                  <div className={clsx('card', styles.heroSecondaryCard)}>
                    <div className="card__header">
                      <h3>Supports TRMNL out of the box</h3>
                    </div>
                    <div className="card__body">
                      <p>
                        <Link to="/docs/using-with-trmnl/slipway-for-trmnl-devices">TRMNL devices</Link> are
                        affordable eInk screens for displaying anything you like.
                      </p>
                      <p>
                        Slipway supports the TRMNL API out of the box, so you can quickly get up and running displaying
                        your Rigs on your TRMNL devices while taking advantage of Slipway's flexible scheduling, playlists
                        and on-demand rendering.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <HomepageFeatures />
        <section className={clsx('hero hero--secondary', styles.heroSecondary)}>
          <div className="container" style={{"textAlign": "center"}}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/intro">
              Quick Start ⏱️
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
