'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { FiHeart } from 'react-icons/fi'
import { Button } from '../buttons/Button'

export default function Liked() {
  const [isLiked, setIsLiked] = useState(false)

  const handleLiked = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setIsLiked(!isLiked)
  }

  return (
    <Button variant="outline" size="icon" onClick={handleLiked} className="rounded-full border-none bg-transparent hover:bg-transparent sm:hover:bg-white [&_svg]:size-6">
      <motion.div
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 1.5 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="p-2"
      >
        <FiHeart
          className={`stroke-white sm:stroke-gray-600 ${isLiked ? '!sm:stroke-destructive fill-destructive !stroke-destructive' : ''}`}
        />
      </motion.div>
    </Button>
  )
}
