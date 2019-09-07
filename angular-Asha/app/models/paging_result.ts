
export class PagingResult<T> {
    constructor(
        public result: T[],
        public total: number,
        public page: number,
        public perPage: number
    ) { }
}
