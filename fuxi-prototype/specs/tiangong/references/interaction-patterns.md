# Tiangong Interaction Patterns

## Expand And Collapse

- Tree and grouped-menu chevrons are stateful controls, never decoration. Descendants enter or leave the visible interaction tree when toggled.
- Keep expansion separate from business selection and expose `aria-expanded`.
- A full-sidebar collapse reduces the module rail to about `48px`; expanding restores labels and previous group state.

## Distribution

- Use the runtime's native transfer component for high-frequency assignment flows.
- Provide searchable available/assigned panels, visible counts, preserved current assignments, and explicit cancel/confirm actions.
- Keep the affected user or object visible above the transfer so the assignment target cannot become ambiguous.

## Navigation Hierarchy

- Treat the solid-blue product header as level 0: product switching and global utilities.
- Treat the white module sidebar as level 1: stable module navigation.
- Treat closable workspace tabs as level 2: open tasks or tools.
- Treat a business tree/category pane as level 3: dataset scope.
- Treat flat in-page tabs as level 4: representations or sub-areas of the selected scope.
- Preserve each level independently. Do not replace the hierarchy with breadcrumbs and a single page title.

## Query And Data Actions

- Place filters directly above the table they affect.
- Keep query and reset adjacent; query is primary, reset is outlined secondary.
- Keep row actions as short text links: common actions first, destructive action red, uncommon actions in a dropdown.
- Keep pagination outside the scrolling body. Show total, current page, and page size.
- Put create and batch actions in a stable bottom-right action bar for full-height management workspaces.
- Disable batch actions when no rows are selected; retain their position so the layout does not shift.
- Preserve filter, expanded-tree, pagination, and selection state while a dialog is open and after it closes.

## Trees

- Tree selection changes the scoped dataset; expansion only changes navigation visibility.
- Use full-row selection, stable indentation, and a contained scrollbar.
- Parent rows may expose add and more actions; leaf rows may expose edit and more actions.
- Keep action icons aligned to the right edge and prevent them from shifting the node label.

## Forms

- Use the runtime form API for required marks, label alignment, disabled/readonly propagation, help text, and validation.
- Use right-aligned labels with a stable width; align fields to one vertical grid.
- Keep radios and checkboxes inline when choices are short.
- Put name construction, format validation, automatic generation, and similar utilities beside the affected field as text actions.
- Show inline help directly under the field. Use placeholder examples inside empty text areas, not as permanent content.
- Validate before submission, show an inline error, focus or scroll to the first invalid field, and disable repeated submission.
- Distinguish create from edit: create may expose `保存并新增`; edit should not.

## Dialogs And Layering

- Use standard form dialogs for create/edit and large editor dialogs for composite workflows.
- Allow one intentional nested dialog for selection/reference tasks. The nested dialog must be smaller than its parent and add its own overlay.
- Keep the parent dialog state intact while the nested dialog is open.
- Place available items on the left and selected items on the right for reference/transfer workflows; give each side an independent table viewport.
- Keep every dialog's action footer fixed and outside the scrolling body.

## States And Feedback

- Keep empty, loading, server-error, and permission-denied states inside the data viewport.
- Use a concise empty state centered in the table region; do not replace the table header or bottom actions.
- Require explicit confirmation for destructive actions and name the affected object.
- Use toast/message feedback for completed saves and lightweight errors; do not add a large success dashboard.
- Keep disabled controls visible with muted surfaces and text.

## Density And Motion

- Optimize for repeated expert use, scanning, and direct manipulation.
- Use short transitions only for dropdowns, dialog entry, and pane collapse. Avoid page-level motion and decorative micro-interactions.
- Do not enlarge controls, typography, or whitespace to make the interface feel modern.
