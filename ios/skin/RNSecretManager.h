//
//  RNSecretManager.h
//

#ifndef RNSecretManager_h
#define RNSecretManager_h


#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>

static NSString *const kKeyPairComment = @"com.hadleylab.skin";
static NSString *const kKeyPairLabel  = @"com.hadleylab.skin.label";

@interface RNSecretManager : NSObject <RCTBridgeModule>

@end

#endif /* RNSecretManager_h */
