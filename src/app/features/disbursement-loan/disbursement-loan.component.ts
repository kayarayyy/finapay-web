import { Component, OnInit } from '@angular/core';
import { LoanRequestService } from '../../core/services/loan-request.service';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { LoanRequest } from '../../core/models/loan-request.model';

@Component({
  selector: 'app-disbursement-loan',
  imports: [NgIf, CommonModule],
  templateUrl: './disbursement-loan.component.html',
  styleUrl: './disbursement-loan.component.css',
})
export class DisbursementLoanComponent implements OnInit {
  loanCount = 0;
  isLoading = false;
  loanRequest!: LoanRequest;
  loanRequestList: LoanRequest[] = [];

  constructor(
    private loanRequestService: LoanRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loanRequestService.getLoanRequestCount().subscribe({
      next: (value) => {
        this.loanCount = value;
        console.log(this.loanCount);
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
      },
    });
    this.loanRequestService.getAllLoanRequestDisbursementOngoing().subscribe({
      next: (value) => {
        this.loanRequestList = value;
        console.log(this.loanRequestList);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  goToDetail(id: string) {
    // this.router.navigate(['/disbursement/detail', id]);
    this.router.navigate(['/disbursement/detail'], {
      queryParams: { id },
    });
  }

  getPengajuan(): void {
    this.isLoading = true;
    this.loanRequestService.getLoanRequestFirstDisbursement().subscribe({
      next: (value) => {
        this.loanRequest = value;
        this.isLoading = false;

        const id = this.loanRequest.id;

        this.router.navigate(['/disbursement/detail'], {
          queryParams: { id: id },
        });

        // Alternatif singkat:
        // this.router.navigate(['/disbursement/detail'], { queryParams: { id: this.loanRequest.id } });
      },
      error: (err) => {
        this.loanRequestService.getLoanRequestCount().subscribe({
          next: (value) => {
            this.loanCount = value;
            console.log('Updated count:', value);
          },
          error: (err) => {
            console.error('Error:', err);
          },
        });
        this.isLoading = false;
      },
    });
  }
}
