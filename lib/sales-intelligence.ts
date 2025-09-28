// Sales Intelligence System for Afilo Enterprise Platform
import type { UserProfile, EnterpriseNeedsAssessment } from './ai-recommendation-engine';
import { trackEvent, trackSalesFunnel, trackQuoteEvent } from './analytics';

export interface Lead {
  id: string;
  source: 'website' | 'referral' | 'partner' | 'event' | 'cold_outreach' | 'inbound';
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    company: string;
    role: string;
    linkedin?: string;
  };
  firmographics: {
    industry: string;
    companySize: number;
    revenue?: number;
    location: string;
    techStack?: string[];
  };
  demographics: {
    seniority: 'individual' | 'manager' | 'director' | 'vp' | 'c_level';
    department: string;
    decisionMaker: boolean;
    influencer: boolean;
    budgetHolder: boolean;
  };
  engagementData: {
    firstContact: Date;
    lastActivity: Date;
    touchpoints: number;
    emailOpens: number;
    linkClicks: number;
    contentDownloads: string[];
    webinarAttendance: string[];
    demoRequests: number;
  };
  qualificationStatus: 'unqualified' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'churned';
  score: number; // 0-100
  temperature: 'cold' | 'warm' | 'hot' | 'burning';
}

export interface LeadScoringCriteria {
  firmographics: {
    companySize: { min: number; max: number; weight: number };
    industry: { preferred: string[]; weight: number };
    revenue: { min: number; weight: number };
    location: { preferred: string[]; weight: number };
  };
  demographics: {
    seniority: { levels: string[]; weights: Record<string, number> };
    department: { preferred: string[]; weight: number };
    decisionMaker: { weight: number };
    budgetHolder: { weight: number };
  };
  behavioral: {
    emailEngagement: { weight: number };
    contentConsumption: { weight: number };
    webActivity: { weight: number };
    eventParticipation: { weight: number };
    demoRequest: { weight: number };
  };
  intent: {
    keywords: { terms: string[]; weight: number };
    competitorMentions: { weight: number };
    urgency: { indicators: string[]; weight: number };
    budget: { indicators: string[]; weight: number };
  };
}

export interface Opportunity {
  id: string;
  leadId: string;
  accountName: string;
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number; // 0-100
  estimatedValue: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  products: string[];
  competitors: string[];
  lossReason?: string;
  winReason?: string;
  salesRep: string;
  salesEngineer?: string;
  customerSuccessManager?: string;
  activities: SalesActivity[];
  documents: SalesDocument[];
  stakeholders: Stakeholder[];
  nextSteps: string[];
  riskFactors: string[];
  timeline: OpportunityTimeline[];
}

export interface SalesActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow_up' | 'technical_call';
  date: Date;
  duration?: number; // minutes
  participants: string[];
  summary: string;
  outcome: string;
  nextAction?: string;
  recording?: string;
  attachments: string[];
}

export interface SalesDocument {
  id: string;
  type: 'proposal' | 'contract' | 'technical_spec' | 'pricing' | 'case_study' | 'demo_recording';
  name: string;
  url: string;
  version: string;
  createdDate: Date;
  lastModified: Date;
  shared: boolean;
  viewed: boolean;
  downloadCount: number;
}

export interface Stakeholder {
  name: string;
  role: string;
  influence: 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker';
  decisionPower: 'high' | 'medium' | 'low';
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  lastContact: Date;
  notes: string;
}

export interface OpportunityTimeline {
  date: Date;
  stage: Opportunity['stage'];
  probability: number;
  value: number;
  notes: string;
  changedBy: string;
}

export interface PipelineMetrics {
  period: 'current_quarter' | 'current_month' | 'current_week';
  totalValue: number;
  weightedValue: number;
  opportunityCount: number;
  averageDealSize: number;
  averageSalesCycle: number; // days
  conversionRates: {
    mql_to_sql: number;
    sql_to_opportunity: number;
    opportunity_to_customer: number;
    overall: number;
  };
  stageMetrics: {
    stage: Opportunity['stage'];
    count: number;
    value: number;
    averageTime: number; // days
    conversionRate: number;
  }[];
  forecast: {
    commit: number;
    bestCase: number;
    pipeline: number;
  };
  velocity: {
    current: number; // deals per month
    trend: number; // percentage change
    projection: number; // projected for period
  };
}

