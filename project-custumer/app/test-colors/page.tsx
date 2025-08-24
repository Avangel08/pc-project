import { ColorDisplayDemo } from '@/components/ui/color-display';

export default function TestColorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1A1A2E] text-white pt-24 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Test Color Display</h1>
        <ColorDisplayDemo />
      </div>
    </div>
  );
} 