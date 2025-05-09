import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentFinalService } from '../../services/document-final.service';

@Component({
  selector: 'app-document-integrity-checker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './document-integrity-checker.component.html',
  styleUrls: ['./document-integrity-checker.component.css']
})
export class DocumentIntegrityCheckerComponent {
  integrityForm: FormGroup;
  isLoading = false;
  verificationResult: { isValid: boolean, message: string } | null = null;
  selectedFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private documentFinalService: DocumentFinalService,
    private snackBar: MatSnackBar
  ) {
    this.integrityForm = this.fb.group({
      file: [null, Validators.required],
      hash: ['', Validators.required]
    });
  }

  /**
   * Manipula a seleção de arquivo
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.integrityForm.patchValue({ file });
      this.selectedFileName = file.name;
    }
  }

  /**
   * Limpa o formulário
   */
  clearForm(): void {
    this.integrityForm.reset();
    this.selectedFileName = null;
    this.verificationResult = null;
  }

  /**
   * Verifica a integridade do documento
   */
  verifyIntegrity(): void {
    if (this.integrityForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      return;
    }

    this.isLoading = true;
    this.verificationResult = null;

    const formValue = this.integrityForm.value;
    const file = formValue.file;
    const hash = formValue.hash.trim();

    this.documentFinalService.verifyDocumentIntegrity(file, hash).subscribe({
      next: (result) => {
        this.verificationResult = result;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open(`Erro ao verificar integridade: ${error.message}`, 'Fechar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }
}
