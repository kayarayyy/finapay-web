import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import {
  Plafond,
  PlafondCreateUpdate,
  PlafondService,
} from '../../core/services/plafond.service';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-plafond',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './plafond.component.html',
  styleUrls: ['./plafond.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PlafondComponent implements OnInit {
  plafonds: Plafond[] = [];
  isLoading = false;
  isProcessing = false;
  showModal = false;
  isEditMode = false;
  selectedPlafondId = '';

  // Loading states untuk setiap item
  deletingPlafondIds = new Set<string>();
  updatingPlafondIds = new Set<string>();

  formData: PlafondCreateUpdate = {
    amount: '',
    plan: '',
    annualRate: 0,
    adminRate: 0,
    colorStart: '#007bff',
    colorEnd: '#0056b3',
  };

  private _amount: number = 0;

  get formattedAmount(): string {
    return this._amount > 0 ? 'Rp' + this._amount.toLocaleString('id-ID') : '';
  }

  onAmountChange(value: string): void {
    const numeric = value.replace(/[^\d]/g, '');
    this._amount = +numeric;
    this.formData.amount = this._amount;
  }

  allowOnlyNumber(event: KeyboardEvent): void {
    const allowed = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'Backspace',
    ];
    if (!allowed.includes(event.key)) {
      event.preventDefault();
    }
  }

  set formattedAmount(value: string) {
    const numeric = value.replace(/[^\d]/g, '');
    this._amount = +numeric;
    this.formData.amount = this._amount;
  }

  // Helper properties for percentage display in form
  get annualRatePercent(): number {
    return this.formData.annualRate * 100;
  }

  set annualRatePercent(value: number) {
    this.formData.annualRate = value / 100;
  }

  get adminRatePercent(): number {
    return this.formData.adminRate * 100;
  }

  set adminRatePercent(value: number) {
    this.formData.adminRate = value / 100;
  }

  // Helper methods untuk check loading states
  isPlafondDeleting(id: string): boolean {
    return this.deletingPlafondIds.has(id);
  }

  isPlafondUpdating(id: string): boolean {
    return this.updatingPlafondIds.has(id);
  }

  constructor(private plafondService: PlafondService) {}

  ngOnInit(): void {
    this.loadPlafonds();
  }

  async loadPlafonds(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.plafondService.getPlafonds());
      if (response && response.status === 'success') {
        this.plafonds = response.data;
      } else {
        throw new Error(response?.message || 'Failed to load plafonds');
      }
    } catch (error: any) {
      console.error('Error loading plafonds:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text:
          error?.error?.message || 'Terjadi kesalahan saat memuat data plafond',
        confirmButtonColor: '#d33',
      });
    } finally {
      this.isLoading = false;
    }
  }

  openModal(plafond?: Plafond): void {
    this.showModal = true;
    this.isEditMode = !!plafond;

    if (plafond) {
      this.selectedPlafondId = plafond.id;
      this.updatingPlafondIds.add(plafond.id);

      // Ubah format string 'Rp1.000.000' ke angka
      const numericAmount = +String(plafond.amount).replace(/[^\d]/g, '');

      this._amount = numericAmount;
      this.formData = {
        ...plafond,
        amount: numericAmount,
      };
    } else {
      this.selectedPlafondId = '';
      this.resetForm();
    }

    document.body.style.overflow = 'hidden';
  }

  closeModal(event?: Event): void {
    // Check if clicked on backdrop
    if (event && (event.target as Element).className.includes('modal')) {
      this.showModal = false;
    } else if (!event) {
      this.showModal = false;
    }

    if (!this.showModal) {
      this.resetForm();
      // Clear updating state
      this.updatingPlafondIds.clear();
      // Restore body scroll
      document.body.style.overflow = 'auto';
    }
  }

  resetForm(): void {
    this.formData = {
      amount: '',
      plan: '',
      annualRate: 0,
      adminRate: 0,
      colorStart: '#007bff',
      colorEnd: '#0056b3',
    };
    this._amount = 0;
    this.isEditMode = false;
    this.selectedPlafondId = '';
  }

  async savePlafond(): Promise<void> {
    this.isProcessing = true;

    try {
      let response;

      if (this.isEditMode) {
        response = await firstValueFrom(
          this.plafondService.updatePlafond(
            this.selectedPlafondId,
            this.formData
          )
        );
      } else {
        response = await firstValueFrom(
          this.plafondService.createPlafond(this.formData)
        );
      }

      if (response && (response.status_code === 201 || response.status_code === 200)) {
        // Update data secara reaktif
        if (this.isEditMode) {
          // Update existing plafond in array
          const index = this.plafonds.findIndex(p => p.id === this.selectedPlafondId);
          if (index !== -1) {
            this.plafonds[index] = { ...response.data };
          }
        } else {
          // Add new plafond to array
          this.plafonds = [response.data, ...this.plafonds];
        }

        // Show success toast (less intrusive)
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });

        Toast.fire({
          icon: 'success',
          title: `Plafond berhasil ${this.isEditMode ? 'diperbarui' : 'ditambahkan'}!`
        });

        this.closeModal();
      } else {
        throw new Error(response?.message || 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving plafond:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text:
          error?.error?.message ||
          `Terjadi kesalahan saat ${
            this.isEditMode ? 'memperbarui' : 'menambahkan'
          } plafond`,
        confirmButtonColor: '#d33',
      });
    } finally {
      this.isProcessing = false;
    }
  }

  deletePlafond(plafond: Plafond): void {
    Swal.fire({
      title: 'Konfirmasi Hapus',
      text: `Apakah Anda yakin ingin menghapus plafond ${plafond.plan}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Set loading state untuk item specific
        this.deletingPlafondIds.add(plafond.id);

        try {
          const response = await firstValueFrom(
            this.plafondService.deletePlafond(plafond.id)
          );

          if (response && response.status_code === 200) {
            // Update data secara reaktif - remove dari array
            this.plafonds = this.plafonds.filter(p => p.id !== plafond.id);

            // Show success toast
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            });

            Toast.fire({
              icon: 'success',
              title: 'Plafond berhasil dihapus!'
            });
          } else {
            throw new Error(response?.message || 'Delete failed');
          }
        } catch (error: any) {
          console.error('Error deleting plafond:', error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Menghapus',
            text:
              error?.error?.message ||
              'Terjadi kesalahan saat menghapus plafond',
            confirmButtonColor: '#d33',
          });
        } finally {
          // Remove loading state
          this.deletingPlafondIds.delete(plafond.id);
        }
      }
    });
  }

  // Method untuk refresh data secara manual jika diperlukan
  async refreshPlafonds(): Promise<void> {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    Toast.fire({
      icon: 'info',
      title: 'Memperbarui data...'
    });

    await this.loadPlafonds();
  }

  // TrackBy function untuk optimasi ngFor
  trackByPlafondId(index: number, plafond: Plafond): string {
    return plafond.id;
  }
}
