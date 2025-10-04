'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CalculationResults {
  monthlySubscription: number;
  annualSubscription: number;
  threeYearInvestment: number;
  estimatedSavings: number;
  productivityGains: number;
  totalROI: number;
  roiPercentage: number;
  paybackMonths: number;
}

export default function ROICalculator() {
  const [employees, setEmployees] = React.useState<number>(50);
  const [avgSalary, setAvgSalary] = React.useState<number>(80000);
  const [currentSoftwareCost, setCurrentSoftwareCost] = React.useState<number>(5000);
  const [results, setResults] = React.useState<CalculationResults | null>(null);

  // Calculate ROI whenever inputs change
  React.useEffect(() => {
    calculateROI();
  }, [employees, avgSalary, currentSoftwareCost]);

  const calculateROI = () => {
    // Determine subscription tier based on employee count
    let monthlySubscription = 0;
    if (employees <= 25) {
      monthlySubscription = 499 + (employees - 1) * 80; // Professional: $499-$2,499
    } else if (employees <= 100) {
      monthlySubscription = 999 + (employees - 25) * 53; // Business: $999-$4,999
    } else if (employees <= 500) {
      monthlySubscription = 1999 + (employees - 100) * 20; // Enterprise: $1,999-$9,999
    } else {
      monthlySubscription = 9999 + (employees - 500) * 10; // Enterprise Plus: $9,999+
    }

    // Apply volume discounts
    let discount = 0;
    if (employees >= 250) discount = 0.25; // 25% for 250+
    else if (employees >= 100) discount = 0.20; // 20% for 100-249
    else if (employees >= 50) discount = 0.15; // 15% for 50-99
    else if (employees >= 25) discount = 0.10; // 10% for 25-49

    monthlySubscription = monthlySubscription * (1 - discount);

    // Annual subscription (17% savings)
    const annualSubscription = monthlySubscription * 12 * 0.83;

    // 3-year investment
    const threeYearInvestment = annualSubscription * 3;

    // Calculate savings and productivity gains
    // Assumption: Afilo reduces manual work by 30%, increases productivity by 25%
    const laborCostPerEmployee = avgSalary / 12; // Monthly labor cost
    const totalMonthlyCost = laborCostPerEmployee * employees;

    // Time savings: 30% reduction in manual processes = 30% of labor cost saved
    const monthlySavings = totalMonthlyCost * 0.30;

    // Current software cost savings (assume Afilo replaces 70% of current tools)
    const softwareSavings = currentSoftwareCost * 0.70;

    // Total monthly savings
    const totalMonthlySavings = monthlySavings + softwareSavings;

    // Annual savings
    const estimatedSavings = totalMonthlySavings * 12;

    // Productivity gains (25% productivity increase)
    const productivityGains = (totalMonthlyCost * 0.25) * 12;

    // 3-year total benefits
    const threeYearBenefits = (estimatedSavings + productivityGains) * 3;

    // ROI calculation
    const totalROI = threeYearBenefits - threeYearInvestment;
    const roiPercentage = (totalROI / threeYearInvestment) * 100;

    // Payback period (months)
    const netMonthlySavings = totalMonthlySavings - monthlySubscription;
    const paybackMonths = netMonthlySavings > 0 ? Math.ceil(threeYearInvestment / netMonthlySavings) : 36;

    setResults({
      monthlySubscription,
      annualSubscription,
      threeYearInvestment,
      estimatedSavings,
      productivityGains,
      totalROI,
      roiPercentage,
      paybackMonths
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(0)}%`;
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <DollarSign className="w-4 h-4" />
            ROI Calculator
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Calculate Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              3-Year Investment
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how Afilo delivers measurable ROI through cost savings, productivity gains, and operational efficiency
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Input Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Organization</h3>

              {/* Number of Employees */}
              <div className="mb-8">
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Number of Employees
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{employees}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>500</span>
                  <span>1,000</span>
                </div>
              </div>

              {/* Average Salary */}
              <div className="mb-8">
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Average Annual Salary
                  </span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(avgSalary)}</span>
                </label>
                <input
                  type="range"
                  min="40000"
                  max="200000"
                  step="5000"
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$40K</span>
                  <span>$120K</span>
                  <span>$200K</span>
                </div>
              </div>

              {/* Current Software Costs */}
              <div className="mb-8">
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Current Monthly Software Costs
                  </span>
                  <span className="text-2xl font-bold text-purple-600">{formatCurrency(currentSoftwareCost)}</span>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={currentSoftwareCost}
                  onChange={(e) => setCurrentSoftwareCost(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$1K</span>
                  <span>$25K</span>
                  <span>$50K</span>
                </div>
              </div>

              {/* Assumptions */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Calculation Assumptions:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>30% reduction in manual processes and administrative tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>25% increase in overall team productivity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>70% replacement of existing software tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>17% savings with annual billing vs. monthly</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Right: Results Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {results && (
              <div className="space-y-6">
                {/* Investment Summary */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">3-Year Investment Summary</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-blue-100">Monthly Subscription</span>
                      <span className="text-3xl font-bold">{formatCurrency(results.monthlySubscription)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-blue-100">Annual Subscription</span>
                      <span className="text-2xl font-semibold">{formatCurrency(results.annualSubscription)}</span>
                    </div>
                    <div className="border-t border-white/30 pt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-blue-100">3-Year Total Investment</span>
                        <span className="text-3xl font-bold">{formatCurrency(results.threeYearInvestment)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROI Metrics Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Annual Savings */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Annual Savings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.estimatedSavings)}</p>
                  </div>

                  {/* Productivity Gains */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Productivity Gains</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.productivityGains)}</p>
                  </div>
                </div>

                {/* Total ROI */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-green-500 p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                      <CheckCircle2 className="w-4 h-4" />
                      3-Year Total ROI
                    </div>
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {formatCurrency(results.totalROI)}
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                      {formatPercent(results.roiPercentage)} Return
                    </div>

                    {/* Payback Period */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <span className="text-lg font-semibold text-gray-900">Payback Period</span>
                      </div>
                      <p className="text-4xl font-bold text-blue-600">
                        {results.paybackMonths} {results.paybackMonths === 1 ? 'Month' : 'Months'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a
                    href="/enterprise#quote"
                    className="group relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                  >
                    <span>Get Custom Quote</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-500 text-center">
                  * ROI calculations are estimates based on industry averages and typical customer outcomes.
                  Actual results may vary based on implementation, usage, and organizational factors.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
