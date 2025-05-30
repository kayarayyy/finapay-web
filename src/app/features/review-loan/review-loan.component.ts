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
  formData: FormData = {
    identity: {},
    capital: {},
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private loanRequestService: LoanRequestService,
    private router: Router
  ) {
    this.loanForm = this.fb.group({
      // Bagian Identitas
      // namaLengkap: [{ value: '', disabled: true }],
      // alamat: [{ value: '', disabled: true }],
      // noKtp: [{ value: '', disabled: true }],
      // tglLahir: [{ value: '', disabled: true }],
      noteIdentity: [''],
      // ... tambahkan field identitas lainnya

      // Bagian Capital
      // penghasilan: [{ value: '', disabled: true }],
      // statusPekerjaan: [{ value: '', disabled: true }],
      // Bagian Pengajuan Peminjaman
      // jumlahPinjaman: [{ value: '', disabled: true }],
      // plafond: [{ value: '', disabled: true }],
      // sisaPlafond: [{ value: '', disabled: true }],
      // tenor: [{ value: '', disabled: true }],
      // tujuanPenggunaan: [{ value: '', disabled: true }],
      noteCapital: [''],

      // ... tambahkan field pengajuan lainnya
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.loan_id = params.get('id') || '';
    });
    // this.loan_id = this.route.snapshot.paramMap.get('id') || '';
    this.loanRequestService.getLoanRequestByIdReview(this.loan_id).subscribe({
      next: (value) => {
        this.review_loan = value;
        this.review_loan.loanRequest.amount = this.fromRupiah(this.review_loan.loanRequest.amount.toString())
        // const alamatParts = [
        //   this.review_loan.customerDetails.street,
        //   this.review_loan.customerDetails.district,
        //   this.review_loan.customerDetails.province,
        //   this.review_loan.customerDetails.postalCode,
        // ];

        // const formattedAlamat = alamatParts
        //   .filter((part) => part && part.trim() !== '')
        //   .join(', ');
        // this.review_loan.customerDetails.street = formattedAlamat
        // this.loanForm.patchValue({
        //   namaLengkap: this.review_loan.customerDetails.user.name,
        //   alamat: formattedAlamat !== '' ? formattedAlamat : '-',
        //   noKtp: '-',
        //   tglLahir: '-',

        //   noTelpon: '-',
        //   email: this.review_loan.customerDetails.user.email,
        //   kontakDarurat1: '-',
        //   hubungan1: '-',
        //   kontak1: '-',
        //   kontakDarurat2: '-',
        //   hubungan2: '-',
        //   kontak2: '-',

        //   penghasilan: 0,
        //   statusPekerjaan: '-',
        //   jumlahPinjaman: this.review_loan.loanRequest.amount,
        //   plafond: '-',
        //   sisaPlafond: this.review_loan.customerDetails.availablePlafond,
        //   tenor: this.review_loan.loanRequest.tenor,
        //   tujuanPenggunaan: '-',
        // });
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
    // Hilangkan simbol 'Rp', spasi, dan titik pemisah ribuan
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
        text: 'Kamu akan menolak pengajuan!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Tolak',
        cancelButtonText: 'Batalkan',
      }).then((result) => {
        if (result.isConfirmed) {
          // Pastikan kamu punya ID LoanRequest yang sedang diproses

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

  submitForm() {}
}
