
import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const slides = [
    {
    desktop: assets.main_banner_bg,
    mobile: assets.main_banner_bg_sm,
    title: 'You Can Trust, Savings You Will Love!',
    subtitle: 'Discover the best products at amazing prices.',
    button: 'Shop Now',
    },
    {
    // Add these image keys to your assets file
    desktop: assets.main_banner_bg1,
    mobile: assets.main_banner_bg_sm_2,
    title: 'Discover More. Save More.',
    subtitle: 'Find your favorites at unbeatable prices.',
    button: 'Explore Products',
    },
    {
    desktop: assets.main_banner_bg2,
    mobile: assets.main_banner_bg_sm_3,
    title: 'Big Deals. Better Shopping.',
    subtitle: 'Your next favorite product is waiting.',
    button: 'Shop Deals',
    },
]

const MainBanner = () => {
    const [current, setCurrent] = useState(0)

  // Automatically change banner every 5 seconds
    useEffect(() => {
    const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
    }, [])

    const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
    setCurrent((prev) =>
        (prev - 1 + slides.length) % slides.length
    )
    }

    return (
    <section className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-gray-200/70 shadow-sm md:shadow-md transition-all duration-300 group select-none">

      {/* Banner images */}
        {slides.map((slide, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.desktop} alt={slide.title} className="hidden h-full w-full object-cover md:block"/>
            <img src={slide.mobile} alt={slide.title} className="h-full w-full object-cover md:hidden"/>
        </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/75 to-transparent/20 md:bg-gradient-to-r md:from-white/90 md:via-white/60 md:to-transparent pointer-events-none" />

        <div className="invisible">
            <img src={slides[0].desktop} alt="" className="hidden w-full md:block"/>
            <img src={slides[0].mobile} alt="" className="w-full md:hidden"/>
        </div>

      {/* Banner content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end px-4 pb-16 sm:pb-20 md:items-start md:justify-center md:pb-0 md:pl-16 lg:pl-24">

        <h1 key={current} className="max-w-72 text-center text-2xl sm:text-3xl font-bold leading-tight text-gray-900 md:max-w-80 md:text-left md:text-4xl lg:max-w-105 lg:text-5xl">{slides[current].title}</h1>
        <p className="mt-2 sm:mt-3 max-w-sm text-center text-xs sm:text-sm text-gray-700 md:text-left md:text-base">{slides[current].subtitle}</p>

        <div className="mt-5 sm:mt-6 flex items-center gap-3 font-medium">
            <Link to="/product" className="rounded-lg bg-primary px-6 py-2.5 sm:px-8 sm:py-3 text-white font-medium shadow-xs hover:shadow-sm transition hover:bg-primary-dull active:scale-95 cursor-pointer text-sm sm:text-base">{slides[current].button}</Link>
            <Link to="/product" className="hidden items-center gap-2 px-4 py-3 text-gray-800 font-medium hover:text-primary transition md:flex cursor-pointer text-sm sm:text-base">Explore Deals <span>→</span></Link>
        </div>
        </div>

      {/* Previous and next circular arrow buttons */}
        <button onClick={prevSlide} aria-label="Previous banner" className="absolute left-2 sm:left-4 top-1/2 z-20 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs border border-white/60 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
        </svg>
        </button>

        <button onClick={nextSlide} aria-label="Next banner" className="absolute right-2 sm:right-4 top-1/2 z-20 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs border border-white/60 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer">
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
        </svg>
        </button>

      {/* Slide indicator pill container */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 px-3 py-1.5 rounded-full bg-black/15 backdrop-blur-sm border border-white/20">
            {slides.map((_, index) => (
                <button key={index} onClick={() => setCurrent(index)} aria-label={`Go to banner ${index + 1}`} className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${ current === index ? 'w-6 sm:w-7 bg-primary shadow-xs' : 'w-2 sm:w-2.5 bg-white/70 hover:bg-white'}`}/>
            ))}
        </div>
    </section>
    )
}

export default MainBanner
