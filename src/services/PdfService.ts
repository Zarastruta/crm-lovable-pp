import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Orcamento, Cliente, Local, OrcamentoItem } from "@/types";
import logoVulcano from "@/assets/logo-pratespaiva.png";
import { 
  Oswald_Medium_B64, 
  Oswald_Regular_B64, 
  Barlow_Regular_B64, 
  Barlow_Light_B64 
} from "@/assets/fonts/font-data";

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const generateOrcamentoPdf = (
  orcamento: Orcamento,
  items: OrcamentoItem[],
  cliente?: Cliente,
  condominio?: Local,
  ocultarUnitarios: boolean = false,
  sindico?: Cliente
) => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" }) as jsPDFWithAutoTable;
  
  // 1. Registro de Fontes Customizadas com Detecção de Corrupção
  const registerFonts = (doc: jsPDF) => {
    try {
      const isHtmlPage = (data: string) => {
        try {
          const decoded = atob(data.substring(0, 100));
          return decoded.includes('<!DOCTYPE') || decoded.includes('<html');
        } catch {
          return false;
        }
      };

      // Só registra fontes se os dados forem válidos (não 404 HTML)
      if (Oswald_Medium_B64 && !isHtmlPage(Oswald_Medium_B64)) {
        doc.addFileToVFS("Oswald-Medium.ttf", Oswald_Medium_B64);
        doc.addFont("Oswald-Medium.ttf", "Oswald", "medium");
      }
      
      if (Oswald_Regular_B64 && !isHtmlPage(Oswald_Regular_B64)) {
        doc.addFileToVFS("Oswald-Regular.ttf", Oswald_Regular_B64);
        doc.addFont("Oswald-Regular.ttf", "Oswald", "bold");
      }

      if (Barlow_Regular_B64 && !isHtmlPage(Barlow_Regular_B64)) {
        doc.addFileToVFS("Barlow-Regular.ttf", Barlow_Regular_B64);
        doc.addFont("Barlow-Regular.ttf", "Barlow", "normal");
      }

      if (Barlow_Light_B64 && !isHtmlPage(Barlow_Light_B64)) {
        doc.addFileToVFS("Barlow-Light.ttf", Barlow_Light_B64);
        doc.addFont("Barlow-Light.ttf", "Barlow-Light", "normal");
      }
      
      console.log("Sistema de fontes inicializado. Fallback ativo: ", isHtmlPage(Oswald_Medium_B64));
    } catch (error) {
      console.warn("Erro ao carregar fontes customizadas. Usando fontes padrão.", error);
    }
  };

  registerFonts(doc);

  // Helper para aplicar fontes de forma segura (fallback para Helvetica se falhar)
  const setSafeFont = (font: string, style: string = "normal") => {
    try {
      // Se a fonte customizada falhou no registro, doc.getFontList() não terá ela
      const availableFonts = Object.keys(doc.getFontList());
      if (availableFonts.includes(font)) {
        doc.setFont(font, style);
      } else {
        doc.setFont("helvetica", style === "medium" || style === "bold" ? "bold" : "normal");
      }
    } catch {
      doc.setFont("helvetica", "normal");
    }
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;

  // Paleta Vulcano Oficial
  const COLORS = {
    GRAFITE: "#2E2F2F",
    AZUL: "#3F8FBE",
    CONCRETO: "#C0C0C0",
    CIMENTO: "#F4F3F0",
    BRANCO: "#FFFFFF"
  };
  
  // ==========================================
  // 1. CABEÇALHO (IDENTIFICAÇÃO - Layout Letterhead)
  // ==========================================
  // Agora usamos fundo branco para máximo contraste e legibilidade
  doc.setFillColor(COLORS.BRANCO); 
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Linha de acento inferior em Azul Vulcano
  doc.setDrawColor(COLORS.AZUL);
  doc.setLineWidth(0.8);
  doc.line(0, 40, pageWidth, 40); 
  
  // Logotipo Oficial Vulcano - Horizontal à Esquerda (Versão Limpa)
  try {
    const logoWidth = 71; 
    const logoHeight = 18;
    doc.addImage(logoVulcano, 'PNG', marginLeft, 10, logoWidth, logoHeight);
  } catch (err) {
    console.error("Erro ao carregar logo no PDF:", err);
    doc.setTextColor(COLORS.GRAFITE);
    setSafeFont("Oswald", "bold");
    doc.setFontSize(22);
    doc.text("PRATES PAIVA", marginLeft, 25);
  }

  // Título e Contato - Lado Direito (Oswald p/ Títulos)
  doc.setTextColor(COLORS.GRAFITE);
  doc.setFontSize(14);
  setSafeFont("Oswald", "bold");
  // Removido setCharSpace pois no jsPDF ele empurra a bounding-box direita para fora da folha ("torto")
  doc.text("PROPOSTA DE SERVIÇOS", pageWidth - marginLeft, 20, { align: 'right' });
  
  doc.setTextColor(COLORS.CONCRETO);
  doc.setFontSize(8);
  setSafeFont("Barlow", "normal");
  doc.text("CNPJ: 21.561.132/0001-62", pageWidth - marginLeft, 27, { align: 'right' });
  doc.text("Tel: (48) 9 9984-1689", pageWidth - marginLeft, 31, { align: 'right' });
  doc.text("Governador Celso Ramos — SC", pageWidth - marginLeft, 35, { align: 'right' });
  
  // ==========================================
  // 2. CONTEXTO E DADOS DA OBRA
  // ==========================================
  const contextY = 50;
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(11);
  setSafeFont("Oswald", "bold");
  doc.text("IDENTIFICAÇÃO DA OBRA", marginLeft, contextY);
  
  autoTable(doc, {
    startY: contextY + 5,
    body: [
      // P2: usa o numero sequencial, não o UUID
      [`PROPOSTA Nº: #${orcamento.numero || orcamento.id.substring(0,6).toUpperCase()}`, `DATA: ${orcamento.data_emissao ? formatDate(orcamento.data_emissao) : '-'}`],
      [`CLIENTE: ${cliente?.nome || 'Não informado'}`, `LOCAL: ${condominio?.nome || 'Obra Direta'}`],
      // M3: exibe o nome do síndico real em vez de "Atribuído"
      [`ENDEREÇO: ${orcamento.endereco_obra || '-'}`, condominio ? `SÍNDICO: ${sindico?.nome || 'Não definido'}` : '']
    ],
    theme: 'plain',
    styles: { font: 'Barlow', fontSize: 10, cellPadding: 2, textColor: [50, 50, 50] }
  });
  
  // ==========================================
  // DESCRIÇÃO DO PROJETO (Apresentação)
  // ==========================================
  let currentY = doc.lastAutoTable.finalY + 10;
  
  if (orcamento.descricao) {
    setSafeFont("Oswald", "bold");
    doc.setFontSize(10);
    doc.text("OBJETIVO DO PROJETO", marginLeft, currentY);
    
    setSafeFont("Barlow-Light", "normal");
    doc.setFontSize(10);
    const splitDesc = doc.splitTextToSize(orcamento.descricao, pageWidth - 40);
    doc.text(splitDesc, marginLeft, currentY + 7);
    currentY += 10 + (splitDesc.length * 6); // Aumentado multiplicador (Line Height de fonte 10)
  }
  
  // ==========================================
  // 3. TABELA DE SERVIÇOS (Escopo Detalhado)
  // ==========================================
  currentY += 10;
  setSafeFont("Oswald", "bold");
  doc.setFontSize(11);
  doc.text("ESCOPO DETALHADO DOS SERVIÇOS", marginLeft, currentY);
  
  const autoTableData = items.map((it, index) => {
    const totalItem = (it.quantidade || 0) * (it.valor_unitario || 0);
    if (ocultarUnitarios) {
      return [(index + 1).toString().padStart(2, '0'), it.nome || 'Serviço s/ nome', it.unidade || 'un', it.quantidade || 0];
    }
    return [
      (index + 1).toString().padStart(2, '0'), 
      it.nome || 'Serviço s/ nome', 
      it.unidade || 'un', 
      it.quantidade || 0, 
      formatCurrency(it.valor_unitario || 0), 
      formatCurrency(totalItem)
    ];
  });
  
  const headConfig = ocultarUnitarios 
    ? [['ITEM', 'DESCRIÇÃO DO SERVIÇO', 'UN', 'QTD']]
    : [['ITEM', 'DESCRIÇÃO DO SERVIÇO', 'UN', 'QTD', 'VALOR UN.', 'TOTAL']];

  autoTable(doc, {
    startY: currentY + 5,
    head: headConfig,
    body: autoTableData.length > 0 ? autoTableData : [['—', 'Nenhum item detalhado. Valores globais aplicados.', '', '', '', '']],
    theme: 'striped',
    headStyles: { font: 'Oswald', fillColor: COLORS.GRAFITE, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [244, 243, 240] }, // Cimento light
    styles: { font: 'Barlow', fontSize: 9, cellPadding: 4 },
    columnStyles: ocultarUnitarios 
      ? { 0: { cellWidth: 15 }, 2: { halign: 'center', cellWidth: 20 }, 3: { halign: 'center', cellWidth: 20 } }
      : { 
          0: { cellWidth: 12 }, 
          2: { halign: 'center', cellWidth: 15 }, 
          3: { halign: 'center', cellWidth: 15 },
          4: { halign: 'right', cellWidth: 30 },
          5: { halign: 'right', cellWidth: 30 }
        }
  });
  
  currentY = doc.lastAutoTable.finalY + 10;

  // ==========================================
  // 4. RESUMO FINANCEIRO E PRAZOS
  // ==========================================
  // Checar se precisa pular página
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  autoTable(doc, {
    startY: currentY,
    head: [['RESUMO DE INVESTIMENTO', '']],
    body: [
      ['VALOR TOTAL DA PROPOSTA:', formatCurrency(orcamento.valor)]
    ],
    theme: 'grid',
    headStyles: { font: 'Oswald', fillColor: COLORS.GRAFITE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 },
    styles: { font: 'Barlow', fontSize: 11, cellPadding: 6 },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', fontStyle: 'bold', textColor: COLORS.AZUL } }
  });

  currentY = doc.lastAutoTable.finalY + 15;

  // Prazos e Condições
  setSafeFont("Oswald", "bold");
  doc.setFontSize(10);
  doc.text("PRAZOS E CONDIÇÕES COMERCIAIS", marginLeft, currentY);

  const prazosBody = [];
  if (orcamento.condicoes_pagamento) prazosBody.push(['CONDIÇÕES DE PAGAMENTO:', orcamento.condicoes_pagamento]);
  if (orcamento.prazo_execucao) prazosBody.push(['PRAZO DE EXECUÇÃO:', orcamento.prazo_execucao]);
  if (orcamento.validade) prazosBody.push(['VALIDADE DESTA PROPOSTA:', `Até ${formatDate(orcamento.validade)}`]);
  
  if (prazosBody.length > 0) {
    autoTable(doc, {
      startY: currentY + 5,
      body: prazosBody,
      theme: 'plain',
      styles: { font: 'Barlow', fontSize: 9, cellPadding: 3, textColor: [50, 50, 50] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
    });
    currentY = doc.lastAutoTable.finalY + 15;
  } else {
    currentY += 10;
  }

  // ==========================================
  // 5. CLÁUSULAS (SEGURANÇAS)
  // ==========================================
  if (currentY > 220) { doc.addPage(); currentY = 20; }
  
  if (orcamento.exclusoes || orcamento.responsabilidades) {
    doc.setFont("Oswald", "bold");
    doc.setFontSize(10);
    doc.text("CLÁUSULAS E OBSERVAÇÕES", marginLeft, currentY);
    let offset = currentY + 7;
    
    doc.setFontSize(9);
    
    if (orcamento.exclusoes) {
      doc.setFont("Barlow", "bold");
      doc.text("ESTÃO EXCLUÍDOS DESTA PROPOSTA (NÃO INCLUSO):", marginLeft, offset);
      doc.setFont("Barlow-Light", "normal");
      const extSplit = doc.splitTextToSize(orcamento.exclusoes, pageWidth - 40);
      doc.text(extSplit, marginLeft, offset + 5);
      offset += 8 + (extSplit.length * 5); // Aumentado multiplicador (Line Height de fonte 9)
    }
    
    if (orcamento.responsabilidades) {
      doc.setFont("Barlow", "bold");
      doc.text("DEVERES DO CONTRATANTE:", marginLeft, offset);
      doc.setFont("Barlow-Light", "normal");
      const respSplit = doc.splitTextToSize(orcamento.responsabilidades, pageWidth - 40);
      doc.text(respSplit, marginLeft, offset + 5);
      offset += 8 + (respSplit.length * 5);
    }
    currentY = offset + 5;
  }
  
  // ==========================================
  // 6. ASSINATURAS E ENCERRAMENTO
  // ==========================================
  if (currentY > 240) { doc.addPage(); currentY = 20; }
  
  const signY = currentY + 30;
  doc.setDrawColor(150, 150, 150);
  
  // Empresa
  doc.line(marginLeft, signY, marginLeft + 70, signY);
  doc.setFont("Oswald", "bold");
  doc.setFontSize(10);
  doc.text("PRATES PAIVA", marginLeft + 35, signY + 5, { align: 'center' });
  doc.setFont("Barlow", "normal");
  doc.setFontSize(8);
  doc.text("Representante Comercial", marginLeft + 35, signY + 10, { align: 'center' });
  
  // Cliente
  doc.line(pageWidth - marginLeft - 70, signY, pageWidth - marginLeft, signY);
  doc.setFont("Barlow", "bold");
  doc.setFontSize(9);
  doc.text("DE ACORDO (CLIENTE)", pageWidth - marginLeft - 35, signY + 5, { align: 'center' });
  doc.setFont("Barlow", "normal");
  doc.setFontSize(8);
  doc.text("Assinatura / Data", pageWidth - marginLeft - 35, signY + 10, { align: 'center' });
  
  // ==========================================
  // RODAPÉ (Padrão para todas as páginas)
  // ==========================================
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(COLORS.CONCRETO);
    doc.setFont("Barlow", "normal");
    const footerText = `Documento gerado por Vulcano Hub CRM • Proposta ${orcamento.id.substring(0,6).toUpperCase()} • Página ${i} de ${pageCount}`;
    doc.text(footerText, pageWidth / 2, 287, { align: 'center' });
  }
  
  doc.save(`Orcamento_${(orcamento.titulo || 'Proposta').replace(/\s+/g, '_')}.pdf`);
};
