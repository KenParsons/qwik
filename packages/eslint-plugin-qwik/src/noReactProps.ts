import type { TSESLint } from '@typescript-eslint/utils';
import jsxAstUtils from 'jsx-ast-utils';

const reactSpecificProps = [
  { from: 'className', to: 'class' },
  { from: 'htmlFor', to: 'for' },
];

const domElementRegex = /^[a-z]/;
export const isDOMElementName = (name: string): boolean => domElementRegex.test(name);

export const noReactProps = {
  meta: {
    type: 'problem',
    docs: {
      recommended: 'warn',
      description: 'Disallow usage of React-specific `className`/`htmlFor` props.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      prefer: 'Prefer the `{{ to }}` prop over the deprecated `{{ from }}` prop.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        for (const { from, to } of reactSpecificProps) {
          const classNameAttribute = jsxAstUtils.getProp(node.attributes, from);
          if (classNameAttribute) {
            // only auto-fix if there is no class prop defined
            const fix = !jsxAstUtils.hasProp(node.attributes, to, { ignoreCase: false })
              ? (fixer: TSESLint.RuleFixer) => fixer.replaceText(classNameAttribute.name, to)
              : undefined;

            context.report({
              node: classNameAttribute,
              messageId: 'prefer',
              data: { from, to },
              fix,
            });
          }
        }
      },
    };
  },
};