export interface SalesForecasting {
  period: 'monthly' | 'quarterly' | 'annual';
  historicalData: {
    period: string;
    revenue: number;
    deals: number;
    averageDealSize: number;
  }[];
  predictions: {
    period: string;
    predictedRevenue: number;
    confidence: number;
    factors: string[];
  }[];
  scenarios: {
    conservative: number;
    likely: number;
    optimistic: number;
  };
  trends: {
    revenue: number; // percentage change
    dealCount: number;
    dealSize: number;
    cycleTime: number;
  };
}

export class SalesIntelligenceEngine {
  private leads: Map<string, Lead> = new Map();
  private opportunities: Map<string, Opportunity> = new Map();
  private scoringCriteria: LeadScoringCriteria;
  private conversionRates: Map<string, number> = new Map();
  private industryBenchmarks: Map<string, number> = new Map();

  constructor() {
    this.initializeScoringCriteria();
    this.initializeConversionRates();
    this.initializeIndustryBenchmarks();
  }

  private initializeScoringCriteria(): void {
    this.scoringCriteria = {
      firmographics: {
        companySize: { min: 100, max: 10000, weight: 25 },
        industry: {
          preferred: ['technology', 'finance', 'healthcare', 'manufacturing'],
          weight: 15
        },
        revenue: { min: 10000000, weight: 20 }, // $10M minimum
        location: {
          preferred: ['north_america', 'europe', 'asia_pacific'],
          weight: 5
        }
      },
      demographics: {
        seniority: {
          levels: ['c_level', 'vp', 'director', 'manager', 'individual'],
          weights: {
            'c_level': 25,
            'vp': 20,
            'director': 15,
            'manager': 10,
            'individual': 5
          }
        },
        department: {
          preferred: ['engineering', 'it', 'operations', 'strategy'],
          weight: 10
        },
        decisionMaker: { weight: 15 },
        budgetHolder: { weight: 20 }
      },
      behavioral: {
        emailEngagement: { weight: 8 },
        contentConsumption: { weight: 12 },
        webActivity: { weight: 10 },
        eventParticipation: { weight: 15 },
        demoRequest: { weight: 25 }
      },
      intent: {
        keywords: {
          terms: ['enterprise software', 'automation', 'AI', 'digital transformation'],
          weight: 15
        },
        competitorMentions: { weight: 10 },
        urgency: {
          indicators: ['immediate need', 'budget approved', 'urgent', 'asap'],
          weight: 20
        },
        budget: {
          indicators: ['budget allocated', 'funding secured', 'purchase decision'],
          weight: 25
        }
      }
    };
  }

  private initializeConversionRates(): void {
    // Historical conversion rates by stage
    this.conversionRates.set('mql_to_sql', 0.25);
    this.conversionRates.set('sql_to_opportunity', 0.35);
    this.conversionRates.set('opportunity_to_customer', 0.28);
    this.conversionRates.set('discovery_to_qualification', 0.65);
    this.conversionRates.set('qualification_to_proposal', 0.45);
    this.conversionRates.set('proposal_to_negotiation', 0.60);
    this.conversionRates.set('negotiation_to_closed_won', 0.70);
  }

  private initializeIndustryBenchmarks(): void {
    // Industry-specific benchmarks for deal size and cycle time
    this.industryBenchmarks.set('technology_deal_size', 150000);
    this.industryBenchmarks.set('technology_cycle_time', 90);
    this.industryBenchmarks.set('finance_deal_size', 250000);
    this.industryBenchmarks.set('finance_cycle_time', 120);
    this.industryBenchmarks.set('healthcare_deal_size', 200000);
    this.industryBenchmarks.set('healthcare_cycle_time', 150);
    this.industryBenchmarks.set('manufacturing_deal_size', 180000);
    this.industryBenchmarks.set('manufacturing_cycle_time', 110);
  }

