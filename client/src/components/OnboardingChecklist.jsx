import { ChecklistProvider, ChecklistPanel, createChecklist } from '@tour-kit/checklists';

const onboarding = createChecklist({
  id: 'peek-onboarding',
  title: 'Get started with Peek',
  tasks: [
    {
      id: 'age',
      title: 'Confirm you are 18+',
      action: { type: 'callback', handler: () => document.querySelector('.age-check-tight input')?.click() },
    },
    {
      id: 'interests',
      title: 'Pick 1–3 interests',
      action: { type: 'callback', handler: () => document.getElementById('interests')?.scrollIntoView({ behavior: 'smooth' }) },
    },
    {
      id: 'start',
      title: 'Start your first chat',
      action: { type: 'callback', handler: () => document.querySelector('.cta-pill-video')?.click() },
    },
  ],
});

export default function OnboardingChecklist() {
  return (
    <ChecklistProvider checklists={[onboarding]}>
      <ChecklistPanel checklistId="peek-onboarding" />
    </ChecklistProvider>
  );
}