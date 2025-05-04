import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleFeature } from '../../core/models/role-feature.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { RoleFeatureService } from '../../core/services/role-feature.service';
import { AuthService } from './../../core/services/auth.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, ReactiveFormsModule, CardComponent, NgIf, NgClass, CommonModule],
})
export class AddUserComponent implements OnInit {
  formData!: FormGroup;
  roles: RoleFeature[] = [];
  isSubmitting = false;
  submitted = false;
  baseUrl = 'https://your-api-url.com/api';
  isLoading = true;
  // isCustomer = false;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private roleFeatureService: RoleFeatureService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.fetchRoles();
    this.initForm();

    // this.formData.get('role_id')?.valueChanges.subscribe(roleId => {
    //   const selectedRole = this.roles.find(r => r.id === roleId);
    //   this.isCustomer = selectedRole?.name?.toUpperCase() === 'CUSTOMER';

    //   const nipControl = this.formData.get('nip');

    //   if (this.isCustomer) {
    //     nipControl?.clearValidators();
    //     nipControl?.setValue('');
    //   } else {
    //     nipControl?.setValidators([Validators.required]);
    //   }

    //   nipControl?.updateValueAndValidity();
    // });
  }


  initForm(): void {
    this.formData = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // password: ['', Validators.required],
      role_id: ['', Validators.required],
      is_active: [true],
      nip: ['', Validators.required],
      refferal: [''],
    });
  }

  fetchRoles(): void {
    this.roleFeatureService.getAllRoleWithFeatures().subscribe({
      next: (value) => {
        this.roles = value.filter(role => role.name?.toUpperCase() !== 'CUSTOMER');
        this.isLoading = false;
        console.log(this.roles);  // Periksa isi dari roles
      },
      error: () => {
        this.isLoading = false;
        console.error('Gagal mengambil data roles');
      }
    });
  }


  submitForm(): void {
    this.submitted = true;  // Tandai bahwa form sudah disubmit

    if (this.formData.invalid) {
      return;
    }

    // Ambil data dari form
    const nipValue = this.formData.get('nip')?.value;
    const referralValue = nipValue ? "REF" + nipValue : '';

    const userData = {
      nip: this.formData.get('nip')?.value,
      name: this.formData.get('name')?.value,
      email: this.formData.get('email')?.value,
      role: this.formData.get('role_id')?.value,  // Menggunakan role_id
      refferal: referralValue,
      is_active: this.formData.get('is_active')?.value
    };

    // Set referral jika nip ada
    if (nipValue) {
      this.formData.get('refferal')?.setValue(referralValue);
    }

    this.isSubmitting = true;
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Pastikan data yang anda masukkan benar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Daftarkan!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        // Jika pengguna memilih "Ya, Daftar!", lanjutkan untuk submit form
        console.log("User data to be registered: ", userData);
        
        // Panggil service register
        this.authService.register(
          userData.nip,
          userData.name,
          userData.email,
          userData.role,
          userData.refferal,
          userData.is_active,
        ).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Registrasi Berhasil',
              text: response.message || 'User berhasil didaftarkan.',
              confirmButtonText: 'OK'
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/users']);
              }
            });
            this.isSubmitting = false;
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Registrasi Gagal',
              text: err.error?.message || 'Terjadi kesalahan saat mendaftarkan user.',
              confirmButtonText: 'OK'
            });
            this.isSubmitting = false;
          }
        });
      } else {
        this.isSubmitting = false;
        // Jika pengguna memilih "Batal", cukup log dan jangan kirim data
        console.log('Registrasi dibatalkan');
      }
    });
  }

}