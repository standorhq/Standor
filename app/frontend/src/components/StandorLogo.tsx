/**
 * StandorLogo — Premium geometric 'S' icon designed via Stitch MCP.
 * 
 * Inspired by Stitch Variant A: sharp, architectural, pixel-style "S"
 * optimized for small sizes in a navbar.
 */

interface StandorLogoProps {
    size?: number;
    className?: string;
}

export default function StandorLogo({ size = 36, className = '' }: StandorLogoProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Standor logo"
        >
            {/* Square background with rounded corners */}
            <rect width="36" height="36" rx="8" fill="#0A0A0A" />

            {/* Geometric architectural 'S' — Stitch Variant A inspired */}
            {/* Top horizontal bar */}
            <rect x="10" y="9" width="16" height="3.5" rx="1" fill="white" />
            {/* Top-left vertical connector */}
            <rect x="10" y="9" width="3.5" height="9.5" rx="1" fill="white" />
            {/* Middle horizontal bar */}
            <rect x="10" y="16.25" width="16" height="3.5" rx="1" fill="white" />
            {/* Bottom-right vertical connector */}
            <rect x="22.5" y="16.25" width="3.5" height="10.25" rx="1" fill="white" />
            {/* Bottom horizontal bar */}
            <rect x="10" y="23.5" width="16" height="3.5" rx="1" fill="white" />
        </svg>
    );
}
