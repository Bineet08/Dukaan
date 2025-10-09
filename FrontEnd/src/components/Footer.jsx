import React, { useEffect, useState } from 'react'


const Footer = () => {
  const[isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(()=>{
    const handleScroll = () => {
      const currScrollY = window.scrollY
      if(currScrollY > lastScrollY && currScrollY > 100){
        setIsVisible(false)
      }
      else if(currScrollY<lastScrollY) setIsVisible(true)
        setIsVisible(currScrollY)
    }
    window.addEventListener('scroll',handleScroll,{ passive: true})
    return ()=> window.removeEventListener('scroll',handleScroll)
  },[ lastScrollY ])
  return (
    <footer className={`bg-gray-600 h-16 w-full fixed bottom-0 flex items-center justify-center z-50 transition-transform duration-150 ${
    isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className='text-sm text-white'>
        Managed By Ankit...
      </div>
    </footer>
  )
}

export default Footer