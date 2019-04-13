module.exports = {
  exportPathMap: async function(defaultPathMap) {
    return {
      '/pages/inex.js': { page: '/' },
      '/pages/admin/index.js': { page: '/admin' },
    };
  },
};
