export type EdgeValue = "top" | "bottom" | "leading" | "trailing" | "all" | "horizontal" | "vertical";
export type DotEdge = `${EdgeValue}`;


export class Color {
  private value: string;

  constructor(value: String) {
    this.value =  value;
  }

  toString(): string {
    return this.value;
  }


  // TODO: Need to manage these better
  // Thinking of using open props
  // Getting the iOS default for now, but there's probably a better way to do this. 
  // Future me problem (～￣▽￣)～.
  // Common colors as static properties
  static black = new Color("#000000");
  static blue = new Color("#0A84FF");
  static gray = new Color("#8E8E93");
  static green = new Color("#30D158");
  static orange = new Color("#FF9F0A");
  static pink = new Color("#FF375F");
  static purple = new Color("#BF5AF2");
  static red = new Color("#FF453A");
  static white = new Color("#FFFFFF");


  // Create color with opacity
  opacity(value: number): Color {
    if(this.value.startsWith("#")) {
      const r = parseInt(this.value.slice(1, 3), 16);
      const g = parseInt(this.value.slice(3, 5), 16);
      const b = parseInt(this.value.slice(5, 7), 16);

      return Color(`rgba(${r}, ${g}, ${b}, ${value})`);
    }

    if(this.value.startsWith("rgb(")) {
      // Prob a better to do this
      return new Color(this.value.replace("rgb(", "rgba(").replace(")", ${value}));
    }

    return new Color(`color-mix(in oklab, ${this.value} ${value * 100}%, transparent)`);
  }

}


export class Font {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  static largeTitle(): Font {
    return new Font("2.5rem");
  }

  static title(): Font {
    return new Font("2rem");
  }

  static headline(): Font {
    return new Font("1.5rem bold");
  }

  static body(): Font {
    return new Font("1rem");
  }

  static callout(): Font {
    return Font("0.8rem");
  }

  static caption(): Font {
    return new Font("0.8rem");
  }

  static footnote(): Font {
    return new Font("0.7rem");
  }

  // #region Modifiers
  bold(): Font {
    return new Font(`${this.value} bold`)
  }


  italic(): Font() {
    return new Font(`${this.value} italic`);
  }

  // #endregion

}


// THis shit will probably become complex in the future. I wanna also learn how signals are implemented.
// So brewing complexity - might end up moving to own submodule
export class State<T> {
  // Use #<?> on the next version
  private _value: T;
  private subscribers: Set<() => void> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if(!this.isSame(this._value, newValue)) {
      this._value newValue;
      this.notifySubscribers();
    }
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    // clean up
    return () => this.subscribers.delete(callback)
  }


  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  // Move to utils
  isSame(value1, value2): boolean {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }
}
