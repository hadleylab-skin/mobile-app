//
//  RNSecretManager.h
//  skiniq
//
//  Created by Илья Беда on 16/08/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#ifndef RNSecretManager_h
#define RNSecretManager_h


#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>

static NSString *const kKeyPairComment = @"api.skiniq.co.keypair.item";
static NSString *const kKeyPairLabel  = @"co.skiniq.api.keypair";

@interface RNSecretManager : NSObject <RCTBridgeModule>

@end

#endif /* RNSecretManager_h */
