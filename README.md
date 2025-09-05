# Welcome to NODO AI Vaults project

## Project info

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in NODO AI Vaults.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
git clone <YOUR_GIT_URL>

cd <YOUR_PROJECT_NAME>

yarn

yarn dev
```

## Mock Mode for Full Flow Testing

Local development runs with mock data by default. This enables testing the full flow (connect wallet, list vaults, open vault detail, estimates) without requiring a real wallet or backend.

- `yarn dev` (or `npm run dev`) starts Vite with `VITE_MOCK_MODE=true`.
- To disable mocks, set `VITE_MOCK_MODE=false` when starting the dev server.
- Production builds keep mocks disabled unless explicitly enabled.


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

# TailwindCSS Styling Guidelines

## Overview
This project uses TailwindCSS for styling components and layouts. Follow these guidelines to maintain consistent styling across the application.

## Key Principles
1. Use Tailwind's utility classes directly in HTML/JSX
2. Follow mobile-first responsive design
3. Maintain consistent spacing and sizing
4. Use the project's color palette

## Common Patterns

### Layout
- Use `container` for main content wrapper
- Use `flex` and `grid` for layouts
- Use `p-4`, `m-4` for consistent spacing
- Use `max-w-{size}` for content width constraints

### Typography
- Use `text-{size}` for font sizes (e.g., `text-sm`, `text-base`, `text-lg`)
- Use `font-{weight}` for font weights (e.g., `font-normal`, `font-medium`, `font-bold`)
- Use `text-{color}` for text colors

### Colors
- Use semantic color classes (e.g., `text-primary`, `bg-secondary`)
- Use opacity modifiers (e.g., `bg-black/50` for 50% opacity)
- Use hover/focus states (e.g., `hover:bg-blue-600`)

### Components
- Use `rounded-{size}` for border radius
- Use `shadow-{size}` for box shadows
- Use `border` and `border-{color}` for borders

## Best Practices
1. Group related utility classes together
2. Use responsive prefixes (sm:, md:, lg:, xl:) for breakpoints
3. Extract common patterns into components when reused
4. Use Tailwind's @apply directive sparingly and only in component-specific styles

## Example
```jsx
<div className="container mx-auto p-4">
  <div className="flex flex-col md:flex-row gap-4">
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800">Title</h2>
      <p className="text-gray-600 mt-2">Content</p>
    </div>
  </div>
</div>
```
