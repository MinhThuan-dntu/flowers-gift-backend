import React from 'react';

interface ZaloBubbleProps {
  phoneNumber?: string;
}

export const ZaloBubble: React.FC<ZaloBubbleProps> = ({ phoneNumber = '0987270812' }) => {
  const cleanPhone = phoneNumber.replace(/\s+/g, '');
  const zaloUrl = `https://zalo.me/${cleanPhone}`;
  const formattedPhone = cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');

  return (
    <aside
      aria-label="Hỗ trợ qua Zalo"
      className="fixed bottom-6 right-6 z-40 flex items-center group select-none print:hidden"
    >
      {/* Tooltip / Label Badge */}
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 bg-white/95 backdrop-blur-md text-stone-800 rounded-full shadow-lg border border-blue-100 group-hover:border-blue-300 transition-all duration-300 hover:scale-105"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium text-stone-600">Chat Zalo:</span>
        <span className="text-xs font-bold text-blue-600">{formattedPhone}</span>
      </a>

      {/* Floating Zalo Button */}
      <a
        href={zaloUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`Chat qua Zalo: ${formattedPhone}`}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#0068FF] to-[#0089FF] text-white shadow-xl shadow-blue-500/35 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Pulsing ring outer */}
        <span className="absolute -inset-1 rounded-full bg-[#0068FF]/30 animate-ping pointer-events-none" />
        <span className="absolute -inset-2.5 rounded-full border-2 border-blue-400/25 animate-pulse pointer-events-none" />

        {/* Zalo Vector Graphic */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <svg
            className="w-8 h-8 drop-shadow-xs"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* White speech bubble background */}
            <path
              d="M24 6C13.5 6 5 13.8 5 23.4C5 27.6 6.6 31.4 9.4 34.4L7 41.5L14.7 39.2C17.5 40.5 20.6 41.2 24 41.2C34.5 41.2 43 33.4 43 23.8C43 14.2 34.5 6 24 6Z"
              fill="white"
            />
            {/* Authentic Zalo blue typographic mark */}
            <text
              x="24"
              y="27.5"
              textAnchor="middle"
              fill="#0068FF"
              fontSize="12.5"
              fontWeight="900"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              letterSpacing="-0.5px"
            >
              Zalo
            </text>
          </svg>
        </div>

        {/* Online green indicator badge */}
        <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
      </a>
    </aside>
  );
};
