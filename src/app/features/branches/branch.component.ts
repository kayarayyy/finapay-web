// branch.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Branch } from '../../core/models/branch.model';
import { BranchService } from '../../core/services/branch.service';
import Swal from 'sweetalert2';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css',
})
export class BranchComponent implements OnInit {
  // Reactive signals
  branches = signal<Branch[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  selectedCity = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Computed properties
  cities = computed(() => {
    const allCities = this.branches().map((branch) => branch.city);
    return [...new Set(allCities)].sort();
  });

  filteredBranches = computed(() => {
    let filtered = this.branches();

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter((branch) => {
        const nameMatch = branch.name.toLowerCase().includes(term);
        const cityMatch = branch.city.toLowerCase().includes(term);
        const managerMatch =
          branch.branchManager?.name?.toLowerCase().includes(term) || false;
        const marketingMatch = branch.marketing.some(
          (m) => m.name?.toLowerCase().includes(term) || false
        );
        return nameMatch || cityMatch || managerMatch || marketingMatch;
      });
    }

    // Filter by city
    if (this.selectedCity()) {
      filtered = filtered.filter(
        (branch) => branch.city === this.selectedCity()
      );
    }

    return filtered;
  });

  paginatedBranches = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredBranches().slice(startIndex, endIndex);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredBranches().length / this.itemsPerPage());
  });

  paginationInfo = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(
      this.currentPage() * this.itemsPerPage(),
      this.filteredBranches().length
    );
    const total = this.filteredBranches().length;
    return { start, end, total };
  });

  branchWithoutManager = computed(
    () => this.branches().filter((b) => b.branchManager === null).length
  );

  totalMarketing = computed(() =>
    this.branches().reduce((sum, b) => sum + b.marketing.length, 0)
  );

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading.set(true);
    this.branchService.getAllBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.isLoading.set(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Gagal memuat data cabang',
          confirmButtonColor: '#dc3545',
        });
      },
    });
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.currentPage.set(1); // Reset to first page when searching
  }

  onCityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCity.set(target.value);
    this.currentPage.set(1); // Reset to first page when filtering
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(target.value));
    this.currentPage.set(1); // Reset to first page
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getPaginationPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, 5);
      } else if (current >= total - 2) {
        pages.push(total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(current - 2, current - 1, current, current + 1, current + 2);
      }
    }

    return pages;
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCity.set('');
    this.currentPage.set(1);
  }

  viewBranchDetails(branch: Branch): void {
    const marketingList =
      branch.marketing && branch.marketing.length > 0
        ? branch.marketing
            .map((m) => `• ${m.name || 'N/A'} (${m.email || 'N/A'})`)
            .join('<br>')
        : 'Tidak ada marketing';

    Swal.fire({
      title: `Detail Cabang ${branch.name}`,
      html: `
        <div class="text-start">
          <p><strong>Nama:</strong> ${branch.name}</p>
          <p><strong>Kota:</strong> ${branch.city}</p>
          <p><strong>Koordinat:</strong> ${branch.latitude}, ${
        branch.longitude
      }</p>
          <p><strong>Branch Manager:</strong> ${
            branch.branchManager?.name || 'Belum ada'
          }</p>
          <p><strong>Email BM:</strong> ${
            branch.branchManager?.email || '-'
          }</p>
          <p><strong>Marketing:</strong></p>
          <div class="ms-3">${marketingList}</div>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#0d6efd',
      width: '500px',
    });
  }

  assignBranchManager(branch: Branch): void {
    Swal.fire({
      title: 'Assign Branch Manager',
      text: `Assign manager untuk cabang ${branch.name}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Assign',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#198754',
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implement assign branch manager logic
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Branch manager berhasil di-assign',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }

  addMarketing(branch: Branch): void {
    Swal.fire({
      title: 'Tambah Marketing',
      text: `Tambah marketing untuk cabang ${branch.name}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#198754',
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implement add marketing logic
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Marketing berhasil ditambahkan',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }

  editBranch(branch: Branch): void {
    Swal.fire({
      title: 'Edit Cabang',
      text: `Edit data cabang ${branch.name}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Edit',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ffc107',
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implement edit branch logic
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data cabang berhasil diperbarui',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }

  deleteBranch(branch: Branch): void {
    Swal.fire({
      title: 'Hapus Cabang',
      text: `Apakah Anda yakin ingin menghapus cabang ${branch.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implement delete branch API call
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Cabang berhasil dihapus',
          timer: 2000,
          showConfirmButton: false,
        });

        // Remove from local state (replace with actual API call)
        const updatedBranches = this.branches().filter(
          (b) => b.id !== branch.id
        );
        this.branches.set(updatedBranches);
      }
    });
  }

  addNewBranch(): void {
    Swal.fire({
      title: 'Tambah Cabang Baru',
      text: 'Fitur untuk menambah cabang baru',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#198754',
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Navigate to add branch form or open modal
        Swal.fire({
          icon: 'info',
          title: 'Coming Soon',
          text: 'Fitur tambah cabang akan segera hadir',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }

  refreshData(): void {
    this.loadBranches();
    Swal.fire({
      icon: 'success',
      title: 'Data Refreshed',
      text: 'Data cabang berhasil di-refresh',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }
}
