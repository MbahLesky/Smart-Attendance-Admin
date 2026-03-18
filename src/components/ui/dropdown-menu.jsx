import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreHorizontal } from 'lucide-react'

import { cn } from '../../lib/utils'

const MotionMenu = motion.div

export function DropdownMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-xl border bg-white p-2 text-brand-muted transition hover:text-brand-text"
      >
        <MoreHorizontal className="size-4" />
      </button>
      <AnimatePresence>
        {open ? (
          <MotionMenu
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 z-20 mt-2 min-w-44 rounded-2xl border bg-white p-2 shadow-panel"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false)
                  item.onClick()
                }}
                className={cn(
                  'flex w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50',
                  item.danger ? 'text-brand-danger' : 'text-brand-text',
                )}
              >
                {item.label}
              </button>
            ))}
          </MotionMenu>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
