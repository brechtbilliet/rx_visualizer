import { Observable } from 'rxjs';
export class Operation {
    constructor(public stream: Observable<any>, public code?: string) {
    }
}