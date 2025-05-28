import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  imports: [CommonModule],
  standalone: true,
})
export class ImageModalComponent {
  @Input() imageUrl: string = '';
  @Input() modalId: string = '';
  @Input() title: string = 'Pratinjau Gambar';

  zoomed: boolean = false;

  toggleZoom(event: MouseEvent) {
    this.zoomed = !this.zoomed;
    const target = event.target as HTMLImageElement;
    if (this.zoomed) {
      target.style.transform = 'scale(1.8)';
      target.style.cursor = 'zoom-out';
    } else {
      target.style.transform = 'scale(1)';
      target.style.cursor = 'zoom-in';
    }
  }
}
