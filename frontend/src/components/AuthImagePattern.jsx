const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 relative overflow-hidden">
      {/* Dynamic/Catchy Image */}
      {/* Text Overlay (optional, depending on image) */}
      <div className="max-w-md text-center relative z-10">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;