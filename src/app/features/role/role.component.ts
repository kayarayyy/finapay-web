import { Component, OnInit } from '@angular/core';
import { RoleFeature } from '../../core/models/role-feature.model';
import { RoleFeatureService, Feature } from '../../core/services/role-feature.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FeatureService } from '../../core/services/feature.service';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  role_features: RoleFeature[] = [];
  availableFeatures: Feature[] = []; // Daftar semua fitur yang tersedia
  isLoading = true;
  openedRoles: string[] = []; // untuk menyimpan role yang sedang dibuka fiturnya
  features: Feature[] = [];
  groupedFeatures: { [key: string]: Feature[] } = {};


  constructor(private roleFeatureService: RoleFeatureService, private featureService: FeatureService) { }

  ngOnInit(): void {
    this.loadData();
    this.loadAvailableFeatures();
  }

  loadData(): void {
    this.isLoading = true;
    this.roleFeatureService.getAllRoleWithFeatures().subscribe({
      next: (value) => {
        this.role_features = value;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.featureService.getAllFeatures().subscribe({
      next: (value) => {
        this.features = value;

        this.groupedFeatures = value.reduce((groups, feature) => {
          const groupKey = feature.name.split('_')[0]; // Ambil sebelum "_"
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push(feature);
          return groups;
        }, {} as { [key: string]: Feature[] });

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });

  }

  // Method baru untuk memuat daftar fitur yang tersedia
  loadAvailableFeatures(): void {
    this.roleFeatureService.getAllFeatures().subscribe({
      next: (features) => {
        this.availableFeatures = features;
      },
      error: (err) => {
        console.error('Error loading features:', err);
      }
    });
  }

  toggleFeature(roleId: string): void {
    if (this.openedRoles.includes(roleId)) {
      this.openedRoles = this.openedRoles.filter(id => id !== roleId);
    } else {
      this.openedRoles.push(roleId);
    }
  }

  addRole(): void {
    Swal.fire({
      title: 'Tambah Role Baru',
      input: 'text',
      inputLabel: 'Nama Role',
      inputPlaceholder: 'Masukkan nama role',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Nama role tidak boleh kosong!';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const rawName = result.value.trim();

        const formattedName = rawName
          .split(' ')
          .filter((word: string) => word.trim() !== '')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('_')
          .toUpperCase();

        this.roleFeatureService.createRole(formattedName).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: `Role "${formattedName}" berhasil ditambahkan.`,
            });

            // Optional: refresh data list
            this.ngOnInit();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: `Role "${formattedName}" gagal ditambahkan.`,
            });
          }
        });
      }
    });
  }

  addFeature(): void {
    Swal.fire({
      title: 'Tambah fitur Baru',
      input: 'text',
      inputLabel: 'Nama fitur',
      inputPlaceholder: 'Masukkan nama fitur',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Nama fitur tidak boleh kosong!';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const rawName = result.value.trim();

        const formattedName = rawName
          .split(' ')
          .filter((word: string) => word.trim() !== '')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('_')
          .toUpperCase();

        this.featureService.createFeature(formattedName).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: `Fitur "${formattedName}" berhasil ditambahkan.`,
            });

            // Optional: refresh data list
            this.ngOnInit();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: `Fitur "${formattedName}" gagal ditambahkan.`,
            });
          }
        });
      }
    });
  }

  removeFeature(feature: Feature): void {
    Swal.fire({
      title: `Yakin ingin menghapus fitur?`,
      text: `Fitur "${feature.name}" akan dihapus dari seluruh role?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.featureService.deleteFeatureById(feature.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Fitur berhasil dihapus'
            });
            // Refresh data
            this.ngOnInit();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Terjadi kesalahan saat menghapus fitur.'
            });
            console.error(err);
          }
        });
      }
    });

  }

  // Method baru untuk menambahkan fitur ke role
  addFeatureToRole(role: RoleFeature): void {
    // Filter fitur yang belum dimiliki role ini
    const availableFeaturesToAdd = this.availableFeatures.filter(feature =>
      !role.listFeatures.some(roleFeature => roleFeature.id === feature.id)
    );

    if (availableFeaturesToAdd.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Informasi',
        text: 'Semua fitur sudah ditambahkan ke role ini.'
      });
      return;
    }

    // Buat opsi untuk select
    const selectOptions: { [key: string]: string } = {};
    availableFeaturesToAdd.forEach(feature => {
      selectOptions[feature.id] = feature.name;
    });

    Swal.fire({
      title: `Tambah Fitur ke Role "${role.name}"`,
      input: 'select',
      inputOptions: selectOptions,
      inputPlaceholder: 'Pilih fitur yang akan ditambahkan',
      showCancelButton: true,
      confirmButtonText: 'Tambahkan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) {
          return 'Silakan pilih fitur yang akan ditambahkan!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const selectedFeature = availableFeaturesToAdd.find(f => f.id === result.value);

        this.roleFeatureService.addFeatureToRole(role.id, result.value).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: `Fitur "${selectedFeature?.name}" berhasil ditambahkan ke role "${role.name}".`
            });

            // Refresh data
            this.ngOnInit();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: `Gagal menambahkan fitur "${selectedFeature?.name}" ke role "${role.name}".`
            });
            console.error('Error adding feature to role:', err);
          }
        });
      }
    });
  }

  // Method alternatif untuk menambahkan multiple fitur sekaligus
  addMultipleFeaturesToRole(role: RoleFeature): void {
    // Filter fitur yang belum dimiliki role ini
    const availableFeaturesToAdd = this.availableFeatures.filter(feature =>
      !role.listFeatures.some(roleFeature => roleFeature.id === feature.id)
    );

    if (availableFeaturesToAdd.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Informasi',
        text: 'Semua fitur sudah ditambahkan ke role ini.'
      });
      return;
    }

    // Buat HTML untuk checkbox multiple selection
    const checkboxOptions = availableFeaturesToAdd.map(feature =>
      `<div class="form-check text-start">
        <input class="form-check-input" type="checkbox" value="${feature.id}" id="feature_${feature.id}">
        <label class="form-check-label" for="feature_${feature.id}">
          ${feature.name}
        </label>
      </div>`
    ).join('');

    Swal.fire({
      title: `Tambah Fitur ke Role "${role.name}"`,
      html: `
        <div class="text-start">
          <p class="mb-3">Pilih fitur yang akan ditambahkan:</p>
          ${checkboxOptions}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Tambahkan',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const checkboxes = Swal.getPopup()?.querySelectorAll('input[type="checkbox"]:checked');
        const selectedFeatures = Array.from(checkboxes || []).map((checkbox: any) => checkbox.value);

        if (selectedFeatures.length === 0) {
          Swal.showValidationMessage('Pilih minimal satu fitur untuk ditambahkan!');
          return false;
        }

        return selectedFeatures;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const selectedFeatureIds: string[] = result.value;

        // Buat array dari promises untuk menambahkan setiap fitur
        const addFeaturePromises = selectedFeatureIds.map(featureId =>
          this.roleFeatureService.addFeatureToRole(role.id, featureId).toPromise()
        );

        // Eksekusi semua promises
        Promise.all(addFeaturePromises)
          .then(() => {
            const selectedFeatureNames = selectedFeatureIds.map(id =>
              availableFeaturesToAdd.find(f => f.id === id)?.name
            ).filter(name => name).join(', ');

            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: `Fitur "${selectedFeatureNames}" berhasil ditambahkan ke role "${role.name}".`
            });

            // Refresh data
            this.ngOnInit();
          })
          .catch(err => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: `Terjadi kesalahan saat menambahkan fitur ke role "${role.name}".`
            });
            console.error('Error adding features to role:', err);
          });
      }
    });
  }

  editRole(role: RoleFeature): void {
    Swal.fire({
      title: 'Edit Role',
      input: 'text',
      inputLabel: 'Nama Role',
      inputValue: role.name,
      inputPlaceholder: 'Masukkan nama role',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Nama role tidak boleh kosong!';
        }
        return null;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const rawName = result.value.trim();

        const formattedName = rawName
          .split(' ')
          .filter((word: string) => word.trim() !== '')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('_')
          .toUpperCase();

        // Jika nama tidak berubah, tidak perlu update
        if (formattedName === role.name) {
          return;
        }

        this.roleFeatureService.updateRole(role.id, formattedName).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: `Role berhasil diubah menjadi "${formattedName}".`,
            });

            // Refresh data list
            this.ngOnInit();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: `Role gagal diubah.`,
            });
          }
        });
      }
    });
  }

  manageFeatures(role: RoleFeature): void {
    // Redirect ke halaman manage features dengan dropdown untuk memilih action
    Swal.fire({
      title: `Kelola Akses Role "${role.name}"`,
      input: 'select',
      inputOptions: {
        'add_single': 'Tambah Satu Fitur',
        'add_multiple': 'Tambah Beberapa Fitur',
        'view_features': 'Lihat Semua Fitur'
      },
      inputPlaceholder: 'Pilih aksi yang akan dilakukan',
      showCancelButton: true,
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        switch (result.value) {
          case 'add_single':
            this.addFeatureToRole(role);
            break;
          case 'add_multiple':
            this.addMultipleFeaturesToRole(role);
            break;
          case 'view_features':
            this.viewRoleFeatures(role);
            break;
        }
      }
    });
  }

  // Method untuk melihat semua fitur yang dimiliki role
  viewRoleFeatures(role: RoleFeature): void {
    const featuresList = role.listFeatures.length > 0
      ? role.listFeatures.map(f => `• ${f.name}`).join('<br>')
      : 'Tidak ada fitur yang diberikan ke role ini.';

    Swal.fire({
      title: `Fitur Role "${role.name}"`,
      html: `<div class="text-start">${featuresList}</div>`,
      confirmButtonText: 'Tutup'
    });
  }

  deleteRole(id: string, name: string): void {
    Swal.fire({
      title: 'Konfirmasi Penghapusan',
      text: 'Apakah Anda yakin ingin menghapus role ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    }).then(result => {
      if (result.isConfirmed) {
        this.roleFeatureService.deleteRoleById(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: `Role "${name}" berhasil dihapus.`,
            });

            // Refresh data list
            this.ngOnInit();
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: `Role "${name}" gagal dihapus.`,
            });
          }
        });
      }
    });
  }

  removeFeatureFromRole(roleId: string, roleName: string, featureId: string, featureName: string): void {
    Swal.fire({
      title: `Yakin ingin menghapus fitur?`,
      text: `Fitur "${featureName}" akan dihapus dari role "${roleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleFeatureService.deleteFeatureFromRole(roleId, featureId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Fitur berhasil dihapus dari role.'
            });
            // Refresh data
            this.ngOnInit();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Terjadi kesalahan saat menghapus fitur.'
            });
            console.error(err);
          }
        });
      }
    });
  }
}