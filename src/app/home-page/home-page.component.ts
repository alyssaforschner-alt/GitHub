import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  constructor(private readonly router: Router) {}
  goSingle(): void { this.router.navigateByUrl('/spiel'); }
  goMulti(): void { this.router.navigateByUrl('/multiplayer'); }
  goHigh(): void { this.router.navigateByUrl('/highscore'); }
}
