import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Profile = () => {
    const { user, setUser, axios } = useAppContext()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [locating, setLocating] = useState(false)

    const fetchLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser')
            return
        }
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    const data = await res.json()
                    const city = data.address?.city || data.address?.town || data.address?.village || ''
                    const state = data.address?.state || ''
                    const country = data.address?.country || ''
                    const loc = [city, state, country].filter(Boolean).join(', ')
                    setLocation(loc || `${latitude}, ${longitude}`)
                    toast.success('Location detected!')
                } catch {
                    toast.error('Could not fetch address')
                }
                setLocating(false)
            },
            () => {
                toast.error('Permission denied. Please allow location access.')
                setLocating(false)
            }
        )
    }

    useEffect(() => {
        if (user) {
            setName(user.name || '')
            setEmail(user.email || '')
            setPhone(user.phone || '')
            setLocation(user.location || '')
        }
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await axios.put('/api/user/profile', { name, phone, location })
            if (data.success) {
                toast.success(data.message)
                setUser(data.user)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
        setLoading(false)
    }

    if (!user) {
        return (
            <div className="mt-16 pb-16 text-center">
                <p className="text-gray-500 text-lg">Please login to view your profile.</p>
            </div>
        )
    }

    return (
        <div className='mt-16 pb-16'>
            <div className='flex flex-col items-end w-max mb-8'>
                <p className='text-2xl font-medium uppercase'>My Profile</p>
                <div className='w-16 h-0.5 bg-primary rounded-full'></div>
            </div>

            <div className='max-w-lg'>
                {/* Avatar */}
                <div className='flex items-center gap-4 mb-8'>
                    <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/30'>
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className='text-xl font-semibold text-gray-800'>{user.name}</h2>
                        <p className='text-gray-500 text-sm'>{user.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                    {/* Name */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                        <input
                            type='text'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-primary bg-white'
                            placeholder='Enter your full name'
                            required
                        />
                    </div>

                    {/* Email (Read Only) */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address</label>
                        <input
                            type='email'
                            value={email}
                            className='w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed'
                            readOnly
                        />
                        <p className='text-xs text-gray-400 mt-1'>Email cannot be changed</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                        <input
                            type='tel'
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-primary bg-white'
                            placeholder='Enter your phone number'
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Current Location</label>
                        <div className='relative'>
                            <input
                                type='text'
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className='w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg outline-primary bg-white'
                                placeholder='Enter your city or address'
                            />
                            <button
                                type='button'
                                onClick={fetchLocation}
                                disabled={locating}
                                title='Detect current location'
                                className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-full transition cursor-pointer disabled:opacity-50'
                            >
                                {locating ? (
                                    <svg className='w-5 h-5 animate-spin' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' strokeDasharray='31.4 31.4' strokeLinecap='round'/></svg>
                                ) : (
                                    <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='3'/><path d='M12 2v4m0 12v4m10-10h-4M6 12H2'/><circle cx='12' cy='12' r='8'/></svg>
                                )}
                            </button>
                        </div>
                        <p className='text-xs text-gray-400 mt-1'>Click the icon to auto-detect your location</p>
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dull transition cursor-pointer disabled:opacity-60'
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Profile
