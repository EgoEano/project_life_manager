#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SystemLanguage, NSObject)

- (NSDictionary *)constantsToExport
{
  NSString *languageCode = [[NSLocale preferredLanguages] firstObject];
  return @{@"languageCode": languageCode ? languageCode : @"en"};
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
