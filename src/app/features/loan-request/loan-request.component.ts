import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { LoanRequest } from '../../core/models/loan-request.model';
import { LoanRequestService } from '../../core/services/loan-request.service';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [CardComponent, TableComponent, NgIf, CommonModule],
  templateUrl: './loan-request.component.html',
  styleUrl: './loan-request.component.css',
})
export class LoanRequestComponent implements OnInit {
  loan_requests: LoanRequest[] = [];
  isLoading = true;
  pageOffset = 0;
  columns: any[] = [];

  @ViewChild('reviewTpl', { static: true }) reviewTpl!: TemplateRef<any>;
  @ViewChild('approvalTpl', { static: true }) approvalTpl!: TemplateRef<any>;
  @ViewChild('disbursementTpl', { static: true })
  disbursementTpl!: TemplateRef<any>;

  constructor(
    private loanRequestService: LoanRequestService,
    private authSessionService: AuthSessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.columns = [
      { header: 'Customer', field: 'customerEmail' },
      { header: 'Jumlah Pengajuan', field: 'amount' },
      { header: 'Tenor', field: 'tenor' },
      { header: 'Marketing', field: 'marketingEmail' },
      {
        header: 'Review',
        field: 'marketingApprove',
        isCustom: true,
        templateRef: this.reviewTpl,
      },
    ];
    if (this.hasFeature('FEATURE_MANAGE_LOAN_REQUESTS')) {
      this.columns.push(
        { header: 'Branch Manager', field: 'branchManagerEmail' },
        {
          header: 'Approval',
          field: 'branchManagerApprove',
          isCustom: true,
          templateRef: this.approvalTpl,
        },
        { header: 'Back Office', field: 'backOfficeEmail' },
        {
          header: 'Disbursement',
          field: 'backOfficeApprove',
          isCustom: true,
          templateRef: this.disbursementTpl,
        }
      );
      this.loanRequestService.getAllLoanRequest().subscribe({
        next: (value) => {
          this.loan_requests = value.map((loan_request) => ({
            ...loan_request,
            refferalMarketing: loan_request.refferal ?? '-',
            customerEmail: loan_request.customer.email,
            marketingEmail: loan_request.marketing?.email ?? '-',
            branchManagerEmail: loan_request.branchManager?.email ?? '-',
            backOfficeEmail: loan_request.backOffice?.email ?? '-',
          }));

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    } else if (this.hasFeature('FEATURE_GET_ALL_LOAN_REQUEST_REVIEW')) {
      const index = this.columns.findIndex(
        (col) => col.field === 'marketingEmail'
      );

      // Sisipkan kolom 'Back Office' dan 'Notes' sebelum 'Disbursement'
      this.columns.splice(index, 0, {
        header: 'Refferal',
        field: 'refferalMarketing',
      });
      this.loanRequestService.getAllLoanRequestReview().subscribe({
        next: (value) => {
          this.loan_requests = value.map((loan_request) => ({
            ...loan_request,
            refferalMarketing: loan_request.refferal ?? '-',
            customerEmail: loan_request.customer.email,
            marketingEmail: loan_request.marketing?.email ?? '-',
          }));

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    } else if (this.hasFeature('FEATURE_GET_ALL_LOAN_REQUEST_APPROVAL')) {
      this.columns.push({
        header: 'Catatan Marketing',
        field: 'marketingNotes',
      });
      this.loanRequestService.getAllLoanRequestApproval().subscribe({
        next: (value) => {
          this.loan_requests = value.map((loan_request) => ({
            ...loan_request,
            customerEmail: loan_request.customer.email,
            marketingEmail: loan_request.marketing?.email ?? '-',
            marketingNotes: loan_request.marketingNotes?.trim() ? loan_request.marketingNotes : '-',
          }));

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    }
  }

  hasFeature(feature: string): boolean {
    const features = this.authSessionService.features;
    return features.includes(feature);
  }

  onPage(event: any) {
    this.pageOffset = event.offset;
  }

  reviewRequest(id: string): void {
    this.router.navigate(['/loan-requests/review/' + id]);
  }
  detailRequest(id: string): void {
    this.router.navigate(['/loan-requests/review/' + id]);
  }
  actionRequest(id: string): void {
    Swal.fire({
      title: 'Tindaklanjuti Pengajuan',
      input: 'textarea',
      inputLabel: 'Catatan (Notes)',
      inputPlaceholder: 'Masukkan catatan Anda di sini...',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
      showDenyButton: true,
      denyButtonText: 'Reject',
      preConfirm: (notes) => {
        return notes;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const notes = result.value;
        this.submitApproval(id, true, notes);
      } else if (result.isDenied) {
        const notes = result.value;
        this.submitApproval(id, false, notes);
      }
    });
  }

  submitApproval(id: string, approval: boolean, notes: string): void {
    this.loanRequestService.updateLoanRequestApproval(id, approval, notes).subscribe({
      next: (res) => {
        this.loan_requests = this.loan_requests.filter(item => item.id !== id);
        Swal.fire('Berhasil', res.message || 'Pengajuan berhasil ditindaklanjuti.', 'success');
      },
      error: (err) => {
        Swal.fire('Gagal', err.error?.message || 'Terjadi kesalahan.', 'error');
      },
    });
  }
  updateRequest(id: string): void {}
  deleteRequest(id: string): void {}
}
