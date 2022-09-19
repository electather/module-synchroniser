export class Queue<T> {
  private _queue: Record<number, T>;
  private _head: number;
  private _tail: number;

  constructor() {
    this._queue = {};
    this._head = 0;
    this._tail = 0;
  }

  get isEmpty() {
    return this.size === 0;
  }
  get size() {
    return this._tail - this._head;
  }

  enqueue(value: T): void {
    this._queue[this._tail] = value;
    this._tail++;
  }

  dequeue(): T | undefined {
    if (this.isEmpty) {
      return undefined;
    }
    const value = this._queue[this._head];
    delete this._queue[this._head];
    this._head++;
    return value;
  }

  foreach(callback: (value: T, index: number) => void): void {
    let index = 0;
    for (let i = this._head; i < this._tail; i++) {
      if (!this.isEmpty) {
        callback(this.dequeue() as T, index);
        index++;
      }
    }
  }
}
