import { Fragment, jsx, JSXNode } from '@builder.io/qwik';
import {
  flattenPrefetchResources,
  prefetchUrlsEventScript,
  workerFetchScript,
} from './prefetch-utils';
import type { PrefetchImplementation, PrefetchResource, PrefetchStrategy } from './types';

export function applyPrefetchImplementation(
  prefetchStrategy: PrefetchStrategy | undefined,
  prefetchResources: PrefetchResource[],
  nonce?: string
): JSXNode | null {
  // if prefetchStrategy is undefined, use defaults
  // set default if implementation wasn't provided
  const prefetchImpl = normalizePrefetchImplementation(prefetchStrategy?.implementation);

  const prefetchNodes: JSXNode[] = [];

  if (prefetchImpl.prefetchEvent === 'always') {
    prefetchUrlsEvent(prefetchNodes, prefetchResources, nonce);
  }

  if (prefetchImpl.linkInsert === 'html-append') {
    linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl);
  }

  if (prefetchImpl.linkInsert === 'js-append') {
    linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl, nonce);
  } else if (prefetchImpl.workerFetchInsert === 'always') {
    workerFetchImplementation(prefetchNodes, prefetchResources, nonce);
  }

  if (prefetchNodes.length > 0) {
    return jsx(Fragment, { children: prefetchNodes });
  }

  return null;
}

function prefetchUrlsEvent(
  prefetchNodes: JSXNode[],
  prefetchResources: PrefetchResource[],
  nonce?: string
) {
  prefetchNodes.push(
    jsx('script', {
      type: 'module',
      dangerouslySetInnerHTML: prefetchUrlsEventScript(prefetchResources),
      nonce,
    })
  );
}

/**
 * Creates the `<link>` within the rendered html.
 * Optionally add the JS worker fetch
 */
function linkHtmlImplementation(
  prefetchNodes: JSXNode[],
  prefetchResources: PrefetchResource[],
  prefetchImpl: Required<PrefetchImplementation>
) {
  const urls = flattenPrefetchResources(prefetchResources);
  const rel = prefetchImpl.linkRel || 'prefetch';

  for (const url of urls) {
    const attributes: Record<string, string> = {};
    attributes['href'] = url;
    attributes['rel'] = rel;
    if (rel === 'prefetch' || rel === 'preload') {
      if (url.endsWith('.js')) {
        attributes['as'] = 'script';
      }
    }

    prefetchNodes.push(jsx('link', attributes, undefined));
  }
}

/**
 * Uses JS to add the `<link>` elements at runtime, and if the
 * link prefetching isn't supported, it'll also add the
 * web worker fetch.
 */
function linkJsImplementation(
  prefetchNodes: JSXNode[],
  prefetchResources: PrefetchResource[],
  prefetchImpl: Required<PrefetchImplementation>,
  nonce?: string
) {
  const rel = prefetchImpl.linkRel || 'prefetch';
  let s = ``;

  if (prefetchImpl.workerFetchInsert === 'no-link-support') {
    s += `let supportsLinkRel = true;`;
  }

  s += `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += `u.map((u,i)=>{`;

  s += `const l=document.createElement('link');`;
  s += `l.setAttribute("href",u);`;
  s += `l.setAttribute("rel","${rel}");`;

  if (prefetchImpl.workerFetchInsert === 'no-link-support') {
    s += `if(i===0){`;
    s += `try{`;
    s += `supportsLinkRel=l.relList.supports("${rel}");`;
    s += `}catch(e){}`;
    s += `}`;
  }

  s += `document.body.appendChild(l);`;

  s += `});`;

  if (prefetchImpl.workerFetchInsert === 'no-link-support') {
    s += `if(!supportsLinkRel){`;
    s += workerFetchScript();
    s += `}`;
  }

  if (prefetchImpl.workerFetchInsert === 'always') {
    s += workerFetchScript();
  }

  prefetchNodes.push(
    jsx('script', {
      type: 'module',
      dangerouslySetInnerHTML: s,
      nonce,
    })
  );
}

function workerFetchImplementation(
  prefetchNodes: JSXNode[],
  prefetchResources: PrefetchResource[],
  nonce?: string
) {
  let s = `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += workerFetchScript();

  prefetchNodes.push(
    jsx('script', {
      type: 'module',
      dangerouslySetInnerHTML: s,
      nonce,
    })
  );
}

function normalizePrefetchImplementation(
  input: PrefetchImplementation | undefined
): Required<PrefetchImplementation> {
  if (input && typeof input === 'object') {
    // user provided PrefetchImplementation
    return input as any;
  }

  // default PrefetchImplementation
  return PrefetchImplementationDefault;
}

const PrefetchImplementationDefault: Required<PrefetchImplementation> = {
  linkInsert: null,
  linkRel: null,
  workerFetchInsert: null,
  prefetchEvent: 'always',
};
