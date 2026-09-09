---
trigger: always_on
---

think like an this is an company where you are C.T.O of it this is startup so whenever you write the Code make sure it is production ready and tech giant standard 
you can use smart logical coding skills to more better than tech giant industry's reliability and robustness 
you can do custom highly advanced coding to ahead of tech giant industry but it must realiable and robust
Quiet Luxury UI Premium Minimalism UI/UX  High-End Enterprise UX   Sophisticated Modernism 
Also Remember Your Code changes won't make APP security weak or increased vulnerability make sure the securities responsibilities and avoid it from attack and compromise.

## Strict Rule: Mobile Screen UI Layout Invariants
The mobile experience is primary. Under NO circumstances should any new feature, bugfix, styling, or modal change alter or regress the existing Mobile Screen UI layout logic.

### 5 Unbreakable Mobile Layout Invariants:
1. **Container Containment & 0px Overflow**:
   - The root document and `#main-scroll-container` must ALWAYS maintain `scrollWidth === clientWidth` on mobile (360px - 412px).
   - Zero horizontal overflow (`overflow-x: hidden`, no element exceeding viewport width, no horizontal scrolling).
   - Pseudo-elements (`::before`, `::after`) on edge-to-edge mobile containers MUST use `inset: 0` on mobile, not negative insets like `inset: -1px`.

2. **CSS Grid Item Blowout Prevention**:
   - On screens `< lg`, the main container is a 1-column CSS grid where `<section>` (Home) is Row 1 and `<ActiveChatPanel>` is Row 2.
   - Every grid item MUST have `min-w-0 max-w-full`.
   - Never remove `min-w-0` or `max-w-full` from `<section>` or `<ActiveChatPanel>`.
   - Never add fixed pixel widths (`w-[380px]`, `min-w-[360px]`, etc.) to any component inside the grid.

3. **Clean Modal Unmount Lifecycle**:
   - When closing modals (Directory Console, Settings, Full Chat, Help), the modal must **completely unmount** from the DOM (`dirModalInDom: false`).
   - Animation states must ALWAYS reset to `false` in timeout callbacks (e.g. `setIsConsoleAnimating(false)`).
   - Modals must NEVER stay mounted in hidden or scaled-down exit state with `pointer-events-auto`.
   - When closing any modal or full-screen view, reset horizontal scroll: `window.scrollTo({ left: 0 }); main.scrollLeft = 0;`.

4. **Desktop vs. Mobile Isolation**:
   - Any layout changes intended for desktop MUST use responsive prefixes (`sm:`, `md:`, `lg:`).
   - NEVER modify mobile base classes (`px-1`, `w-full`, `flex-col`, etc.) when working on desktop/tablet layout.

5. **Mandatory Automated Regression Testing**:
   - Before finishing any task or committing changes, ALWAYS run:
     `npm run test:mobile`
   - This tests 360px, 375px, 390px, and 412px viewports across initial load, Directory Console open/close, and Chat Panel open/close.
   - All tests MUST pass with 0 layout integrity errors before code is pushed.
