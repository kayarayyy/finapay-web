import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReviewLoan } from '../../core/models/review-loan';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanRequestService } from '../../core/services/loan-request.service';
import Swal from 'sweetalert2';
import { ImageModalComponent } from '../../shared/components/image-modal/image-modal.component';
interface FormData {
  identity: any;
  capital: any;
  contact: any;
}

@Component({
  selector: 'app-approval-loan',
  imports: [CommonModule, ReactiveFormsModule, ImageModalComponent],
  templateUrl: './approval-loan.component.html',
  styleUrl: './approval-loan.component.css',
  standalone: true,
})
export class ApprovalLoanComponent {
  currentSection = 1;
  loan_id = '';
  review_loan!: ReviewLoan;
  loanForm: FormGroup;
  formData: FormData = {
    identity: {},
    capital: {},
    contact: {},
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
    this.loanRequestService.getLoanRequestByIdApproval(this.loan_id).subscribe({
      next: (value) => {
        this.review_loan = value;
        this.review_loan.loanRequest.amount = this.fromRupiah(this.review_loan.loanRequest.amount.toString())
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
      },
    });
  }

  fromRupiah(rupiah: string): number {
    const cleanString = rupiah.replace(/[Rp\s.]/g, '');
    return Number(cleanString);
  }

  toRupiah(value: number): string {
    return 'Rp' + value.toLocaleString('id-ID', { maximumFractionDigits: 0 });
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

      this.formData.contact = {
        noteContact: this.loanForm.get('noteContact')?.value,
      };

      this.formData.capital = {
        noteCapital: this.loanForm.get('noteCapital')?.value,
      };

      const notes = [];

      if (this.formData.identity.noteIdentity?.trim()) {
        notes.push('Identity: ' + this.formData.identity.noteIdentity);
      }

      if (this.formData.contact.noteContact?.trim()) {
        notes.push('Contact: ' + this.formData.contact.noteContact);
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
            .updateLoanRequestApproval(this.loan_id, false, fullNote)
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

  approveLoan() {
    if (this.loanForm.valid) {
      this.formData.identity = {
        noteIdentity: this.loanForm.get('noteIdentity')?.value,
      };

      this.formData.capital = {
        noteCapital: this.loanForm.get('noteCapital')?.value,
      };

      this.formData.contact = {
        noteLoan: this.loanForm.get('noteLoan')?.value,
      };

      const notes = [];

      if (this.formData.identity.noteIdentity?.trim()) {
        notes.push('Identity: ' + this.formData.identity.noteIdentity);
      }

      if (this.formData.contact.noteLoan?.trim()) {
        notes.push('Contact: ' + this.formData.contact.noteLoan);
      }

      if (this.formData.capital.noteCapital?.trim()) {
        notes.push('Capital: ' + this.formData.capital.noteCapital);
      }

      const fullNote = notes.join(', ');

      Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Kamu akan menyetujui pengajuan!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Setujui',
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
            .updateLoanRequestApproval(this.loan_id, true, fullNote)
            .subscribe({
              next: (res) => {
                Swal.fire(
                  'Success',
                  res.message || 'Sukses menyetujui pengajuan!',
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
