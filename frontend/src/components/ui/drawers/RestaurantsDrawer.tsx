'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export default function RestaurantsDrawer() {
  const contentRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const [dragConstraints, setDragConstraints] = useState({ top: 0, bottom: 0 })

  useEffect(() => {
    const calculateConstraints = () => {
      if (!contentRef.current)
        return

      const contentHeight = contentRef.current.offsetHeight
      const modalViewHeight = window.innerHeight * 0.4
      const dragDistance = contentHeight - modalViewHeight

      setDragConstraints({
        top: -dragDistance,
        bottom: 0,
      })
    }

    const timer = setTimeout(calculateConstraints, 100)

    window.addEventListener('resize', calculateConstraints)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateConstraints)
    }
  }, [])

  return (
    <motion.div
      drag="y"
      dragConstraints={dragConstraints}
      className="absolute bottom-0 z-40 h-[40vh] w-full"
      ref={modalRef}
    >
      <div className="rounded-t-3xl bg-lime-100 p-4" ref={contentRef}>
        <div className="mx-auto mb-2 h-1 w-9 rounded-full bg-gray-200" />
        <h2>検索結果はこちら</h2>
        <p>○件の飲食店が見つかりました！</p>

        <div className="mt-4 space-y-2">
          <RetaurantList />
        </div>
      </div>
    </motion.div>
  )
}

function RetaurantList() {
  return (
    <>
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} className="rounded-lg border border-black bg-white p-4">
          <h3 className="font-semibold">
            レストラン
            {i + 1}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            美味しい料理を提供するレストランです
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">4.2</span>
          </div>
        </div>
      ))}
    </>
  )
}
