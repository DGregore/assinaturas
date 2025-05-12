
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { SignatureTemplateService } from '../../services/signature-template.service';
import { SignatureTemplate } from '../../models/signature-template.model';
import * as pdfjsLib from 'pdfjs-dist';
import * as fabric from 'fabric';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFPageProxy } from 'pdfjs-dist';

// Configuração global do PDF.js Worker
//pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
  imports: [CommonModule, FormsModule]
})
export class DocumentViewerComponent implements OnInit, AfterViewInit {
  public canvas!: fabric.Canvas;
  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef;
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef;
  
  documentId: string = '';
  document: any;
  pdfDoc: any;
  currentPage: number = 1;
  totalPages: number = 0;
  scale: number = 1.5;
  isLoading: boolean = true;
  
  // Assinatura
  signaturePad: any;
  isDrawing: boolean = false;
  signaturePosition: { x: number, y: number } = { x: 0, y: 0 };
  signatureSize: { width: number, height: number } = { width: 300, height: 150 };
  signatureColor: string = '#000000';
  signatureThickness: number = 2;
  signatureStyle: string = 'solid'; // solid, dashed
  
  // Canvas de visualização do PDF
  pdfFabricCanvas: any;
  signatureImage: any;
  
  // Templates de assinatura
  signatureTemplates: SignatureTemplate[] = [];
  selectedTemplate: SignatureTemplate | null = null;
  newTemplateName: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private signatureTemplateService: SignatureTemplateService
  ) { }

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    this.loadDocument();
    this.loadSignatureTemplates();
  }

  ngAfterViewInit(): void {
    this.initializeSignaturePad();
    this.initializePdfCanvas();
  }

  loadDocument(): void {
    this.isLoading = true;
    this.documentService.getDocument(Number(this.documentId)).subscribe(
      (document) => {
        this.document = document;
        this.loadPdf(document.storagePath);
      },
      (error) => {
        console.error('Erro ao carregar documento:', error);
        this.isLoading = false;
      }
    );
  }

  // loadPdf(url: string): void {
  //   const loadingTask = pdfjsLib.getDocument(url);
  //   loadingTask.promise.then((pdf) => {
  //     this.pdfDoc = pdf;
  //     this.totalPages = pdf.numPages;
  //     this.renderPage(this.currentPage);
  //     this.isLoading = false;
  //   }).catch((error) => {
  //     console.error('Erro ao carregar PDF:', error);
  //     this.isLoading = false;
  //   });
  // }

  loadPdf(url: string): void {
    // Verificau00e7u00e3o de segurana para garantir que o URL nu00e3o estu00e1 vazio
    if (!url) {
      console.error('URL do PDF número fornecida');
      return;
    }
  
    console.log('Carregando PDF de:', url); // Log para debug
  
    // Carregando o documento PDF
    const loadingTask = pdfjsLib.getDocument(url);
    
    loadingTask.promise.then(
      (pdf) => {
        console.log('PDF carregado com sucesso');
        this.pdfDoc = pdf;
        this.totalPages = pdf.numPages;
        this.currentPage = 1;
        this.renderPage(this.currentPage);
      },
      (error) => {
        console.error('Erro ao carregar PDF:', error);
      }
    );
  }

  renderPage(pageNumber: number): void {
    this.isLoading = true;
    this.pdfDoc.getPage(pageNumber).then((page: PDFPageProxy) => {
      const viewport = page.getViewport({ scale: this.scale });
      
      // Configurar o canvas para o PDF
      const canvas = this.pdfCanvas.nativeElement;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Renderizar o PDF no canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      page.render(renderContext).promise.then(() => {
        this.isLoading = false;
        this.updatePdfFabricCanvas();
      });
    });
  }

  initializePdfCanvas(): void {
    // Inicializar o canvas do Fabric.js para a visualização do PDF
    this.pdfFabricCanvas = new fabric.Canvas('pdfOverlayCanvas', {
      selection: false,
      renderOnAddRemove: true
    });
    
    // Configurar eventos do mouse para posicionamento da assinatura
    this.pdfFabricCanvas.on('mouse:down', (options: fabric.TEvent) => {
      if (!this.signatureImage) return;
      
      const pointer = this.pdfFabricCanvas.getPointer(options.e);
      this.signaturePosition = { x: pointer.x, y: pointer.y };
      this.updateSignaturePreview();
    });
  }

  updatePdfFabricCanvas(): void {
    // Atualizar o tamanho do canvas do Fabric.js para corresponder ao PDF
    const canvas = this.pdfCanvas.nativeElement;
    this.pdfFabricCanvas.setWidth(canvas.width);
    this.pdfFabricCanvas.setHeight(canvas.height);
    
    // Se houver uma assinatura, atualizar a visualização
    if (this.signatureImage) {
      this.updateSignaturePreview();
    }
  }

  initializeSignaturePad(): void {
    const canvas = this.signatureCanvas.nativeElement;
    this.signaturePad = new fabric.Canvas(canvas, {
      isDrawingMode: true,
      width: this.signatureSize.width,
      height: this.signatureSize.height
    });
    
    // Configurar o pincel para desenho
    this.updateBrushSettings();
    
    // Limpar o canvas
    this.clearSignature();
  }

  updateBrushSettings(): void {
    if (!this.signaturePad) return;
    
    this.signaturePad.freeDrawingBrush.color = this.signatureColor;
    this.signaturePad.freeDrawingBrush.width = this.signatureThickness;
    
    if (this.signatureStyle === 'dashed') {
      this.signaturePad.freeDrawingBrush.strokeDashArray = [5, 5];
    } else {
      this.signaturePad.freeDrawingBrush.strokeDashArray = [];
    }
  }

  clearSignature(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
      this.signaturePad.backgroundColor = 'rgba(255, 255, 255, 0.0)';
    }
    
    // Remover a visualização da assinatura no PDF
    if (this.signatureImage && this.pdfFabricCanvas) {
      this.pdfFabricCanvas.remove(this.signatureImage);
      this.signatureImage = null;
    }
  }

  previewSignature(): void {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      alert('Por favor, desenhe uma assinatura primeiro.');
      return;
    }
    
    // Obter a imagem da assinatura
    const signatureDataUrl = this.signaturePad.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    // Criar um objeto de imagem do Fabric.js
    fabric.Image.fromURL(signatureDataUrl).then((img: fabric.Image) => {
      // Remove the previous image if it exists
      if (this.signatureImage) {
        this.pdfFabricCanvas.remove(this.signatureImage);
      }
    
      // Set the new image
      this.signatureImage = img;
      this.updateSignaturePreview();
    });
  }

  updateSignaturePreview(): void {
    if (!this.signatureImage || !this.pdfFabricCanvas) return;
    
    // Remover a imagem anterior do canvas
    this.pdfFabricCanvas.remove(this.signatureImage);
    
    // Calcular o tamanho proporcional da assinatura
    const originalWidth = this.signatureImage.width;
    const originalHeight = this.signatureImage.height;
    const maxWidth = this.signatureSize.width;
    const maxHeight = this.signatureSize.height;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    
    if (originalWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = (originalHeight * maxWidth) / originalWidth;
    }
    
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = (originalWidth * maxHeight) / originalHeight;
    }
    
    // Configurar a imagem com o novo tamanho e posição
    this.signatureImage.set({
      left: this.signaturePosition.x,
      top: this.signaturePosition.y,
      scaleX: newWidth / originalWidth,
      scaleY: newHeight / originalHeight,
      selectable: true,
      hasControls: true,
      hasBorders: true
    });
    
    // Adicionar a imagem ao canvas
    this.pdfFabricCanvas.add(this.signatureImage);
    this.pdfFabricCanvas.renderAll();
  }

  applySignature(): void {
    if (!this.signatureImage) {
      alert('Por favor, crie e posicione uma assinatura primeiro.');
      return;
    }
    
    // Obter a posição final da assinatura
    const finalPosition = {
      x: this.signatureImage.left,
      y: this.signatureImage.top,
      width: this.signatureImage.width * this.signatureImage.scaleX,
      height: this.signatureImage.height * this.signatureImage.scaleY,
      page: this.currentPage
    };
    
    // Get signature image
    const signatureDataUrl = this.signaturePad.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    // Send to document service
    this.isLoading = true;
    this.documentService.applySignature(
      this.documentId, 
      signatureDataUrl, 
      finalPosition
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        alert('Documento assinado com sucesso!');
        
        // Add signature to canvas after successful upload
        fabric.Image.fromURL(signatureDataUrl).then((img: fabric.Image) => {
          img.set({
            left: finalPosition.x,
            top: finalPosition.y,
            scaleX: finalPosition.width / img.width!,
            scaleY: finalPosition.height / img.height!
          });
          this.canvas.add(img);
          this.canvas.requestRenderAll();
        });
    
        this.loadDocument();
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Erro ao aplicar assinatura:', error);
        alert('Erro ao aplicar assinatura. Por favor, tente novamente.');
      }
    });
  }

  // Navegação de páginas
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderPage(this.currentPage);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderPage(this.currentPage);
    }
  }

  // Zoom
  zoomIn(): void {
    this.scale += 0.25;
    this.renderPage(this.currentPage);
  }

  zoomOut(): void {
    if (this.scale > 0.5) {
      this.scale -= 0.25;
      this.renderPage(this.currentPage);
    }
  }

  // Funções para templates de assinatura
  loadSignatureTemplates(): void {
    this.signatureTemplateService.getTemplates().subscribe(
      (templates) => {
        this.signatureTemplates = templates;
      },
      (error) => {
        console.error('Erro ao carregar templates de assinatura:', error);
      }
    );
  }

  saveSignatureAsTemplate(): void {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      alert('Por favor, desenhe uma assinatura primeiro.');
      return;
    }
    
    if (!this.newTemplateName || this.newTemplateName.trim() === '') {
      alert('Por favor, informe um nome para o template.');
      return;
    }
    
    // Obter a imagem da assinatura
    const signatureDataUrl = this.signaturePad.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    // Criar o objeto de template
    const template: SignatureTemplate = {
      id: '', // Será gerado pelo serviço
      name: this.newTemplateName,
      imageData: signatureDataUrl,
      color: this.signatureColor,
      thickness: this.signatureThickness,
      style: this.signatureStyle,
      createdAt: new Date()
    };
    
    // Salvar o template
    this.signatureTemplateService.saveTemplate(template).subscribe(
      (savedTemplate) => {
        this.signatureTemplates.push(savedTemplate);
        this.newTemplateName = '';
        alert('Template de assinatura salvo com sucesso!');
      },
      (error) => {
        console.error('Erro ao salvar template de assinatura:', error);
        alert('Erro ao salvar template de assinatura. Por favor, tente novamente.');
      }
    );
  }

  loadSignatureTemplate(template: SignatureTemplate): void {
    // Aplicar as configurações do template
    this.signatureColor = template.color;
    this.signatureThickness = template.thickness;
    this.signatureStyle = template.style;
    this.updateBrushSettings();
    
    // Carregar a imagem da assinatura
    fabric.Image.fromURL(template.imageData).then((img: fabric.Image) => {
      // Limpar o canvas atual
      this.signaturePad.clear();
      
      // Adicionar a imagem ao canvas de assinatura
      img.set({
        left: 0,
        top: 0,
        selectable: false
      });
      
      this.signaturePad.add(img);
      this.signaturePad.renderAll();
      
      // Atualizar a visualização no PDF
      this.previewSignature();
    });
  }

  deleteSignatureTemplate(template: SignatureTemplate): void {
    if (confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      this.signatureTemplateService.deleteTemplate(template.id).subscribe(
        () => {
          this.signatureTemplates = this.signatureTemplates.filter(t => t.id !== template.id);
          alert('Template excluído com sucesso!');
        },
        (error) => {
          console.error('Erro ao excluir template:', error);
          alert('Erro ao excluir template. Por favor, tente novamente.');
        }
      );
    }
  }
}
