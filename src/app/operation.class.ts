import { Observable } from 'rxjs';
export class Operation {
    result? = '';

    private subscriptions = [];
    private interval;

    constructor(public stream: Observable<any>, public code?: string) {

    }

    draw(): void {
        this.result = '';
        this.cleanup();
        this.interval = setInterval(() => {
            this.result += '-';
        }, 200);
        this.subscriptions.push(this.stream.subscribe((e) => {
            this.result += e;
        }, () => {
        }, () => {
            this.result += '|';
            clearInterval(this.interval);
        }));
    }

    private cleanup(): void {
        clearInterval(this.interval);
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    destroy(): void {
        this.cleanup();
    }
}