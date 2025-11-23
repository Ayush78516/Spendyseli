"use client";
import Link from 'next/link'
import { Button } from './ui/button'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { FlipWords } from './ui/flip-words';
import { InteractiveHoverButton } from './magicui/interactive-hover-button';

const HeroSection = () => {
    const imageRef = useRef();

    useEffect(() => {
        const imageElement = imageRef.current;
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 100;

            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add("scrolled");
            } else {
                imageElement.classList.remove("scrolled");
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const words = ["track", "analyze", "organize"];

    return (
        <div className="pb-20 px-4">
            <div className="container mx-auto text-center">
                <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 font-bold bg-gradient-to-r from-red-500 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                    Your Finances with <br /> Smart Assistance 
                </h1>

                
                <div className="text-xl md:text-2xl font-semibold mt-4">
                    A next-gen budgeting platform that empowers you to
                    <span >
                    <FlipWords words={words} className="font-extrabold text-blue-500 text-xl md:text-2xl"/>
                    </span> <br/>
                    your spending using real-time AI intelligence.
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <Link href="/dashboard">
                        {/* <Button size="lg" variant="outline" className="px-8 mt-4 mr-2 shadow:lg">
                            Get Started
                        </Button> */}
                            <InteractiveHoverButton >Get Started</InteractiveHoverButton>
                        
                        
                    </Link>
                    <Link href="https://www.youtube.com/channel/UCwk8Ji_KtnPLm2rj5XkuUZQ/community?pvf=CAE%253D">
                        <Button size="lg" variant="outline" className="px-8">
                            Watch Demo
                        </Button>
                    </Link>
                </div>

                <div className="hero-image-wrapper">
                    <div ref={imageRef} className="hero-image">
                        <Image
                            src="/spend3.png"
                            width={1260}
                            height={720}
                            alt="Dashboard Preview"
                            className="rounded-lg shadow-2xl border mx-auto"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;
