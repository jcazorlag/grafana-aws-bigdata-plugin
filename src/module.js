import AWSDashboardPanel from './panel';

export {
  AWSDashboardPanel as PanelCtrl
};

export const plugin = {
  panel: AWSDashboardPanel,
  defaults: {
    // Configuraciones por defecto del panel
  },
  // Aquí es donde conectarías tu fuente de datos
  fetchData: async (options) => {
    // Simulación de llamada a API - Reemplaza esto con tu fuente real
    console.log('Fetching data with options:', options);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          nodes: [
            { id: 'glue_extract', name: 'Extract Job', status: 'success', duration: 120 },
            { id: 'lambda_validate', name: 'Validate Data', status: 'success', duration: 45 },
            { id: 'glue_transform', name: 'Transform Job', status: 'running', duration: 180 },
            { id: 'athena_query', name: 'Athena Analysis', status: 'pending', duration: 0 }
          ],
          links: [
            { source: 'glue_extract', target: 'lambda_validate' },
            { source: 'lambda_validate', target: 'glue_transform' },
            { source: 'glue_transform', target: 'athena_query' }
          ]
        });
      }, 1000);
    });
  }
};
