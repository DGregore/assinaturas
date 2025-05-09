import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentFinalService {
  private apiUrl = '/api/documents'; // Use relative path for proxy

  constructor(private http: HttpClient) { }

  /**
   * Obtém o documento final com todas as assinaturas aplicadas visualmente.
   * @param id O ID do documento.
   * @returns Observable<Blob> O conteúdo do arquivo PDF final como um Blob.
   */
  getDocumentFinal(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/final`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtém o hash do documento para verificação de integridade.
   * @param id O ID do documento.
   * @returns Observable<string> O hash do documento.
   */
  getDocumentHash(id: number): Observable<{ hash: string }> {
    return this.http.get<{ hash: string }>(`${this.apiUrl}/${id}/hash`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verifica a integridade de um documento comparando seu hash.
   * @param file O arquivo PDF a ser verificado.
   * @param hash O hash fornecido para comparação.
   * @returns Observable<boolean> Verdadeiro se o documento for íntegro.
   */
  verifyDocumentIntegrity(file: File, hash: string): Observable<{ isValid: boolean, message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hash', hash);
    
    return this.http.post<{ isValid: boolean, message: string }>('/api/integrity/verify', formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Tratamento básico de erros para requisições HTTP.
   * @param error O HttpErrorResponse.
   * @returns Observable lançando um erro.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(
      `Backend returned code ${error.status}, body was: `, error.error);
    let userMessage = 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';
    if (error.error instanceof ErrorEvent) {
      userMessage = `Erro: ${error.error.message}`;
    } else if (error.status === 404) {
      userMessage = 'Recurso não encontrado.';
    } else if (error.status === 400 && error.error?.message) {
      userMessage = error.error.message;
    } else if (error.status === 401) {
      userMessage = 'Não autorizado. Verifique suas credenciais ou faça login novamente.';
    } else if (error.status === 403) {
      userMessage = 'Acesso negado.';
    }
    return throwError(() => new Error(userMessage));
  }
}
