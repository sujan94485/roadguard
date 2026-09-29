import React, { useEffect, useRef } from 'react';

interface HazardNode {
  id: string;
  x: number; // Normalized -1 to 1 in 3D grid space
  z: number; // Normalized -1 to 1 in 3D grid space
  type: 'critical' | 'high' | 'medium' | 'resolved';
  label: string;
  score: number;
  pulseOffset: number;
}

interface TransitPacket {
  segmentIndex: number;
  progress: number; // 0 to 1
  speed: number;
  reverse: boolean;
}

interface RoadSegment {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
  isArterial: boolean;
}

export const CivicNetworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse tilt offsets (normalized)
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });
  const isVisible = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Define Civic Grid Roads (Isometric 3D network: Arterials and Feeders)
    const roadSegments: RoadSegment[] = [
      // Arterials (Primary Corridors)
      { x1: -0.85, z1: -0.7, x2: 0.85, z2: -0.7, isArterial: true },
      { x1: -0.9, z1: 0.0, x2: 0.9, z2: 0.0, isArterial: true },
      { x1: -0.85, z1: 0.65, x2: 0.85, z2: 0.65, isArterial: true },
      { x1: -0.5, z1: -0.85, x2: -0.5, z2: 0.85, isArterial: true },
      { x1: 0.0, z1: -0.9, x2: 0.0, z2: 0.9, isArterial: true },
      { x1: 0.5, z1: -0.85, x2: 0.5, z2: 0.85, isArterial: true },

      // Diagonal Express Connectors
      { x1: -0.5, z1: -0.7, x2: 0.0, z2: 0.0, isArterial: false },
      { x1: 0.0, z1: 0.0, x2: 0.5, z2: 0.65, isArterial: false },
      { x1: -0.5, z1: 0.0, x2: 0.0, z2: 0.65, isArterial: false },
      { x1: 0.0, z1: -0.7, x2: 0.5, z2: 0.0, isArterial: false },

      // Secondary Cross streets
      { x1: -0.8, z1: -0.35, x2: -0.2, z2: -0.35, isArterial: false },
      { x1: 0.2, z1: -0.35, x2: 0.8, z2: -0.35, isArterial: false },
      { x1: -0.8, z1: 0.35, x2: -0.2, z2: 0.35, isArterial: false },
      { x1: 0.2, z1: 0.35, x2: 0.8, z2: 0.35, isArterial: false },
      { x1: -0.25, z1: -0.8, x2: -0.25, z2: 0.8, isArterial: false },
      { x1: 0.25, z1: -0.8, x2: 0.25, z2: 0.8, isArterial: false }
    ];

    // Hazard Nodes positioned at Key Intersections
    const hazardNodes: HazardNode[] = [
      {
        id: 'node-crit-1',
        x: 0.0,
        z: 0.0,
        type: 'critical',
        label: 'RG-2026-0014 // HARDINGE CIRCLE (SIGNAL FAULT)',
        score: 94,
        pulseOffset: 0
      },
      {
        id: 'node-high-1',
        x: -0.5,
        z: -0.7,
        type: 'high',
        label: 'RG-2026-0012 // SJCE GATE (SEVERE POTHOLE)',
        score: 80,
        pulseOffset: 0.25
      },
      {
        id: 'node-med-1',
        x: 0.5,
        z: -0.35,
        type: 'medium',
        label: 'RG-2026-0008 // INFANTRY RD (LIGHTING FAILURE)',
        score: 58,
        pulseOffset: 0.5
      },
      {
        id: 'node-res-1',
        x: -0.5,
        z: 0.65,
        type: 'resolved',
        label: 'RG-2026-0003 // SAYYAJI RAO (ASPHALT PATCHED)',
        score: 22,
        pulseOffset: 0.75
      },
      {
        id: 'node-high-2',
        x: 0.5,
        z: 0.65,
        type: 'high',
        label: 'RG-2026-0018 // SUBURBAN STAND (WATERLOGGING)',
        score: 76,
        pulseOffset: 0.4
      },
      {
        id: 'node-res-2',
        x: 0.25,
        z: -0.7,
        type: 'resolved',
        label: 'RG-2026-0001 // KALIDASA CORRIDOR (INSPECTED)',
        score: 18,
        pulseOffset: 0.9
      }
    ];

    // Light Packets traveling along roads (calm, purposeful velocity)
    const packets: TransitPacket[] = [
      { segmentIndex: 0, progress: 0.1, speed: 0.0024, reverse: false },
      { segmentIndex: 1, progress: 0.5, speed: 0.0028, reverse: true },
      { segmentIndex: 2, progress: 0.8, speed: 0.0022, reverse: false },
      { segmentIndex: 3, progress: 0.3, speed: 0.0026, reverse: false },
      { segmentIndex: 4, progress: 0.7, speed: 0.0023, reverse: true },
      { segmentIndex: 5, progress: 0.4, speed: 0.0025, reverse: false },
      { segmentIndex: 6, progress: 0.2, speed: 0.003, reverse: false },
      { segmentIndex: 7, progress: 0.6, speed: 0.0027, reverse: true }
    ];

    let radarAngle = 0;
    let animationFrameId: number;

    // Handle Resize
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse Tracking for subtle parallax tilt
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetTilt.current = { x: x * 0.07, y: y * 0.05 };
    };

    const handleMouseLeave = () => {
      targetTilt.current = { x: 0, y: 0 };
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('mousemove', handleMouseMove);
      containerEl.addEventListener('mouseleave', handleMouseLeave);
    }

    // 3D Perspective Projection Function
    const project = (
      x: number,
      y: number,
      z: number,
      width: number,
      height: number
    ): [number, number, number] => {
      // Camera parameters
      const tiltX = currentTilt.current.x;
      const tiltY = currentTilt.current.y;

      // Base isometric pitch: 56 degrees, rotated 26 degrees
      const cosA = Math.cos(0.46 + tiltX);
      const sinA = Math.sin(0.46 + tiltX);
      const pitch = 0.96 + tiltY;

      // Rotate in horizontal plane
      const rx = x * cosA - z * sinA;
      const rz = x * sinA + z * cosA;

      // Perspective depth scaling (enhanced depth gradient)
      const distance = 2.45;
      const depth = distance + rz * 0.6;
      const scale = Math.min(width, height) * 0.74 / depth;

      const screenX = width / 2 + rx * scale;
      const screenY = height * 0.50 + (rz * pitch * 0.44 - y * 0.8) * scale;

      return [screenX, screenY, scale];
    };

    // Main Render Loop
    const render = () => {
      if (!isVisible.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 800;
      const height = rect?.height || 400;

      // Smooth camera damping
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.05;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Subtle Fading Perspective Ground Grid
      const gridCount = 8;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';

      for (let i = -gridCount; i <= gridCount; i++) {
        const t = i / gridCount;
        const [x1, y1] = project(t, 0, -1, width, height);
        const [x2, y2] = project(t, 0, 1, width, height);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const [zx1, zy1] = project(-1, 0, t, width, height);
        const [zx2, zy2] = project(1, 0, t, width, height);
        ctx.beginPath();
        ctx.moveTo(zx1, zy1);
        ctx.lineTo(zx2, zy2);
        ctx.stroke();
      }

      // Atmospheric Horizon Fog (Gives spatial depth fading into distance)
      const horizonFog = ctx.createLinearGradient(0, 0, 0, height * 0.4);
      horizonFog.addColorStop(0, 'rgba(7, 10, 18, 0.9)');
      horizonFog.addColorStop(0.5, 'rgba(7, 10, 18, 0.4)');
      horizonFog.addColorStop(1, 'rgba(7, 10, 18, 0)');
      ctx.fillStyle = horizonFog;
      ctx.fillRect(0, 0, width, height * 0.4);

      // 2. Draw Radar / Lidar Scanning Sweep Beam
      if (!prefersReducedMotion) {
        radarAngle += 0.007; // Smooth, slow telemetry sweep
      }
      const [hubX, hubY] = project(0, 0, 0, width, height);
      const sweepRadius = Math.min(width, height) * 0.44;

      ctx.save();
      const sweepGrad = ctx.createRadialGradient(hubX, hubY, 0, hubX, hubY, sweepRadius);
      sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      sweepGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.03)');
      sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(hubX, hubY);
      ctx.arc(hubX, hubY, sweepRadius, radarAngle - 0.35, radarAngle);
      ctx.closePath();
      ctx.fill();

      // Sweep leading edge line
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hubX, hubY);
      ctx.lineTo(
        hubX + Math.cos(radarAngle) * sweepRadius,
        hubY + Math.sin(radarAngle) * sweepRadius
      );
      ctx.stroke();
      ctx.restore();

      // 3. Draw Road Corridors
      roadSegments.forEach(seg => {
        const [p1x, p1y, scale1] = project(seg.x1, 0, seg.z1, width, height);
        const [p2x, p2y, scale2] = project(seg.x2, 0, seg.z2, width, height);
        const avgScale = (scale1 + scale2) / 2;

        // Road Bed Base Glow (depth-attenuated)
        ctx.strokeStyle = seg.isArterial
          ? 'rgba(14, 165, 233, 0.18)'
          : 'rgba(30, 41, 59, 0.45)';
        ctx.lineWidth = seg.isArterial ? Math.max(2.5, 4.2 * (avgScale / 380)) : 2;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();

        // Road Center Track
        ctx.strokeStyle = seg.isArterial
          ? 'rgba(56, 189, 248, 0.55)'
          : 'rgba(71, 85, 105, 0.45)';
        ctx.lineWidth = seg.isArterial ? 1.4 : 0.8;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
      });

      // 4. Draw Animated Telemetry Transit Packets
      if (!prefersReducedMotion) {
        packets.forEach(packet => {
          packet.progress += packet.speed;
          if (packet.progress > 1) packet.progress = 0;

          const seg = roadSegments[packet.segmentIndex];
          if (!seg) return;

          const p = packet.reverse ? 1 - packet.progress : packet.progress;
          const px = seg.x1 + (seg.x2 - seg.x1) * p;
          const pz = seg.z1 + (seg.z2 - seg.z1) * p;

          const [screenX, screenY, scale] = project(px, 0.02, pz, width, height);
          const size = Math.max(1.5, 2.5 * (scale / 400));

          ctx.fillStyle = '#38BDF8';
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 5. Draw Civic Infrastructure Hub at Center
      const [cX, cY] = project(0, 0, 0, width, height);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cX, cY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(cX, cY, 3, 0, Math.PI * 2);
      ctx.fill();

      // 6. Draw Hazard Nodes (Pulsing rings, diagnostic markers, score tags)
      const now = performance.now() / 1000;

      hazardNodes.forEach(node => {
        const [nx, ny, nScale] = project(node.x, 0.06, node.z, width, height);
        const baseRadius = Math.max(4, 5.2 * (nScale / 380));

        // Color theme mapping
        let colorMain = '#38BDF8';
        let colorGlow = 'rgba(56, 189, 248, 0.35)';
        let badgeBorder = '#38BDF8';

        if (node.type === 'critical') {
          colorMain = '#EF4444';
          colorGlow = 'rgba(239, 68, 68, 0.45)';
          badgeBorder = '#EF4444';
        } else if (node.type === 'high') {
          colorMain = '#F97316';
          colorGlow = 'rgba(249, 115, 22, 0.4)';
          badgeBorder = '#F97316';
        } else if (node.type === 'medium') {
          colorMain = '#F59E0B';
          colorGlow = 'rgba(245, 158, 11, 0.35)';
          badgeBorder = '#F59E0B';
        } else if (node.type === 'resolved') {
          colorMain = '#10B981';
          colorGlow = 'rgba(16, 185, 129, 0.4)';
          badgeBorder = '#10B981';
        }

        // Ground shadow (gives authentic spatial grounding)
        const [stalkBaseX, stalkBaseY] = project(node.x, 0, node.z, width, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(stalkBaseX, stalkBaseY + 1, baseRadius * 1.2, baseRadius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated Outer Pulse Ring
        if (!prefersReducedMotion) {
          const pulse = (now * 1.3 + node.pulseOffset * 4) % 2;
          const pulseRadius = baseRadius + pulse * 12;
          const pulseOpacity = Math.max(0, 1 - pulse / 2);

          ctx.strokeStyle = colorGlow.replace(/[\d.]+\)$/, `${pulseOpacity * 0.65})`);
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(nx, ny, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Vertical Telemetry Stalk
        ctx.strokeStyle = colorGlow;
        ctx.lineWidth = 0.9;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(stalkBaseX, stalkBaseY);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ground footprint dot
        ctx.fillStyle = colorGlow;
        ctx.beginPath();
        ctx.arc(stalkBaseX, stalkBaseY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Node Pin Body
        ctx.shadowColor = colorMain;
        ctx.shadowBlur = 8;
        ctx.fillStyle = colorMain;
        ctx.beginPath();
        ctx.arc(nx, ny, baseRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(nx, ny, baseRadius * 0.42, 0, Math.PI * 2);
        ctx.fill();

        // Floating Mini Callout Tag
        const tagText = `${node.type.toUpperCase()} • P-${node.score}`;
        ctx.font = '600 8.5px "JetBrains Mono", SFMono-Regular, monospace';
        const textWidth = ctx.measureText(tagText).width;
        const tagPadX = 5;
        const tagHeight = 15;
        const tagX = nx + 8;
        const tagY = ny - 6;

        // Tag background
        ctx.fillStyle = 'rgba(11, 15, 25, 0.9)';
        ctx.strokeStyle = badgeBorder;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY - tagHeight + 3, textWidth + tagPadX * 2, tagHeight, 4);
        ctx.fill();
        ctx.stroke();

        // Tag text
        ctx.fillStyle = colorMain;
        ctx.fillText(tagText, tagX + tagPadX, tagY);
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // IntersectionObserver to pause loop when scrolled out of viewport
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          isVisible.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove);
        containerEl.removeEventListener('mouseleave', handleMouseLeave);
      }
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-canvas-frame"
      role="img"
      aria-label="3D Civic Road Network Visualization displaying real-time spatial road hazards and triage zones"
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

      {/* Futuristic HUD Header */}
      <div className="hero-canvas-hud-header">
        <div className="hud-title-tag">
          <span className="live-beacon" style={{ width: '5px', height: '5px' }} />
          <span>SPATIAL INTELLIGENCE GRID // MYSURU SECTOR</span>
        </div>
        <div className="hud-status-badge">
          60 FPS • TELEMETRY SYNCED
        </div>
      </div>

      {/* Futuristic HUD Footer */}
      <div className="hero-canvas-hud-footer">
        <div>LAT: 12.3130° N • LON: 76.6135° E</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: '#EF4444' }}>● CRITICAL</span>
          <span style={{ color: '#F97316' }}>● HIGH</span>
          <span style={{ color: '#F59E0B' }}>● MEDIUM</span>
          <span style={{ color: '#10B981' }}>● RESOLVED</span>
        </div>
      </div>
    </div>
  );
};
