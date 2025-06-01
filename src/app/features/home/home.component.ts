import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { LoanRequest } from '../../core/models/loan-request.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from '../../core/models/dashboard.model';

type LoanStatus = 'approved' | 'pending' | 'rejected';

@Component({
  selector: 'app-home',
  standalone: true,  // Standalone component
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userName: string = '';
  userRole: string = '';
  dashboardData!: Dashboard;
  isLoading = true;


  totalBranches = 12;
  totalUsers = 247;
  totalLoanRequests = 156;
  approvedLoans = 89;
  branches: any[] = [
  ];

  loanStats = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  loanStatuses: LoanStatus[] = ['approved', 'pending', 'rejected'];

  loanAmountStats: Record<LoanStatus, number> = {
    approved: 0,
    pending: 0,
    rejected: 0
  };

  plafondCustomerCount: { [plafondName: string]: number } = {};

  constructor(
    private session: AuthSessionService,
    private dashboardService: DashboardService
  ) { }


  ngOnInit(): void {
    this.userName = this.session.name || 'Admin';
    this.userRole = this.session.role;

    const state = history.state;
    if (state?.showWelcome) {
      Swal.fire({
        icon: 'success',
        title: 'Selamat Datang!',
        text: `Hai ${this.userName}, selamat datang di dashboard 😊`,
        timer: 3000,
        showConfirmButton: false
      });
    }

    this.dashboardService.getDashboardSuperadmin().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.totalBranches = data.totalBranches;
        this.totalUsers = data.totalActiveUsers;
        this.totalLoanRequests = data.totalLoanRequests;
        this.approvedLoans = data.totalApproved;
        this.branches = data.branches;

        // Update loan stats
        this.loanStats = {
          pending: data.totalPending,
          approved: data.totalApproved,
          rejected: data.totalRejected,
        };

        // Update loan amount stats
        this.loanAmountStats = {
          approved: data.amountApproved,
          pending: data.amountPending,
          rejected: data.amountRejected,
        };

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.isLoading = false;
      }
    });
  }


  getLoanPercent(status: 'pending' | 'approved' | 'rejected'): number {
    const total = this.loanStats.pending + this.loanStats.approved + this.loanStats.rejected;
    if (total === 0) return 0;
    return Math.round((this.loanStats[status] / total) * 100);
  }

  getAmountPercent(status: LoanStatus): number {
    const total = this.loanAmountStats.approved + this.loanAmountStats.pending + this.loanAmountStats.rejected;
    return total ? Math.round((this.loanAmountStats[status] / total) * 100) : 0;
  }

  getPlafondPercent(count: number): number {
    const total = Object.values(this.plafondCustomerCount).reduce((a, b) => a + b, 0);
    return total ? Math.round((count / total) * 100) : 0;
  }

  // Helper function for donut chart SVG
  getCircumference(percentage: number): number {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    return (percentage / 100) * circumference;
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Helper function to get branch initials
  getBranchInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}