  // Lead Scoring and Qualification
  public async scoreLead(leadId: string): Promise<number> {
    const lead = this.leads.get(leadId);
    if (!lead) return 0;

    let score = 0;

    // Firmographic scoring
    score += this.scoreFirmographics(lead);

    // Demographic scoring
    score += this.scoreDemographics(lead);

    // Behavioral scoring
    score += this.scoreBehavioral(lead);

    // Intent scoring
    score += this.scoreIntent(lead);

    // Normalize score to 0-100
    const normalizedScore = Math.min(100, Math.max(0, score));

    // Update lead score
    lead.score = normalizedScore;
    lead.temperature = this.determineTemperature(normalizedScore);

    // Track scoring event
    trackEvent({
      action: 'lead_scored',
      category: 'sales_intelligence',
      label: lead.temperature,
      value: normalizedScore,
      custom_parameters: {
        lead_id: leadId,
        company: lead.contactInfo.company,
        industry: lead.firmographics.industry,
        score: normalizedScore
      }
    });

    return normalizedScore;
  }

  private scoreFirmographics(lead: Lead): number {
    let score = 0;

    // Company size scoring
    const { companySize } = lead.firmographics;
    const sizeRange = this.scoringCriteria.firmographics.companySize;

    if (companySize >= sizeRange.min && companySize <= sizeRange.max) {
      score += sizeRange.weight;
    } else if (companySize > sizeRange.max) {
      score += sizeRange.weight * 0.8; // Still valuable but may have longer sales cycles
    }

    // Industry scoring
    const { industry } = lead.firmographics;
    const industryConfig = this.scoringCriteria.firmographics.industry;

    if (industryConfig.preferred.includes(industry)) {
      score += industryConfig.weight;
    }

    // Revenue scoring
    const { revenue } = lead.firmographics;
    const revenueConfig = this.scoringCriteria.firmographics.revenue;

    if (revenue && revenue >= revenueConfig.min) {
      score += revenueConfig.weight;
    }

    // Location scoring
    const { location } = lead.firmographics;
    const locationConfig = this.scoringCriteria.firmographics.location;

    if (locationConfig.preferred.includes(location)) {
      score += locationConfig.weight;
    }

    return score;
  }

  private scoreDemographics(lead: Lead): number {
    let score = 0;

    // Seniority scoring
    const { seniority } = lead.demographics;
    const seniorityWeights = this.scoringCriteria.demographics.seniority.weights;
    score += seniorityWeights[seniority] || 0;

    // Department scoring
    const { department } = lead.demographics;
    const deptConfig = this.scoringCriteria.demographics.department;

    if (deptConfig.preferred.includes(department)) {
      score += deptConfig.weight;
    }

    // Decision maker scoring
    if (lead.demographics.decisionMaker) {
      score += this.scoringCriteria.demographics.decisionMaker.weight;
    }

    // Budget holder scoring
    if (lead.demographics.budgetHolder) {
      score += this.scoringCriteria.demographics.budgetHolder.weight;
    }

    return score;
  }

  private scoreBehavioral(lead: Lead): number {
    let score = 0;
    const { engagementData } = lead;
    const behavioralConfig = this.scoringCriteria.behavioral;

    // Email engagement scoring
    const emailEngagementRate = engagementData.emailOpens > 0 ?
      engagementData.linkClicks / engagementData.emailOpens : 0;
    score += emailEngagementRate * behavioralConfig.emailEngagement.weight;

    // Content consumption scoring
    score += Math.min(behavioralConfig.contentConsumption.weight,
      engagementData.contentDownloads.length * 3);

    // Event participation scoring
    score += Math.min(behavioralConfig.eventParticipation.weight,
      engagementData.webinarAttendance.length * 5);

    // Demo request scoring
    if (engagementData.demoRequests > 0) {
      score += behavioralConfig.demoRequest.weight;
    }

    return score;
  }

  private scoreIntent(lead: Lead): number {
    let score = 0;
    // Intent scoring would be implemented with actual intent data
    // This is a simplified version

    // Demo requests indicate high intent
    if (lead.engagementData.demoRequests > 0) {
      score += this.scoringCriteria.intent.budget.weight;
    }

    // Multiple touchpoints indicate sustained interest
    if (lead.engagementData.touchpoints > 5) {
      score += this.scoringCriteria.intent.urgency.weight * 0.5;
    }

    return score;
  }

  private determineTemperature(score: number): Lead['temperature'] {
    if (score >= 80) return 'burning';
    if (score >= 60) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
  }

