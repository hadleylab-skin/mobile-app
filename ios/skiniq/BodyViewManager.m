//
//  Created by mutexre on 14/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

#import <React/RCTBridge.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <JavaScriptCore/JSContext.h>
#import "skiniq-Swift.h"
#import "BodyViewManager.h"

@interface BodyViewManager : RCTViewManager<BodyViewDelegate>
@end

@implementation BodyViewManager

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (UIView *)view
{
  BodyView3D* view = [BodyView3D new];
  view.delegate = self;
  return view;
}

RCT_EXPORT_VIEW_PROPERTY(sex, NSString);
RCT_EXPORT_VIEW_PROPERTY(moles, NSArray);

- (void)bodyView:(BodyView3D*)bodyView bodyNodeSelected:(NSString*)bodyNodeName
{
  RCTEventEmitter* eventEmitter = [_bridge moduleForName:EVENT_EMITTER_CLASS];
  [eventEmitter sendEventWithName:BODY_PART_SELECTED_EVENT body:@{
    @"name": bodyNodeName
  }];
}

- (void)bodyView:(BodyView3D*)bodyView nevusAdded:(Nevus*)nevus
{
  RCTEventEmitter* eventEmitter = [_bridge moduleForName:EVENT_EMITTER_CLASS];
  [eventEmitter sendEventWithName:MOLE_ADDED_EVENT body:@{
    @"id": nevus.id,
    @"bodyPart": nevus.bodyNode.name,
    @"faceIndex": @(nevus.faceIndex),
    @"x": @(nevus.coord.x),
    @"y": @(nevus.coord.y)
  }];
}

- (void)bodyView:(BodyView3D*)bodyView nevusSelected:(NSString*)nevusId
{
  RCTEventEmitter* eventEmitter = [_bridge moduleForName:EVENT_EMITTER_CLASS];
  [eventEmitter sendEventWithName:MOLE_SELECTED_EVENT body:@{
    @"id": nevusId
  }];
}

@end
