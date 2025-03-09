export default class Color {
  private value: string;

  constructor(value: string) {
    this.value = value;
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
    if (this.value.startsWith("#")) {
      const r = parseInt(this.value.slice(1, 3), 16);
      const g = parseInt(this.value.slice(3, 5), 16);
      const b = parseInt(this.value.slice(5, 7), 16);

      return new Color(`rgba(${r}, ${g}, ${b}, ${value})`);
    }

    if (this.value.startsWith("rgb(")) {
      // Prob a better to do this
      return new Color(this.value.replace("rgb(", "rgba(").replace(")", `, ${value})`));
    }

    return new Color(`color-mix(in oklab, ${this.value} ${value * 100}%, transparent)`);
  }

}
