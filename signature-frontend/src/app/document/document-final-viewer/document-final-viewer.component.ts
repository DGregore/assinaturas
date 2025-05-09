import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { DocumentFinalService } from '../../services/document-final.service';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document.model';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-document-final-viewer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PdfViewerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './document-final-viewer.component.html',
  styleUrls: ['./document-final-viewer.component.css']
})
export class DocumentFinalViewerComponent implements OnInit, OnDestroy {
  document: Document | null = null;
  pdfSrc: any = null; // Usando 'any' para compatibilidade com o componente pdf-viewer
  documentHash: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  private routeSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private documentFinalService: DocumentFinalService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.pipe(
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
        this.document = null;
        this.pdfSrc = null;
        this.documentHash = null;
      }),
      switchMap(params => {
        const idParam = params.get('id');
        if (!idParam) {
          this.errorMessage = 'ID do documento não encontrado na rota.';
          this.isLoading = false;
          return of(null);
        }
        const documentId = parseInt(idParam, 10);
        if (isNaN(documentId)) {
          this.errorMessage = 'ID do documento inválido.';
          this.isLoading = false;
          return of(null);
        }

        // Primeiro, obter os metadados do documento
        return this.documentService.getDocument(documentId).pipe(
          switchMap(document => {
            this.document = document;
            
            // Verificar se o documento está completo
            if (document.status !== 'COMPLETED') {
              this.errorMessage = 'Este documento ainda não foi completamente assinado.';
              this.isLoading = false;
              return of(null);
            }
            
            // Obter o documento final com assinaturas
            return this.documentFinalService.getDocumentFinal(documentId).pipe(
              tap(pdfBlob => {
                this.pdfSrc = pdfBlob;
              }),
              switchMap(() => {
                // Obter o hash do documento para verificação de integridade
                return this.documentFinalService.getDocumentHash(documentId).pipe(
                  tap(response => {
                    this.documentHash = response.hash;
                  })
                );
              }),
              catchError(error => {
                this.errorMessage = `Erro ao carregar documento final: ${error.message}`;
                return of(null);
              })
            );
          }),
          catchError(error => {
            this.errorMessage = `Erro ao carregar documento: ${error.message}`;
            return of(null);
          })
        );
      })
    ).subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  /**
   * Faz o download do documento final com assinaturas
   */
  downloadFinalDocument(): void {
    if (!this.document) return;
    
    const filename = `${this.document.originalFilename.replace('.pdf', '')}_assinado.pdf`;
    
    if (this.pdfSrc instanceof Blob) {
      const url = window.URL.createObjectURL(this.pdfSrc);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      this.snackBar.open('Documento baixado com sucesso!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } else {
      this.documentFinalService.getDocumentFinal(this.document.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          
          this.snackBar.open('Documento baixado com sucesso!', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        },
        error: (err: any) => {
          this.errorMessage = `Erro ao baixar documento: ${err.message}`;
          this.snackBar.open('Erro ao baixar documento', 'Fechar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  /**
   * Copia o hash do documento para a área de transferência
   */
  copyHashToClipboard(): void {
    if (!this.documentHash) return;
    
    navigator.clipboard.writeText(this.documentHash).then(() => {
      this.snackBar.open('Hash copiado para a área de transferência!', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }, (err) => {
      console.error('Erro ao copiar hash:', err);
      this.snackBar.open('Erro ao copiar hash', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
    });
  }
}
