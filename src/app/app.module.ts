import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './component/app.component';
import { CodemirrorModule } from 'ng2-codemirror';
import { StreamRowComponent } from './component/stream-row.component';
import { StreamService } from './services/stream.service';

@NgModule({
  declarations: [
    AppComponent,
    StreamRowComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CodemirrorModule,
    HttpModule
  ],
  providers: [StreamService],
  bootstrap: [AppComponent]
})
export class AppModule { }
