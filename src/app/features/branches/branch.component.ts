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

  // branchWithoutManager = computed(
  //   () => this.branches().filter((b) => b.branchManager === null).length
  // );

  // totalMarketing = computed(() =>
  //   this.branches().reduce((sum, b) => sum + b.marketing.length, 0)
  // );

  constructor(private branchService: BranchService) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    // this.isLoading.set(true);
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
      text: `Masukkan email manager untuk cabang ${branch.name}:`,
      input: 'email',
      inputPlaceholder: 'contoh: manager@example.com',
      showCancelButton: true,
      confirmButtonText: 'Assign',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#198754',
      preConfirm: (email) => {
        if (!email) {
          Swal.showValidationMessage('Email tidak boleh kosong');
        }
        return email;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const email = result.value;

        this.branchService.assignManager(branch.id, email).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Branch manager berhasil di-assign',
              timer: 2000,
              showConfirmButton: false,
            });
            this.loadBranches();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text:
                error?.error?.message ||
                'Terjadi kesalahan saat assign manager',
            });
          },
        });
      }
    });
  }

  addMarketing(branch: Branch): void {
    Swal.fire({
      title: 'Tambah Marketing',
      html: `Masukkan email marketing untuk cabang <strong>${branch.name}</strong><br><small>Pisahkan dengan koma atau baris baru</small>`,
      input: 'textarea',
      inputPlaceholder:
        'contoh:\nmarketing1@example.com, marketing2@example.com\natau:\nmarketing1@example.com\nmarketing2@example.com',
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#198754',
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage('Minimal 1 email harus diisi');
          return;
        }

        const emails = value
          .split(/[\s,]+/)
          .map((e: string) => e.trim())
          .filter((e: string) => e.length > 0);

        if (emails.length === 0) {
          Swal.showValidationMessage('Tidak ada email valid');
          return;
        }

        return emails;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const emails: string[] = result.value;

        this.branchService.addMarketing(branch.id, emails).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: `${emails.length} marketing berhasil ditambahkan`,
              timer: 2000,
              showConfirmButton: false,
            });
            this.loadBranches();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text:
                error?.error?.message ||
                'Terjadi kesalahan saat menambahkan marketing',
            });
          },
        });
      }
    });
  }

editBranch(branch: Branch): void {
  Swal.fire({
    title: 'Edit Cabang',
    html: `
      <input id="edit-branch-name" class="swal2-input" placeholder="Nama Cabang" value="${branch.name}">
      <input id="edit-branch-city" class="swal2-input" placeholder="Kota (contoh: JAKARTA)" value="${branch.city}">
      <input id="edit-branch-latitude" class="swal2-input" placeholder="Latitude" value="${branch.latitude ?? ''}">
      <input id="edit-branch-longitude" class="swal2-input" placeholder="Longitude" value="${branch.longitude ?? ''}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ffc107',
    preConfirm: () => {
      const name = (document.getElementById('edit-branch-name') as HTMLInputElement)?.value.trim();
      const city = (document.getElementById('edit-branch-city') as HTMLInputElement)?.value.trim().toUpperCase();
      const latitudeStr = (document.getElementById('edit-branch-latitude') as HTMLInputElement)?.value.trim();
      const longitudeStr = (document.getElementById('edit-branch-longitude') as HTMLInputElement)?.value.trim();

      if (!name || !city) {
        Swal.showValidationMessage('Nama dan kota wajib diisi');
        return;
      }

      const latitude = latitudeStr ? parseFloat(latitudeStr) : 0;
      const longitude = longitudeStr ? parseFloat(longitudeStr) : 0;

      if ((latitudeStr && isNaN(latitude)) || (longitudeStr && isNaN(longitude))) {
        Swal.showValidationMessage('Latitude dan Longitude harus berupa angka');
        return;
      }

      return { name, city, latitude, longitude };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { name, city, latitude, longitude } = result.value;

      const payload = {
        name,
        city,
        latitude,
        longitude,
      };

      this.branchService.updateBranch(branch.id, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'Data cabang berhasil diperbarui',
            timer: 2000,
            showConfirmButton: false,
          });
          this.loadBranches();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error?.error?.message || 'Gagal memperbarui data cabang',
          });
        }
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
        this.branchService.deleteBranchById(branch.id).subscribe({
          next: (branches) => {
            Swal.fire({
              icon: 'success',
              title: 'Terhapus!',
              text: 'Cabang berhasil dihapus',
              timer: 2000,
              showConfirmButton: false,
            });
            this.loadBranches();
          },
          error: (error) => {
            console.error('Error loading branches:', error);
            this.isLoading.set(false);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Gagal menghapus data cabang',
              confirmButtonColor: '#dc3545',
            });
          },
        });
      }
    });
  }

  addNewBranch(): void {
    Swal.fire({
      title: 'Tambah Cabang Baru',
      html: `
      <input id="branch-name" class="swal2-input" placeholder="Nama Cabang">
      <input id="branch-city" class="swal2-input" placeholder="Kota (contoh: JAKARTA)">
      <input id="branch-latitude" class="swal2-input" placeholder="Latitude">
      <input id="branch-longitude" class="swal2-input" placeholder="Longitude">
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#198754',
      preConfirm: () => {
        const name = (
          document.getElementById('branch-name') as HTMLInputElement
        )?.value.trim();
        const city = (
          document.getElementById('branch-city') as HTMLInputElement
        )?.value
          .trim()
          .toUpperCase();
        const latitudeStr = (
          document.getElementById('branch-latitude') as HTMLInputElement
        )?.value.trim();
        const longitudeStr = (
          document.getElementById('branch-longitude') as HTMLInputElement
        )?.value.trim();

        if (!name || !city || !latitudeStr || !longitudeStr) {
          Swal.showValidationMessage('Semua field wajib diisi');
          return;
        }

        const latitude = parseFloat(latitudeStr);
        const longitude = parseFloat(longitudeStr);

        if (isNaN(latitude) || isNaN(longitude)) {
          Swal.showValidationMessage(
            'Latitude dan Longitude harus berupa angka'
          );
          return;
        }

        return { name, city, latitude, longitude };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { name, city, latitude, longitude } = result.value;

        this.branchService
          .createBranch(name, city, latitude, longitude)
          .subscribe({
            next: (branch) => {
              Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: `Cabang "${branch.name}" berhasil ditambahkan`,
                timer: 2000,
                showConfirmButton: false,
              });
              this.loadBranches();
            },
            error: (error) => {
              Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error?.error?.message || 'Gagal menambahkan cabang',
              });
            },
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
