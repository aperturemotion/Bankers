// @ts-nocheck
import React from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
export const GlTest = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#001C3C" }}>
      <ThreeCanvas width={1080} height={1920} shadows camera={{ fov: 35, position: [0, 3, 10] }}
        onCreated={({ gl, scene, camera }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.fog = new THREE.Fog("#0a2a55", 8, 30); camera.lookAt(0, 0.6, 0); }}>
        <color attach="background" args={["#0a2a55"]} />
        <hemisphereLight args={["#9cc4ff", "#001020", 0.6]} />
        <directionalLight castShadow position={[-6, 10, 6]} intensity={2.2} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
        <mesh rotation-x={-Math.PI / 2} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color="#123a6b" roughness={0.6} metalness={0.1} /></mesh>
        <mesh castShadow position={[0, 1, 0]} rotation-y={f * 0.03}><boxGeometry args={[1.6, 2, 1.6]} /><meshStandardMaterial color="#4D8ED9" roughness={0.25} metalness={0.6} /></mesh>
        <mesh castShadow position={[2.4, 0.6, -1.5]}><sphereGeometry args={[0.6, 48, 32]} /><meshPhysicalMaterial color="#ffffff" roughness={0.1} transmission={0.6} thickness={0.5} /></mesh>
        {Array.from({ length: 20 }, (_, i) => <mesh key={i} castShadow position={[-6 + (i % 5) * 3, 0.4, -4 - Math.floor(i / 5) * 4]}><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial color="#B3CEEF" /></mesh>)}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
