'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, CheckCircle, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Testimonial {
  id: number;
  customer_name: string;
  customer_company?: string | null;
  customer_role?: string | null;
  customer_avatar_url?: string | null;
  rating?: number | null;
  title?: string | null;
  content: string;
  is_verified_purchase: boolean;
  is_featured: boolean;
  purchase_date?: Date | null;
}

interface TestimonialsSectionProps {
  productId: string;
  productHandle: string;
  testimonials?: Testimonial[];
  variant?: 'carousel' | 'grid' | 'list';
  className?: string;
}

// Sample testimonials for demonstration
const sampleTestimonials: Testimonial[] = [
  {
    id: 1,
    customer_name: 'Sarah Johnson',
    customer_company: 'TechCorp Inc.',
    customer_role: 'CTO',
    customer_avatar_url: null,
    rating: 5,
    title: 'Game-changer for our team!',
    content: 'This product has completely transformed how we work. The quality is exceptional and support is top-notch. Highly recommended for any serious business.',
    is_verified_purchase: true,
    is_featured: true,
    purchase_date: new Date('2024-12-15'),
  },
  {
    id: 2,
    customer_name: 'Michael Chen',
    customer_company: 'StartupHub',
    customer_role: 'Lead Developer',
    customer_avatar_url: null,
    rating: 5,
    title: 'Worth every penny',
    content: 'Incredible value for money. Saved us hundreds of hours of development time. The documentation is clear and implementation was smooth.',
    is_verified_purchase: true,
    is_featured: true,
    purchase_date: new Date('2024-12-10'),
  },
  {
    id: 3,
    customer_name: 'Emily Rodriguez',
    customer_company: 'Digital Solutions',
    customer_role: 'Product Manager',
    customer_avatar_url: null,
    rating: 5,
    title: 'Outstanding quality',
    content: 'Best purchase we made this year. The attention to detail is impressive and it integrates perfectly with our existing stack.',
    is_verified_purchase: true,
    is_featured: true,
    purchase_date: new Date('2024-12-05'),
  },
];

export function TestimonialsSection({
  productId,
  productHandle,
  testimonials,
  variant = 'carousel',
  className = '',
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = testimonials && testimonials.length > 0 ? testimonials : sampleTestimonials;

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Quote Icon */}
      <div className="mb-4">
        <Quote className="h-8 w-8 text-blue-500 opacity-20" />
      </div>

      {/* Rating */}
      {testimonial.rating && (
        <div className="mb-3">{renderStars(testimonial.rating)}</div>
      )}

      {/* Title */}
      {testimonial.title && (
        <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
          {testimonial.title}
        </h4>
      )}

      {/* Content */}
      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
        {testimonial.content}
      </p>

      {/* Customer Info */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {testimonial.customer_name.charAt(0).toUpperCase()}
          </div>

          {/* Name and Company */}
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              {testimonial.customer_name}
            </p>
            {testimonial.customer_role && testimonial.customer_company && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {testimonial.customer_role} at {testimonial.customer_company}
              </p>
            )}
          </div>
        </div>

        {/* Verified Badge */}
        {testimonial.is_verified_purchase && (
          <Badge variant="success" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>
    </motion.div>
  );

  if (variant === 'grid') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            What Our Customers Say
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((testimonial, index) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
        ))}
      </div>
    );
  }

  // Carousel variant (default)
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          What Our Customers Say
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Join thousands of satisfied customers
        </p>
      </div>

      <div className="relative">
        {/* Carousel */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <TestimonialCard testimonial={data[currentIndex]} index={0} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {data.length > 1 && (
          <>
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </>
        )}

        {/* Indicators */}
        {data.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {data.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
