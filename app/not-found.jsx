import Link from "next/link";
import { Button } from "@/components/ui/button";
import FuzzyText from "@/components/ui/FuzzyText/FuzzyText";


export default function NotFound() {
    const hoverIntensity = 0.5; 
    const enableHover = true;
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <FuzzyText
      baseIntensity={0.2} 
      hoverIntensity={0.5} 
      enableHover={true}
      color="#000">
        404
    </FuzzyText>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist or has been
        moved.
      </p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}