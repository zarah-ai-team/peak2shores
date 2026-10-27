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

export type GlobePin = {
  slug: string;
  country: string;
  coords: [number, number];
  /** The journey's name and first departure, for the pin's label. */
  title: string;
  when: string;
};

type GlobeProps = {
  /** Countries that have journeys. Highlighted, hoverable and clickable. */
  destinations: string[];
  /** Journeys per destination, for the hover label. */
  counts: Record<string, number>;
  pins: GlobePin[];
  selected?: string;
  onSelect: (country: string) => void;
  /** A journey whose pin is lit (brand blue), e.g. while its name in a list is hovered. */
  highlight?: string | null;
  /** Reports the pin under the pointer, so a list beside the globe can answer it. */
  onHoverPin?: (slug: string | null) => void;
  /**
   * The journey whose region the globe frames. Unset, it frames the region
   * with the most journeys — today the Alps and the Mediterranean.
   */
  frame?: string | null;
};

type Country = Feature<Geometry, { name: string }>;
type Point = [number, number];
type View = { center: Point; zoom: number };

/** Pins closer than this share a region, and are framed together. */
const REGION_DEG = 28;
/** Room around a region's outermost pins, so none sits on the frame. */
const REGION_PAD_DEG = 4.5;
const LONE_PAD_DEG = 22;
/** Zoom limits: 1 shows the whole sphere; the top is a single coast. */
const ZOOM: Point = [1, 4.6];
/** Flights scale with distance: a neighbor is quick, a hemisphere unhurried. */
const FLIGHT_MS: Point = [900, 2000];

