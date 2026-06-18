export function Lights() {
  return (
    <>
      <ambientLight intensity={1.05} />
      <hemisphereLight args={['#D7F3EC', '#9E9B84', 1.25]} />
      <directionalLight position={[8, 10, 6]} intensity={1.15} />
    </>
  );
}
