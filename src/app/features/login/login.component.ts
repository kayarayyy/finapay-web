import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  nip: string = '';
  password: string = '';
  isLoading = false;
  error: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.nip || !this.password) return;

    this.isLoading = true;

    const success = await this.auth.login(this.nip, this.password);

    if (success) {
      this.router.navigate(['/dashboard'], {
        state: { showWelcome: true },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Login',
        text: 'NIP atau password salah',
        confirmButtonColor: '#d33',
      });
    }

    this.isLoading = false;
  }

  resetPassword() {
    Swal.fire({
      title: 'Reset Password',
      text: 'Masukkan email yang terdaftar untuk reset password',
      input: 'email',
      inputPlaceholder: 'contoh@email.com',
      confirmButtonText: 'Kirim',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value) {
          return 'Email tidak boleh kosong';
        }
        return null;
      },
      preConfirm: async (email) => {
        Swal.showLoading();
        try {
          const response = await firstValueFrom(
            this.auth.resetPassword(email)
          );
          console.log(response);
          Swal.hideLoading();
          return Promise.resolve(response.message); // pastikan ini Promise agar terbaca di then
        } catch (err: any) {
          Swal.hideLoading();
          const message =
            err?.error?.message ||
            'Terjadi kesalahan saat mengirim permintaan reset password.';
          Swal.showValidationMessage(message);
          return Promise.reject(); // hentikan proses swal success
        }
      },
    }).then((result) => {
      console.log(result)
      if (result.isConfirmed && result.value) {
        Swal.fire({
          icon: 'success',
          title: 'Email Dikirim!',
          text: result.value,
        });
      }
    });
  }
}
