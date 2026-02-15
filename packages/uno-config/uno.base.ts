/* eslint-disable @typescript-eslint/no-explicit-any */
import { presetAttributify, presetUno } from 'unocss';

export function BaseUnoConfig() {
  return {
    content: {
      pipeline: {
        include: [
          // the default
          /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
          // include js/ts files
          'src/**/*.{js,ts,jsx,tsx}',
        ],
      },
    },
    presets: [presetUno(), presetAttributify()],
    shortcuts: {
      ellipsis: 'text-overflow',
      'f-b': 'flex justify-between items-center',
      'f-c': 'flex justify-center items-center',
      'f-s': 'flex justify-start items-center',
      'f-e': 'flex justify-end items-center',
      'wh-full': 'w-full h-full',
      'absolute-full': 'absolute inset-0 overflow-hidden',
    },
    rules: [
      [/^bw-(\d+)$/, (match: any) => ({ 'border-width': `${match[1]}px` })],
      [/^b-(\d+)-#([\w]+)$/, (match: any) => ({ border: `solid ${match[1]}px #${match[2]}` })],
      [
        /^bt-(\d+)-#([\w]+)$/,
        (match: any) => ({ 'border-top': `solid ${match[1]}px #${match[2]}` }),
      ],
      [
        /^bb-(\d+)-#([\w]+)$/,
        (match: any) => ({ 'border-bottom': `solid ${match[1]}px #${match[2]}` }),
      ],
      [
        /^bl-(\d+)-#([\w]+)$/,
        (match: any) => ({ 'border-left': `solid ${match[1]}px #${match[2]}` }),
      ],
      [
        /^br-(\d+)-#([\w]+)$/,
        (match: any) => ({ 'border-right': `solid ${match[1]}px #${match[2]}` }),
      ],
      [
        /^px-(\d+)$/,
        (match: any) => ({
          'padding-left': `${match[1]}px`,
          'padding-right': `${match[1]}px`,
        }),
      ],
      [
        /^py-(\d+)$/,
        (match: any) => ({
          'padding-top': `${match[1]}px`,
          'padding-bottom': `${match[1]}px`,
        }),
      ],
      [
        /^mx-(\d+)$/,
        (match: any) => ({
          'margin-left': `${match[1]}px`,
          'margin-right': `${match[1]}px`,
        }),
      ],
      [
        /^my-(\d+)$/,
        (match: any) => ({
          'margin-top': `${match[1]}px`,
          'margin-bottom': `${match[1]}px`,
        }),
      ],
      [/^pt-(\d+)$/, (match: any) => ({ 'padding-top': `${match[1]}px` })],
      [/^pb-(\d+)$/, (match: any) => ({ 'padding-bottom': `${match[1]}px` })],
      [/^pl-(\d+)$/, (match: any) => ({ 'padding-left': `${match[1]}px` })],
      [/^pr-(\d+)$/, (match: any) => ({ 'padding-right': `${match[1]}px` })],
      [/^mt-(\d+)$/, (match: any) => ({ 'margin-top': `${match[1]}px` })],
      [/^mb-(\d+)$/, (match: any) => ({ 'margin-bottom': `${match[1]}px` })],
      [/^ml-(\d+)$/, (match: any) => ({ 'margin-left': `${match[1]}px` })],
      [/^mr-(\d+)$/, (match: any) => ({ 'margin-right': `${match[1]}px` })],
    ],
  };
}
