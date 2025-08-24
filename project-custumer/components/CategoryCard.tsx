import Image from 'next/image';
import Link from 'next/link';
import { Keyboard, MousePointer, Sparkles, Cpu, Armchair, Table, Headphones, Monitor, DivideIcon as LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  image: string;
  href: string;
  icon: string;
}

// Custom Rectangle Icon for 'Lót chuột'
function RectanglePadIcon({ size = 24, color = "#00FFFF" }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="2"
        y="2"
        width="24"
        height="12"
        rx="4"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  );
}

export default function CategoryCard({ title, image, href, icon }: CategoryCardProps) {
  const icons: Record<string, typeof LucideIcon> = {
    Keyboard,
    MousePointer,
    Sparkles,
    Cpu,
    Armchair,
    Table,
    Headphones,
    Monitor,
  };
  
  // Nếu là 'RectangleHorizontal' thì dùng icon custom
  const isRectanglePad = icon === 'RectangleHorizontal';
  const IconComponent = icons[icon] || Cpu;
  
  return (
    <Link href={href} className="group">
      <div className="relative h-36 rounded-lg overflow-hidden border border-[#2A2A40] bg-[#161625]">
        <div className="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-110">
          <Image 
            src={image}
            alt={title}
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D17]/90 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 transition-transform duration-300 group-hover:translate-y-[-5px]">
          <div className="w-12 h-12 flex items-center justify-center bg-[#1A1A2E] rounded-full mb-3 text-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.3)] group-hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-shadow duration-300">
            {isRectanglePad ? <RectanglePadIcon size={28} color="#00FFFF" /> : <IconComponent size={24} />}
          </div>
          <h3 className="text-center font-medium">{title}</h3>
        </div>
      </div>
    </Link>
  );
}