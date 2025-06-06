import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { LoanRequest } from '../../core/models/loan-request.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from '../../core/models/dashboard.model';
import { FormsModule } from '@angular/forms';

type LoanStatus = 'approved' | 'pending' | 'rejected';

@Component({
  selector: 'app-home',
  standalone: true,  // Standalone component
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userName: string = '';
  userRole: string = '';
  dashboardData!: Dashboard;
  isLoading = true;


  totalBranches = 0;
  totalUsers = 0;
  totalLoanRequests = 0;
  approvedLoans = 0;
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
  searchTerm: string = '';
  filteredBranches: any[] = [];
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';





  constructor(
    private session: AuthSessionService,
    private dashboardService: DashboardService,
    private authSessionService: AuthSessionService
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

    this.fetchDashboard();
  }

  fetchDashboard(): void {
    if (this.hasFeature("FEATURE_DASHBOARD_SUPERADMIN")) {
      this.dashboardService.getDashboardSuperadmin().subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.totalBranches = data.totalBranches;
          this.totalUsers = data.totalActiveUsers;
          this.totalLoanRequests = data.totalLoanRequests;
          this.approvedLoans = data.totalApproved;
          this.branches = data.branches;
          this.applyFilter();

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
    } else if (this.hasFeature("FEATURE_DASHBOARD_MARKETING")) {
      this.dashboardService.getDashboardMarketing().subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.totalBranches = data.totalBranches;
          this.totalUsers = data.totalActiveUsers;
          this.totalLoanRequests = data.totalLoanRequests;
          this.approvedLoans = data.totalApproved;
          this.branches = data.branches;
          this.applyFilter();

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
    } else if (this.hasFeature("FEATURE_DASHBOARD_BRANCHMANAGER")) {
      this.dashboardService.getDashboardBranchManager().subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.totalBranches = data.totalBranches;
          this.totalUsers = data.totalActiveUsers;
          this.totalLoanRequests = data.totalLoanRequests;
          this.approvedLoans = data.totalApproved;
          this.branches = data.branches;
          this.applyFilter();
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
    } else if (this.hasFeature("FEATURE_DASHBOARD_BACKOFFICE")) {
      this.dashboardService.getDashboardBackOffice().subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.totalBranches = data.totalBranches;
          this.totalUsers = data.totalActiveUsers;
          this.totalLoanRequests = data.totalLoanRequests;
          this.approvedLoans = data.totalApproved;
          this.branches = data.branches;
          this.applyFilter();

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
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBranches = this.branches.filter(branch =>
      branch.name.toLowerCase().includes(term) ||
      branch.city.toLowerCase().includes(term) ||
      branch.branchManager?.name?.toLowerCase().includes(term)
    );
  }
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredBranches.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Untuk nested value seperti branchManager.name
      if (field === 'branchManager') {
        aValue = a.branchManager?.name || '';
        bValue = b.branchManager?.name || '';
      }

      aValue = aValue?.toString().toLowerCase();
      bValue = bValue?.toString().toLowerCase();

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }


  hasFeature(feature: string): boolean {
    const features = this.authSessionService.features;
    return features.includes(feature);
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