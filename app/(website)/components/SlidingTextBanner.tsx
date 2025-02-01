"use client";

import React from "react";

interface SlidingTextBannerProps {
  texts: string[]; // ข้อความที่เลื่อน
  speed?: number; // ความเร็วในการเลื่อน (ค่าเริ่มต้นคือ 20)
  backgroundColor?: string; // สีพื้นหลัง
  textColor?: string; // สีข้อความ
}

const SlidingTextBanner: React.FC<SlidingTextBannerProps> = ({
  texts,
  speed = 20,
  backgroundColor = "black",
  textColor = "white",
}) => {
  return (
    <div
      className="relative overflow-hidden h-[40px] flex items-center"
      style={{ backgroundColor }}
    >
      <div
        className="absolute whitespace-nowrap animate-slide"
        style={{
          animationDuration: `${speed}s`,
          color: textColor,
          whiteSpace: "nowrap",
        }}
      >
        {texts.map((text, index) => (
          <span key={index} className="mx-8 font-bold">
            {text}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-slide {
          display: inline-block;
          animation: slide linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SlidingTextBanner;
