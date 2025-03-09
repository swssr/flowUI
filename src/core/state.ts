export type SubCallback<T> = (newValue: T, oldValue: T) => void;
export default class State<T> {
  // Use #<?> on the next version
  private _value: T;
  private subscribers: Set<SubCallback<T>> = new Set();


  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (!this.isSame(this._value, newValue)) {
      const oldValue = this._value;
      this._value = newValue;
      this.notifySubscribers(newValue, oldValue);
    }
  }

  subscribe(callback: SubCallback<T>): () => void {
    this.subscribers.add(callback);
    // clean up
    return () => this.subscribers.delete(callback);
  }

  map<R>(mapFn: (value: T) => R): State<R> {
    const derivedState = new State(mapFn(this._value));

    this.subscribe((newValue) => {
      derivedState.value = mapFn(newValue);
    });

    return derivedState;
  }

  effect(effectFn: (value: T) => void): () => void {
    effectFn(this.value);
    return this.subscribe((newValue) => effectFn(newValue));
  }

  private notifySubscribers(newValue: T, oldValue: T): void {
    this.subscribers.forEach(callback => callback(newValue, oldValue));
  }

  // Move to utils
  isSame(value1: any, value2: any): boolean {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }
}
