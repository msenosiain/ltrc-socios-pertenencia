import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'ltrc-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly title = 'LTRC Socios';
}
