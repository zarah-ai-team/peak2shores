'use client';

import { useState } from 'react';
import Image from 'next/image';
import { peaksShores } from '@/lib/data/home';
import { HomeMedia } from './HomeMedia';

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/**
 * 07 — Why "Peaks2Shores": the Alps on the left, the sea on the right, and a
 * handle between them. The whole frame is a real range input, so it drags,
 * takes the arrow keys and reads to a screen reader; each word and its line
 * fade up as its side takes the frame.
 */
export function NameSlider() {
  const [split, setSplit] = useState(50);
  const peaksFade = clamp((split - 18) / 26);
  const shoresFade = clamp((82 - split) / 26);

  return (
    <section className="hc-cmp" id="name" aria-labelledby="name-title">
      <div className="side shores">
        <Image
          src={peaksShores.shores.img}
          alt={peaksShores.shores.alt}
          fill
          sizes="100vw"
          className="fill drift"
        />
        <span className="shade" />
        <span className="word r" style={{ opacity: shoresFade }} aria-hidden>
          Shores
        </span>
        <p className="cap r" style={{ opacity: shoresFade }}>
          {peaksShores.shores.line}
        </p>
      </div>
      <div className="side peaks" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
        <HomeMedia visual={{ ...peaksShores.peaks, alt: '' }} sizes="100vw" />
        <span className="shade" />
        <span className="word l" style={{ opacity: peaksFade }} aria-hidden>
          Peaks
        </span>
        <p className="cap l" style={{ opacity: peaksFade }}>
          {peaksShores.peaks.line}
        </p>
      </div>

      <div className="top">
        <div className="lab" id="name-title">
          Why “Peaks2Shores” · drag to travel
        </div>
        <p>{peaksShores.between}</p>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={split}
        onChange={(e) => setSplit(Number(e.target.value))}
        aria-label="Move between Peaks and Shores"
        aria-valuetext={split > 60 ? 'Peaks' : split < 40 ? 'Shores' : 'Between'}
      />
      <div className="handle" style={{ left: `${split}%` }} aria-hidden>
        <b>2</b>
      </div>
    </section>
  );
}
