
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SignatureTemplate } from '../models/signature-template.model';

@Injectable({
  providedIn: 'root'
})
export class SignatureTemplateService {
  private apiUrl = '/api/documents';
  
  // Cache local de templates para melhorar a performance
  private templatesCache: SignatureTemplate[] = [];
  
  constructor(private http: HttpClient) { }
  
  /**
   * Obtém todos os templates de assinatura do usuário
   * @returns Observable com a lista de templates
   */
  getTemplates(): Observable<SignatureTemplate[]> {
    // Se já temos os templates em cache, retorna-os
    if (this.templatesCache) {
      return of(this.templatesCache);
    }
    
    // Caso contrário, busca do servidor
    return this.http.get<SignatureTemplate[]>(this.apiUrl).pipe(
      map(templates => {
        // Converte as datas de string para objeto Date
        templates.forEach(template => {
          template.createdAt = new Date(template.createdAt);
        });
        
        // Atualiza o cache
        this.templatesCache = templates;
        return templates;
      }),
      catchError(error => {
        console.error('Erro ao buscar templates de assinatura:', error);
        return of([]);
      })
    );
  }
  
  /**
   * Salva um novo template de assinatura
   * @param template Template a ser salvo
   * @returns Observable com o template salvo (incluindo ID gerado)
   */
  saveTemplate(template: SignatureTemplate): Observable<SignatureTemplate> {
    return this.http.post<SignatureTemplate>(this.apiUrl, template).pipe(
      map(savedTemplate => {
        // Converte a data de string para objeto Date
        savedTemplate.createdAt = new Date(savedTemplate.createdAt);
        
        // Atualiza o cache
        if (this.templatesCache) {
          this.templatesCache.push(savedTemplate);
        }
        
        return savedTemplate;
      }),
      catchError(error => {
        console.error('Erro ao salvar template de assinatura:', error);
        throw error;
      })
    );
  }
  
  /**
   * Atualiza um template de assinatura existente
   * @param template Template com as alterações
   * @returns Observable com o template atualizado
   */
  updateTemplate(template: SignatureTemplate): Observable<SignatureTemplate> {
    return this.http.put<SignatureTemplate>(`${this.apiUrl}/${template.id}`, template).pipe(
      map(updatedTemplate => {
        // Converte a data de string para objeto Date
        updatedTemplate.createdAt = new Date(updatedTemplate.createdAt);
        
        // Atualiza o cache
        if (this.templatesCache) {
          const index = this.templatesCache.findIndex(t => t.id === updatedTemplate.id);
          if (index !== -1) {
            this.templatesCache[index] = updatedTemplate;
          }
        }
        
        return updatedTemplate;
      }),
      catchError(error => {
        console.error('Erro ao atualizar template de assinatura:', error);
        throw error;
      })
    );
  }
  
  /**
   * Exclui um template de assinatura
   * @param templateId ID do template a ser excluído
   * @returns Observable com o resultado da operação
   */
  deleteTemplate(templateId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${templateId}`).pipe(
      map(() => {
        // Atualiza o cache
        if (this.templatesCache) {
          this.templatesCache = this.templatesCache.filter(t => t.id !== templateId);
        }
      }),
      catchError(error => {
        console.error('Erro ao excluir template de assinatura:', error);
        throw error;
      })
    );
  }
  
  /**
   * Limpa o cache de templates
   */
  clearCache(): void {
    this.templatesCache = [];
  }
}
