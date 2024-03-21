import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Vex } from 'vexflow';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'kme-frontend';
  
  ngOnInit() {
    const { Factory, EasyScore, System } = Vex.Flow;

    const vf = new Factory({
      renderer: { elementId: 'output', width: 500, height: 200 },
    });

    const score = vf.EasyScore();
    const system = vf.System();

    system
      .addStave({
        voices: [
          score.voice(score.notes('C#5/q, B4, A4, G#4', { stem: 'up' })),
          score.voice(score.notes('C#4/h, C#4', { stem: 'down' })),
        ],
      })
      .addClef('treble')
      .addTimeSignature('4/4');

    vf.draw();
  }
}
