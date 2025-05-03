import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-home',
  standalone: true,  // Standalone component
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userName: string = '';
  userRole: string = '';

  constructor(private session: AuthSessionService) {}

  
  ngOnInit(): void {
    this.userName = this.session.name;
    this.userRole = this.session.role;
    const state = history.state;
    if (state?.showWelcome) {
      Swal.fire({
        icon: 'success',
        title: 'Selamat Datang!',
        text: `Hai ${this.userName}, selamat datang di dashboard 😊`,
        timer: 3000,
        showConfirmButton: false
      });
    }
  }

}
