import HeroSection from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData, howItWorksData, statsData, testimonialsData } from "@/data/landing";
// import { CardSpotlight } from "@/components/ui/card-spotlight";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContainer,CardBody,CardItem } from "@/components/ui/3d-card";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";




export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection/>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((statsData,index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{statsData.value}</div>
                <div className="text-gray-600">{statsData.label}</div>
                </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to manage your finances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature,index)=>(
              <CardContainer key={index} containerClassName="p-6">
              <CardBody className="bg-white shadow-lg rounded-xl p-6 h-auto">
                <CardItem translateZ={50}>
                  {feature.icon}
                </CardItem>
                <CardItem translateZ={30}>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </CardItem>
                <CardItem translateZ={20}>
                  <p className="text-gray-600">{feature.description}</p>
                </CardItem>
              </CardBody>
            </CardContainer>
            
            ))}
          </div>
        </div>
         
      </section>




      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((step,index)=>(
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              
            ))}
          </div>
        </div>
         
      </section>

     
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 flex justify-center">
            <TypewriterEffectSmooth
              words={[
                { text: "What Our Users Say" }
              ]}
              
            />
            </h2>
            
            
          

    {/* Infinite Moving Cards Component */}
    <InfiniteMovingCards
      items={testimonialsData.map((testimonial) => ({
        name: testimonial.name,
        title: testimonial.role,
        quote: (
          <div className="p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-4">
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-300">{testimonial.role}</div>
              </div>
            </div>
            <p className="text-gray-100">{testimonial.quote}</p>
          </div>
        ),
      }))}
      direction="left"
      speed="normal"
    />
  </div>
</section>




      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
            {/* <div style={{ position: 'relative', height: '100px',color:"#FFF" }}> */}
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Take Control Of Your Finances?</h2>
          {/* <TextPressure
            text="Ready to Take Control Of Your Finances?"
            flex={true}
            alpha={false}
            stroke={true}
            width={true}
            weight={true}
            italic={true}
            textColor="#FFFFFF"
            strokeColor="#007BFF"
            minFontSize={36}
          /> */}
        
          
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join Thousands of users who are already managing their finances
            smarter with SpendYseli
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50
              animate-bounce">
                Start Free Trial
            </Button>
          </Link>
          
        </div>
         
      </section>


    </div>
  ) 
}
