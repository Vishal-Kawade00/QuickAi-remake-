import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
    return (
        <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-16 w-full text-gray-500 mt-20 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-200 pb-10">
                <div className="md:max-w-96">
                    <img width="157" height="40" src={assets.logo} alt="logo" className="mb-6" />
                    <p className="text-sm leading-relaxed text-gray-500">
                        Experience the power of AI with QuickAi. Transform your content creation with our suite of premium AI tools. Write articles, design images, and turn YouTube videos into massive study guides instantly.
                    </p>
                </div>
                
                <div className="flex-1 flex flex-wrap md:justify-end gap-16 md:gap-24">
                    <div>
                        <h2 className="font-bold mb-6 text-gray-800 uppercase tracking-wider text-xs">Company</h2>
                        <ul className="text-sm space-y-4 font-medium">
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Home</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">About us</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Contact us</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy policy</a></li>
                        </ul>
                    </div>
                    <div className="max-w-xs">
                        <h2 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-xs">Subscribe to our newsletter</h2>
                        <div className="text-sm space-y-4">
                            <p className="leading-relaxed">The latest news, AI updates, and resources, sent to your inbox weekly.</p>
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    className="border border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none w-full h-10 rounded-lg px-3 transition-all" 
                                    type="email" 
                                    placeholder="Enter your email"
                                />
                                <button className="bg-blue-600 hover:bg-blue-700 px-4 h-10 text-white rounded-lg font-medium transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="py-6 text-center text-sm font-medium">
                Copyright 2026 © <a href="https://www.rawpixel.com/image/9182675/middle-finger-hand-isolated-image#eyJrZXlzIjoibWlkZGxlIGZpbmdlciIsInNvcnRlZEtleXMiOiJmaW5nZXIgbWlkZGxlIn0=" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">Bakchodi Team Limited</a>. All Rights Reserved.
            </p>
        </footer>
    );
};

export default Footer;