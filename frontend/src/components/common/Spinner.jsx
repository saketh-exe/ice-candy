import { Loader2 } from "lucide-react";

const Spinner = ({ size = "default", className = "" }) => {
  const sizes = {
    sm: 16,
    default: 24,
    lg: 32,
  };

  return (
    <Loader2
      size={sizes[size]}
      className={`animate-spin text-primary ${className}`}
    />
  );
};

export default Spinner;
