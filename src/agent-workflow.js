export const agentSteps = [
  { title: 'A task from my phone', detail: 'Check why this selection crosses a row.', duration: 2300 },
  { title: 'Discord → coding session', detail: 'The bridge delivers the message to the agent.', duration: 1300 },
  { title: 'Read the project instructions', detail: 'AGENTS.md · reproduce first · preserve game rules', duration: 2400 },
  { title: 'Plan the investigation', detail: 'Superpowers · trace the neighbor check · make a small change', duration: 2400 },
  { title: 'Work in the repository', detail: 'Inspect selection logic and handle the row boundary.', duration: 2600 },
  { title: 'Check the result', detail: 'Verify matching neighbors and reject wrapped rows.', duration: 2500 },
  { title: 'Reply through Discord', detail: 'Explain the change and what was checked.', duration: 3500 },
];
export const agentExampleCode = `const columnDistance = Math.abs(
  current % size - neighbor % size,
);
const rowDistance = Math.abs(
  Math.floor(current / size) -
  Math.floor(neighbor / size),
);
if (columnDistance + rowDistance !== 1) {
  continue;
}`;
