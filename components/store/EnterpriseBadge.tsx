'use client';

/**
 * EnterpriseBadge Component
 *
 * Displays a badge indicating that a product is free for Enterprise customers.
 * Conditionally rendered based on user segment.
 *
 * Features:
 * - Shows "FREE for Enterprise" on marketplace products
 * - Explains enterprise benefits on hover
 * - Responsive design
 * - Animated entrance
 *
 * Usage:
 * ```tsx
 * <EnterpriseBadge text="FREE for Enterprise" />
 * <EnterpriseBadge
 *   text="Included in your plan"
 *   backgroundColor="#10b981"
 * />
 * ```
 */

import React from 'react';

/**
 * Component Props
 */
interface EnterpriseBadgeProps {
  /** Badge text to display */
  text?: string;
  /** Background color (default: green) */
  backgroundColor?: string;
  /** Text color (default: white) */
  textColor?: string;
  /** Show tooltip on hover */
  tooltip?: string;
  /** Custom className */
  className?: string;
  /** Badge position (default: absolute top-right) */
  position?: 'top-left' | 'top-right' | 'top-center' | 'inline';
}

/**
 * EnterpriseBadge Component
 *
 * Visual indicator for enterprise-free products.
 *
 * @component
 */
export const EnterpriseBadge: React.FC<EnterpriseBadgeProps> = ({
  text = 'FREE for Enterprise',
  backgroundColor = '#10b981',
  textColor = 'white',
  tooltip = 'Included in your Enterprise plan ($415+/month)',
  className = '',
  position = 'top-right',
}) => {
  const positionClasses: Record<string, string> = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'top-center': 'top-2 left-1/2 -translate-x-1/2',
    inline: 'static',
  };

  const isAbsolute = position !== 'inline';

  return (
    <div
      className={`enterprise-badge ${isAbsolute ? 'absolute' : 'inline-block'} ${
        positionClasses[position]
      } ${className}`}
      title={tooltip}
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <span className="badge-text">{text}</span>

      <style jsx>{`
        .enterprise-badge {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease-out;
          cursor: help;
          transition: all 0.2s ease;
        }

        .enterprise-badge:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
        }

        .badge-text {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .badge-text::before {
          content: '⭐';
          font-size: 0.875rem;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .enterprise-badge {
            font-size: 0.65rem;
            padding: 0.375rem 0.75rem;
          }

          .badge-text::before {
            content: '✓';
          }
        }
      `}</style>
    </div>
  );
};

export default EnterpriseBadge;
