export default function IconFont({
  name,
  fontSize,
  color,
}: {
  name: string;
  fontSize: number;
  color?: string;
}) {
  return (
    <i
      className={`iconfont icon-${name}`}
      style={{ fontSize: `${fontSize}px`, color }}
    ></i>
  );
}
