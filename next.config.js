const path = require('path');

const hasKiboUi = (() => {
  try {
    require.resolve('@kibocommerce/kiboui');
    return true;
  } catch (_err) {
    return false;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  webpack: (config) => {
    if (!hasKiboUi) {
      config.resolve.alias['@kibocommerce/kiboui'] = path.resolve(
        __dirname,
        'src/kiboui-fallback'
      );
    }
    return config;
  },
};

module.exports = nextConfig;
