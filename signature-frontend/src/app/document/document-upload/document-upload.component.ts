import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule, DecimalPipe } from '@angular/common'; // Import CommonModule and DecimalPipe
import { DocumentService } from '../../services/document.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { DocumentSignatory } from '../../models/document.model';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop'; // Import DragDropModule
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading indicator

@Component({
  selector: 'app-document-upload',
  standalone: true, // Make component standalone
  imports: [
    CommonModule, // Import CommonModule for *ngIf, *ngFor
    ReactiveFormsModule, // Import ReactiveFormsModule for formGroup
    FormsModule, // Import FormsModule for ngModel
    DragDropModule, // Import DragDropModule for cdkDrag, cdkDropList
    DecimalPipe, // Import DecimalPipe (or use NumberPipe)
    MatProgressSpinnerModule // Import for loading indicator
  ],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css'],
})
export class DocumentUploadComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading = false;
  searchResults: User[] = [];
  searchQuery = '';

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private userService: UserService
  ) {
    this.uploadForm = this.fb.group({
      fileInput: [null, Validators.required],
      signatories: this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {}

  get signatories(): FormArray {
    return this.uploadForm.get('signatories') as FormArray;
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      if (file.type === 'application/pdf') {
        this.isLoading = true;
        this.errorMessage = null;
        
        // Validar o PDF antes de aceitar
        this.documentService.validatePdf(file).subscribe({
          next: (result) => {
            if (result.isValid) { // ou result.valid, dependendo da correção anterior
              this.selectedFile = file;
              // Remova ou comente esta linha:
              // this.uploadForm.patchValue({ fileInput: file });
            } else {
              this.selectedFile = null;
              // Aqui você pode limpar o valor, mas apenas com string vazia
              this.uploadForm.patchValue({ fileInput: '' });
              this.errorMessage = `O PDF não é válido: ${result.errors?.join(', ') || 'Formato inválido'}`;
              element.value = '';
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.selectedFile = null;
            this.uploadForm.patchValue({ fileInput: null });
            this.errorMessage = `Erro ao validar PDF: ${error.message}`;
            element.value = '';
            this.isLoading = false;
          }
        });
      } else {
        this.selectedFile = null;
        this.uploadForm.patchValue({ fileInput: null });
        this.errorMessage = 'Por favor, selecione um arquivo PDF.';
        element.value = '';
      }
    } else {
        this.selectedFile = null;
        this.uploadForm.patchValue({ fileInput: null });
    }
  }

  searchUsers(): void {
    if (this.searchQuery.trim().length > 2) {
      // Assuming userService.searchUsers exists and returns Observable<User[]>
      this.userService.searchUsers(this.searchQuery).subscribe({
        next: (users: User[]) => this.searchResults = users,
        error: (err: any) => console.error('Erro ao buscar usuários:', err)
      });
    } else {
      this.searchResults = [];
    }
  }

  addSignatory(user: User): void {
    const existingSignatory = this.signatories.controls.find(control => control.value.userId === user.id);
    if (!existingSignatory) {
      const signatoryGroup = this.fb.group({
        userId: [user.id, Validators.required],
        name: [user.name],
        email: [user.email]
      });
      this.signatories.push(signatoryGroup);
      this.searchQuery = '';
      this.searchResults = [];
    } else {
      console.warn('Usuário já adicionado como signatário.');
    }
  }

  removeSignatory(index: number): void {
    this.signatories.removeAt(index);
  }

  drop(event: CdkDragDrop<FormGroup[]>) {
    const controls = this.signatories.controls;
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    this.signatories.setValue(controls.map(control => control.value));
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.uploadForm.invalid || !this.selectedFile) {
      this.errorMessage = 'Por favor, selecione um arquivo PDF e adicione pelo menos um signatário.';
      this.uploadForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Preparar os signatários como um array de objetos simples
    // Sem incluir propriedades desnecessárias que possam ser interpretadas como 'metadata'
    const signatoriesData: Partial<DocumentSignatory>[] = this.signatories.controls.map((control, index) => {
      const value = control.value;
      // Incluir apenas as propriedades necessárias para evitar o erro 'property metadata should not exist'
      return {
        userId: Number(value.userId), // Garantir que userId seja um número
        order: index  // Ordem sequencial baseada na posição no array
      };
    });

    console.log('Enviando signatários:', signatoriesData);

    try {
      // Enviar o documento com os signatários
      this.documentService.uploadDocument(this.selectedFile, signatoriesData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = `Documento '${response.originalFilename || this.selectedFile?.name}' enviado com sucesso!`;
          this.uploadForm.reset();
          this.signatories.clear();
          this.selectedFile = null;
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = `Erro ao enviar documento: ${error.message}`;
          console.error('Upload error:', error);
        }
      });
      
    } catch (error: any) {
      this.isLoading = false;
      this.errorMessage = `Erro ao preparar documento: ${error.message}`;
      console.error('Preparation error:', error);
    }
  }
}