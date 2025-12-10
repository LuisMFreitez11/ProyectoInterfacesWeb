// vue.config.js (SOLUCIÓN ALTERNATIVA)
module.exports = {
  chainWebpack: config => {
    config.resolve.alias.set('worker_threads', false);
    config.module
      .rule('js')
      .include.add(/jspdf/) // Apunta directamente a la librería
      .end()
      .use('babel')
      .loader('babel-loader')
      .options({
        plugins: [
          [
            'module-resolver',
            {
              alias: {
                'worker_threads': false
              }
            }
          ]
        ]
      })
  },
  // La configuración más simple que deberíamos haber usado:
  configureWebpack: {
    node: {
      worker_threads: 'empty'
    }
  }
};