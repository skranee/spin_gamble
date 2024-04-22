module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost/api/:path*'
      }
    ];
  },
  experimental: {
    outputStandalone: true
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      oneOf: [
        {
          dependency: { not: ['url'] },
          use: ['@svgr/webpack', 'new-url-loader']
        }
      ]
    });
    return config;
  },
  images: {
    domains: ['tr.rbxcdn.com']
  }
};
