'use client';
import { useEffect } from 'react';

function colorFromSwatch(el) {
  if (!el) return null;
  const raw = el.style.background || el.style.backgroundColor || getComputedStyle(el).backgroundColor || '';
  const hex = raw.match(/#[0-9a-fA-F]{6}/);
  if (hex) return hex[0];
  const rgb = raw.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/);
  if (rgb) return '#' + [rgb[1], rgb[2], rgb[3]].map(v => Number(v).toString(16).padStart(2, '0')).join('');
  return null;
}

export function ConfiguratorBehaviorPatch() {
  useEffect(() => {
    const root = document.querySelector('.ns-configurator');
    if (!root) return;
    let raf = 0;

    const paint = () => {
      const textEl = root.querySelector('.ns-neon-text');
      const art = root.querySelector('.ns-neon-art');
      const canvas = root.querySelector('.ns-canvas');
      const ruler = root.querySelector('.ns-sign-ruler');
      if (!textEl || !art || !canvas) {
        raf = requestAnimationFrame(paint);
        return;
      }

      root.querySelectorAll('.ns-preview-studio-toolbar button').forEach(btn => {
        // btn.style.border = '1px solid rgba(95,245,199,.42)';
        btn.style.borderRadius = '10px';
        btn.style.boxShadow = btn.classList.contains('selected')
          ? '0 0 14px rgba(95,245,199,.14)'
          : 'inset 0 0 0 1px rgba(139,92,246,.12)';
      });

      // Ruler follows the rendered text and its physical size baseline.
      if (ruler) {
        const cr = canvas.getBoundingClientRect();
        const tr = textEl.getBoundingClientRect();
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        ruler.style.left = `${Math.max(8, tr.left - cr.left)}px`;
        ruler.style.top = `${Math.max(8, tr.top - cr.top - 30)}px`;
        ruler.style.width = `${Math.max(100, tr.width)}px`;
        ruler.style.height = `${Math.max(80, tr.height + 60)}px`;
      }

      // Custom Neon: selected WordPress colour becomes the actual neon core.
      const custom = root.querySelector('.ns-neon-text:not(.spectrum)');
      if (custom && !root.classList.contains('ns-mojo')) {
        const swatch = root.querySelector('.ns-color-grid button.selected');
        const color = colorFromSwatch(swatch);
        if (color) {
          custom.style.setProperty('color', color, 'important');
          custom.style.setProperty('-webkit-text-fill-color', color, 'important');
          custom.style.setProperty('text-shadow', `0 0 2px #fff, 0 0 5px #fff, 0 0 10px ${color}, 0 0 24px ${color}, 0 0 45px ${color}`, 'important');
          custom.style.setProperty('filter', 'none', 'important');
        }
      }

      // Mojo Mix: moving multicolour spectrum from the reference builder.
      const mojo = root.querySelector('.ns-neon-text.spectrum');
      if (mojo) {
        mojo.style.setProperty('color', 'transparent', 'important');
        mojo.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
        mojo.style.setProperty('background-image', 'linear-gradient(90deg,#ffde00,#ff7b00,#ff007b,#c400ff,#00d4ff,#ffde00)', 'important');
        mojo.style.setProperty('background-size', '300% 100%', 'important');
        mojo.style.setProperty('background-clip', 'text', 'important');
        mojo.style.setProperty('-webkit-background-clip', 'text', 'important');
        mojo.style.setProperty('animation', 'nsMojoSpectrum 3s linear infinite', 'important');
      }

      // Shapes are anchored to the rendered word, not to the canvas edges.
      const cr = canvas.getBoundingClientRect();
      const ar = art.getBoundingClientRect();
      const tr = textEl.getBoundingClientRect();
      const textLeftInArt = tr.left - ar.left;
      const textRightInArt = tr.right - ar.left;
      const textCenterYInArt = tr.top - ar.top + tr.height / 2;
      const shapes = [...root.querySelectorAll('.ns-art-shapes span')];
      shapes.forEach((span, index) => {
        const originalX = parseFloat(span.style.left || '0');
        const side = originalX < textLeftInArt ? 'left' : 'right';
        const sameSide = shapes.slice(0, index).filter(s => {
          const x = parseFloat(s.style.left || '0');
          return (x < textLeftInArt ? 'left' : 'right') === side;
        }).length;
        const x = side === 'left'
          ? textLeftInArt - 38 - sameSide * 54
          : textRightInArt + 38 + sameSide * 54;
        span.style.left = `${Math.max(8, Math.min(art.clientWidth - 8, x))}px`;
        span.style.top = `${Math.max(8, Math.min(art.clientHeight - 8, textCenterYInArt))}px`;
      });

      root.querySelectorAll('.ns-mojo .ns-art-shapes span').forEach((shape, index) => {
        shape.style.animationDelay = `-${(index * 0.22) % 2.4}s`;
      });

      raf = requestAnimationFrame(paint);
    };

    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
