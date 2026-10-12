import React from 'react'
import { assets, features } from '../assets/assets'

const BottemBanner = () => {
    return (
    <div className='relative mt-24 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-200/70 shadow-sm'>
        <img src={assets.bottom_banner_image} alt="banner" className='w-full hidden md:block' />
        <img src={assets.bottom_banner_image_sm} alt="banner" className='w-full  md:hidden' />
        <div className='absolute inset-0 flex flex-col items-center md:items-end md:justify-center pt-16 md:pt-0 px-6 md:pr-24'>
        </div>
    </div>
    
    )
}

export default BottemBanner
