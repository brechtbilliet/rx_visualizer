import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Marble } from '../marble.class';

@Component({
    selector: 'stream-row',
    template: `
        <div class="marble-diagram">
            <span class="marble-line" [style.width]="left + 'px'"></span>
            <span class="marble" *ngFor="let marble of marbles" [style.margin-left]="marble.left + 'px'">
                <span class="marble-label">{{marble.value}}</span>
            </span>
            <span *ngIf="end" [style.margin-left]="end + 'px'" class="marble-diagram-end"><span class="end-stripe"></span></span>
        </div>
    `
})
export class StreamRowComponent implements OnChanges, OnDestroy {
    @Input() stream: Observable<any>;
    @Input() active: boolean;
    @Input() interval: number;

    private subscriptions: Array<Subscription> = [];
    marbles: Array<Marble> = [];
    end: number;
    left: number;
    existingInterval: any;

    ngOnChanges(simpleChanges: any): void {
        if (simpleChanges.active) {
            //*---*---*---*---*---*...
            //--------4-------6----...
            //*---*---*4--*---*6--*...
            //*---*---4---*---6---*...
            if (this.active && this.stream && this.interval) {
                this.start();
            }
            if (!this.active && this.stream && this.interval) {
                this.stop();
            }
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private start(): void {
        this.end = null;
        this.marbles = [];
        const space = 10;
        this.left = 0;
        let ctr = 0;
        this.existingInterval = setInterval(() => {
            this.left = space * ctr;
            ctr ++;
        }, 200);
        this.subscriptions.push(this.stream.subscribe((v: number) => {
            this.marbles.push(new Marble(v, this.left));
        }, () => {}, () => {
            this.end = this.left;
            clearInterval(this.existingInterval);
        }));
    }

    private stop(): void {
        clearInterval(this.existingInterval);
        this.subscriptions.forEach(sub => sub.unsubscribe())
    }
}
