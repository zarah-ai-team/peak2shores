'use client';

import { useEffect, useRef, useState } from 'react';
import {
  geoCentroid,
  geoContains,
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
} from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';

export type GlobePin = { slug: string; country: string; coords: [number, number] };

type GlobeProps = {
  /** Countries that have journeys. Highlighted, hoverable and clickable. */
  destinations: string[];
  /** Journeys per destination, for the hover label. */
  counts: Record<string, number>;
  pins: GlobePin[];
  selected?: string;
  onSelect: (country: string) => void;
};

type Country = Feature<Geometry, { name: string }>;
type Point = [number, number];

/**
 * The globe keeps to the part of the world the journeys are in: its centre may
 * wander this far east or west of the outermost pins, and no further north or
 * south than they are.
 */
const VIEW_PAD_DEG = 18;
/** The idle sway across that region. Slow enough to read as weather. */
const SWAY_DEG_PER_SEC = 3;
/** Turning to a chosen country. */
const TURN_MS = 1100;
/** Opens on the Mediterranean with the Cape in view below it. */
const START: Point = [-15, -12];

const graticule = geoGraticule10();
const sphere = { type: 'Sphere' } as const;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp = (value: number, [min, max]: Point) => Math.max(min, Math.min(max, value));

/** The longitudes and latitudes the globe's centre may face. */
function viewBounds(pins: GlobePin[]): { lon: Point; lat: Point } {
  if (!pins.length) return { lon: [-180, 180], lat: [-60, 60] };
  const lons = pins.map((p) => p.coords[0]);
  const lats = pins.map((p) => p.coords[1]);
  return {
    lon: [Math.min(...lons) - VIEW_PAD_DEG, Math.max(...lons) + VIEW_PAD_DEG],
    lat: [Math.min(...lats), Math.max(...lats)],
  };
}

/** Brand tokens, read once from the stylesheet so the globe follows them. */
function readPalette() {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    ink: token('--color-ink', '#1e1f1d'),
    ivory: token('--color-ivory', '#f4f1ea'),
    acqua: token('--color-acqua', '#0cc0df'),
    acquaDeep: token('--color-acqua-deep', '#0b9fb8'),
    acquaText: token('--color-acqua-text', '#06758a'),
  };
}

/**
 * The destinations globe.
 *
 * An orthographic projection drawn to a canvas, lit from the upper left so it
 * reads as a sphere rather than a disc: a pale ocean that darkens toward the
 * limb, a highlight, and a faint acqua atmosphere. Countries with journeys are
 * picked out in acqua; each journey is a pin.
 *
 * Drag turns it (horizontally only on touch, so the page still scrolls), a
 * click or tap on a highlighted country or pin selects it, and a selection —
 * from here or from the filters — turns the globe to face it. It idles with a
 * slow spin until someone touches it, and only draws while on screen.
 *
 * The canvas is hidden from assistive technology: the destination buttons
 * beside it do the same job and are the accessible route.
 */
