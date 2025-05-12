
/**
 * Modelo de dados para templates de assinatura
 * 
 * Este modelo representa um template de assinatura salvo pelo usuário,
 * contendo a imagem da assinatura e suas configurações de estilo.
 */
export interface SignatureTemplate {
  /**
   * Identificador único do template
   */
  id: string;
  
  /**
   * Nome do template definido pelo usuário
   */
  name: string;
  
  /**
   * Dados da imagem da assinatura em formato base64
   */
  imageData: string;
  
  /**
   * Cor da assinatura em formato hexadecimal
   */
  color: string;
  
  /**
   * Espessura da linha da assinatura em pixels
   */
  thickness: number;
  
  /**
   * Estilo da linha da assinatura (solid, dashed)
   */
  style: string;
  
  /**
   * Data de criação do template
   */
  createdAt: Date;
}
