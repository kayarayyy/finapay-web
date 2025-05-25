import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PlafondData, PlafondService } from '../../core/services/plafond.service';

@Component({
  selector: 'app-plafond',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './plafond.component.html',
  styleUrls: ['./plafond.component.css']
})
export class PlafondManagementComponent implements OnInit, OnDestroy {
  plafonds: PlafondData[] = [];
  isLoading = false;
  showModal = false;
  showDeleteModal = false;
  isEditMode = false;
  selectedPlafond: PlafondData | null = null;
  plafondForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  sortBy = 'plan';
  sortOrder: 'asc' | 'desc' = 'asc';

  private destroy$ = new Subject<void>();

  // Available plan options
  planOptions = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EMERALD'];

  constructor(
    private plafondService: PlafondService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadPlafonds();
    this.subscribeToPlafonds();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.plafondForm = this.fb.group({
      amount: ['', [Validators.required]],
      plan: ['', [Validators.required]],
      annualRate: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
      adminRate: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
      colorStart: ['#000000', [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],
      colorEnd: ['#000000', [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],
    });
  }

  private subscribeToPlafonds(): void {
    this.plafondService.plafonds$
      .pipe(takeUntil(this.destroy$))
      .subscribe(plafonds => {
        this.plafonds = plafonds;
      });
  }

  private loadPlafonds(): void {
    this.isLoading = true;
    this.plafondService.getPlafonds()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status_code != 200) {
            this.showError(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.message);
        }
      });
  }

  // Modal operations
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedPlafond = null;
    this.plafondForm.reset();
    this.plafondForm.patchValue({
      annualRate: 0.12,
      adminRate: 0.025,
      colorStart: '#000000',
      colorEnd: '#000000'
    });
    this.showModal = true;
    this.clearMessages();
  }

  openEditModal(plafond: PlafondData): void {
    this.isEditMode = true;
    this.selectedPlafond = plafond;
    this.plafondForm.patchValue({
      amount: this.plafondService.parseCurrency(plafond.amount).toString(),
      plan: plafond.plan,
      annualRate: plafond.annualRate,
      adminRate: plafond.adminRate,
      colorStart: plafond.colorStart,
      colorEnd: plafond.colorEnd
    });
    this.showModal = true;
    this.clearMessages();
  }

  openDeleteModal(plafond: PlafondData): void {
    this.selectedPlafond = plafond;
    this.showDeleteModal = true;
    this.clearMessages();
  }

  closeModal(): void {
    this.showModal = false;
    this.showDeleteModal = false;
    this.selectedPlafond = null;
    this.plafondForm.reset();
    this.clearMessages();
  }

  // CRUD operations
  savePlafond(): void {
    if (this.plafondForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.plafondForm.value;
    const plafondData: PlafondData = {
      amount: this.plafondService.formatCurrency(parseInt(formValue.amount)),
      plan: formValue.plan.toUpperCase(),
      annualRate: parseFloat(formValue.annualRate),
      adminRate: parseFloat(formValue.adminRate),
      colorStart: formValue.colorStart,
      colorEnd: formValue.colorEnd
    };

    // Validate data
    const errors = this.plafondService.validatePlafond(plafondData);
    if (errors.length > 0) {
      this.showError(errors.join(', '));
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.selectedPlafond?.id) {
      this.updatePlafond(this.selectedPlafond.id, plafondData);
    } else {
      this.createPlafond(plafondData);
    }
  }

  private createPlafond(plafondData: PlafondData): void {
    this.plafondService.createPlafond(plafondData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showSuccess('Plafond berhasil dibuat');
            this.closeModal();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.message);
        }
      });
  }

  private updatePlafond(id: string, plafondData: PlafondData): void {
    this.plafondService.updatePlafond(id, plafondData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showSuccess('Plafond berhasil diperbarui');
            this.closeModal();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.message);
        }
      });
  }

  confirmDelete(): void {
    if (!this.selectedPlafond?.id) return;

    this.isLoading = true;
    this.plafondService.deletePlafond(this.selectedPlafond.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.showSuccess('Plafond berhasil dihapus');
            this.closeModal();
          } else {
            this.showError(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.message);
        }
      });
  }

  // Utility methods
  get filteredPlafonds(): PlafondData[] {
    let filtered = this.plafonds.filter(plafond =>
      plafond.plan.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      plafond.amount.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof PlafondData];
      let bValue: any = b[this.sortBy as keyof PlafondData];

      if (this.sortBy === 'amount') {
        aValue = this.plafondService.parseCurrency(a.amount);
        bValue = this.plafondService.parseCurrency(b.amount);
      }

      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  sortPlafonds(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.plafondForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} wajib diisi`;
      if (field.errors['min']) return `${fieldName} tidak boleh kurang dari ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} tidak boleh lebih dari ${field.errors['max'].max}`;
      if (field.errors['pattern']) return `Format ${fieldName} tidak valid`;
    }
    return '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.plafondForm.controls).forEach(key => {
      const control = this.plafondForm.get(key);
      control?.markAsTouched();
    });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.clearMessages(), 3000);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Format percentage for display
  formatPercentage(rate: number): string {
    return (rate * 100).toFixed(1) + '%';
  }

  // Get gradient background style
  getGradientStyle(plafond: PlafondData): string {
    return `linear-gradient(135deg, ${plafond.colorStart} 0%, ${plafond.colorEnd} 100%)`;
  }
}