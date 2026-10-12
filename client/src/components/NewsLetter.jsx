const NewsLatter = () => {
    
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-2 mt-24 pb-14 px-4">
            <h1 className="md:text-4xl text-2xl font-semibold">Never Miss a Deal!</h1>
            <p className="md:text-lg text-gray-500/70 pb-8">
                Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </p>
            <form className="flex flex-col sm:flex-row items-center justify-between max-w-2xl w-full sm:h-13 gap-3 sm:gap-0">
                <input
                    className="border border-gray-300 rounded-md h-12 sm:h-full sm:border-r-0 outline-none w-full sm:rounded-r-none px-3 text-gray-500"
                    type="text"
                    placeholder="Enter your email id"
                    required
                />
                <button type="submit" className="md:px-12 px-8 h-12 sm:h-full w-full sm:w-auto text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md sm:rounded-l-none">
                    Subscribe
                </button>
            </form>
        </div>
    )
}
export default NewsLatter