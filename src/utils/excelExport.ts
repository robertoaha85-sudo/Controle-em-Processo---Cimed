import ExcelJS from 'exceljs';
import { LoteHistorico } from '../types';
import { formatarMinutosParaTexto } from '../initialData';

export interface TemposLote {
  tempoPrevisto: number;
  tempoReal: number;
}

// Formata data YYYY-MM-DD para o padrão brasileiro DD/MM/YYYY
function formatarDataBR(dataStr?: string): string {
  if (!dataStr) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return dataStr;
}

export async function exportarHistoricoParaExcel(
  historico: LoteHistorico[],
  obterTempos: (lote: LoteHistorico) => TemposLote
) {
  if (!historico || historico.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CIMED - Sistema de Controle de Produção';
  workbook.lastModifiedBy = 'CIMED Controle de Envase';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Histórico de Lotes', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }],
    properties: { defaultRowHeight: 22 },
  });

  // Linha 1: Banner Superior Estilo Corporativo CIMED
  worksheet.mergeCells('A1:L1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'CIMED & CO  —  RELATÓRIO DE HISTÓRICO DE PRODUÇÃO E ENVASE';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF161616' }, // Fundo preto/cinza escuro CIMED
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  worksheet.getRow(1).height = 32;

  // Linha 2: Barra de Status e Metadados (Amarelo CIMED)
  worksheet.mergeCells('A2:L2');
  const metaCell = worksheet.getCell('A2');
  const agora = new Date();
  const dataHojeBR = agora.toLocaleDateString('pt-BR');
  const horaHojeBR = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const totalLotes = historico.length;
  const totalParadas = historico.filter((l) => l.teveProblemaMecanico).length;

  metaCell.value = `GERADO EM: ${dataHojeBR} ÀS ${horaHojeBR}   |   TOTAL DE LOTES: ${totalLotes}   |   LOTES COM PARADA MECÂNICA: ${totalParadas}`;
  metaCell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF111111' } };
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFD100' }, // Amarelo oficial CIMED
  };
  metaCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  worksheet.getRow(2).height = 20;

  // Linha 3: Espaçador visual
  worksheet.getRow(3).height = 8;

  // Linha 4: Cabeçalhos da Tabela (SEM a coluna ID)
  const columns = [
    { key: 'dataTermino', header: 'Data Término', minWidth: 16, align: 'center' as const },
    { key: 'maquina', header: 'Linha / Envasadora', minWidth: 22, align: 'left' as const },
    { key: 'setor', header: 'Setor', minWidth: 18, align: 'center' as const },
    { key: 'codigo', header: 'Cód. Produto', minWidth: 15, align: 'center' as const },
    { key: 'produto', header: 'Descrição do Produto', minWidth: 42, align: 'left' as const },
    { key: 'lote', header: 'Nº do Lote', minWidth: 16, align: 'center' as const },
    { key: 'inicio', header: 'Hora Início', minWidth: 14, align: 'center' as const },
    { key: 'termino', header: 'Hora Término', minWidth: 14, align: 'center' as const },
    { key: 'previsao', header: 'Previsão (Estimada)', minWidth: 20, align: 'center' as const },
    { key: 'tempoReal', header: 'Tempo Real (Efetivo)', minWidth: 20, align: 'center' as const },
    { key: 'problema', header: 'Parada Mecânica', minWidth: 18, align: 'center' as const },
    { key: 'observacao', header: 'Observações / Motivo', minWidth: 36, align: 'left' as const },
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.height = 30;

  columns.forEach((col, idx) => {
    const colNumber = idx + 1;
    const cell = headerRow.getCell(colNumber);
    cell.value = col.header;
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }, // Dark slate
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF111827' } },
      bottom: { style: 'medium', color: { argb: 'FFFFD100' } }, // Linha amarela CIMED embaixo do cabeçalho
      left: { style: 'thin', color: { argb: 'FF374151' } },
      right: { style: 'thin', color: { argb: 'FF374151' } },
    };
  });

  // Linhas de Dados com espaçamento, cores alternadas e nunca exibindo '###'
  let currentRowIndex = 5;
  historico.forEach((lote, index) => {
    const { tempoPrevisto, tempoReal } = obterTempos(lote);
    const row = worksheet.getRow(currentRowIndex);
    row.height = 24;

    const isPar = index % 2 === 0;
    const bgCor = isPar ? 'FFFFFFFF' : 'FFF9FAFB'; // Zebra striping sutil e limpo

    const dataFinalizacaoBR = formatarDataBR(lote.dataFinalizacao || lote.dataInicio);
    const setorTexto = lote.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos';
    const teveProblema = Boolean(lote.teveProblemaMecanico);
    const textoPrevisao = formatarMinutosParaTexto(tempoPrevisto);
    const textoTempoReal = formatarMinutosParaTexto(tempoReal);

    const rowData = [
      dataFinalizacaoBR,
      lote.maquinaNome || '',
      setorTexto,
      lote.produtoCodigo || '-',
      lote.produtoNome || '',
      lote.numeroLote || '-',
      lote.horaInicio || '-',
      lote.horaTermino || '-',
      textoPrevisao,
      textoTempoReal,
      teveProblema ? 'SIM (PARADA)' : 'NÃO',
      lote.observacao || '-',
    ];

    rowData.forEach((val, colIdx) => {
      const colDef = columns[colIdx];
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1F2937' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgCor },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colDef.align,
        wrapText: colDef.key === 'produto' || colDef.key === 'observacao',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };

      // Destaques visuais por coluna
      if (colDef.key === 'lote' && val !== '-') {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
      }

      if (colDef.key === 'tempoReal') {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF111827' } };
      }

      if (colDef.key === 'problema') {
        if (teveProblema) {
          cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF991B1B' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' }, // Vermelho claro de alerta
          };
        } else {
          cell.font = { name: 'Calibri', size: 9.5, bold: false, color: { argb: 'FF166534' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDCFCE7' }, // Verde claro normal
          };
        }
      }
    });

    currentRowIndex++;
  });

  // Cálculo e aplicação de larguras de colunas seguras (nunca causa '###')
  columns.forEach((col, idx) => {
    let maxContentLen = col.header.length;

    historico.forEach((lote) => {
      const { tempoPrevisto, tempoReal } = obterTempos(lote);
      let text = '';
      switch (col.key) {
        case 'dataTermino':
          text = formatarDataBR(lote.dataFinalizacao || lote.dataInicio);
          break;
        case 'maquina':
          text = lote.maquinaNome || '';
          break;
        case 'setor':
          text = lote.setor === 'liquidos' ? 'Líquidos' : 'Semissólidos';
          break;
        case 'codigo':
          text = lote.produtoCodigo || '';
          break;
        case 'produto':
          text = lote.produtoNome || '';
          break;
        case 'lote':
          text = lote.numeroLote || '';
          break;
        case 'inicio':
          text = lote.horaInicio || '';
          break;
        case 'termino':
          text = lote.horaTermino || '';
          break;
        case 'previsao':
          text = formatarMinutosParaTexto(tempoPrevisto);
          break;
        case 'tempoReal':
          text = formatarMinutosParaTexto(tempoReal);
          break;
        case 'problema':
          text = lote.teveProblemaMecanico ? 'SIM (PARADA)' : 'NÃO';
          break;
        case 'observacao':
          text = lote.observacao || '';
          break;
      }
      if (text && text.length > maxContentLen) {
        maxContentLen = text.length;
      }
    });

    // Adiciona margem de segurança de 4 caracteres para não haver truncamento em nenhuma fonte
    let computedWidth = Math.max(col.minWidth, maxContentLen + 4);

    // Limites superiores para evitar colunas excessivamente gigantes
    if (col.key === 'produto') {
      computedWidth = Math.min(Math.max(col.minWidth, maxContentLen + 3), 52);
    } else if (col.key === 'observacao') {
      computedWidth = Math.min(Math.max(col.minWidth, maxContentLen + 3), 55);
    }

    worksheet.getColumn(idx + 1).width = computedWidth;
  });

  // Habilitar auto-filtro na linha de cabeçalho (linha 4)
  worksheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: currentRowIndex - 1, column: columns.length },
  };

  // Gerar e iniciar o download do arquivo .xlsx
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dataHojeISO = new Date().toISOString().split('T')[0];
  link.download = `CIMED_Historico_Lotes_${dataHojeISO}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
