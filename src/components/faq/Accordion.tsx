"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  question: string;
  answer: string;
}

export default function Accordion({ question, answer }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-shopay-gray-light rounded-2xl overflow-hidden mb-4 bg-shopay-gray-light/10 transition-all duration-300 shadow-sm hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-right transition-colors hover:text-shopay-purple group focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="font-bold text-shopay-black group-hover:text-shopay-purple text-lg transition-colors">
          {question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-shopay-purple text-white rotate-180' : 'bg-shopay-white text-shopay-black group-hover:bg-shopay-purple/10 group-hover:text-shopay-purple shadow-sm border border-shopay-gray-light'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 md:p-6 pt-0 text-shopay-black/80 leading-relaxed text-base border-t border-shopay-gray-light/50 mt-2">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}
