/**
 * Guest Assistant & Live Support Chat Widget for Addis Eats
 * Loaded lazily during idle time via Next.js next/script (strategy="lazyOnload")
 */
(function() {
  if (typeof window === 'undefined') return;

  window.initRestaurantChat = function(config) {
    if (document.getElementById('addis-chat-widget-root')) return;

    const root = document.createElement('div');
    root.id = 'addis-chat-widget-root';
    root.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;font-family:inherit;';

    root.innerHTML = `
      <style>
        @media (max-width: 1023px) {
          #addis-chat-widget-root {
            bottom: 74px !important;
            right: 16px !important;
          }
        }
        .addis-chat-btn {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #3d7905;
          box-shadow: 0 8px 24px rgba(61, 121, 5, 0.35);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .addis-chat-btn:hover {
          transform: scale(1.05);
          background: #336604;
        }
        .addis-chat-box {
          display: none;
          position: absolute;
          bottom: 66px;
          right: 0;
          width: 320px;
          max-width: 90vw;
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 16px 40px rgba(8, 7, 15, 0.18);
          border: 1px solid #f0f0f0;
          overflow: hidden;
          flex-direction: column;
          animation: addisChatFade 0.25s ease forwards;
        }
        @keyframes addisChatFade {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .addis-chat-header {
          background: #08070f;
          color: #ffffff;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .addis-chat-body {
          padding: 16px;
          font-size: 13px;
          color: #4b5563;
          max-height: 260px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .addis-chat-msg {
          background: #f3f4f6;
          padding: 10px 12px;
          border-radius: 12px;
          line-height: 1.45;
        }
        .addis-chat-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .addis-chat-chip {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .addis-chat-chip:hover {
          background: #3d7905;
          border-color: #3d7905;
          color: white;
        }
      </style>
      <div id="addis-chat-box" class="addis-chat-box">
        <div class="addis-chat-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#22c55e;"></div>
            <strong style="font-size:13px;letter-spacing:0.5px;">Addis Eats Assistant</strong>
          </div>
          <button id="addis-chat-close" style="background:transparent;border:none;color:#9ca3af;font-size:18px;cursor:pointer;line-height:1;">&times;</button>
        </div>
        <div class="addis-chat-body">
          <div class="addis-chat-msg">
            ${(config && config.welcomeMessage) || "Welcome to Addis Eats! How can we help you today?"}
          </div>
          <div class="addis-chat-chips">
            <button class="addis-chat-chip" data-q="menu">View Menu</button>
            <button class="addis-chat-chip" data-q="track">Track Order</button>
            <button class="addis-chat-chip" data-q="contact">Opening Hours</button>
          </div>
          <div id="addis-chat-replies"></div>
        </div>
      </div>
      <button id="addis-chat-toggle" class="addis-chat-btn" aria-label="Open Guest Support Chat" title="Chat with Addis Eats">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    `;

    document.body.appendChild(root);

    const toggle = document.getElementById('addis-chat-toggle');
    const box = document.getElementById('addis-chat-box');
    const close = document.getElementById('addis-chat-close');
    const replies = document.getElementById('addis-chat-replies');

    let isOpen = false;
    function setOpen(open) {
      isOpen = open;
      box.style.display = isOpen ? 'flex' : 'none';
    }

    toggle.addEventListener('click', () => setOpen(!isOpen));
    close.addEventListener('click', () => setOpen(false));

    root.querySelectorAll('.addis-chat-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const q = e.target.getAttribute('data-q');
        let answer = '';
        if (q === 'menu') {
          answer = 'Our signature dishes include Authentic Kitfo, Special Tibs, and fasting platters. You can browse them on our <a href="/menu" style="color:#3d7905;font-weight:bold;text-decoration:underline;">Menu page</a>!';
        } else if (q === 'track') {
          answer = 'To monitor live kitchen preparation and courier progress, visit the <a href="/order-status" style="color:#3d7905;font-weight:bold;text-decoration:underline;">Live Tracking page</a>.';
        } else if (q === 'contact') {
          answer = 'We are open daily from 8:00 AM to 11:00 PM. Call us at +251 91 100 2233 for immediate table bookings.';
        }
        if (replies) {
          replies.innerHTML = `<div class="addis-chat-msg" style="background:#eef8e5;border:1px solid #d4ecc4;margin-top:6px;">${answer}</div>`;
        }
      });
    });
  };

  // Defer initialization until browser idle time to avoid blocking initial main thread
  function deferChatInit() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        window.initRestaurantChat({
          welcomeMessage: "Welcome to Addis Eats! Looking for delicious Ethiopian dishes or need help with your order?"
        });
      }, { timeout: 3500 });
    } else {
      setTimeout(() => {
        window.initRestaurantChat({
          welcomeMessage: "Welcome to Addis Eats! Looking for delicious Ethiopian dishes or need help with your order?"
        });
      }, 1500);
    }
  }

  if (document.readyState === 'complete') {
    deferChatInit();
  } else {
    window.addEventListener('load', deferChatInit, { once: true });
  }
})();
