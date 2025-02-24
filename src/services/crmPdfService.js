import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const generarReciboPDF = (servicio, cliente) => {
  const docDefinition = {
    content: [
      { text: 'RECIBO DE SERVICIO', style: 'header' },
      { text: 'Venta y servicios en construcción en seco', style: 'subHeader' },
      { text: 'Cel: 63605479', style: 'contactInfo' },
      { text: '\n' },
      { text: `Nº de Recibo: ${servicio.id}`, style: 'subheader' },
      { text: `Fecha: ${new Date(servicio.fechaInicio).toLocaleString()}`, style: 'subheader' },
      { text: `Cliente: ${cliente.nombre}`, style: 'subheader' },
      { text: `CI/NIT: ${cliente.ciNit}`, style: 'subheader' },
      { text: '\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Servicio', style: 'tableHeader' },
              { text: 'Descripción', style: 'tableHeader' },
              { text: 'Monto', style: 'tableHeader' }
            ],
            [
              servicio.nombre,
              servicio.descripcion,
              `${servicio.monto.toFixed(2)} Bs`
            ]
          ]
        }
      },
      { text: '\n' },
      { text: `Total: ${servicio.monto.toFixed(2)} Bs`, style: 'total' },
      { text: `Método de Pago: ${servicio.metodoPago}`, style: 'subheader' },
      { text: '\n\n' },
      { text: '¡Gracias por su preferencia!', style: 'thanks' }
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        color: '#006400',
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      subHeader: {
        fontSize: 14,
        color: '#2E74B5',
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      contactInfo: {
        fontSize: 12,
        color: '#2E74B5',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        color: '#2E74B5',
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'white',
        fillColor: '#4472C4'
      },
      total: {
        fontSize: 18,
        bold: true,
        color: '#2E74B5',
        alignment: 'right'
      },
      thanks: {
        fontSize: 16,
        italic: true,
        color: '#2E74B5',
        alignment: 'center'
      }
    }
  };

  return pdfMake.createPdf(docDefinition);
};

export const generarReporteClientePDF = (cliente) => {
  const docDefinition = {
    content: [
      { text: 'REPORTE DE CLIENTE', style: 'header' },
      { text: 'Venta y servicios en construcción en seco', style: 'subHeader' },
      { text: '\n' },
      { text: 'Información del Cliente', style: 'sectionHeader' },
      {
        table: {
          widths: ['auto', '*'],
          body: [
            ['Nombre:', cliente.nombre],
            ['CI/NIT:', cliente.ciNit],
            ['Teléfono:', cliente.telefono],
            ['Email:', cliente.email],
            ['Dirección:', cliente.direccion],
            ['Tipo:', cliente.tipo],
            ['Estado:', cliente.estado]
          ]
        }
      },
      { text: '\n' },
      { text: 'Servicios Contratados', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Servicio', style: 'tableHeader' },
              { text: 'Fecha', style: 'tableHeader' },
              { text: 'Estado', style: 'tableHeader' },
              { text: 'Monto', style: 'tableHeader' }
            ],
            ...cliente.servicios.map(servicio => [
              servicio.nombre,
              new Date(servicio.fechaInicio).toLocaleDateString(),
              servicio.estado,
              `${servicio.monto.toFixed(2)} Bs`
            ])
          ]
        }
      },
      { text: '\n' },
      { text: 'Historial de Interacciones', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*'],
          body: [
            [
              { text: 'Fecha', style: 'tableHeader' },
              { text: 'Tipo', style: 'tableHeader' },
              { text: 'Detalle', style: 'tableHeader' }
            ],
            ...cliente.interacciones.map(interaccion => [
              new Date(interaccion.fecha).toLocaleString(),
              interaccion.tipo,
              interaccion.detalle
            ])
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        color: '#006400',
        alignment: 'center',
        margin: [0, 0, 0, 5]
      },
      subHeader: {
        fontSize: 14,
        color: '#2E74B5',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      sectionHeader: {
        fontSize: 18,
        bold: true,
        color: '#2E74B5',
        margin: [0, 10, 0, 10]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'white',
        fillColor: '#4472C4'
      }
    }
  };

  return pdfMake.createPdf(docDefinition);
};
