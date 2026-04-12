# FlowUI

A SwiftUI-inspired library for web interfaces with a fluent API and shadow DOM styles.

## Install

```sh
npm install @notswssr/flowui
```

Use a bundler such as Vite to load the package.

## Counter

```typescript
import {
  Button,
  Font,
  HStack,
  State,
  Text,
  VStack,
  mount,
} from "@notswssr/flowui";

const count = new State(0);

const counter = VStack(
  Text("Counter").font(Font.headline()).padding("bottom", 20),
  HStack(
    Button("-").onTap(() => count.value--),
    Text().to(count).padding("horizontal", 20),
    Button("+").onTap(() => count.value++),
  ),
).padding(20);

const unmount = mount(counter, "#app");
```

Call `unmount()` to remove the component and release its state subscriptions.

## Components

- Layout: `VStack`, `HStack`, `ZStack`, `Spacer`, `Divider`.
- Content: `Text`, `Image`, `Link`.
- Controls: `Button`, `TextField`, `Toggle`, `Slider`.
- Core: `UIComponent`, `State`, `Font`, `Color`, `mount`.

## State

`State` uses `Object.is` to compare values. Replace an object or array to notify subscribers.
Mutations to the current object do not send notifications.

```typescript
import { State, Text, TextField } from "@notswssr/flowui";

const profile = new State({ name: "" });
profile.value = { ...profile.value, name: "Simo" };

const name = new State("");
const input = TextField("Name").to(name);
const greeting = name.format((value) => `Hello, ${value}`).to(Text());
```

Automatic bindings use the initial state type:

- Strings bind to input values or text content.
- Numbers bind to number and range inputs or text content.
- Booleans bind to checkboxes or component visibility.
- Objects bind to text content as JSON.

Mapped objects bind to style properties. Use an explicit target to select a compatible setter.

```typescript
const color = new State("red");
color.to(Text("Status"), "foregroundColor");
color.asStyle("color").to(Text("Status"));
color.asCssVar("accent").to(Text("Status"));
```

Use `component.bind(state, callback)` for custom updates.
Use `state.subscribe(callback)` to receive new and old values.
Both `subscribe` and `effect` return an unsubscribe function.
`effect` also calls the callback immediately.

## Styles and events

```typescript
import { Color, Font, Text } from "@notswssr/flowui";

Text("Hello")
  .font(Font.headline().italic())
  .foregroundColor(Color.blue)
  .backgroundColor(Color.gray.opacity(0.1))
  .padding("all", 20)
  .cornerRadius(10)
  .border(2, Color.blue)
  .frame({ width: 200, height: 100 });
```

`style({ ... })` applies inline styles immediately. Use camelCase, CSS property names, or custom properties.
`style('...')` sets a stylesheet inside the component's shadow root.
Later style calls override earlier values for the same property.
Inline styles take precedence over normal stylesheet rules.

`onTap` and `onClick` receive a click event.
`onInput` and `onChange` receive the input value first and the event second.

```typescript
TextField("Name").onInput((value) => {
  name.value = value;
});
```

## Development

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm check:state
```

The dev server loads source files directly. `pnpm build` emits JavaScript and type declarations to `dist`.
Use `pnpm watch` to rebuild the package when source files change.
