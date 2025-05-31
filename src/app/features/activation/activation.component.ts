import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ActivationComponent implements OnInit {
  user_id = '';
  isLoading = false;
  isSuccess = false;
  hasError = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.user_id = params.get('id') || '';

      if (this.user_id) {
        this.processActivation();
      }
    });
  }

  private processActivation(): void {
    this.isLoading = true;
    this.isSuccess = false;
    this.hasError = false;

    this.authService.activate(this.user_id).subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response.status === 'success') {
          this.handleSuccess(response);
        } else {
          this.handleError({ status: response?.status_code || 500 });
        }
      },
      (error) => {
        this.isLoading = false;
        this.handleError(error);
      }
    );
  }


  private handleSuccess(response: any): void {
    this.isSuccess = true;
    this.hasError = false;
    this.successMessage = response.message || 'Aktivasi akun berhasil dilakukan';
  }

  private handleError(error: any): void {
    this.isSuccess = false;
    this.hasError = true;

    if (error.status === 404) {
      this.errorMessage = 'Link aktivasi tidak ditemukan atau sudah kedaluwarsa.';
    } else if (error.status === 400) {
      this.errorMessage = 'Link aktivasi tidak valid.';
    } else if (error.status === 409) {
      this.errorMessage = 'Akun sudah aktif sebelumnya.';
    } else {
      this.errorMessage = 'Terjadi kesalahan saat memproses aktivasi. Silakan coba lagi.';
    }
  }

  public retryActivation(): void {
    if (this.user_id) {
      this.processActivation();
    }
  } 

  public goToHome(): void {
    this.router.navigate(['/']);
  }

  public contactSupport(): void {
    window.open('mailto:support@yourapp.com', '_blank');
  }
}
