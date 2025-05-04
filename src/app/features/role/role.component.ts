import { Component, OnInit } from '@angular/core';
import { RoleFeature } from '../../core/models/role-feature.model';
import { RoleFeatureService } from '../../core/services/role-feature.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  role_features: RoleFeature[] = [];
  isLoading = true;
  openedRoles: string[] = []; // untuk menyimpan role yang sedang dibuka fiturnya

  constructor(private roleFeatureService: RoleFeatureService) { }

  ngOnInit(): void {
    this.loadData();
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




  editRole(role: RoleFeature): void {
    console.log('Edit role', role);
  }

  manageFeatures(role: RoleFeature): void {
    console.log('Kelola fitur untuk role', role);
  }

  deleteRole(id: string, name: string): void {
    Swal.fire({
      title: 'Konfirmasi Penghapusan',
      text: 'Apakah Anda yakin ingin menghapus role ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true, // Membalik posisi tombol untuk tampilan lebih baik
    }).then(result => {
      if (result.isConfirmed) {
        console.log('Hapus role', id);

        // TODO: Panggil service untuk menghapus role
        this.roleFeatureService.deleteRoleById(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: `Role "${name}" berhasil dihapus.`,
            });

            // Optional: refresh data list
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
            // Panggil ulang data di sini jika perlu
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
