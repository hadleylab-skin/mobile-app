//
//  Created by mutexre on 17/08/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <React/RCTEventEmitter.h>
#import "BodyViewManager.h"

@interface BodyViewEventEmitter : RCTEventEmitter
@end

@implementation BodyViewEventEmitter

RCT_EXPORT_MODULE()

- (NSArray<NSString *> *)supportedEvents
{
  return @[ BODY_PART_SELECTED_EVENT, MOLE_ADDED_EVENT, MOLE_SELECTED_EVENT ];
}

@end
