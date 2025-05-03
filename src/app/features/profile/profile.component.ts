import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EmployeeDetailsService } from '../../core/services/employee-details.service';
import { EmployeeDetails } from '../../core/models/employee-details.model';
import { NgIf } from '@angular/common';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ProfileComponent implements OnInit {
  constructor(private employeeDetailsService: EmployeeDetailsService, private session: AuthSessionService, private router: Router) {}
  employeeDetails!: EmployeeDetails;

  ngOnInit(): void {
    this.employeeDetailsService.getEmployeeProfileByEmail().subscribe({
      next: (data) => {
        this.employeeDetails = data;
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
      },
    });
  }


  onLogout() {
    Swal.fire({
      title: 'Logout dari aplikasi?',
      text: 'Anda akan keluar dari sesi saat ini.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, logout',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        this.session.clearSession();
        this.router.navigate(['/login']);

        Swal.fire({
          title: 'Logged out!',
          text: 'Anda telah berhasil keluar.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }
}
