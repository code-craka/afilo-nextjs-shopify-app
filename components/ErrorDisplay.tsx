'use client';

import { motion } from 'framer-motion';
import { AlertCircle, XCircle, WifiOff, ShieldAlert, RefreshCw, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type ErrorVariant = 'api' | 'validation' | 'network' | 'permission' | 'generic';

interface ErrorDisplayProps {
  variant?: ErrorVariant;
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onBack?: () => void;
  showIcon?: boolean;
}

/**
 * Standardized Error Display Component
 * Provides consistent, user-friendly error messages across the application
 *
 * Variants:
 * - api: Stripe/Payment API failures
 * - validation: Form validation errors
 * - network: Network connectivity issues
 * - permission: Authorization/access denied errors
 * - generic: General error fallback
 */
export default function ErrorDisplay({
  variant = 'generic',
  title,
  message,
  details,
  onRetry,
  onBack,
  showIcon = true,
}: ErrorDisplayProps) {
  // Variant configurations
  const variants = {
    api: {
      icon: AlertCircle,
      iconColor: 'text-orange-400',
      bgColor: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/50',
      defaultTitle: 'Service Error',
    },
    validation: {
      icon: XCircle,
      iconColor: 'text-red-400',
      bgColor: 'from-red-500/20 to-pink-500/20',
      borderColor: 'border-red-500/50',
      defaultTitle: 'Validation Error',
    },
    network: {
      icon: WifiOff,
      iconColor: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/50',
      defaultTitle: 'Connection Error',
    },
    permission: {
      icon: ShieldAlert,
      iconColor: 'text-yellow-400',
      bgColor: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/50',
      defaultTitle: 'Access Denied',
    },
    generic: {
      icon: AlertCircle,
      iconColor: 'text-gray-400',
      bgColor: 'from-gray-500/20 to-slate-500/20',
      borderColor: 'border-gray-500/50',
      defaultTitle: 'Error',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Alert
        className={`backdrop-blur-xl bg-gradient-to-r ${config.bgColor} border ${config.borderColor} rounded-xl`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          {showIcon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1
              }}
              className="flex-shrink-0"
            >
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </motion.div>
          )}

          {/* Content */}
          <div className="flex-1">
            {/* Title */}
            <h3 className="text-white font-bold text-lg mb-2">{displayTitle}</h3>

            {/* Message */}
            <AlertDescription className="text-white/80 mb-2">
              {message}
            </AlertDescription>

            {/* Details (optional) */}
            {details && (
              <details className="mt-3">
                <summary className="text-white/60 text-sm cursor-pointer hover:text-white/80 transition-colors">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-white/70 overflow-auto max-h-40">
                  {details}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            {(onRetry || onBack) && (
              <div className="flex flex-wrap gap-3 mt-4">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 group"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Try Again
                  </Button>
                )}

                {onBack && (
                  <Button
                    onClick={onBack}
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Alert>
    </motion.div>
  );
}

/**
 * Inline Error Message
 * Smaller, compact error display for forms and inline validation
 */
export function InlineError({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 text-red-400 text-sm mt-1"
      role="alert"
      aria-live="polite"
    >
      <XCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}
