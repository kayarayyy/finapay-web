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
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Properties untuk show/hide password
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  // Methods untuk toggle visibility password
  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    // Validasi input form
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      return;
    }

    this.isLoading = true;
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
        this.isLoading = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Terjadi kesalahan saat mengubah password.';
        // Tampilkan swal error
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: errorMessage,
        });
        this.isLoading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}
