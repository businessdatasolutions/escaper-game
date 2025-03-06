# Escaper

A browser-based clone of the classic 1980s Boulder Dash game built using HTML, CSS (via Tailwind CSS), and JavaScript. This project features a grid-based layout with falling boulders, collectible diamonds, and a hidden exit that is revealed once you collect enough diamonds. The game supports both desktop and mobile controls, including keyboard arrow keys, on-screen buttons, and touch swipe gestures.

## Overview

In this game, you control a player character navigating through a dynamic grid filled with various obstacles:

- **Boulders:** Fall from above and can crush the player.
- **Diamonds:** Must be collected to reveal the exit.
- **Dirt and Walls:** Form the terrain, with walls serving as the borders of the game area.
- **Exit:** Hidden until the required number of diamonds is collected.

The game is built with a modular, object-oriented structure to keep the code organized and maintainable. Several improvements have been made over a basic implementation:

- **Physics Simulation:** Objects (boulders and diamonds) fall down one grid cell at a time, with boulders also having the ability to roll.
- **Grace Period Mechanism:** When a boulder is about to fall on the player, a 500ms grace period is provided. During this time, if the player moves downward quickly (with a “dash” move), they can escape the falling boulder.
- **Visual Feedback for Death:** Upon death (when crushed by a boulder or running out of time), the player's tile is not removed. Instead, it permanently shows a “Face with Spiral Eyes” emoji (😵‍💫) and the tile’s background color changes to red, making the event visibly distinct.
- **Responsive Controls:** The game is fully playable on desktop and mobile devices with dedicated on-screen buttons and touch controls.

## Features

- **Grid-based Gameplay:** 20x15 grid where each cell represents a game tile.
- **Dynamic Level Generation:** Random placement of dirt, boulders, diamonds, and safe starting positions for the player.
- **Physics and Collision Handling:** Simulated falling boulders with rolling behavior and collision detection.
- **Grace Period & Dash Move:** A brief window to escape an imminent crushing collision, with a dash move that moves the player two tiles down.
- **Responsive & Accessible:** Tailwind CSS styling, keyboard and on-screen button controls, and touch support.
- **Visual Death Feedback:** The player’s death is clearly shown with a permanent red background and a “Face with Spiral Eyes” emoji.

## How to Play

- **Objective:** Collect the required number of diamonds to reveal the exit and then reach it before time runs out.
- **Controls:**
  - **Desktop:** Use the arrow keys or on-screen buttons to move.
  - **Mobile:** Tap on the on-screen directional buttons or swipe in the desired direction.
- **Gameplay Tips:**
  - Be cautious of falling boulders. If a boulder starts to fall onto your character, a 500ms grace period allows you a chance to dash downwards and escape.
  - Collect diamonds strategically to not only meet the exit condition but also clear paths that might block your movement.
  - The exit is revealed only after you collect enough diamonds (at least 10 or 80% of available diamonds).

## Installation and Running

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/boulder-dash-clone.git
   cd boulder-dash-clone
   ```

2. **Open the Game:**

   Simply open the `index.html` file in your favorite web browser. No additional server setup is required since the game is entirely client-side.

## Project Structure

- **index.html:** Contains the game markup, styles (including Tailwind CSS integration), and the entire JavaScript code.
- **JavaScript Code:** Encapsulated in a `BoulderDash` class that manages game state, event handling, physics updates, and rendering.
- **Styles:** Tailwind CSS is used for quick and responsive styling. Custom CSS is applied for animations (flash effects on diamonds and the exit).

## Future Improvements

- **Canvas Rendering:** Consider migrating from DOM manipulation to a canvas-based renderer for improved performance.
- **Level Progression:** Implement multiple levels with increasing difficulty.
- **Sound Effects:** Add audio feedback for actions like collecting diamonds, falling boulders, and game over.
- **Enhanced Physics:** Fine-tune the physics simulation for more realistic interactions.

## Credits

- **Inspiration:** This game is inspired by the classic Boulder Dash.
- **Frameworks:** Utilizes [Tailwind CSS](https://tailwindcss.com) for styling.
- **Contributors:** [Your Name or Team Name]

## License

This project is open source and available under the [MIT License](LICENSE).
