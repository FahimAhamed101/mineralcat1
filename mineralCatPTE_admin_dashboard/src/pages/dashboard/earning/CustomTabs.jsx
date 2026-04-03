import React from "react"

const CustomTabs = ({ tabs, active, onTabClick }) => (
  <div className="w-full flex flex-col">
    <div className="flex gap-0.5 justify-start items-end">
      {tabs.map((tab, idx) => (
        <button
          key={tab.label}
          onClick={() => onTabClick(idx)}
          className={`
            flex items-center gap-1
            px-4 py-1.5
            text-[15px] font-semibold
            transition-all duration-200
            rounded-t-xl
            ${active === idx
              ? "text-[#CE001F] border-[#CE001F] border-b-transparent z-10 shadow-[0_0_0_2px_rgba(206,0,31,0.14)]"
              : "text-[#B0B0B0] border-[#B0B0B0] bg-transparent hover:text-[#CE001F]"
            }
            outline-none
          `}
          style={{
            minWidth: 110,
            boxShadow: active === idx ? "0 2px 10px 0 rgba(206,0,31,0.07)" : undefined,
            // Active tab borders on top, right, and left
            borderTop: active === idx ? "2px solid #CE001F" : undefined,
            borderRight: active === idx ? "2px solid #CE001F" : undefined,
            borderLeft: active === idx ? "2px solid #CE001F" : undefined,
            // No bottom border for active tab
            borderBottom: active === idx ? "none" : "2px solid #B0B0B0",
          }}
        >
          {tab.icon && <span className="inline-block text-lg">{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
      {/* Gradient line below tabs */}
      {/* <span
        className="absolute left-0 -bottom-px w-full h-[2px] bg-gradient-to-r from-[#CE001F] to-[#5D50FE] opacity-70 pointer-events-none"
      /> */}
    </div>
  </div>
)

export default CustomTabs;
