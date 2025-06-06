import { Component, OnInit } from '@angular/core';
import { ReviewLoan } from '../../core/models/review-loan';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanRequestService } from '../../core/services/loan-request.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ImageModalComponent } from '../../shared/components/image-modal/image-modal.component';

interface FormData {
  identity: any;
  capital: any;
}

@Component({
  selector: 'app-disbursement-detail',
  imports: [CommonModule, ReactiveFormsModule, ImageModalComponent],
  templateUrl: './disbursement-detail.component.html',
  styleUrl: './disbursement-detail.component.css',
  standalone: true,
})
export class DisbursementDetailComponent implements OnInit {
  currentSection = 1;
  loan_id = '';
  review_loan!: ReviewLoan;
  loanForm: FormGroup;
  formData: FormData = {
    identity: {},
    capital: {}
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private loanRequestService: LoanRequestService,
    private router: Router
  ) {
    this.loanForm = this.fb.group({
      noteIdentity: [''],
      noteCapital: [''],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.loan_id = params.get('id') || '';
    });
    // this.loan_id = this.route.snapshot.paramMap.get('id') || '';
    this.loanRequestService
      .getLoanRequestByIdDisbursement(this.loan_id)
      .subscribe({
        next: (value) => {
          this.review_loan = value;
          this.review_loan.loanRequest.amount = this.fromRupiah(this.review_loan.loanRequest.amount.toString())
        },
        error: (err) => {
          console.error('Error fetching employee details:', err);
        },
      });
    // Anda bisa menambahkan logika inisialisasi data di sini jika diperlukan
  }

  toRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID', { maximumFractionDigits: 0 });
  }

  fromRupiah(rupiah: string): number {
    const cleanString = rupiah.replace(/[Rp\s.]/g, '');
    return Number(cleanString);
  }

  nextSection() {
    if (this.currentSection < 4) {
      this.currentSection++;
    }
  }

  prevSection() {
    if (this.currentSection > 1) {
      this.currentSection--;
    }
  }

  rejectLoan() {
    if (this.loanForm.valid) {
      this.formData.identity = {
        noteIdentity: this.loanForm.get('noteIdentity')?.value,
      };

      this.formData.capital = {
        noteCapital: this.loanForm.get('noteCapital')?.value,
      };

      const notes = [];

      if (this.formData.identity.noteIdentity?.trim()) {
        notes.push('Identity: ' + this.formData.identity.noteIdentity);
      }

      if (this.formData.capital.noteCapital?.trim()) {
        notes.push('Capital: ' + this.formData.capital.noteCapital);
      }

      const fullNote = notes.join(', ');

      // Tampilkan konfirmasi
      Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Kamu akan membatalkan pencairan dana!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Batalkan',
      }).then((result) => {
        if (result.isConfirmed) {
          // Pastikan kamu punya ID LoanRequest yang sedang diproses
          Swal.fire({
            title: 'Memproses...',
            text: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          this.loanRequestService
            .updateLoanRequestDisbursement(this.loan_id, false, fullNote)
            .subscribe({
              next: (res) => {
                Swal.fire(
                  'Pencairan Dibatalkan',
                  res.message || 'Sukses membatalkan pencairan dana!',
                  'success'
                ).then(() => {
                  this.router.navigate(['/disbursement']);
                });
              },
              error: (err) => {
                Swal.fire(
                  'Error',
                  err.error.message || 'Terjadi kesalahan',
                  'error'
                );
              },
            });
        }
      });
    } else {
      console.log('Formulir tidak valid');
      Swal.fire('Invalid', 'Please fill in the form correctly!', 'warning');
    }
  }

  disburseLoan() {
    if (this.loanForm.valid) {
      this.formData.identity = {
        noteIdentity: this.loanForm.get('noteIdentity')?.value,
      };

      this.formData.capital = {
        noteCapital: this.loanForm.get('noteCapital')?.value,
      };

      const notes = [];

      if (this.formData.identity.noteIdentity?.trim()) {
        notes.push('Identity: ' + this.formData.identity.noteIdentity);
      }

      if (this.formData.capital.noteCapital?.trim()) {
        notes.push('Capital: ' + this.formData.capital.noteCapital);
      }

      const fullNote = notes.join(', ');

      // Tampilkan konfirmasi
      Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Kamu akan mencairkan dana!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Cairkan Dana',
        cancelButtonText: 'Batalkan',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Memproses...',
            text: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          this.loanRequestService
            .updateLoanRequestDisbursement(this.loan_id, true, fullNote)
            .subscribe({
              next: (res) => {
                Swal.fire(
                  'Success',
                  res.message || 'Sukses mencairkan dana!',
                  'success'
                ).then(() => {
                  this.router.navigate(['/disbursement']);
                });
              },
              error: (err) => {
                Swal.fire(
                  'Error',
                  err.error.message || 'Terjadi kesalahan',
                  'error'
                );
              },
            });
        }
      });
    } else {
      console.log('Formulir tidak valid');
      Swal.fire('Invalid', 'Please fill in the form correctly!', 'warning');
    }
  }

  toggleZoom(event: MouseEvent) {
    const img = event.target as HTMLImageElement;
    if (img.style.transform === 'scale(2)') {
      img.style.transform = 'scale(1)';
      img.style.cursor = 'zoom-in';
    } else {
      img.style.transform = 'scale(2)';
      img.style.cursor = 'zoom-out';
    }
  }

  submitForm() { }
}
