export default function GradientButton({
  children,
  className = "",
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  animationSpeed = 8,
  showBorder = true,
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <button
      className={`relative px-6 py-3 font-semibold rounded-[1.25rem] transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
    >
      {showBorder && (
        <div
          className="absolute inset-0 bg-cover z-0 pointer-events-none animate-gradient"
          style={{
            ...gradientStyle,
            backgroundSize: "300% 100%",
            borderRadius: "inherit",
          }}
        ></div>
      )}
      <span
        className="relative z-10 text-white"
        style={{
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: showBorder ? "transparent" : "white",
          backgroundImage: showBorder ? gradientStyle.backgroundImage : "none",
        }}
      >
        {children}
      </span>
    </button>
  );
}
