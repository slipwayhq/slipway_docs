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
          Slipway is an open source framework for displaying useful information on your devices,
          from eInk screens to phones to monitor walls.
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
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <section className="container margin-top--lg">
          <div className="row">
          <div className={clsx('col col--4 margin-top--lg')}>
              <div className="card-demo">
                <div className="card">
                  <div className="card__header">
                    <h3>Display Anywhere, Easily</h3>
                  </div>
                  <div className="card__body">
                    <p>
                      Slipway lets you quickly create custom dashboards (called Rigs) that can be displayed
                      on almost any device with a display.
                    </p>
                    <p>
                      If you have data in one place and want to display it in another place, Slipway is designed to do that with
                      minimum fuss, minimum code, and maximum reuse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={clsx('col col--4 margin-top--lg')}>
              <div className="card-demo">
                <div className="card">
                  <div className="card__header">
                    <h3>Minimum Code, Maximum Reuse</h3>
                  </div>
                  <div className="card__body">
                    <p>
                      Slipway supports an ecosystem of Components that take care of the complicated, repetitive,
                      or boring tasks, such as rendering, formatting or fetching data from common APIs.
                    </p>
                    <p>
                      You can often create Rigs in pure JSON, composing together existing Components,
                      but if a custom Component is required then it often only needs a small amount of code,
                      written in a language of your choice.
                    </p>
                    <p>
                      Slipway lets you write Components in Javascript or any language that compiles to WASM, such as Rust,
                      and mix and match them in your Rigs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={clsx('col col--4 margin-top--lg')}>
              <div className="card-demo">
                <div className="card">
                  <div className="card__header">
                    <h3>Supports TRMNL Devices</h3>
                  </div>
                  <div className="card__body">
                    <p>
                      <Link to="/docs/using-with-trmnl/slipway-for-trmnl-devices">TRMNL</Link> devices
                      are affordable eInk screens for displaying anything you like.
                    </p>
                    <p>
                      Slipway supports the TRMNL API out of the box, so you quickly get up and running displaying
                      your Rigs on your TRMNL devices, taking advantage of Slipway's flexible scheduling, playlists
                      and on-demand rendering.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