export function Globe({ destinations, counts, pins, selected, onSelect }: GlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Everything the frame loop reads lives here, so the loop is set up once and
  // never restarted by a render.
  const live = useRef({
    rotation: [...START] as Point,
    velocity: 0,
    dragging: false,
    moved: 0,
    last: [0, 0] as Point,
    turn: null as null | { path: (t: number) => Point; start: number },
    /** Which way the idle sway is heading: +1 west, -1 east. */
    swayDir: 1,
    countries: [] as Country[],
    byName: new Map<string, Country>(),
    size: 0,
    reduced: false,
    destinations,
    pins,
    selected,
    hovered: null as string | null,
    onSelect,
  });
  live.current.destinations = destinations;
  live.current.pins = pins;
  live.current.selected = selected;
  live.current.hovered = hovered;
  live.current.onSelect = onSelect;

  const projection = useRef(geoOrthographic().clipAngle(90).precision(0.6)).current;

  /** Face a country: the average of its pins, or the middle of its outline. */
  const turnTo = (country: string) => {
    const L = live.current;
    const own = L.pins.filter((p) => p.country === country);
    let target: Point | null = null;
    if (own.length) {
      target = [
        own.reduce((sum, p) => sum + p.coords[0], 0) / own.length,
        own.reduce((sum, p) => sum + p.coords[1], 0) / own.length,
      ];
    } else {
      const shape = L.byName.get(country);
      if (shape) target = geoCentroid(shape) as Point;
    }
    if (!target) return;
    const bounds = viewBounds(L.pins);
    target = [clamp(target[0], bounds.lon), clamp(target[1], bounds.lat)];

    L.velocity = 0;
    if (L.reduced) {
      L.rotation = [-target[0], -target[1]];
      L.turn = null;
      return;
    }
    const from: Point = [-L.rotation[0], -L.rotation[1]];
    L.turn = {
      path: geoInterpolate(from, target) as (t: number) => Point,
      start: performance.now(),
    };
  };

  // A selection from anywhere — the globe, the buttons, the filters — turns it.
  useEffect(() => {
    if (selected) turnTo(selected);
  }, [selected]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const L = live.current;
    const palette = readPalette();
    L.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;

    // The outlines (Natural Earth via world-atlas, in public/geo) arrive after
    // the page is up. Until then the globe draws as a lit sphere with its pins.
    fetch('/geo/countries-110m.json')
      .then(
        (res) =>
          res.json() as Promise<Topology<{ countries: GeometryCollection<{ name: string }> }>>,
      )
      .then((topology) => {
        if (cancelled) return;
        const collection = feature(topology, topology.objects.countries) as FeatureCollection<
          Geometry,
          { name: string }
        >;
        L.countries = collection.features;
        L.byName = new Map(collection.features.map((f) => [f.properties.name, f]));
        if (L.selected) turnTo(L.selected);
      })
      .catch(() => {
        // No outlines: the sphere and its pins still work.
      });

    const radius = () => (L.size / 2) * 0.86;

    function draw(now: number) {
      if (!ctx || !L.size) return;
      const size = L.size;
      const c = size / 2;
      const r = radius();
      const dpr = window.devicePixelRatio || 1;
      projection.translate([c, c]).scale(r).rotate([L.rotation[0], L.rotation[1], 0]);
      const path = geoPath(projection, ctx);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Atmosphere.
      let g = ctx.createRadialGradient(c, c, r * 0.94, c, c, r * 1.13);
      g.addColorStop(0, hexAlpha(palette.acqua, 0.2));
      g.addColorStop(1, hexAlpha(palette.acqua, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c, c, r * 1.13, 0, Math.PI * 2);
      ctx.fill();

      // Ocean: a soft charcoal, lit from the upper left.
      g = ctx.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.05, c, c, r);
      g.addColorStop(0, '#6b6d66');
      g.addColorStop(1, '#45473f');
      ctx.beginPath();
      path(sphere);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = hexAlpha(palette.ivory, 0.07);
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Everywhere without a journey is only a faint outline, for bearings.
      const destinationSet = new Set(L.destinations);
      ctx.beginPath();
      for (const country of L.countries) {
        if (!destinationSet.has(country.properties.name)) path(country);
      }
      ctx.strokeStyle = hexAlpha(palette.ivory, 0.16);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Destinations.
      for (const name of L.destinations) {
        const country = L.byName.get(name);
        if (!country) continue;
        ctx.beginPath();
        path(country);
        ctx.fillStyle =
          name === L.selected || name === L.hovered
            ? palette.acqua
            : hexAlpha(palette.acquaDeep, 0.85);
        ctx.fill();
        ctx.strokeStyle = hexAlpha(palette.ivory, name === L.selected ? 0.9 : 0.4);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Limb darkening, then the highlight — the two together make the sphere.
      g = ctx.createRadialGradient(c, c, r * 0.5, c, c, r);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.22)');
      ctx.beginPath();
      path(sphere);
      ctx.fillStyle = g;
      ctx.fill();

      g = ctx.createRadialGradient(c - r * 0.42, c - r * 0.48, 0, c - r * 0.42, c - r * 0.48, r);
      g.addColorStop(0, 'rgba(255,255,255,0.16)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fill();

      ctx.strokeStyle = hexAlpha(palette.acqua, 0.25);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pins, on the near side only.
      const centre: Point = [-L.rotation[0], -L.rotation[1]];
      for (const pin of L.pins) {
        if (geoDistance(pin.coords, centre) > Math.PI / 2 - 0.06) continue;
        const at = projection(pin.coords);
        if (!at) continue;
        const [x, y] = at;
        const active = pin.country === L.selected;
        const dot = active ? 5.5 : 4;

        if (active && !L.reduced) {
          const t = (now % 1800) / 1800;
          ctx.beginPath();
          ctx.arc(x, y, dot + 3 + t * 14, 0, Math.PI * 2);
          ctx.strokeStyle = hexAlpha(palette.acqua, (1 - t) * 0.7);
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, dot + 2.5, 0, Math.PI * 2);
        ctx.fillStyle = palette.ivory;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, dot, 0, Math.PI * 2);
        ctx.fillStyle = active ? palette.acqua : palette.ink;
        ctx.fill();
      }
    }

    function update(now: number, dt: number) {
      if (L.turn) {
        const t = Math.min(1, (now - L.turn.start) / TURN_MS);
        const [lon, lat] = L.turn.path(easeInOut(t));
        L.rotation = [-lon, -lat];
        if (t >= 1) L.turn = null;
        return;
      }
      if (L.dragging) return;
      if (Math.abs(L.velocity) > 0.01) {
        // A flick carries on and settles.
        L.rotation[0] += L.velocity * (dt / 16);
        L.velocity *= 0.94;
        keepInView();
      } else if (!L.selected && !L.hovered && !L.reduced) {
        // Sway between the outermost journeys, turning back at each edge.
        L.rotation[0] += (L.swayDir * SWAY_DEG_PER_SEC * dt) / 1000;
        const edge = keepInView();
        if (edge) L.swayDir = edge;
      }
    }

    /**
     * Holds the centre inside the journeys' region. Returns which way to turn
     * back if it was at an edge: +1 at the eastern edge, -1 at the western.
     */
    function keepInView(): number {
      const bounds = viewBounds(L.pins);
      const lon = -L.rotation[0];
      const held = clamp(lon, bounds.lon);
      L.rotation = [-held, -clamp(-L.rotation[1], bounds.lat)];
      if (held === lon) return 0;
      L.velocity = 0;
      return held === bounds.lon[1] ? 1 : -1;
    }

    /** The destination under a point on the canvas, pins first. */
    function hit(x: number, y: number): string | null {
      const c = L.size / 2;
      const centre: Point = [-L.rotation[0], -L.rotation[1]];
      for (const pin of L.pins) {
        if (geoDistance(pin.coords, centre) > Math.PI / 2 - 0.06) continue;
        const at = projection(pin.coords);
        if (at && Math.hypot(at[0] - x, at[1] - y) < 14) return pin.country;
      }
      if (Math.hypot(x - c, y - c) > radius()) return null;
      const point = projection.invert?.([x, y]);
      if (!point) return null;
      for (const name of L.destinations) {
        const country = L.byName.get(name);
        if (country && geoContains(country, point)) return name;
      }
      return null;
    }

    const local = (event: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top];
    };

    const showLabel = (name: string | null, at?: Point) => {
      if (name !== L.hovered) setHovered(name);
      canvas.style.cursor = L.dragging ? 'grabbing' : name ? 'pointer' : 'grab';
      const label = labelRef.current;
      if (label && at) label.style.transform = `translate(${at[0] + 14}px, ${at[1] - 10}px)`;
    };

    const onDown = (event: PointerEvent) => {
      L.dragging = true;
      L.moved = 0;
      L.velocity = 0;
      L.turn = null;
      L.last = [event.clientX, event.clientY];
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onMove = (event: PointerEvent) => {
      if (!L.dragging) {
        const at = local(event);
        showLabel(hit(...at), at);
        return;
      }
      const dx = event.clientX - L.last[0];
      const dy = event.clientY - L.last[1];
      L.last = [event.clientX, event.clientY];
      L.moved += Math.abs(dx) + Math.abs(dy);
      // Roughly one degree per degree under the pointer, so it feels held.
      const k = 57 / radius();
      L.rotation[0] += dx * k;
      L.rotation[1] -= dy * k;
      L.velocity = dx * k;
      keepInView();
      if (L.moved > 6 && L.hovered) showLabel(null);
    };

    const onUp = (event: PointerEvent) => {
      if (!L.dragging) return;
      L.dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      const at = local(event);
      if (L.moved < 6) {
        L.velocity = 0;
        const name = hit(...at);
        if (name) L.onSelect(name);
      }
      showLabel(event.pointerType === 'mouse' ? hit(...at) : null, at);
    };

    const onCancel = () => {
      L.dragging = false;
      showLabel(null);
    };

    const onLeave = () => {
      if (!L.dragging) showLabel(null);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onCancel);
    canvas.addEventListener('pointerleave', onLeave);

    const resize = () => {
      const size = wrap.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      L.size = size;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      draw(performance.now());
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    resize();

    // Draw only while the globe is on screen and the tab is visible.
    let frame = 0;
    let last = 0;
    let onScreen = false;
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      update(now, dt);
      draw(now);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = onScreen && document.visibilityState === 'visible';
      if (run && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    intersection.observe(wrap);
    document.addEventListener('visibilitychange', sync);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('pointerleave', onLeave);
    };
    // Set up once; everything changing lives in `live`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = hovered ? (counts[hovered] ?? 0) : 0;

  return (
    <div ref={wrapRef} className="relative aspect-square w-full" aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full touch-pan-y select-none"
        style={{ cursor: 'grab' }}
      />
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap bg-ink px-2.5 py-1.5 font-ui text-[10px] uppercase leading-none tracking-[0.16em] text-ivory transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {hovered ? `${hovered} · ${count} ${count === 1 ? 'journey' : 'journeys'}` : ''}
      </div>
    </div>
  );
}

/** `#rrggbb` + alpha → `rgba()`. Tokens are hex; canvas gradients need alpha. */
function hexAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  if (value.length !== 6) return hex;
  const n = parseInt(value, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
