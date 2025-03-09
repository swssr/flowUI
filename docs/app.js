// Import FlowUI from npm
import { 
    VStack, HStack, Text, Button, 
    State, mount, Color, Font 
  } from 'https://cdn.jsdelivr.net/npm/@notswssr/flowui@latest/+esm';
  
  function Counter() {
    // Create state for the counter
    const count = new State(0);
    
    // Build UI
    return VStack(
      Text("Counter")
        .font(Font.headline())
        .padding(".bottom", 20),
        
      HStack(
        Button("-")
          .onTap(() => count.value--)
          .padding(10),
          
        Text("0")
          .bind(count, (value, component) => {
            component.text(value.toString());
          })
          .padding(".horizontal", 20)
          .font(Font.title()),
          
        Button("+")
          .onTap(() => count.value++)
          .padding(10)
      )
      .padding(".bottom", 20),
      
      Text("Current count: 0")
        .bind(count, (value, component) => {
          component.text(`Current count: ${value}`);
        })
    )
    .padding(20)
    .backgroundColor(Color.gray.opacity(0.1))
    .cornerRadius(10);
  }
  
  // Mount the app to the DOM when the page loads
  document.addEventListener('DOMContentLoaded', () => {
    try {
      mount(Counter(), "#app");
      console.log("Counter app mounted successfully!");
    } catch (error) {
      console.error("Error mounting counter app:", error);
      document.querySelector("#app").innerHTML = `
        <div style="padding: 20px; color: red; text-align: center;">
          <h3>Error Loading Demo</h3>
          <p>${error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      `;
    }
  });