import { AuthService } from './../../core/services/auth.service';
import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardComponent } from '../../shared/components/card/card.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CardComponent, CommonModule, FormsModule, NgIf],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ChangePasswordComponent {
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;  // Untuk menandakan loading
  errorMessage: string = '';  // Untuk menampilkan error
  successMessage: string = '';  // Untuk menampilkan pesan sukses

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {

    // // Validasi input form
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {

      return;
    }

    // if (this.newPassword !== this.confirmPassword) {
    //   this.errorMessage = 'Konfirmasi password tidak cocok.';
    //   return;
    // }

    this.isLoading = true; // Set loading true saat proses submit
    console.log(this.isLoading);

    // Panggil service untuk ubah password
    this.authService.changePassword(this.oldPassword, this.newPassword, this.confirmPassword).subscribe({
      next: (res) => {
        // Tampilkan swal sukses
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: res.message || 'Password berhasil diubah!',
        }).then(() => {
          this.router.navigate(['/profile']); // Arahkan ke halaman profil setelah sukses
        });
        this.isLoading = false;  // Set loading false setelah selesai
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Terjadi kesalahan saat mengubah password.';
        // Tampilkan swal error
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: errorMessage,
        });
        this.isLoading = false;  // Set loading false setelah selesai
      },
    });
  }


  goBack() {
    this.router.navigate(['/profile']);
  }
}
