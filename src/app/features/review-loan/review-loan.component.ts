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

interface FormData {
  identity: any;
  capital: any;
  loanDetails: any;
}

@Component({
  selector: 'app-review-loan',
  templateUrl: './review-loan.component.html',
  styleUrl: './review-loan.component.css',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
})
export class ReviewLoanComponent implements OnInit {
  currentSection = 1;
  loan_id = '';
  review_loan!: ReviewLoan;
  loanForm: FormGroup;
  formData: FormData = {
    identity: {},
    capital: {},
    loanDetails: {},
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private loanRequestService: LoanRequestService,
    private router: Router
  ) {
    this.loanForm = this.fb.group({
      // Bagian Identitas
      namaLengkap: [{ value: '', disabled: true }],
      alamat: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      noteIdentity: [''],
      // ... tambahkan field identitas lainnya

      // Bagian Capital
      penghasilan: [{ value: '', disabled: true }],
      kepemilikanRumah: [''],
      noteCapital: [''],
      // ... tambahkan field capital lainnya

      // Bagian Pengajuan Peminjaman
      jumlahPinjaman: [{ value: '', disabled: true }],
      tenor: [{ value: '', disabled: true }],
      tujuanPenggunaan: [{ value: '', disabled: true }],
      noteLoan: [''],
      // ... tambahkan field pengajuan lainnya
    });
  }

  ngOnInit(): void {
    this.loan_id = this.route.snapshot.paramMap.get('id') || '';
    this.loanRequestService.getLoanRequestByIdReview(this.loan_id).subscribe({
      next: (value) => {
        this.review_loan = value;
        const alamatParts = [
          this.review_loan.customerDetails.street,
          this.review_loan.customerDetails.district,
          this.review_loan.customerDetails.province,
          this.review_loan.customerDetails.postalCode,
        ];

        const formattedAlamat = alamatParts
          .filter((part) => part && part.trim() !== '')
          .join(', ');
        this.loanForm.patchValue({
          namaLengkap: this.review_loan.customerDetails.user.name,
          email: this.review_loan.customerDetails.user.email,
          alamat: formattedAlamat !== '' ? formattedAlamat : '-',
          jumlahPinjaman: this.review_loan.loanRequest.amount,
          tenor: this.review_loan.loanRequest.tenor,
        });
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
      },
    });
    // Anda bisa menambahkan logika inisialisasi data di sini jika diperlukan
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
    console.log('Pinjaman Ditolak');
    // Lakukan logika penolakan pinjaman
  }

  recommendLoan() {
    if (this.loanForm.valid) {
      this.formData.identity = {
        noteIdentity: this.loanForm.get('noteIdentity')?.value,
      };

      this.formData.capital = {
        noteCapital: this.loanForm.get('noteCapital')?.value,
      };

      this.formData.loanDetails = {
        noteLoan: this.loanForm.get('noteLoan')?.value,
      };

      const notes = [];

      if (this.formData.identity.noteIdentity?.trim()) {
        notes.push('Identity: ' + this.formData.identity.noteIdentity);
      }

      if (this.formData.capital.noteCapital?.trim()) {
        notes.push('Capital: ' + this.formData.capital.noteCapital);
      }

      if (this.formData.loanDetails.noteLoan?.trim()) {
        notes.push('Loan: ' + this.formData.loanDetails.noteLoan);
      }

      const fullNote = notes.join(', ');

      // Tampilkan konfirmasi
      Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Kamu akan merekomendasikan pengajuan!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Rekomendasikan',
        cancelButtonText: 'Batalkan',
      }).then((result) => {
        if (result.isConfirmed) {
          // Pastikan kamu punya ID LoanRequest yang sedang diproses

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
              },
            });
        }
      });
    } else {
      console.log('Formulir tidak valid');
      Swal.fire('Invalid', 'Please fill in the form correctly!', 'warning');
    }
  }

  submitForm() {}
}