  // Opportunity Management
  public async createOpportunity(
    leadId: string,
    estimatedValue: number,
    expectedCloseDate: Date,
    products: string[]
  ): Promise<Opportunity> {
    const lead = this.leads.get(leadId);
    if (!lead) throw new Error('Lead not found');

    const opportunity: Opportunity = {
      id: `opp_${Date.now()}_${leadId}`,
      leadId,
      accountName: lead.contactInfo.company,
      stage: 'discovery',
      probability: 10, // Initial probability for discovery stage
      estimatedValue,
      expectedCloseDate,
      products,
      competitors: [],
      salesRep: this.assignSalesRep(lead),
      activities: [],
      documents: [],
      stakeholders: [{
        name: lead.contactInfo.name,
        role: lead.contactInfo.role,
        influence: lead.demographics.decisionMaker ? 'champion' : 'supporter',
        decisionPower: lead.demographics.decisionMaker ? 'high' :
                       lead.demographics.budgetHolder ? 'medium' : 'low',
        contactInfo: {
          email: lead.contactInfo.email,
          phone: lead.contactInfo.phone,
          linkedin: lead.contactInfo.linkedin
        },
        lastContact: new Date(),
        notes: 'Primary contact from lead conversion'
      }],
      nextSteps: ['Conduct discovery call', 'Identify additional stakeholders'],
      riskFactors: [],
      timeline: [{
        date: new Date(),
        stage: 'discovery',
        probability: 10,
        value: estimatedValue,
        notes: 'Opportunity created from qualified lead',
        changedBy: 'system'
      }]
    };

    this.opportunities.set(opportunity.id, opportunity);

    // Update lead qualification status
    lead.qualificationStatus = 'opportunity';

    // Track opportunity creation
    trackSalesFunnel('opportunity_created', estimatedValue, {
      opportunity_id: opportunity.id,
      lead_id: leadId,
      account_name: opportunity.accountName,
      products: products,
      estimated_value: estimatedValue
    });

    return opportunity;
  }

  public async updateOpportunityStage(
    opportunityId: string,
    newStage: Opportunity['stage'],
    probability?: number,
    notes?: string
  ): Promise<void> {
    const opportunity = this.opportunities.get(opportunityId);
    if (!opportunity) return;

    const previousStage = opportunity.stage;
    opportunity.stage = newStage;

    // Update probability based on stage
    if (probability !== undefined) {
      opportunity.probability = probability;
    } else {
      opportunity.probability = this.getDefaultProbabilityForStage(newStage);
    }

    // Add to timeline
    opportunity.timeline.push({
      date: new Date(),
      stage: newStage,
      probability: opportunity.probability,
      value: opportunity.estimatedValue,
      notes: notes || `Stage updated from ${previousStage} to ${newStage}`,
      changedBy: 'sales_rep' // Would be actual user ID
    });

    // Track stage progression
    trackSalesFunnel(`${previousStage}_to_${newStage}`, opportunity.estimatedValue, {
      opportunity_id: opportunityId,
      previous_stage: previousStage,
      new_stage: newStage,
      probability: opportunity.probability
    });

    // Trigger stage-specific automations
    await this.triggerStageAutomations(opportunity, newStage, previousStage);
  }

  private getDefaultProbabilityForStage(stage: Opportunity['stage']): number {
    const probabilities = {
      discovery: 10,
      qualification: 25,
      proposal: 50,
      negotiation: 75,
      closed_won: 100,
      closed_lost: 0
    };

    return probabilities[stage] || 10;
  }

