# Adaptive Checkout Service

Intelligent checkout optimization based on user location, device type, and payment preferences.

## Key Features

- **Geographic Detection**: IP-based country/currency detection
- **Device Optimization**: Mobile, tablet, desktop-specific layouts
- **Payment Method Selection**: Region-optimal payment methods
- **Currency Conversion**: Real-time exchange rates
- **Localization**: Language and format preferences

## Implementation Details

### Location Detection
```typescript
const location = await AdaptiveCheckoutService.detectLocation(ipAddress);
// Returns: country_code, currency, timezone, region
```

### Device Detection
```typescript
const device = AdaptiveCheckoutService.detectDevice(userAgent);
// Returns: device_type, os, browser, screen_size, recommended_layout
```

### Payment Method Scoring

The service scores payment methods based on:
1. **Base Score**: 70 points
2. **Supported in Country**: +10 points
3. **Common Methods**: Card (+20), Google/Apple Pay (+15)
4. **Local Preferences**: +10 for country-specific methods

### Currency Conversion

Uses real-time exchange rates with fallback to 1:1 ratio:
```typescript
const localizedPrice = calculateLocalizedPrice(basePriceCents, 'USD', targetCurrency);
```

## Error Handling

- **Location Detection Fails**: Defaults to US/USD
- **Payment Method Issues**: Always includes 'card' as fallback
- **Currency Conversion Fails**: Uses original currency
- **Session Creation Fails**: Provides detailed error message

## Integration Points

- **Stripe Checkout**: Creates optimized sessions
- **Payment Methods Config**: `/lib/stripe/config/payment-methods.ts`
- **Currency Config**: `/lib/stripe/config/currencies.ts`
- **API Route**: `/api/checkout/adaptive/create-session`

## Testing Considerations

- Test with different IP addresses for geo-detection
- Verify payment methods for each supported country
- Check currency conversion accuracy
- Test mobile/desktop device detection