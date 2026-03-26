import React from 'react';
import NavBar from '../components/layout/NavBar'; // Updated path
import Hero from '../components/Hero';
import AiTools from '../components/AiTools';
import Testimonial from '../components/Testimonial';
import Plan from '../components/Plan'; // Changed Page to Plan based on your component name
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="bg-white">
            <NavBar />
            <Hero />
            <AiTools />
            <Testimonial />
            <Plan />
            <Footer />
        </div>
    );
};

export default Home;