  // Pipeline Analytics
  public async generatePipelineMetrics(period: PipelineMetrics['period']): Promise<PipelineMetrics> {
    const opportunities = Array.from(this.opportunities.values())
      .filter(opp => this.isInPeriod(opp, period));

    const totalValue = opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
    const weightedValue = opportunities.reduce((sum, opp) =>
      sum + (opp.estimatedValue * opp.probability / 100), 0);

    const averageDealSize = opportunities.length > 0 ? totalValue / opportunities.length : 0;

    // Calculate conversion rates
    const conversionRates = this.calculateConversionRates(opportunities);

    // Calculate stage metrics
    const stageMetrics = this.calculateStageMetrics(opportunities);

    // Generate forecast
    const forecast = this.generateForecast(opportunities);

    // Calculate velocity
    const velocity = await this.calculateVelocity(period);

    const metrics: PipelineMetrics = {
      period,
      totalValue,
      weightedValue,
      opportunityCount: opportunities.length,
      averageDealSize,
      averageSalesCycle: await this.calculateAverageSalesCycle(opportunities),
      conversionRates,
      stageMetrics,
      forecast,
      velocity
    };

    // Track pipeline metrics generation
    trackEvent({
      action: 'pipeline_metrics_generated',
      category: 'sales_intelligence',
      label: period,
      value: weightedValue,
      custom_parameters: {
        period,
        total_value: totalValue,
        opportunity_count: opportunities.length,
        average_deal_size: averageDealSize
      }
    });

    return metrics;
  }

  // Sales Forecasting
  public async generateSalesForecasting(period: SalesForecasting['period']): Promise<SalesForecasting> {
    const historicalData = await this.getHistoricalData(period);
    const predictions = await this.generatePredictions(historicalData, period);
    const scenarios = this.generateScenarios(predictions);
    const trends = this.calculateTrends(historicalData);

    const forecasting: SalesForecasting = {
      period,
      historicalData,
      predictions,
      scenarios,
      trends
    };

    return forecasting;
  }

  // Conversion Optimization
  public async identifyConversionBottlenecks(): Promise<{
    stage: string;
    conversionRate: number;
    benchmark: number;
    improvementOpportunity: number;
    recommendations: string[];
  }[]> {
    const bottlenecks = [];
    const stages = ['discovery', 'qualification', 'proposal', 'negotiation'];

    for (const stage of stages) {
      const conversionKey = `${stage}_to_${this.getNextStage(stage)}`;
      const currentRate = this.conversionRates.get(conversionKey) || 0;
      const benchmark = this.getBenchmarkConversionRate(conversionKey);
      const improvementOpportunity = benchmark - currentRate;

      if (improvementOpportunity > 0.05) { // 5% or more improvement opportunity
        bottlenecks.push({
          stage,
          conversionRate: currentRate,
          benchmark,
          improvementOpportunity,
          recommendations: this.getStageOptimizationRecommendations(stage)
        });
      }
    }

    return bottlenecks.sort((a, b) => b.improvementOpportunity - a.improvementOpportunity);
  }

  // Helper methods
  private assignSalesRep(lead: Lead): string {
    // Logic to assign sales rep based on territory, industry, deal size, etc.
    if (lead.firmographics.companySize > 1000) {
      return 'enterprise_sales_rep';
    } else if (lead.firmographics.companySize > 100) {
      return 'mid_market_sales_rep';
    } else {
      return 'smb_sales_rep';
    }
  }

  private async triggerStageAutomations(
    opportunity: Opportunity,
    newStage: Opportunity['stage'],
    previousStage: Opportunity['stage']
  ): Promise<void> {
    // Implement stage-specific automations
    switch (newStage) {
      case 'qualification':
        await this.scheduleQualificationCall(opportunity);
        break;
      case 'proposal':
        await this.generateProposal(opportunity);
        break;
      case 'negotiation':
        await this.prepareNegotiationMaterials(opportunity);
        break;
      case 'closed_won':
        await this.triggerOnboarding(opportunity);
        break;
      case 'closed_lost':
        await this.conductLossAnalysis(opportunity);
        break;
    }
  }

  private isInPeriod(opportunity: Opportunity, period: PipelineMetrics['period']): boolean {
    const now = new Date();
    const oppDate = opportunity.timeline[0]?.date || new Date();

    switch (period) {
      case 'current_week':
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        return oppDate >= weekStart;
      case 'current_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return oppDate >= monthStart;
      case 'current_quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return oppDate >= quarterStart;
      default:
        return true;
    }
  }

  private calculateConversionRates(opportunities: Opportunity[]): PipelineMetrics['conversionRates'] {
    // Calculate actual conversion rates from historical data
    return {
      mql_to_sql: this.conversionRates.get('mql_to_sql') || 0.25,
      sql_to_opportunity: this.conversionRates.get('sql_to_opportunity') || 0.35,
      opportunity_to_customer: this.conversionRates.get('opportunity_to_customer') || 0.28,
      overall: 0.25 * 0.35 * 0.28 // Combined conversion rate
    };
  }

