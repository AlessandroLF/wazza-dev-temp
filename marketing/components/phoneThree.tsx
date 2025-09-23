"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function PhoneThree({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // three
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const texRef = useRef<THREE.CanvasTexture | null>(null);

  // lottie
  const lottieAnimRef = useRef<any>(null);
  const hiddenHostRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    let disposed = false;

    // --- Three.js setup ---
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    camera.position.z = 2.2;
    cameraRef.current = camera;

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Plane with 440x600 aspect
    const W = 440;
    const H = 600;
    const planeH = 1.4;
    const planeW = planeH * (W / H);
    const geom = new THREE.PlaneGeometry(planeW, planeH);

    // 1x1 temp texture until Lottie canvas is ready
    const tmp = document.createElement("canvas");
    tmp.width = tmp.height = 1;
    const tmpTex = new THREE.CanvasTexture(tmp);
    tmpTex.colorSpace = THREE.SRGBColorSpace;

    const mat = new THREE.MeshBasicMaterial({ map: tmpTex, transparent: true });
    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);

    const fit = () => {
      const w = mount.clientWidth || 300;
      const h = mount.clientHeight || Math.max(300, Math.round(w * (H / W)));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();

    // --- Hidden host for Lottie canvas ---
    const hidden = document.createElement("div");
    hidden.style.position = "absolute";
    hidden.style.left = "-99999px";
    hidden.style.top = "-99999px";
    hidden.style.width = `${W}px`;
    hidden.style.height = `${H}px`;
    document.body.appendChild(hidden);
    hiddenHostRef.current = hidden;

    let cleanupFns: Array<() => void> = [];

    (async () => {
      const lottie = (await import("lottie-web")).default;

      const anim = lottie.loadAnimation({
        container: hidden,
        renderer: "canvas",
        loop: false,          // we do our own ping-pong
        autoplay: false,
        path: "/phone-440x600.json",
        // keep clears so we don't smear; we'll bridge segments on next RAF
        rendererSettings: {
          clearCanvas: true,
          preserveAspectRatio: "xMidYMid meet",
        },
      });
      lottieAnimRef.current = anim;

      const attach = () => {
        if (disposed) return;
        const cvs = hidden.querySelector("canvas") as HTMLCanvasElement | null;
        if (!cvs) return;

        const tex = new THREE.CanvasTexture(cvs);
        tex.colorSpace = THREE.SRGBColorSpace;
        texRef.current = tex;

        (mesh.material as THREE.MeshBasicMaterial).map = tex;
        (mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;

        // --- Forward then backward, forever (no direction flips) ---
        const totalFrames = Math.floor(anim.getDuration(true));
        const last = Math.max(0, totalFrames - 1);

        let forward = true;

        const playForward = () => anim.playSegments([0, last], true);
        const playBackward = () => anim.playSegments([last, 0], true);

        // Start FORWARD
        playForward();

        const onComplete = () => {
          // queue next segment on the next RAF to avoid the 1-frame clear
          requestAnimationFrame(() => {
            forward ? playBackward() : playForward();
            forward = !forward;
          });
        };

        anim.addEventListener("complete", onComplete);
        cleanupFns.push(() => anim.removeEventListener("complete", onComplete));
      };

      anim.addEventListener("DOMLoaded", attach);
      anim.addEventListener("data_ready", attach);
      cleanupFns.push(() => anim.removeEventListener("DOMLoaded", attach));
      cleanupFns.push(() => anim.removeEventListener("data_ready", attach));
    })();

    // --- render loop; keep the texture fresh ---
    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      if (texRef.current) texRef.current.needsUpdate = true;
      renderer.render(scene, camera);
    };
    render();

    const ro = new ResizeObserver(fit);
    ro.observe(mount);

    return () => {
      disposed = true;
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cleanupFns.forEach((fn) => fn());
      try {
        lottieAnimRef.current?.destroy?.();
      } catch {}
      lottieAnimRef.current = null;

      if (hiddenHostRef.current) {
        hiddenHostRef.current.remove();
        hiddenHostRef.current = null;
      }

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = (obj as THREE.Mesh).material as THREE.Material | THREE.Material[];
          const mats = Array.isArray(m) ? m : [m];
          mats.forEach((mm) => {
            if ((mm as any).map) (mm as any).map.dispose?.();
            mm.dispose?.();
          });
          (obj as THREE.Mesh).geometry.dispose?.();
        }
      });

      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
}
