// AI Recommendation Engine for Afilo Enterprise Platform
import type { ShopifyProduct } from '@/types/shopify';

export interface UserProfile {
  id: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  role: string;
  techStack: string[];
  budget: number;
  useCase: string[];
  previousPurchases: string[];
  interactionHistory: UserInteraction[];
}

export interface UserInteraction {
  type: 'view' | 'download' | 'trial' | 'purchase' | 'support' | 'demo';
  productId: string;
  timestamp: Date;
  duration?: number;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface RecommendationResult {
  productId: string;
  product: ShopifyProduct;
  score: number;
  reasoning: string[];
  confidence: number;
  category: 'perfect_match' | 'high_potential' | 'complementary' | 'upsell';
  estimatedValue: number;
  priority: 'high' | 'medium' | 'low';
}

export interface EnterpriseNeedsAssessment {
  companyProfile: {
    size: number;
    industry: string;
    techMaturity: 'basic' | 'intermediate' | 'advanced' | 'cutting_edge';
    budget: number;
    timeline: string;
  };
  currentChallenges: string[];
  desiredOutcomes: string[];
  technicalRequirements: {
    integrations: string[];
    scalability: 'low' | 'medium' | 'high' | 'extreme';
    security: 'standard' | 'enhanced' | 'enterprise' | 'government';
    compliance: string[];
  };
  decisionMakers: {
    primary: string;
    influencers: string[];
    budget_holder: string;
  };
}

export class AIRecommendationEngine {
  private productCatalog: ShopifyProduct[] = [];
  private userProfiles: Map<string, UserProfile> = new Map();
  private industryPatterns: Map<string, string[]> = new Map();
  private successPatterns: Map<string, number> = new Map();

  constructor() {
    this.initializeIndustryPatterns();
    this.initializeSuccessPatterns();
  }

  private initializeIndustryPatterns() {
    // Industry-specific product affinity patterns
    this.industryPatterns.set('finance', [
      'compliance-automation', 'risk-management', 'fraud-detection',
      'regulatory-reporting', 'financial-analytics'
    ]);

    this.industryPatterns.set('healthcare', [
      'patient-data-analytics', 'compliance-automation', 'telemedicine',
      'medical-imaging-ai', 'hipaa-security'
    ]);

    this.industryPatterns.set('retail', [
      'inventory-optimization', 'customer-analytics', 'recommendation-engine',
      'supply-chain-ai', 'price-optimization'
    ]);

    this.industryPatterns.set('manufacturing', [
      'predictive-maintenance', 'quality-control-ai', 'supply-chain-optimization',
      'production-planning', 'iot-analytics'
    ]);

    this.industryPatterns.set('technology', [
      'devops-automation', 'code-analysis', 'performance-monitoring',
      'security-scanning', 'api-management'
    ]);
  }

  private initializeSuccessPatterns() {
    // Success patterns based on historical data
    this.successPatterns.set('startup_ai_analytics', 0.85);
    this.successPatterns.set('enterprise_automation', 0.92);
    this.successPatterns.set('medium_integration', 0.78);
    this.successPatterns.set('large_custom_solution', 0.95);
  }

  public async generateRecommendations(
    userId: string,
    context?: Partial<EnterpriseNeedsAssessment>
  ): Promise<RecommendationResult[]> {
    const userProfile = this.getUserProfile(userId);
    const recommendations: RecommendationResult[] = [];

    // 1. Industry-based recommendations
    const industryRecs = await this.getIndustryRecommendations(userProfile);
    recommendations.push(...industryRecs);

    // 2. Behavioral pattern recommendations
    const behavioralRecs = await this.getBehavioralRecommendations(userProfile);
    recommendations.push(...behavioralRecs);

    // 3. Complementary product recommendations
    const complementaryRecs = await this.getComplementaryRecommendations(userProfile);
    recommendations.push(...complementaryRecs);

    // 4. Upselling recommendations
    const upsellRecs = await this.getUpsellRecommendations(userProfile);
    recommendations.push(...upsellRecs);

    // 5. Context-based recommendations (if assessment provided)
    if (context) {
      const contextRecs = await this.getContextualRecommendations(userProfile, context);
      recommendations.push(...contextRecs);
    }

    // Sort by score and confidence
    return recommendations
      .sort((a, b) => (b.score * b.confidence) - (a.score * a.confidence))
      .slice(0, 10); // Top 10 recommendations
  }