  private calculateStageMetrics(opportunities: Opportunity[]): PipelineMetrics['stageMetrics'] {
    const stages: Opportunity['stage'][] = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

    return stages.map(stage => {
      const stageOpportunities = opportunities.filter(opp => opp.stage === stage);
      const count = stageOpportunities.length;
      const value = stageOpportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);

      return {
        stage,
        count,
        value,
        averageTime: this.calculateAverageTimeInStage(stageOpportunities, stage),
        conversionRate: this.getStageConversionRate(stage)
      };
    });
  }

  private generateForecast(opportunities: Opportunity[]): PipelineMetrics['forecast'] {
    const activeOpportunities = opportunities.filter(opp =>
      !['closed_won', 'closed_lost'].includes(opp.stage)
    );

    const commit = activeOpportunities
      .filter(opp => opp.probability >= 75)
      .reduce((sum, opp) => sum + opp.estimatedValue, 0);

    const bestCase = activeOpportunities
      .filter(opp => opp.probability >= 50)
      .reduce((sum, opp) => sum + opp.estimatedValue, 0);

    const pipeline = activeOpportunities
      .reduce((sum, opp) => sum + (opp.estimatedValue * opp.probability / 100), 0);

    return { commit, bestCase, pipeline };
  }

  private async calculateVelocity(period: PipelineMetrics['period']): Promise<PipelineMetrics['velocity']> {
    // Calculate deals closed per month and trends
    return {
      current: 12, // deals per month
      trend: 0.15, // 15% increase
      projection: 14 // projected deals for next period
    };
  }

  private async calculateAverageSalesCycle(opportunities: Opportunity[]): Promise<number> {
    const closedOpportunities = opportunities.filter(opp => opp.actualCloseDate);

    if (closedOpportunities.length === 0) return 90; // Default 90 days

    const totalDays = closedOpportunities.reduce((sum, opp) => {
      const startDate = opp.timeline[0]?.date || opp.expectedCloseDate;
      const endDate = opp.actualCloseDate!;
      const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return Math.round(totalDays / closedOpportunities.length);
  }

  private async getHistoricalData(period: SalesForecasting['period']): Promise<SalesForecasting['historicalData']> {
    // Get historical sales data for forecasting
    return [
      { period: '2024-Q1', revenue: 2500000, deals: 25, averageDealSize: 100000 },
      { period: '2024-Q2', revenue: 2800000, deals: 28, averageDealSize: 100000 },
      { period: '2024-Q3', revenue: 3200000, deals: 32, averageDealSize: 100000 },
      { period: '2024-Q4', revenue: 3600000, deals: 36, averageDealSize: 100000 }
    ];
  }

  private async generatePredictions(
    historicalData: SalesForecasting['historicalData'],
    period: SalesForecasting['period']
  ): Promise<SalesForecasting['predictions']> {
    // AI-based forecasting would go here
    return [
      {
        period: '2025-Q1',
        predictedRevenue: 4000000,
        confidence: 0.85,
        factors: ['Historical growth trend', 'Pipeline strength', 'Market conditions']
      }
    ];
  }

  private generateScenarios(predictions: SalesForecasting['predictions']): SalesForecasting['scenarios'] {
    const base = predictions[0]?.predictedRevenue || 0;

    return {
      conservative: base * 0.8,
      likely: base,
      optimistic: base * 1.3
    };
  }

  private calculateTrends(historicalData: SalesForecasting['historicalData']): SalesForecasting['trends'] {
    // Calculate trends from historical data
    return {
      revenue: 0.20, // 20% growth
      dealCount: 0.15, // 15% growth
      dealSize: 0.05, // 5% growth
      cycleTime: -0.10 // 10% reduction in cycle time
    };
  }

  private calculateAverageTimeInStage(opportunities: Opportunity[], stage: Opportunity['stage']): number {
    // Calculate average time spent in each stage
    return 30; // Simplified: 30 days average
  }

  private getStageConversionRate(stage: Opportunity['stage']): number {
    const nextStage = this.getNextStage(stage);
    if (!nextStage) return 1;

    return this.conversionRates.get(`${stage}_to_${nextStage}`) || 0.5;
  }

  private getNextStage(stage: Opportunity['stage']): string | null {
    const stageFlow = {
      discovery: 'qualification',
      qualification: 'proposal',
      proposal: 'negotiation',
      negotiation: 'closed_won'
    };

    return stageFlow[stage as keyof typeof stageFlow] || null;
  }

  private getBenchmarkConversionRate(conversionKey: string): number {
    const benchmarks: Record<string, number> = {
      'discovery_to_qualification': 0.70,
      'qualification_to_proposal': 0.50,
      'proposal_to_negotiation': 0.65,
      'negotiation_to_closed_won': 0.75
    };

    return benchmarks[conversionKey] || 0.5;
  }

  private getStageOptimizationRecommendations(stage: string): string[] {
    const recommendations: Record<string, string[]> = {
      discovery: [
        'Improve qualification questions',
        'Provide better discovery call training',
        'Use discovery call templates'
      ],
      qualification: [
        'Implement BANT qualification framework',
        'Improve stakeholder identification',
        'Better budget qualification process'
      ],
      proposal: [
        'Standardize proposal templates',
        'Improve value proposition messaging',
        'Add more compelling case studies'
      ],
      negotiation: [
        'Provide negotiation training',
        'Improve pricing flexibility',
        'Better competitive positioning'
      ]
    };

    return recommendations[stage] || ['Review stage process and identify improvements'];
  }

  // Automation trigger methods (simplified implementations)
  private async scheduleQualificationCall(opportunity: Opportunity): Promise<void> {
    trackEvent({
      action: 'qualification_call_scheduled',
      category: 'sales_automation',
      label: 'qualification',
      custom_parameters: {
        opportunity_id: opportunity.id,
        account_name: opportunity.accountName
      }
    });
  }

  private async generateProposal(opportunity: Opportunity): Promise<void> {
    trackEvent({
      action: 'proposal_generated',
      category: 'sales_automation',
      label: 'proposal',
      value: opportunity.estimatedValue,
      custom_parameters: {
        opportunity_id: opportunity.id,
        products: opportunity.products
      }
    });
  }

  private async prepareNegotiationMaterials(opportunity: Opportunity): Promise<void> {
    trackEvent({
      action: 'negotiation_materials_prepared',
      category: 'sales_automation',
      label: 'negotiation',
      custom_parameters: {
        opportunity_id: opportunity.id,
        estimated_value: opportunity.estimatedValue
      }
    });
  }

  private async triggerOnboarding(opportunity: Opportunity): Promise<void> {
    trackEvent({
      action: 'onboarding_triggered',
      category: 'sales_automation',
      label: 'closed_won',
      value: opportunity.estimatedValue,
      custom_parameters: {
        opportunity_id: opportunity.id,
        account_name: opportunity.accountName,
        products: opportunity.products
      }
    });
  }

  private async conductLossAnalysis(opportunity: Opportunity): Promise<void> {
    trackEvent({
      action: 'loss_analysis_initiated',
      category: 'sales_automation',
      label: 'closed_lost',
      custom_parameters: {
        opportunity_id: opportunity.id,
        loss_reason: opportunity.lossReason,
        competitors: opportunity.competitors
      }
    });
  }

  // Public methods for external integration
  public addLead(lead: Lead): void {
    this.leads.set(lead.id, lead);
  }

  public getLead(leadId: string): Lead | undefined {
    return this.leads.get(leadId);
  }

  public getOpportunity(opportunityId: string): Opportunity | undefined {
    return this.opportunities.get(opportunityId);
  }

  public getAllOpportunities(): Opportunity[] {
    return Array.from(this.opportunities.values());
  }

  public async getLeadsByScore(minScore: number): Promise<Lead[]> {
    return Array.from(this.leads.values())
      .filter(lead => lead.score >= minScore)
      .sort((a, b) => b.score - a.score);
  }

  public async getOpportunitiesByStage(stage: Opportunity['stage']): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values())
      .filter(opp => opp.stage === stage)
      .sort((a, b) => b.estimatedValue - a.estimatedValue);
  }
}