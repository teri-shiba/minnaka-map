'use client'
import { useState } from 'react'
import { FiHeart } from 'react-icons/fi'
import { Button } from '../buttons/Button'

export default function LikedWithText() {
  const [isLiked, setIsLiked] = useState(false)

  const handleLiked = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setIsLiked(!isLiked)
  }

  return (
    <>
      <Button variant="link" onClick={handleLiked} className="border-none bg-transparent rounded-full [&_svg]:size-6 sm:[&_svg]:size-5">
        <div className="flex gap-2">
          <FiHeart
            className={`stroke-white sm:stroke-gray-500 ${isLiked ? 'fill-destructive !stroke-destructive sm:!stroke-destructive' : ''}`}
          />
          保存する
        </div>
      </Button>
    </>
  )
}
