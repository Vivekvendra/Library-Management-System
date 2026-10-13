export function BookIconSvg({ className = 'w-8 h-8' }) {
  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left cover & page stack */}
      <path
        d="M4 8.5C4 6.8 5.4 5.5 7.1 5.7C13.2 6.3 18.8 8.2 22.8 11.2V34.2C18.8 31.4 13.2 29.7 7.1 29.1C5.4 28.9 4 27.5 4 25.8V8.5Z"
        fill="#7C4D25"
      />
      <path
        d="M7 6.2C12.8 6.8 18.2 8.5 22.2 11.4V32.4C18.2 29.6 12.8 28 7 27.4V6.2Z"
        fill="#8E5B30"
        stroke="#FBF7F2"
        strokeWidth="1.2"
      />
      {/* Right cover & page stack */}
      <path
        d="M44 8.5C44 6.8 42.6 5.5 40.9 5.7C34.8 6.3 29.2 8.2 25.2 11.2V34.2C29.2 31.4 34.8 29.7 40.9 29.1C42.6 28.9 44 27.5 44 25.8V8.5Z"
        fill="#7C4D25"
      />
      <path
        d="M41 6.2C35.2 6.8 29.8 8.5 25.8 11.4V32.4C29.8 29.6 35.2 28 41 27.4V6.2Z"
        fill="#8E5B30"
        stroke="#FBF7F2"
        strokeWidth="1.2"
      />
      {/* Bottom open book curve */}
      <path
        d="M4 29.5C11.5 29.8 18.5 31.6 24 35.5C29.5 31.6 36.5 29.8 44 29.5"
        stroke="#6B401E"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Center spine highlight */}
      <line
        x1="24"
        y1="10.5"
        x2="24"
        y2="35"
        stroke="#FBF7F2"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LibraXLogo({ size = 'md', lightText = false }) {
  const sizes = {
    sm: {
      icon: 'w-7 h-6',
      text: 'text-xl',
      gap: 'gap-2',
    },
    md: {
      icon: 'w-9 h-8',
      text: 'text-[26px]',
      gap: 'gap-2.5',
    },
    lg: {
      icon: 'w-11 h-9',
      text: 'text-[32px]',
      gap: 'gap-3',
    },
  };

  const current = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center ${current.gap} select-none`}>
      <BookIconSvg className={current.icon} />
      <span
        className={`font-serif-display font-bold tracking-tight leading-none ${current.text} ${
          lightText ? 'text-[#FBF7F2]' : 'text-[#22150E]'
        }`}
      >
        Libra<span className="text-[#855228]">X</span>
      </span>
    </div>
  );
}

export function BotanicalCornerSvg({ className = '' }) {
  return (
    <svg
      viewBox="0 0 180 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main curved stem */}
      <path
        d="M174 202C149 165 129 116 121 48"
        stroke="#D5BDA6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M148 164C157 125 166 95 169 52"
        stroke="#D5BDA6"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Top left sweeping leaf */}
      <path
        d="M123 64C96 63 68 48 53 26C82 26 111 38 123 64Z"
        fill="#DEC8B3"
        fillOpacity="0.78"
      />
      {/* Top center upright leaf */}
      <path
        d="M122 54C116 32 124 12 135 2C142 19 136 42 122 54Z"
        fill="#DEC8B3"
        fillOpacity="0.82"
      />
      {/* Upper right broad leaf */}
      <path
        d="M145 104C142 74 156 49 175 34C176 64 166 91 145 104Z"
        fill="#DEC8B3"
        fillOpacity="0.75"
      />
      {/* Middle left leaf */}
      <path
        d="M135 124C110 120 88 105 76 86C101 87 124 100 135 124Z"
        fill="#DEC8B3"
        fillOpacity="0.75"
      />
      {/* Lower left smaller leaf */}
      <path
        d="M150 156C129 154 111 144 101 131C120 131 139 140 150 156Z"
        fill="#DEC8B3"
        fillOpacity="0.7"
      />
      {/* Lower right small leaf */}
      <path
        d="M156 142C157 125 165 113 176 105C175 121 168 135 156 142Z"
        fill="#DEC8B3"
        fillOpacity="0.68"
      />
    </svg>
  );
}
