# FlowUI

A SwiftUI-inspired library for building web interfaces with a fluent API.

> All wishful thing for now :')

```typescript
import { VStack, Text, Button, State, mount } from '@notswssr/flowui';

function Counter() {
  const count = new State(0);
  
  return VStack(
    Text("Counter")
      .font(.headline)
      .padding(".bottom", 20),
      
    Button("+")
      .onTap(() => count.value++)
      .padding(10),
      
    Text("0")
      .bind(count, (value, component) => {
        component.text(value.toString());
      })
  );
}

mount(Counter(), "#app");
```

## Features

- 🔗 **Fluent API**: Chainable, SwiftUI-inspired syntax
- 🧩 **Component Composition**: Build complex UIs from simple components
- 🔄 **State Management**: Reactive state with simple bindings
- 🎨 **Theming System**: Light/dark modes and customizable themes
- ✨ **Animations**: Transitions and animations for dynamic interfaces
- 📱 **Responsive Design**: Mobile-first grid and layout components
- 🚀 **No Build Step Required**: Use directly in the browser
- 🔍 **TypeScript Powered**: Full type safety and autocompletion

## Installation

```bash
npm install flowui
```

## Basic Usage

### Creating a Simple Component

```typescript
import { Text, Button, VStack, mount } from '@notswssr/flowui';

function HelloWorld() {
  return VStack(
    Text("Hello, World!")
      .font(Font.headline())
      .foregroundColor(Color.blue),
    Button("Click Me")
      .onTap(() => alert("Button clicked!"))
      .padding(10)
  )
  .padding(20)
  .backgroundColor(Color.gray.opacity(0.1))
  .cornerRadius(10);
}

mount(HelloWorld(), "#app");
```

### State Management

```typescript
import { Text, Button, VStack, State, mount } from '@notswssr/flowui';

function Counter() {
  // Create state
  const count = new State(0);
  
  // Build UI
  return VStack(
    Text("Counter")
      .font(Font.headline())
      .padding(".bottom", 20),
      
    Button("Increment")
      .onTap(() => count.value++)
      .padding(10),
      
    Text("0")
      .bind(count, (value, component) => {
        component.text(value.toString());
      })
  );
}

mount(Counter(), "#app");
```

## Core Components

### Layout Components

- **VStack**: Vertical stack layout
- **HStack**: Horizontal stack layout
- **ZStack**: Depth stack for overlapping elements
- **Spacer**: Flexible space
- **Grid**: Responsive grid layout
- **ScrollView**: Scrollable container

```typescript
VStack(
  Text("Header"),
  HStack(
    Text("Left"),
    Spacer(),
    Text("Right")
  ),
  Grid({ xs: 1, md: 2 }, 16, [
    Card({ title: "Card 1", content: Text("Content 1") }),
    Card({ title: "Card 2", content: Text("Content 2") })
  ])
)
```

### Basic Components

- **Text**: For displaying text
- **Button**: Interactive button
- **TextField**: Text input field
- **Toggle**: Boolean toggle switch
- **Image**: Image display with loading state

```typescript
VStack(
  Text("Login Form")
    .font(Font.headline()),
    
  TextField("Username")
    .padding(".bottom", 10),
    
  TextField("Password")
    .padding(".bottom", 20),
    
  Toggle(rememberMe)
    .padding(".bottom", 20),
    
  Button("Sign In")
    .padding(10)
    .backgroundColor(Color.blue)
    .cornerRadius(8)
)
```

### Advanced Components

- **Card**: Container with header, content, and footer
- **List**: Efficient list for rendering collections
- **Alert**: Contextual alerts with various types
- **Modal**: Modal dialog windows
- **TabView**: Tabbed interface
- **Divider**: Horizontal rule separator
- **Form**: Form container with submission handling

```typescript
Card({
  title: "User Profile",
  subtitle: "Personal information",
  content: VStack(
    Image("profile.jpg", { width: 100, height: 100 })
      .cornerRadius(50),
      
    Text("John Doe")
      .font(Font.headline()),
      
    Text("Software Developer")
      .foregroundColor(Color.gray)
  ),
  footer: Button("Edit Profile")
})
```

## Style Modifiers

Apply styles using chainable modifiers:

```typescript
Text("Hello World")
  .font(Font.headline())
  .foregroundColor(Color.blue)
  .padding(20)
  .backgroundColor(Color.gray.opacity(0.1))
  .cornerRadius(10)
  .border(Color.blue, 2)
  .frame({ width: 200, height: 100 })
```

Common modifiers:

- **padding()**: Add space around content
- **backgroundColor()**: Set background color
- **foregroundColor()**: Set text color
- **font()**: Set font style and size
- **cornerRadius()**: Round corners
- **border()**: Add border
- **frame()**: Set dimensions
- **style()**: Apply custom CSS

## Animation and Transitions

Add animations to any component:

```typescript
Button("Animated Button")
  .onTap(() => performAction())
  .animation(Animation.spring({ stiffness: 100, damping: 10 }))
```

Add transitions for enter/exit animations:

```typescript
Text("Fade In Text")
  .transition(Transition.opacity())
```

## Theming System

### Using Themes

```typescript
import { useTheme, VStack, Text, Button } from '@notswssr/flowui';

function ThemeDemo() {
  const { theme, toggleDarkMode } = useTheme();
  
  return VStack(
    Text(`Current Theme: ${theme.name}`)
      .foregroundColor(theme.colors.primary),
      
    Button(theme.isDark ? "Switch to Light" : "Switch to Dark")
      .onTap(() => toggleDarkMode())
  );
}
```

### Creating Custom Themes

```typescript
import { createTheme, Color, applyThemeToDocument } from '@notswssr/flowui';

const customTheme = createTheme({
  name: 'Custom Theme',
  colors: {
    primary: new Color('#6200EE'),
    secondary: new Color('#03DAC6'),
    background: new Color('#FAFAFA')
  }
});

// Apply the custom theme
applyThemeToDocument(customTheme);
```

## Advanced Usage

### Custom Components

Create your own components by composing existing ones:

```## Coming soon``