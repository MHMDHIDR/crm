import React from 'react'
import { toast } from 'sonner'
import { Error as ErrorIcon, Success } from '@/components/custom/icons'

/*
 * A function to copy a string to the clipboard
 * @param code the string to be copied to the clipboard
 * @returns void
 * */
export async function handleCopyToClipboard(code: string) {
  try {
    await navigator.clipboard.writeText(code)

    toast('Copied!', {
      icon: React.createElement(Success, { className: 'w-6 h-6 ml-3' }),
      position: 'bottom-center',
      className: 'text-right select-none rtl',
      duration: 2000,
      style: {
        backgroundColor: '#F0FAF0',
        color: '#367E18',
        border: '1px solid #367E18',
        gap: '1.5rem',
        textAlign: 'justify'
      }
    })
  } catch (error) {
    toast(JSON.stringify(error), {
      icon: React.createElement(ErrorIcon, { className: 'w-6 h-6 ml-3' }),
      position: 'bottom-center',
      className: 'text-right select-none rtl',
      style: {
        backgroundColor: '#FFF0F0',
        color: '#BE2A2A',
        border: '1px solid #BE2A2A',
        gap: '1.5rem',
        textAlign: 'justify'
      }
    })
  }
}
