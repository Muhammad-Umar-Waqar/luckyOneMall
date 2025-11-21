"use client"
import "../../styles/global/fonts.css"
import "../../styles/pages/Dashboard/freezer-cards-responsive.css"

export default function FreezerDeviceCard({
  refrigeratorAlert,
  deviceId,
  ambientTemperature,
  freezerTemperature,
  batteryLow = false,
  isSelected = false,
  onCardSelect,
}) {
  // Responsive card: use container with aspect ratio via padding-top trick

  const handleCardClick = () => {
    if (onCardSelect) {
      onCardSelect()
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`freezer-card-container ${
        isSelected ? "selected" : ""
      }`}
    >
      {/* Client's exact SVG card */}
      <div 
        className="relative w-full h-full"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 599 389"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          className="drop-shadow-md absolute inset-0 w-full h-full"
        >
          <g filter="url(#filter0_d_91_1411)">
            <path 
              d="M4 50C4 22.3858 26.3858 0 54 0H545C572.614 0 595 22.3858 595 50V159.524V305.626V331C595 358.614 572.614 381 545 381H337H248.5H54C26.3858 381 4 358.614 4 331V50Z" 
              fill={isSelected ? "url(#paint0_linear_91_1411)" : "#FFFFFF"}
            />
            <path 
              d="M54 0.5H545C572.338 0.5 594.5 22.6619 594.5 50V331C594.5 358.338 572.338 380.5 545 380.5H54C26.6619 380.5 4.5 358.338 4.5 331V50C4.5 22.6619 26.6619 0.5 54 0.5Z" 
              stroke="#717171" 
              strokeOpacity="0.42"
            />
          </g>
          <defs>
            <filter id="filter0_d_91_1411" x="0" y="0" width="599" height="389" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset dy="4"/>
              <feGaussianBlur stdDeviation="2"/>
              <feComposite in2="hardAlpha" operator="out"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_91_1411"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_91_1411" result="shape"/>
            </filter>
            <linearGradient id="paint0_linear_91_1411" x1="68.5" y1="168.817" x2="601.988" y2="436.237" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F64CF"/>
              <stop offset="1" stopColor="#45D2DE"/>
            </linearGradient>
          </defs>
        </svg>
        
        {/* Content overlay */}
        <div className="freezer-card-content">
          
          {/* Top Section: Device ID */}
          <div className="device-id-section">
            <div className="flex flex-col items-start">
              <span className={`device-id-label ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>Device ID</span>
              <h3 className={`device-id-value ${isSelected ? 'text-white' : 'text-[#1E293B]'}`}>{deviceId}</h3>
            </div>
            
            {/* Ambient Temperature Pill */}
            <div className={`ambient-pill ${
              isSelected 
                ? "bg-white/20 border border-white/30" 
                : "bg-white border border-gray-300"
            }`}>
              <span className={`${
                isSelected ? 'text-white' : 'text-gray-600'
              }`}>
                Ambient {ambientTemperature}°C
              </span>
            </div>
          </div>

              {/* Middle Section: Freezer Temperature */}
              <div className="freezer-temp-section">
                <img 
                  src="/freezer-icon.png" 
                  alt="Freezer" 
                  className="freezer-icon"
                />
                
                {/* Freezer Label and Temperature - Right of Icon */}
                <div className="freezer-temp-info">
                  <span className={`freezer-label ${isSelected ? 'text-white' : 'text-[#1E293B]'}`}>
                    Freezer
                  </span>
                  
                  {/* Temperature Display - Below Freezer Text */}
                  <span className={`freezer-temp-value ${isSelected ? 'text-white' : 'text-[#1E293B]'}`}>
                    {freezerTemperature}°C
                  </span>
                </div>
              </div>

              {/* Bottom Section: Battery Warning */}
              {batteryLow && refrigeratorAlert ? (
            // ✅ Show only Temperature Alert if both true
            <div className="battery-warning">
              <span className={`${isSelected ? 'text-white' : 'text-[#1E293B]'}`}>
                Temperature 
              </span>
              <img 
                src="/red-alert-icon.webp" 
                alt="Alert" 
                className="alert-icon"
              />
            </div>
          ) : (
            <>
              {batteryLow && (
                <div className="battery-warning">
                  <span className={`${isSelected ? 'text-white' : 'text-[#1E293B]'}`}>
                    Battery Low
                  </span>
                  <img 
                    src="/alert-icon.png" 
                    alt="Alert" 
                    className="alert-icon"
                  />
                </div>
              )}

              {refrigeratorAlert && (
                <div className="battery-warning">
                  <span className={`${isSelected ? 'text-white' : 'text-[#1E293B]'}`}>
                    Temperature 
                  </span>
                  <img 
                    src="/red-alert-icon.webp" 
                    alt="Alert" 
                    className="alert-icon"
                  />
                </div>
              )}
            </>
          )}



        </div>
      </div>
    </div>
  )
}
