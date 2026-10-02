// Global Quantum Directory Aura Screen Card - Exact UI Pattern
export function showAuraHelpModal() {
  console.log('GQD Aura Screen Card called');
  
  // Remove existing modal if present
  const existingModal = document.getElementById('aura-help-modal-gqd-card');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal container using exact GQD backdrop pattern
  const modalContainer = document.createElement('div');
  modalContainer.id = 'aura-help-modal-gqd-card';
  modalContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(4px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: fadeIn 0.2s ease-out;
  `;
  
  // Add minimal CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Create modal content matching GQD card pattern exactly
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    position: relative;
    width: 380px;
    max-height: 80vh;
    border-radius: 16px;
    border: 1px solid rgba(34, 211, 248, 0.4);
    background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
    padding: 1px;
    box-shadow: 0 0 25px rgba(34, 211, 248, 0.7);
    overflow: hidden;
  `;
  
  modalContent.innerHTML = `
    <!-- GQD Purple-Blue Blur Effects -->
    <div style="
      position: absolute;
      left: -20px;
      top: -20px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(to bottom right, rgba(34, 211, 248, 0.4), rgba(217, 70, 239, 0.3), rgba(99, 102, 241, 0.3));
      filter: blur(24px);
      pointer-events: none;
    "></div>
    <div style="
      position: absolute;
      right: -20px;
      bottom: -40px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(to top right, rgba(99, 102, 241, 0.3), rgba(34, 211, 248, 0.3), rgba(217, 70, 239, 0.3));
      filter: blur(24px);
      pointer-events: none;
    "></div>
    
    <!-- GQD Dark Blue Center Background -->
    <div style="
      position: absolute;
      inset: 1px;
      border-radius: 15px;
      background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
      z-index: 1;
    "></div>
    
    <!-- GQD Card Header -->
    <div style="
      padding: 16px 20px;
      border-bottom: 1px solid rgba(71, 85, 105, 0.3);
      background: rgba(15, 23, 42, 0.9);
      position: relative;
      z-index: 2;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, rgba(34, 211, 248, 0.8), rgba(217, 70, 239, 0.6));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            box-shadow: 0 0 12px rgba(34, 211, 248, 0.4);
          ">✨</div>
          <div>
            <h3 style="
              color: rgb(248, 250, 252);
              margin: 0;
              font-size: 14px;
              font-weight: 600;
              letter-spacing: -0.025em;
            ">Aura Levels</h3>
            <p style="
              color: rgba(148, 163, 184, 0.7);
              margin: 0;
              font-size: 11px;
              font-weight: 400;
            ">Your engagement score</p>
          </div>
        </div>
        <button
          id="close-modal-btn"
          style="
            border-radius: 50%;
            border: 1px solid rgba(71, 85, 105, 0.7);
            background: rgba(15, 23, 42, 0.8);
            padding: 6px;
            font-size: 10px;
            font-weight: 500;
            color: rgba(203, 213, 225, 0.7);
            cursor: pointer;
            transition: all 0.2s ease;
          "
        >✕</button>
      </div>
    </div>
    
    <!-- GQD Card Content -->
    <div style="
      padding: 16px 20px;
      background: rgba(15, 23, 42, 0.95);
      overflow-y: auto;
      max-height: 60vh;
      border-radius: 15px;
      margin: 1px;
      position: relative;
      z-index: 2;
    ">
      <!-- GQD Card Items -->
      <div style="display: grid; gap: 6px;">
        <!-- 0% Aura Card -->
        <div style="
          border-radius: 16px;
          border: 1px solid rgba(71, 85, 105, 0.7);
          background: rgba(15, 23, 42, 0.8);
          padding: 12px 16px;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='rgba(34, 211, 248, 0.7)'; this.style.background='rgba(15, 23, 42, 0.95)'" 
           onmouseout="this.style.borderColor='rgba(71, 85, 105, 0.7)'; this.style.background='rgba(15, 23, 42, 0.8)'">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="
                display: inline-flex;
                height: 20px;
                min-width: 28px;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(71, 85, 105, 0.8);
                font-size: 10px;
                font-weight: 600;
                color: rgb(248, 250, 252);
              ">0%</div>
              <div style="min-width: 0;">
                <p style="
                  margin: 0;
                  font-weight: 500;
                  color: rgb(226, 232, 240);
                  font-size: 11px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">No Aura</p>
                <p style="
                  margin: 0;
                  color: rgba(148, 163, 184, 0.7);
                  font-size: 10px;
                  margin-top: 2px;
                ">New user status</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="
                  color: rgba(107, 114, 128, 0.9);
                  font-size: 10px;
                  font-weight: 700;
                ">0% Aura</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 50% Aura Card -->
        <div style="
          border-radius: 16px;
          border: 1px solid rgba(71, 85, 105, 0.7);
          background: rgba(15, 23, 42, 0.8);
          padding: 12px 16px;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='rgba(34, 211, 248, 0.7)'; this.style.background='rgba(15, 23, 42, 0.95)'" 
           onmouseout="this.style.borderColor='rgba(71, 85, 105, 0.7)'; this.style.background='rgba(15, 23, 42, 0.8)'">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="
                display: inline-flex;
                height: 20px;
                min-width: 28px;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(251, 146, 60, 0.8);
                font-size: 10px;
                font-weight: 600;
                color: rgb(248, 250, 252);
              ">50%</div>
              <div style="min-width: 0;">
                <p style="
                  margin: 0;
                  font-weight: 500;
                  color: rgb(226, 232, 240);
                  font-size: 11px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">Rising Star</p>
                <p style="
                  margin: 0;
                  color: rgba(148, 163, 184, 0.7);
                  font-size: 10px;
                  margin-top: 2px;
                ">5 engagements</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="
                  color: rgba(251, 146, 60, 0.9);
                  font-size: 10px;
                  font-weight: 700;
                ">50% Aura</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 100% Aura Card -->
        <div style="
          border-radius: 16px;
          border: 1px solid rgba(71, 85, 105, 0.7);
          background: rgba(15, 23, 42, 0.8);
          padding: 12px 16px;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='rgba(34, 211, 248, 0.7)'; this.style.background='rgba(15, 23, 42, 0.95)'" 
           onmouseout="this.style.borderColor='rgba(71, 85, 105, 0.7)'; this.style.background='rgba(15, 23, 42, 0.8)'">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="
                display: inline-flex;
                height: 20px;
                min-width: 28px;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(251, 191, 36, 0.8);
                font-size: 10px;
                font-weight: 600;
                color: rgb(248, 250, 252);
              ">100%</div>
              <div style="min-width: 0;">
                <p style="
                  margin: 0;
                  font-weight: 500;
                  color: rgb(226, 232, 240);
                  font-size: 11px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">Active User</p>
                <p style="
                  margin: 0;
                  color: rgba(148, 163, 184, 0.7);
                  font-size: 10px;
                  margin-top: 2px;
                ">100 engagements</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="
                  color: rgba(251, 191, 36, 0.9);
                  font-size: 10px;
                  font-weight: 700;
                ">100% Aura</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 1000% Aura Card -->
        <div style="
          border-radius: 16px;
          border: 1px solid rgba(71, 85, 105, 0.7);
          background: rgba(15, 23, 42, 0.8);
          padding: 12px 16px;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='rgba(34, 211, 248, 0.7)'; this.style.background='rgba(15, 23, 42, 0.95)'" 
           onmouseout="this.style.borderColor='rgba(71, 85, 105, 0.7)'; this.style.background='rgba(15, 23, 42, 0.8)'">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="
                display: inline-flex;
                height: 20px;
                min-width: 28px;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(34, 197, 94, 0.8);
                font-size: 10px;
                font-weight: 600;
                color: rgb(248, 250, 252);
              ">1K%</div>
              <div style="min-width: 0;">
                <p style="
                  margin: 0;
                  font-weight: 500;
                  color: rgb(226, 232, 240);
                  font-size: 11px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">Influencer</p>
                <p style="
                  margin: 0;
                  color: rgba(148, 163, 184, 0.7);
                  font-size: 10px;
                  margin-top: 2px;
                ">1K engagements</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="
                  color: rgba(34, 197, 94, 0.9);
                  font-size: 10px;
                  font-weight: 700;
                ">1K% Aura</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 10500% Aura Card -->
        <div style="
          border-radius: 16px;
          border: 1px solid rgba(71, 85, 105, 0.7);
          background: rgba(15, 23, 42, 0.8);
          padding: 12px 16px;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='rgba(34, 211, 248, 0.7)'; this.style.background='rgba(15, 23, 42, 0.95)'" 
           onmouseout="this.style.borderColor='rgba(71, 85, 105, 0.7)'; this.style.background='rgba(15, 23, 42, 0.8)'">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="
                display: inline-flex;
                height: 20px;
                min-width: 28px;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.8);
                font-size: 9px;
                font-weight: 600;
                color: rgb(248, 250, 252);
              ">10.5K</div>
              <div style="min-width: 0;">
                <p style="
                  margin: 0;
                  font-weight: 500;
                  color: rgb(226, 232, 240);
                  font-size: 11px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">Expert</p>
                <p style="
                  margin: 0;
                  color: rgba(148, 163, 184, 0.7);
                  font-size: 10px;
                  margin-top: 2px;
                ">10.5K engagements</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="
                  color: rgba(239, 68, 68, 0.9);
                  font-size: 10px;
                  font-weight: 700;
                ">10.5K% Aura</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 999999% Aura Card -->
        <div style="
          border-radius: 16px;
          border: 1px solid rgba(71, 85, 105, 0.7);
          background: rgba(15, 23, 42, 0.8);
          padding: 12px 16px;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='rgba(34, 211, 248, 0.7)'; this.style.background='rgba(15, 23, 42, 0.95)'" 
           onmouseout="this.style.borderColor='rgba(71, 85, 105, 0.7)'; this.style.background='rgba(15, 23, 42, 0.8)'">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
              <div style="
                display: inline-flex;
                height: 20px;
                min-width: 28px;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(127, 29, 29, 0.8);
                font-size: 9px;
                font-weight: 600;
                color: rgb(248, 250, 252);
              ">∞</div>
              <div style="min-width: 0;">
                <p style="
                  margin: 0;
                  font-weight: 500;
                  color: rgb(226, 232, 240);
                  font-size: 11px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                ">Legendary</p>
                <p style="
                  margin: 0;
                  color: rgba(148, 163, 184, 0.7);
                  font-size: 10px;
                  margin-top: 2px;
                ">999K engagements</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="
                  color: rgba(127, 29, 29, 0.9);
                  font-size: 10px;
                  font-weight: 700;
                ">∞ Aura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tips Section -->
      <div style="
        margin-top: 16px;
        padding: 12px 16px;
        border-radius: 12px;
        background: rgba(34, 211, 248, 0.05);
        border: 1px solid rgba(34, 211, 248, 0.2);
      ">
        <div style="color: rgba(34, 211, 248, 0.8); font-size: 11px; font-weight: 600; margin-bottom: 4px;">
          🚀 Boost Your Aura
        </div>
        <div style="color: rgba(148, 163, 184, 0.7); font-size: 10px; line-height: 1.4;">
          Post regularly, engage with others, build connections, stay active daily.
        </div>
      </div>
    </div>
  `;
  
  // Add click handlers
  const closeBtn = modalContent.querySelector('#close-modal-btn') as HTMLButtonElement;
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      console.log('GQD card close button clicked');
      document.body.removeChild(modalContainer);
      document.head.removeChild(style);
    });
    
    // Add hover effect
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.borderColor = 'rgba(34, 211, 248, 0.7)';
      closeBtn.style.color = 'rgba(34, 211, 248, 0.9)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.borderColor = 'rgba(71, 85, 105, 0.7)';
      closeBtn.style.color = 'rgba(203, 213, 225, 0.7)';
    });
  }
  
  // Add backdrop click to close
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      document.body.removeChild(modalContainer);
      document.head.removeChild(style);
    }
  });
  
  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);
  
  console.log('GQD Aura Screen Card added to DOM');
}
