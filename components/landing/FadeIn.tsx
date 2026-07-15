'use client'

import { motion } from 'framer-motion'

type Props = {
  children: React.ReactNode
}

export default function FadeIn({
  children,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}