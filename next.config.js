module.exports = {
  exportPathMap: async function(defaultPathMap) {
    return {
      '/index.js': { page: '/' },
      '/admin/index.js': { page: '/admin' },
    };
  },
};
