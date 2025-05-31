import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoanRequestService } from '../../core/services/loan-request.service';
import { ReviewLoan } from '../../core/models/review-loan';
import Swal from 'sweetalert2';
import { ImageModalComponent } from '../../shared/components/image-modal/image-modal.component';
import { delay } from 'rxjs';

interface FormData {
  identity: any;
  capital: any;
}

@Component({
  selector: 'app-review-loan',
  templateUrl: './review-loan.component.html',
  styleUrl: './review-loan.component.css',
  imports: [CommonModule, ReactiveFormsModule, ImageModalComponent],
  standalone: true,
})
export class ReviewLoanComponent implements OnInit {
  currentSection = 1;
  loan_id = '';
  review_loan!: ReviewLoan;
  loanForm: FormGroup;
  lat = -6.200000; 
  lng = 106.816666;
  apiKey = 'AIzaSyA86DgTHWD6n2rdV2I7EmX2KgGspLXudtc'; 
  formData: FormData = {
    identity: {},
    capital: {},
  };
  Math = Math;

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
    this.loanRequestService.getLoanRequestByIdReview(this.loan_id).subscribe({
      next: (value) => {
        this.review_loan = value;
        this.review_loan.loanRequest.amount = this.fromRupiah(this.review_loan.loanRequest.amount.toString())
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
      },
    });
  }

  get staticMapUrl(): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${this.lat},${this.lng}&zoom=15&size=600x300&markers=color:red%7C${this.lat},${this.lng}&key=${this.apiKey}`;
  }

  getDIRBadgeClass(dirValue: number): string {
    if (dirValue <= 30) {
      return 'bg-success text-white';
    } else if (dirValue <= 50) {
      return 'bg-warning text-dark';
    } else if (dirValue <= 70) {
      return 'bg-orange text-white';
    } else {
      return 'bg-danger text-white';
    }
  }

  getDIRProgressClass(dirValue: number): string {
    if (dirValue <= 30) {
      return 'bg-success';
    } else if (dirValue <= 50) {
      return 'bg-warning';
    } else if (dirValue <= 70) {
      return 'bg-orange';
    } else {
      return 'bg-danger';
    }
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

      Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Kamu akan menolak pengajuan!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Tolak',
        cancelButtonText: 'Batalkan',
      }).then((result) => {
        if (result.isConfirmed) {

          this.loanRequestService
            .updateLoanRequestReview(this.loan_id, false, fullNote)
            .subscribe({
              next: (res) => {
                Swal.fire(
                  'Success',
                  res.message || 'Sukses menolak pengajuan!',
                  'success'
                ).then(() => {
                  this.router.navigate(['/loan-requests']);
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

  recommendLoan() {
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

      Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Kamu akan merekomendasikan pengajuan!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Rekomendasikan',
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
            .updateLoanRequestReview(this.loan_id, true, fullNote)
            .subscribe({
              next: (res) => {
                Swal.fire(
                  'Success',
                  res.message || 'Sukses merekomendasikan pengajuan!',
                  'success'
                ).then(() => {
                  this.router.navigate(['/loan-requests']);
                });
              },
              error: (err) => {
                Swal.fire(
                  'Error',
                  err.error.message || 'Terjadi kesalahan',
                  'error'
                );
              }
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
