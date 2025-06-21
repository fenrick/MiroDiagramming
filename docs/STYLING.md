Styling and Formatting Guide

Standards for UI consistency and developer workflow in Miro Web SDK Add-ons

⸻

Purpose

This guide ensures consistent visual language, scalable design practices, and efficient collaboration when building Miro Web SDK add-ons. It reflects Miro’s brand principles and component architecture, using Mirotone and mirotone-react as the foundation.

⸻

1. Design System Alignment with Mirotone

Mirotone is Miro’s official UI toolkit. It defines the visual and behavioural standards across Miro’s interfaces. Adhering to its tokens, components, and layout conventions ensures:
	•	Visual coherence with the Miro ecosystem
	•	Accessibility compliance (WCAG AA)
	•	Simplified maintenance and future upgrades

Use of Base Styles
	•	The project must import the full stylesheet:

import 'mirotone/dist/styles.css';


	•	Prefer utility-first styling using Mirotone’s predefined classes. Avoid custom CSS unless the need is validated and not covered by system classes.
	•	Leverage layout primitives:
	•	cs*, ce* for grid columns (e.g., cs1 ce6)
	•	row, grid, and cluster for structured layout
	•	tokens.space.* for consistent spacing and padding

✅ Do:

<div className="grid cs1 ce12">
  <div className="cs1 ce6">
    <Input label="Name" />
  </div>
</div>

❌ Avoid:

.custom-grid {
  margin-left: 12px;
}


⸻

2. Using mirotone-react Components

mirotone-react provides type-safe React components that wrap native elements with correct accessibility, structure, and theming.

Key Components
	•	Button, Input, Checkbox, Modal, Tooltip, Link
	•	These expose props that abstract away the required Mirotone class combinations.

Example:

import { Button, Input } from 'mirotone-react';

<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>

Best Practices
	•	Avoid using raw <button>, <input> etc., unless the design cannot be represented via mirotone-react.
	•	For complex interactions, wrap mirotone-react components in presentational components with clearly defined interfaces.
	•	Maintain accessibility by default. E.g., all inputs must have labels; buttons must use aria attributes if they control hidden content.

⸻

3. Responsive Layout & Spacing

Use Mirotone’s spacing scale from tokens.space to manage white space consistently.

Guidelines

Token	Description
tokens.space.xs	Extra small spacing
tokens.space.md	Medium spacing
tokens.space.lg	Large spacing

Do not hard-code pixel values. Integrate these tokens via component props or custom utility classes only when required.

✅ Correct:

<div style={{ padding: tokens.space.md }}>
  <Input label="Title" />
</div>

❌ Incorrect:

<div style={{ padding: '12px' }}>
  <input type="text" />
</div>


⸻

4. Custom Styling Rules (Use Sparingly)

Where custom CSS is essential:
	•	Scope styles locally using CSS Modules or Emotion
	•	Prefix custom classes with custom- to avoid namespace collision
	•	Document why the custom style is needed, ideally with a link to a design spec or ticket

⸻

5. Formatting, Linting & Code Consistency

Pre-commit Standards

All code must be formatted and validated before commits. Run the following silently to ensure compliance:

npm run typecheck --silent
npm test --silent
npm run lint --silent
npm run prettier --silent

Tooling
	•	Prettier: Consistent formatting
	•	ESLint: Enforces code style and potential error checks
	•	TypeScript: Ensures strong typing and clarity
	•	Stylelint (optional): If using custom CSS

Integrate these checks into CI pipelines to enforce consistency automatically.

⸻

6. Theming and Accessibility
	•	All components should render correctly in light and dark themes. Test toggling system themes or using Miro’s theme switcher when available.
	•	Ensure sufficient colour contrast ratios and keyboard accessibility in all components.
	•	Use aria-* and role attributes as required by Mirotone’s accessibility recommendations.

⸻

7. Example Pattern: Form Layout with Validation

<form className="cs1 ce12 cluster" onSubmit={handleSubmit}>
  <Input
    label="Board name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
    error={showError ? 'Board name is required' : ''}
  />
  <Button type="submit" variant="primary">Create</Button>
</form>


⸻

Next Steps
	•	Review Mirotone Docs
	•	Align component development with the Figma design spec if available
	•	Log deviations or requests for missing components in your team’s shared backlog