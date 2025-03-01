import {
  component$,
  $,
  useOnWindow,
  useSignal,
  useStylesScoped$,
  useTask$,
} from '@builder.io/qwik';
import { isBrowser } from '@builder.io/qwik/build';
import styles from './starter.css?inline';
import { useLocation } from '@builder.io/qwik-city';

export const GETTING_STARTED_STEPS = [
  {
    message: '<b>Ready</b> to make some changes?<br />Press and hold the <b>ALT</b> key',
  },
  {
    message: 'Select the title of this page while keeping the <b>ALT</b> key pressed',
    hint: 'Edit the title and save the changes. If your editor does not open, have a look at <a href="https://github.com/yyx990803/launch-editor#supported-editors" target="_blank">this page</a> to set the correct <code>LAUNCH_EDITOR</code> value.',
  },
  {
    message:
      '<b>Update</b> now the <code>routeLoader$</code> defined in the <code>src/routes/layout.tsx</code> file',
    hint: 'Instead of returning the current date, you could return any possible string.<br />The output is displayed in the footer.',
  },
  {
    message: 'Create a <b>new Route</b> called <code>/me</code>',
    hint: 'Create a new directory called <code>me</code> in <code>src/routes</code>. Within this directory create a <code>index.tsx</code> file or copy the <code>src/routes/index.tsx</code> file. Your new route is now accessible <a href="/me" target="_blank">here</a> ✨',
  },
  {
    message: 'Time to have a look at <b>Forms</b>',
    hint: 'Open <a href="/todolist" target="_blank">the TODO list App</a> and add some items to the list. Try the same with disabled JavaScript 🐰',
  },
  {
    message: '<b>Congratulations!</b> You are now familiar with the basics! 🎉',
    hint: "If you need further info on how to use qwik, have a look at <a href='https://qwik.builder.io' target='_blank'>qwik.builder.io</a> or join the <a href='https://qwik.builder.io/chat' target='_blank'>Discord channel</a>.",
  },
];

export default component$(() => {
  useStylesScoped$(styles);

  const loc = useLocation();
  let stepParam = loc.url.searchParams.has('step')
    ? parseInt(loc.url.searchParams.get('step') || '0') - 1
    : 0;

  if (stepParam < 0 || stepParam >= GETTING_STARTED_STEPS.length) {
    stepParam = 0;
  }

  const gettingStartedStep = useSignal(stepParam);

  useTask$(({ track }) => {
    track(() => gettingStartedStep.value);
    if (isBrowser) {
      // pushState to update the URL
      const url = new URL(window.location.href);
      url.searchParams.set('step', gettingStartedStep.value + 1 + '');
      window.history.pushState({}, '', url);
    }
  });

  useOnWindow(
    'keydown',
    $((e) => {
      if ((e as KeyboardEvent).key === 'Alt') {
        gettingStartedStep.value = 1;
      }
    })
  );

  return (
    <>
      <div class="getting-started">
        <div dangerouslySetInnerHTML={GETTING_STARTED_STEPS[gettingStartedStep.value].message} />
        <span
          class="hint"
          dangerouslySetInnerHTML={GETTING_STARTED_STEPS[gettingStartedStep.value].hint}
        />
      </div>
      {gettingStartedStep.value + 1 < GETTING_STARTED_STEPS.length ? (
        <button class="gray small" onClick$={() => gettingStartedStep.value++}>
          Continue with Step {gettingStartedStep.value + 2} of {GETTING_STARTED_STEPS.length}
        </button>
      ) : (
        <button class="gray small" onClick$={() => (gettingStartedStep.value = 0)}>
          Re-Start
        </button>
      )}
    </>
  );
});