const graticule = geoGraticule10();

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp = (value: number, [min, max]: Point) => Math.max(min, Math.min(max, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Groups pins into regions and frames each one: its center is the pins'
 * average, its zoom the tightest that still shows every pin with room around.
 * `fit` is the share of the canvas's short side a region may span.
 */
function regions(pins: GlobePin[], fit: number) {
  const groups: GlobePin[][] = [];
  for (const pin of pins) {
    const near = groups.find(
      (g) => geoDistance(g[0].coords, pin.coords) < (REGION_DEG * Math.PI) / 180,
    );
    if (near) near.push(pin);
    else groups.push([pin]);
  }
  return groups
    .sort((a, b) => b.length - a.length)
    .map((group) => {
      const center: Point = [
        group.reduce((sum, p) => sum + p.coords[0], 0) / group.length,
        group.reduce((sum, p) => sum + p.coords[1], 0) / group.length,
      ];
      const spread = Math.max(...group.map((p) => geoDistance(p.coords, center)));
      // A lone pin gets more of its surroundings, so it reads as a place on a map.
      const pad = group.length > 1 ? REGION_PAD_DEG : LONE_PAD_DEG;
      const reach = Math.sin(spread + (pad * Math.PI) / 180);
      return { slugs: group.map((p) => p.slug), view: { center, zoom: clamp(fit / reach, ZOOM) } };
    });
}

/** Brand tokens, read once from the stylesheet so the globe follows them. */
function readPalette() {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const ink = token('--color-ink', '#1e1f1d');
  const ivory = token('--color-ivory', '#f4f1ea');
  const sand = token('--color-tone-sand', '#e5dfd1');
  const acqua = token('--color-acqua', '#7accfd');
  const acquaDeep = token('--color-acqua-deep', '#1190cb');
  const acquaText = token('--color-acqua-text', '#0b5c85');
  const navy = token('--color-navy', '#0e2f42');
  const brand = token('--color-brand', '#1190cb');
  // A printed atlas on the house paper: water-blue sea, ivory land, the
  // journeys' countries in deep acqua, pins in navy with a brand-blue light.
  return {
    oceanIn: mix(acqua, ivory, 0.62),
    oceanOut: mix(acquaDeep, sand, 0.55),
    glow: hexAlpha(acqua, 0.35),
    graticule: hexAlpha(acquaText, 0.09),
    land: ivory,
    landStroke: hexAlpha(ink, 0.14),
    dest: hexAlpha(acquaText, 0.55),
    destHover: hexAlpha(acquaText, 0.78),
    destSelected: navy,
    destStroke: hexAlpha(ivory, 0.7),
    limb: hexAlpha(navy, 0.16),
    highlight: hexAlpha(ivory, 0.32),
    edge: hexAlpha(acquaText, 0.35),
    pinHalo: ivory,
    pin: navy,
    pinActive: brand,
  };
}

/**
 * The destinations globe.
 *
 * An orthographic projection drawn to a canvas, set as a printed atlas on the
 * house paper: water-blue sea that deepens toward the limb, ivory land, the
 * journeys' countries in deep acqua, each journey a navy pin. It opens
 * framed on the region with the most journeys, close enough that every pin
 * stands apart, and flies — rotate and zoom together, easing out a little in
 * the middle like a camera — to any other journey that is hovered or chosen.
 *
 * Drag turns it (horizontally only on touch, so the page still scrolls), a
 * click or tap on a highlighted country or pin selects it. Left alone it holds
 * still: the sphere is painted once into an offscreen layer and repainted only
 * when the view, the selection or the hover changes (with the light 110m
 * outlines while it moves, the 50m ones once it settles), so a frame at rest
 * is a copy of that layer plus the pins. It only draws while on screen.
 * Under reduced motion every move is a cut.
 *
 * The canvas is hidden from assistive technology: the journey list and the
 * region buttons beside it do the same job and are the accessible route.
 */
export function Globe({
  destinations,
  counts,
  pins,
  selected,
  onSelect,
  highlight = null,
  onHoverPin,
  frame = null,
}: GlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  // Everything the frame loop reads lives here, so the loop is set up once and
  // never restarted by a render.
  const live = useRef({
    view: { center: [0, 0] as Point, zoom: 1 } as View,
    velocity: 0,
    dragging: false,
    moved: 0,
    last: [0, 0] as Point,
    flight: null as null | {
      path: (t: number) => Point;
      zoom: [number, number];
      dip: number;
      start: number;
      ms: number;
    },
    countries: [] as Country[],
    /** The light 110m outlines, drawn while the globe is moving. */
    coarse: [] as Country[],
    byName: new Map<string, Country>(),
    width: 0,
    height: 0,
    reduced: false,
    destinations,
    pins,
    selected,
    hovered: null as string | null,
    hoveredPin: null as string | null,
    highlight,
    frame,
    onSelect,
    onHoverPin,
  });
  live.current.destinations = destinations;
  live.current.pins = pins;
  live.current.selected = selected;
  live.current.hovered = hovered;
  live.current.onSelect = onSelect;
  live.current.highlight = highlight;
  live.current.frame = frame;
  live.current.onHoverPin = onHoverPin;

  const projection = useRef(geoOrthographic().clipAngle(90).precision(0.4)).current;

  /** The view the globe should hold now: the framed journey's region, or the first. */
  const target = (): View | null => {
    const L = live.current;
    if (!L.width) return null;
    const all = regions(L.pins, (0.42 * Math.min(L.width, L.height)) / baseRadius(L));
    const want = L.frame ?? L.pins.find((p) => p.country === L.selected)?.slug ?? null;
    const region = (want && all.find((r) => r.slugs.includes(want))) || all[0];
    if (region) return region.view;
    if (L.selected) {
      const shape = L.byName.get(L.selected);
      if (shape) return { center: geoCentroid(shape) as Point, zoom: 2.4 };
    }
    return null;
  };

  /** Fly to a view: rotate along the great circle and zoom, easing out mid-way. */
  const flyTo = (to: View) => {
    const L = live.current;
    L.velocity = 0;
    const from = L.view;
    const distance = geoDistance(from.center, to.center);
    if (L.reduced || (distance < 1e-3 && Math.abs(from.zoom - to.zoom) < 0.01)) {
      L.view = { center: [...to.center], zoom: to.zoom };
      L.flight = null;
      return;
    }
    const share = Math.min(1, distance / (Math.PI / 2));
    L.flight = {
      path: geoInterpolate(from.center, to.center) as (t: number) => Point,
      zoom: [from.zoom, to.zoom],
      // Long flights pull back to show where they are going.
      dip: share * 0.62,
      start: performance.now(),
      ms: lerp(FLIGHT_MS[0], FLIGHT_MS[1], share),
    };
  };

  // Hovering a journey anywhere, or choosing a country, reframes the globe.
  useEffect(() => {
    const view = target();
    // `target` reads `live`, which this render has just updated.
    if (view) flyTo(view);
  }, [frame, selected]);

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
    // the page is up: the light 110m set first, then the 50m set, whose coasts
    // hold up at regional zoom. Until then the globe draws as a sphere with pins.
    const load = (file: string) =>
      fetch(file)
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
          if (!L.coarse.length) L.coarse = collection.features;
          L.countries = collection.features;
          // New outlines: the layer is repainted on the next frame.
          painted = '';
          L.byName = new Map(collection.features.map((f) => [f.properties.name, f]));
        });
    load('/geo/countries-110m.json')
      .then(() => load('/geo/countries-50m.json'))
      .catch(() => {
        // No outlines (or only the coarse ones): the sphere and its pins still work.
      });

    /** Point under the canvas center, as a projection rotation. */
    const rotation = (): [number, number, number] => [-L.view.center[0], -L.view.center[1], 0];

    /** The offscreen layer: sphere, graticule and countries — everything but the pins. */
    const layer = document.createElement('canvas');
    const layerCtx = layer.getContext('2d');
    /** What the layer was last painted for; a frame with the same key reuses it. */
    let painted = '';

    /** Paints the sphere and its countries for the current projection. */
    function paint(
      c: CanvasRenderingContext2D,
      countries: Country[],
      cx: number,
      cy: number,
      r: number,
    ) {
      const path = geoPath(projection, c);
      const w = L.width;
      const h = L.height;
      const dpr = window.devicePixelRatio || 1;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);

      // A faint water-blue atmosphere just beyond the limb.
      let g = c.createRadialGradient(cx, cy, r * 0.96, cx, cy, r * 1.12);
      g.addColorStop(0, palette.glow);
      g.addColorStop(1, hexAlpha(palette.pinHalo, 0));
      c.beginPath();
      c.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
      c.fillStyle = g;
      c.fill();

      // Water, lit from the upper left and deepening toward the edge.
      g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r);
      g.addColorStop(0, palette.oceanIn);
      g.addColorStop(1, palette.oceanOut);
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fillStyle = g;
      c.fill();

      c.beginPath();
      path(graticule);
      c.strokeStyle = palette.graticule;
      c.lineWidth = 0.6;
      c.stroke();

      // Everywhere without a journey: ivory, for bearings only.
      const destinationSet = new Set(L.destinations);
      c.beginPath();
      for (const country of countries) {
        if (!destinationSet.has(country.properties.name)) path(country);
      }
      c.fillStyle = palette.land;
      c.fill();
      c.strokeStyle = palette.landStroke;
      c.lineWidth = 0.6;
      c.stroke();

      // Destinations, from the same outlines as everything else in the frame.
      const shapes = new Map(
        countries
          .filter((country) => destinationSet.has(country.properties.name))
          .map((country) => [country.properties.name, country]),
      );
      for (const name of L.destinations) {
        const country = shapes.get(name);
        if (!country) continue;
        c.beginPath();
        path(country);
        c.fillStyle =
          name === L.selected
            ? palette.destSelected
            : name === L.hovered
              ? palette.destHover
              : palette.dest;
        c.fill();
        c.strokeStyle = palette.destStroke;
        c.lineWidth = 0.8;
        c.stroke();
      }

      // Light and fall-off, so it reads as a sphere rather than a disc.
      g = c.createRadialGradient(cx - r * 0.35, cy - r * 0.4, 0, cx, cy, r);
      g.addColorStop(0, palette.highlight);
      g.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
      g.addColorStop(1, palette.limb);
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.fillStyle = g;
      c.fill();
      c.strokeStyle = palette.edge;
      c.lineWidth = 1;
      c.stroke();
    }

    function draw(now: number) {
      if (!ctx || !layerCtx || !L.width) return;
      const { width: w, height: h } = L;
      const cx = w / 2;
      const cy = h / 2;
      const r = baseRadius(L) * L.view.zoom;
      const dpr = window.devicePixelRatio || 1;
      // Geometry outside the canvas is culled before it is drawn — at regional
      // zoom most of the near hemisphere lies beyond the frame.
      projection
        .translate([cx, cy])
        .scale(r)
        .rotate(rotation())
        .clipExtent([
          [-4, -4],
          [w + 4, h + 4],
        ]);

      const moving = !!L.flight || L.dragging || Math.abs(L.velocity) > 0.01;
      const key = [
        L.view.center[0],
        L.view.center[1],
        L.view.zoom,
        w,
        h,
        L.selected,
        L.hovered,
        moving,
      ].join('|');
      // A lit pin pulses, so its frames always draw; otherwise a frame whose
      // view has not changed has nothing new to show.
      const pulsing =
        !L.reduced &&
        L.pins.some(
          (pin) =>
            pin.slug === L.highlight || pin.slug === L.hoveredPin || pin.country === L.selected,
        );
      if (key === painted && !pulsing) return;
      if (key !== painted) {
        if (layer.width !== canvas!.width || layer.height !== canvas!.height) {
          layer.width = canvas!.width;
          layer.height = canvas!.height;
        }
        // In motion: the light outlines, resampled loosely; at rest, full detail.
        projection.precision(moving ? 2 : 0.4);
        paint(layerCtx, moving && L.coarse.length ? L.coarse : L.countries, cx, cy, r);
        painted = key;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.drawImage(layer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Pins, on the near side only. Lit pins draw last, over their neighbors.
      const visible = L.pins
        .filter((pin) => geoDistance(pin.coords, L.view.center) < Math.PI / 2 - 0.06)
        .map((pin) => ({ pin, lit: pin.slug === L.highlight || pin.slug === L.hoveredPin }))
        .sort((a, b) => Number(a.lit) - Number(b.lit));
      for (const { pin, lit } of visible) {
        const at = projection(pin.coords);
        if (!at) continue;
        const [x, y] = at;
        const active = lit || pin.country === L.selected;
        const dot = active ? 6 : 4.5;

        if (active && !L.reduced) {
          for (const offset of [0, 0.5]) {
            const t = (((now / 1600 + offset) % 1) + 1) % 1;
            ctx.beginPath();
            ctx.arc(x, y, dot + 3 + t * 18, 0, Math.PI * 2);
            ctx.strokeStyle = hexAlpha(palette.pinActive, (1 - t) * 0.7);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(x, y, dot + 3, 0, Math.PI * 2);
        ctx.fillStyle = palette.pinHalo;
        ctx.shadowColor = hexAlpha(palette.pin, 0.25);
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, dot, 0, Math.PI * 2);
        ctx.fillStyle = active ? palette.pinActive : palette.pin;
        ctx.fill();
      }
    }

    function update(now: number, dt: number) {
      const F = L.flight;
      if (F) {
        const t = Math.min(1, (now - F.start) / F.ms);
        const e = easeInOut(t);
        L.view = {
          center: F.path(e),
          zoom: lerp(F.zoom[0], F.zoom[1], e) * (1 - F.dip * Math.sin(Math.PI * e)),
        };
        if (t >= 1) L.flight = null;
        return;
      }
      if (L.dragging) return;
      if (Math.abs(L.velocity) > 0.01) {
        // A flick carries on and settles.
        L.view.center[0] -= L.velocity * (dt / 16);
        L.velocity *= 0.92;
        return;
      }
    }

    /** The journey pin under a point on the canvas, if any. */
    function pinAt(x: number, y: number): GlobePin | null {
      for (const pin of L.pins) {
        if (geoDistance(pin.coords, L.view.center) > Math.PI / 2 - 0.06) continue;
        const at = projection(pin.coords);
        if (at && Math.hypot(at[0] - x, at[1] - y) < 16) return pin;
      }
      return null;
    }

    /** The destination under a point on the canvas, pins first. */
    function hit(x: number, y: number): string | null {
      const pin = pinAt(x, y);
      if (pin) return pin.country;
      const r = baseRadius(L) * L.view.zoom;
      if (Math.hypot(x - L.width / 2, y - L.height / 2) > r) return null;
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

    const showLabel = (at: Point | null) => {
      const pin = at ? pinAt(...at) : null;
      const name = at ? (pin?.country ?? hit(...at)) : null;
      if (name !== L.hovered) setHovered(name);
      const slug = pin?.slug ?? null;
      if (slug !== L.hoveredPin) {
        L.hoveredPin = slug;
        setHoveredPin(slug);
        L.onHoverPin?.(slug);
      }
      canvas.style.cursor = L.dragging ? 'grabbing' : name ? 'pointer' : 'grab';
      const label = labelRef.current;
      if (label && at) label.style.transform = `translate(${at[0] + 16}px, ${at[1] - 12}px)`;
    };

    const onDown = (event: PointerEvent) => {
      L.dragging = true;
      L.moved = 0;
      L.velocity = 0;
      L.flight = null;
      L.last = [event.clientX, event.clientY];
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onMove = (event: PointerEvent) => {
      if (!L.dragging) {
        showLabel(local(event));
        return;
      }
      const dx = event.clientX - L.last[0];
      const dy = event.clientY - L.last[1];
      L.last = [event.clientX, event.clientY];
      L.moved += Math.abs(dx) + Math.abs(dy);
      // Roughly one degree per degree under the pointer, so it feels held.
      const k = 57 / (baseRadius(L) * L.view.zoom);
      L.view.center = [L.view.center[0] - dx * k, clamp(L.view.center[1] + dy * k, [-70, 75])];
      L.velocity = dx * k;
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
      showLabel(event.pointerType === 'mouse' ? at : null);
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
      const dpr = window.devicePixelRatio || 1;
      const first = !L.width;
      L.width = wrap.clientWidth;
      L.height = wrap.clientHeight;
      canvas.width = Math.round(L.width * dpr);
      canvas.height = Math.round(L.height * dpr);
      // Resizing clears the canvas, so the next frame paints in full.
      painted = '';
      const view = target();
      if (view && (first || !L.flight)) {
        // The first frame is placed, not flown to; later resizes keep the frame.
        L.view = { center: [...view.center], zoom: view.zoom };
      }
      draw(performance.now());
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    resize();

    // Draw only while the globe is on screen and the tab is visible.
    let frameId = 0;
    let last = 0;
    let onScreen = false;
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      update(now, dt);
      draw(now);
      frameId = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = onScreen && document.visibilityState === 'visible';
      if (run && !frameId) {
        last = 0;
        frameId = requestAnimationFrame(tick);
      } else if (!run && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
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
      cancelAnimationFrame(frameId);
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

  const pin = hoveredPin ? pins.find((p) => p.slug === hoveredPin) : null;
  const count = hovered ? (counts[hovered] ?? 0) : 0;

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full touch-pan-y select-none"
        style={{ cursor: 'grab' }}
      />
      <div
        ref={labelRef}
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap bg-navy-deep px-3 py-2 text-on-dark shadow-[0_8px_24px_rgb(10_34_50/0.18)] transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        {pin ? (
          <>
            <span className="h5 block !text-[15px] leading-tight">{pin.title}</span>
            <span className="kicker-sm mt-1 block !text-acqua">From {pin.when}</span>
          </>
        ) : (
          <span className="kicker-sm block !text-on-dark">
            {hovered ? `${hovered} · ${count} ${count === 1 ? 'journey' : 'journeys'}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}

/** The sphere's radius at zoom 1: the whole globe, with a margin, in the canvas. */
function baseRadius({ width, height }: { width: number; height: number }) {
  return (Math.min(width, height) / 2) * 0.86;
}

/** `#rrggbb` + alpha → `rgba()`. Tokens are hex; canvas gradients need alpha. */
function hexAlpha(hex: string, alpha: number) {
  const value = hex.replace('#', '');
  if (value.length !== 6) return hex;
  const n = parseInt(value, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Two `#rrggbb` tokens blended: `t` of the first, the rest of the second. */
function mix(a: string, b: string, t: number) {
  const parse = (hex: string) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [x, y] = [parse(a), parse(b)];
  return `rgb(${x.map((v, i) => Math.round(v * t + y[i] * (1 - t))).join(', ')})`;
}
