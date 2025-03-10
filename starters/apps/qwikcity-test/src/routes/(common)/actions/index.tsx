import { component$ } from '@builder.io/qwik';
import { action$, DocumentHead, loader$ } from '@builder.io/qwik-city';
import { SecretForm } from './login';

export const useDateLoader = loader$(() => new Date());

export const useOtherAction = action$(() => {
  return {
    success: true,
  };
});

export default component$(() => {
  const other = useOtherAction();
  const date = useDateLoader();

  return (
    <div class="actions">
      <h1>Actions Test</h1>
      <section class="input">
        <SecretForm />
      </section>
      <div>{date.value.toISOString()}</div>
      <section>
        <div id="other-store">
          {String(other.isRunning)}:{other.formData?.get('username')}:{other.formData?.get('code')}:
          {JSON.stringify(other.value)}
        </div>
        <button id="other-button" onClick$={() => other.run()}>
          Run other
        </button>
        {other.value?.success && <div id="other-success">Success</div>}
      </section>
    </div>
  );
});

export const head: DocumentHead = () => {
  return {
    title: 'Actions',
  };
};