  private async getIndustryRecommendations(userProfile: UserProfile): Promise<RecommendationResult[]> {
    const industryProducts = this.industryPatterns.get(userProfile.industry) || [];
    const recommendations: RecommendationResult[] = [];

    for (const productType of industryProducts) {
      const products = this.findProductsByType(productType);

      for (const product of products) {
        const score = this.calculateIndustryScore(userProfile, product, productType);

        if (score > 0.6) {
          recommendations.push({
            productId: product.id,
            product,
            score,
            reasoning: [
              `Perfect match for ${userProfile.industry} industry`,
              `Addresses common ${productType} needs`,
              `High success rate in similar companies`
            ],
            confidence: 0.85,
            category: score > 0.8 ? 'perfect_match' : 'high_potential',
            estimatedValue: this.estimateValue(userProfile, product),
            priority: score > 0.8 ? 'high' : 'medium'
          });
        }
      }
    }

    return recommendations;
  }

  private async getBehavioralRecommendations(userProfile: UserProfile): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];
    const recentInteractions = userProfile.interactionHistory
      .filter(i => this.isRecentInteraction(i))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Analyze interaction patterns
    const viewedProducts = recentInteractions
      .filter(i => i.type === 'view')
      .map(i => i.productId);

    const downloadedProducts = recentInteractions
      .filter(i => i.type === 'download')
      .map(i => i.productId);

    // Find similar products based on viewing behavior
    for (const productId of viewedProducts) {
      const similarProducts = await this.findSimilarProducts(productId);

      for (const product of similarProducts) {
        const score = this.calculateBehavioralScore(userProfile, product, recentInteractions);

        if (score > 0.5) {
          recommendations.push({
            productId: product.id,
            product,
            score,
            reasoning: [
              'Based on your recent browsing behavior',
              'Similar to products you\'ve shown interest in',
              'Matches your interaction patterns'
            ],
            confidence: 0.75,
            category: 'high_potential',
            estimatedValue: this.estimateValue(userProfile, product),
            priority: score > 0.7 ? 'high' : 'medium'
          });
        }
      }
    }

