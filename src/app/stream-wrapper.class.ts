import { Observable } from 'rxjs';
export class StreamWrapper {
    constructor(public name: string, public stream: Observable<any>) {

    }
}