import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Slipway',
  //tagline: 'Ambient information delivered to your devices.',
  tagline: 'An open source framework for displaying useful information on your devices.',
  favicon: 'favicon.ico',

  // Set the production url of your site here
  url: 'https://slipway.co',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'slipwayhq', // Usually your GitHub org/user name.
  projectName: 'slipway_docs', // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    require.resolve('docusaurus-lunr-search'),
    [
      "@dipakparmar/docusaurus-plugin-umami",
      /** @type {import('@dipakparmar/docusaurus-plugin-umami').Options} */
      ({
        websiteID: "11e7c6fc-c2af-44c6-868f-c1c05a9c57c0",
        analyticsDomain: "analytics.umami.is",
        dataDomains: "slipway.co,www.slipway.co,slipwayhq.com,www.slipwayhq.com"
      }),
    ]
  ],
  
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/slipwayhq/slipway_docs/tree/main/packages/create-docusaurus/templates/shared/',
          remarkPlugins: [
            require('remark-directive'),
            require('./plugins/insert-directive/index.js'),
          ],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          // 'https://github.com/slipwayhq/slipway_docs/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          remarkPlugins: [
            require('remark-directive'),
            require('./plugins/insert-directive/index.js'),
          ],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/slipway-social-card.png',
    navbar: {
      title: 'Slipway',
      logo: {
        alt: 'Slipway Logo',
        src: 'img/slipway-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/components', label: 'Components', position: 'left'},
        {to: '/community', label: 'Community', position: 'left'},
        {to: '/hosting', label: 'Hosting', position: 'left'},
        {
          href: 'https://github.com/slipwayhq/slipway',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Quick Start',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Zulip',
              href: 'https://slipway.zulipchat.com',
            },
            {
              label: 'Instagram',
              href: 'https://www.instagram.com/slipwayhq/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/slipwayhq/slipway',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} James Thurley`,
    },
    prism: {
      // Themes: https://github.com/FormidableLabs/prism-react-renderer/tree/master/packages/prism-react-renderer/src/themes
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.vsDark
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
