# Implementação de Validação Avançada de Documentos PDF

Este documento descreve a implementação da validação avançada de documentos PDF no backend do sistema de assinatura digital.

## Arquivos Criados ou Modificados

### Arquivos Criados:
1. `/src/document/pdf-validation.service.ts` - Serviço para validação avançada de documentos PDF
2. `/src/document/pdf-validation.service.spec.ts` - Testes unitários para o serviço de validação
3. `/.env.example` - Atualizado com as configurações para validação de PDF

### Arquivos Modificados:
1. `/src/document/document.module.ts` - Registrado o serviço de validação de PDF
2. `/src/document/document.service.ts` - Integrado o serviço de validação no fluxo de upload

## Funcionalidades Implementadas

O serviço de validação de PDF (`PdfValidationService`) realiza as seguintes verificações:

1. **Validação de Formato**: Verifica se o arquivo é realmente um PDF válido e não está corrompido.
2. **Verificação de Senha**: Detecta se o PDF está protegido por senha e rejeita arquivos criptografados.
3. **Detecção de Scripts Maliciosos**: Analisa o conteúdo do PDF em busca de padrões suspeitos como JavaScript, ações automáticas, formulários interativos, etc.
4. **Limitação de Tamanho**: Verifica se o tamanho do arquivo está dentro do limite configurado (padrão: 10MB).
5. **Limitação de Páginas**: Verifica se o número de páginas está dentro do limite configurado (padrão: 100 páginas).

## Configuração

As seguintes variáveis de ambiente foram adicionadas para configurar a validação de PDF:

- `MAX_PDF_SIZE_MB`: Tamanho máximo do arquivo PDF em megabytes (padrão: 10MB)
- `MAX_PDF_PAGES`: Número máximo de páginas permitido (padrão: 100 páginas)

Estas configurações podem ser ajustadas no arquivo `.env` conforme necessário.

## Integração no Fluxo de Upload

A validação de PDF foi integrada no método `create()` do `DocumentService`, que é chamado quando um documento é enviado através do endpoint `POST /api/documents`. O processo de validação ocorre antes do upload do arquivo para o MinIO, economizando recursos de armazenamento para arquivos inválidos.

## Tratamento de Erros

Quando um PDF não passa na validação, o serviço lança uma exceção `BadRequestException` com uma mensagem de erro específica em português, indicando o motivo da rejeição. Estas mensagens são propagadas para o cliente, permitindo que o frontend exiba informações úteis ao usuário.

## Como Testar

Para testar a funcionalidade de validação de PDF:

1. Inicie o servidor em modo de desenvolvimento:
   ```
   npm run start:dev
   ```

2. Envie uma solicitação POST para o endpoint de upload de documentos com diferentes tipos de arquivos PDF:
   - PDF válido dentro dos limites
   - PDF protegido por senha
   - PDF com scripts maliciosos
   - Arquivo muito grande
   - PDF com muitas páginas
   - Arquivo que não é um PDF

3. Verifique as respostas do servidor para confirmar que a validação está funcionando corretamente.

### Exemplo de Requisição com cURL:

```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -F "file=@caminho/para/documento.pdf" \
  -F "title=Documento de Teste" \
  -F "description=Descrição do documento de teste"
```

## Testes Unitários

Foram criados testes unitários básicos para o serviço de validação de PDF. Para executar os testes:

```bash
npm test -- pdf-validation.service
```

Os testes verificam:
- Rejeição de arquivos muito grandes
- Aceitação de PDFs válidos dentro dos limites
