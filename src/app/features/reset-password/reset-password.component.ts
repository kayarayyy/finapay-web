import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent {
  email = '';
  newPassword = '';
  confirmPassword = '';
  resetId = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}
  navigateToLogin() {
    console.log('Dasd');
    this.router.navigate(['/login']);
  }
  handleSetPassword(form: NgForm): void {
    this.route.queryParamMap.subscribe((params) => {
      this.resetId = params.get('id') || '';
    });
    // this.resetId = this.route.snapshot.paramMap.get('id') || '';
    if (form.invalid) {
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Gagal', 'Konfirmasi password tidak cocok.', 'error');
      return;
    }

    Swal.fire({
      title: 'Menyimpan...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
    });

    this.authService
      .setResetPassword(
        this.resetId,
        this.email,
        this.newPassword,
        this.confirmPassword
      )
      .subscribe({
        next: (res) => {
          Swal.fire(
            'Berhasil',
            res.message || 'Password berhasil diubah',
            'success'
          ).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          const message =
            err.error?.message ||
            'Terjadi kesalahan saat mengatur ulang password.';
          Swal.fire('Gagal', message, 'error');
        },
      });
  }
}