    return recommendations;
  }

  private async getComplementaryRecommendations(userProfile: UserProfile): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];
    const purchasedProducts = userProfile.previousPurchases;

    for (const purchasedProductId of purchasedProducts) {
      const complementaryProducts = await this.findComplementaryProducts(purchasedProductId);

      for (const product of complementaryProducts) {
        const score = this.calculateComplementaryScore(userProfile, product, purchasedProductId);

        if (score > 0.6) {
          recommendations.push({
            productId: product.id,
            product,
            score,
            reasoning: [
              `Complements your existing ${this.getProductName(purchasedProductId)}`,
              'Extends functionality of current solutions',
              'Creates integrated workflow'
            ],
            confidence: 0.8,
            category: 'complementary',
            estimatedValue: this.estimateValue(userProfile, product),
            priority: 'medium'
          });
        }
      }
    }

    return recommendations;
  }

  private async getUpsellRecommendations(userProfile: UserProfile): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];
    const currentProducts = userProfile.previousPurchases;

    for (const currentProductId of currentProducts) {
      const upgrades = await this.findUpgradeOptions(currentProductId);

      for (const upgrade of upgrades) {
        const score = this.calculateUpsellScore(userProfile, upgrade, currentProductId);

        if (score > 0.5) {
          recommendations.push({
            productId: upgrade.id,
            product: upgrade,
            score,
            reasoning: [
              `Upgrade from your current ${this.getProductName(currentProductId)}`,
              'Unlocks advanced enterprise features',
              'Scales with your growing needs'
            ],
            confidence: 0.9,
            category: 'upsell',
            estimatedValue: this.estimateValue(userProfile, upgrade),
            priority: 'high'
          });
        }
      }
    }

    return recommendations;
  }

  private async getContextualRecommendations(
    userProfile: UserProfile,
    context: Partial<EnterpriseNeedsAssessment>
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    if (context.currentChallenges) {
      for (const challenge of context.currentChallenges) {
        const solutionProducts = await this.findSolutionsForChallenge(challenge);

        for (const product of solutionProducts) {
          const score = this.calculateContextualScore(userProfile, product, challenge, context);

          if (score > 0.7) {
            recommendations.push({
              productId: product.id,
              product,
              score,
              reasoning: [
                `Directly addresses your "${challenge}" challenge`,
                'Proven solution for similar enterprises',
                'Fits your technical requirements'
              ],
              confidence: 0.95,
              category: 'perfect_match',
              estimatedValue: this.estimateValue(userProfile, product),
              priority: 'high'
            });
          }
        }
      }
    }

    return recommendations;
  }

  // Scoring algorithms
  private calculateIndustryScore(userProfile: UserProfile, product: ShopifyProduct, productType: string): number {
    let score = 0.5; // Base score

    // Industry relevance
    const industryMatch = this.industryPatterns.get(userProfile.industry)?.includes(productType);
    if (industryMatch) score += 0.3;

    // Company size fit
    if (this.isProductSuitableForCompanySize(product, userProfile.companySize)) {
      score += 0.2;
    }

    // Budget alignment
    if (this.isWithinBudget(product, userProfile.budget)) {
      score += 0.1;
    } else if (this.getProductPrice(product) > userProfile.budget * 2) {
      score -= 0.3; // Significantly over budget
    }

    // Success pattern match
    const patternKey = `${userProfile.companySize}_${productType}`;
    const successRate = this.successPatterns.get(patternKey) || 0.5;
    score += (successRate - 0.5) * 0.4;

    return Math.max(0, Math.min(1, score));
  }

  private calculateBehavioralScore(
    userProfile: UserProfile,
    product: ShopifyProduct,
    interactions: UserInteraction[]
  ): number {
    let score = 0.3; // Base score

    // Interaction frequency
    const productViews = interactions.filter(i => i.productId === product.id).length;
    score += Math.min(0.3, productViews * 0.1);

    // Recency of interactions
    const lastInteraction = interactions.find(i => i.productId === product.id);
    if (lastInteraction) {
      const daysSince = (Date.now() - lastInteraction.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 0.2 - (daysSince / 30 * 0.2)); // Decay over 30 days
    }

    // Similar product affinity
    const similarViewScore = this.calculateSimilarProductAffinity(userProfile, product);
    score += similarViewScore * 0.3;

    return Math.max(0, Math.min(1, score));
  }

  private calculateComplementaryScore(
    userProfile: UserProfile,
    product: ShopifyProduct,
    ownedProductId: string
  ): number {
    let score = 0.4; // Base score

    // Integration compatibility
    if (this.areProductsIntegrable(product.id, ownedProductId)) {
      score += 0.3;
    }

    // Workflow enhancement
    if (this.enhancesWorkflow(product.id, ownedProductId)) {
      score += 0.2;
    }

    // Bundle discount opportunity
    if (this.hasBundleDiscount(product.id, ownedProductId)) {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateUpsellScore(
    userProfile: UserProfile,
    upgrade: ShopifyProduct,
    currentProductId: string
  ): number {
    let score = 0.5; // Base score

    // Usage threshold
    const usage = this.getCurrentUsage(userProfile.id, currentProductId);
    if (usage > 0.8) score += 0.3; // High usage indicates need for upgrade

    // Growth trajectory
    const growthRate = this.getCompanyGrowthRate(userProfile);
    score += growthRate * 0.2;

    // Feature gap analysis
    const featureGap = this.calculateFeatureGap(currentProductId, upgrade.id);
    score += featureGap * 0.2;

    return Math.max(0, Math.min(1, score));
  }

  private calculateContextualScore(
    userProfile: UserProfile,
    product: ShopifyProduct,
    challenge: string,
    context: Partial<EnterpriseNeedsAssessment>
  ): number {
    let score = 0.6; // Base score for contextual match

    // Direct challenge solution
    if (this.solvesProblem(product, challenge)) {
      score += 0.2;
    }

    // Technical requirements fit
    if (context.technicalRequirements) {
      const techFit = this.calculateTechnicalFit(product, context.technicalRequirements);
      score += techFit * 0.15;
    }

    // Timeline compatibility
    if (context.companyProfile?.timeline) {
      const timelineFit = this.calculateTimelineFit(product, context.companyProfile.timeline);
      score += timelineFit * 0.05;
    }

    return Math.max(0, Math.min(1, score));
  }

  // Helper methods
  private getUserProfile(userId: string): UserProfile {
    return this.userProfiles.get(userId) || this.createDefaultProfile(userId);
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      companySize: 'medium',
      industry: 'technology',
      role: 'decision_maker',
      techStack: [],
      budget: 10000,
      useCase: [],
      previousPurchases: [],
      interactionHistory: []
    };
  }

  private isRecentInteraction(interaction: UserInteraction): boolean {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return interaction.timestamp > thirtyDaysAgo;
  }

  private estimateValue(userProfile: UserProfile, product: ShopifyProduct): number {
    const basePrice = this.getProductPrice(product);

    // Adjust based on company size
    const sizeMultiplier = {
      'startup': 0.8,
      'small': 1.0,
      'medium': 1.5,
      'large': 2.5,
      'enterprise': 4.0
    }[userProfile.companySize] || 1.0;

    return basePrice * sizeMultiplier;
  }

  // Placeholder methods (would be implemented with actual product data)
  private findProductsByType(productType: string): ShopifyProduct[] {
    return this.productCatalog.filter(p =>
      p.tags.includes(productType) || p.productType.toLowerCase().includes(productType)
    );
  }

  private async findSimilarProducts(productId: string): Promise<ShopifyProduct[]> {
    // AI-based similarity matching would go here
    return this.productCatalog.slice(0, 3);
  }

  private async findComplementaryProducts(productId: string): Promise<ShopifyProduct[]> {
    // Integration and complementary analysis would go here
    return this.productCatalog.slice(0, 2);
  }

  private async findUpgradeOptions(productId: string): Promise<ShopifyProduct[]> {
    // Product hierarchy and upgrade path analysis
    return this.productCatalog.slice(0, 1);
  }

  private async findSolutionsForChallenge(challenge: string): Promise<ShopifyProduct[]> {
    // Challenge-solution mapping
    return this.productCatalog.filter(p =>
      p.description.toLowerCase().includes(challenge.toLowerCase())
    );
  }

  private getProductPrice(product: ShopifyProduct): number {
    return parseFloat(product.priceRange.minVariantPrice.amount);
  }

  private getProductName(productId: string): string {
    const product = this.productCatalog.find(p => p.id === productId);
    return product?.title || 'Unknown Product';
  }

  private isProductSuitableForCompanySize(product: ShopifyProduct, companySize: string): boolean {
    // Logic to determine if product is suitable for company size
    return true; // Simplified
  }

  private isWithinBudget(product: ShopifyProduct, budget: number): boolean {
    return this.getProductPrice(product) <= budget;
  }

  private calculateSimilarProductAffinity(userProfile: UserProfile, product: ShopifyProduct): number {
    // Calculate affinity based on similar product interactions
    return 0.5; // Simplified
  }

  private areProductsIntegrable(productId1: string, productId2: string): boolean {
    // Check if products can be integrated
    return true; // Simplified
  }

  private enhancesWorkflow(newProductId: string, existingProductId: string): boolean {
    // Check if new product enhances workflow with existing product
    return true; // Simplified
  }

  private hasBundleDiscount(productId1: string, productId2: string): boolean {
    // Check for bundle pricing
    return false; // Simplified
  }

  private getCurrentUsage(userId: string, productId: string): number {
    // Get current usage percentage for the product
    return 0.6; // Simplified
  }

  private getCompanyGrowthRate(userProfile: UserProfile): number {
    // Calculate company growth rate
    return 0.3; // Simplified
  }

  private calculateFeatureGap(currentProductId: string, upgradeProductId: string): number {
    // Calculate the feature gap between current and upgrade product
    return 0.4; // Simplified
  }

  private solvesProblem(product: ShopifyProduct, challenge: string): boolean {
    // Check if product solves the specific challenge
    return product.description.toLowerCase().includes(challenge.toLowerCase());
  }

  private calculateTechnicalFit(
    product: ShopifyProduct,
    techRequirements: EnterpriseNeedsAssessment['technicalRequirements']
  ): number {
    // Calculate how well product fits technical requirements
    return 0.8; // Simplified
  }

  private calculateTimelineFit(product: ShopifyProduct, timeline: string): number {
    // Calculate timeline compatibility
    return 0.9; // Simplified
  }

  // Public methods for updating user data
  public updateUserProfile(userId: string, updates: Partial<UserProfile>): void {
    const current = this.getUserProfile(userId);
    this.userProfiles.set(userId, { ...current, ...updates });
  }

  public addUserInteraction(userId: string, interaction: UserInteraction): void {
    const profile = this.getUserProfile(userId);
    profile.interactionHistory.push(interaction);
    this.userProfiles.set(userId, profile);
  }

  public setProductCatalog(products: ShopifyProduct[]): void {
    this.productCatalog = products;
  }
}